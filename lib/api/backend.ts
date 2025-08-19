import type { Product } from "@/types/product";
import type { Transaction } from "@/types/transaction";
import type { Customer } from "@/types/customer";
import { api } from "../apiClient";
import { API_CONFIG, DEMO_CONFIG, HEADERS, PAYMENT_CONFIG } from "../constants";
import { createWompiTransaction, getWompiAcceptanceToken, tokenizeCard, getWompiTransaction } from "./wompi";
import type { WompiTransaction } from "./wompi";

// Backend response type (snake_case)
interface BackendTransaction {
  id: string;
  product_id: string;
  customer_id: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  created_at: string;
}

// Delivery response type (snake_case)
interface BackendDelivery {
  id: string;
  customer_id: string;
  product_id: string;
  status: "CREATED" | "IN_PROGRESS" | "DELIVERED";
  created_at?: string;
}

export async function getProducts(): Promise<Product[]> {
  return api<Product[]>(`${API_CONFIG.BASE_URL}/products`, {
    headers: { [HEADERS.API_KEY_HEADER]: API_CONFIG.API_KEY },
  });
}

export async function createTransaction(productId: string): Promise<Transaction> {
  const response = await api<BackendTransaction>(`${API_CONFIG.BASE_URL}/transactions`, {
    method: "POST",
    headers: { [HEADERS.API_KEY_HEADER]: API_CONFIG.API_KEY },
    body: JSON.stringify({
      productId,
      customerId: DEMO_CONFIG.CUSTOMER_ID,
      customerName: DEMO_CONFIG.CUSTOMER_NAME,
      customerEmail: DEMO_CONFIG.CUSTOMER_EMAIL,
    }),
  });

  return {
    id: response.id,
    productId: response.product_id,
    amount: response.amount ?? 0,
    status: response.status,
    createdAt: response.created_at,
  } as Transaction;
}

export async function confirmTransaction(
  id: string,
  cardData?: { number: string; cvc: string; exp_month: string; exp_year: string; card_holder: string }
): Promise<Transaction> {
  console.log(`[Flow] Iniciando confirmTransaction para id=${id}`);

  const backendTx = await api<BackendTransaction>(`${API_CONFIG.BASE_URL}/transactions/${id}`, {
    headers: { [HEADERS.API_KEY_HEADER]: API_CONFIG.API_KEY },
  });
  console.log(`[Flow] Backend GET /transactions/${id} -> amount=${backendTx.amount} status=${backendTx.status}`);

  if (!cardData) throw new Error("Datos de tarjeta requeridos para procesar el pago");

  console.log("[WOMPI] Iniciando tokenización y obtención de acceptance_token en paralelo...");
  const [cardToken, acceptanceToken] = await Promise.all([
    tokenizeCard(cardData),
    getWompiAcceptanceToken()
  ]);
  console.log(`[WOMPI] token creado id=${cardToken.data.id}, brand=${cardToken.data.brand}, last4=${cardToken.data.last_four}`);
  console.log("[WOMPI] acceptance_token obtenido");

  console.log("[WOMPI] Creando transacción (POST /transactions)...");
  const wompiTxRaw = await createWompiTransaction({
    amount_in_cents: backendTx.amount,
    currency: PAYMENT_CONFIG.DEFAULT_CURRENCY,
    customer_email: DEMO_CONFIG.CUSTOMER_EMAIL,
    payment_method: { type: "CARD", token: cardToken.data.id, installments: PAYMENT_CONFIG.DEFAULT_INSTALLMENTS },
    reference: `TX_${id}_${Date.now()}`,
    acceptance_token: acceptanceToken,
    customer_data: { phone_number: DEMO_CONFIG.CUSTOMER_PHONE, full_name: DEMO_CONFIG.CUSTOMER_NAME },
  });
  // Diagnóstico del payload
  console.log("[WOMPI] POST raw payload =", wompiTxRaw);
  // Type guards para robustez ante posibles envoltorios { data: ... }
  const isWompiTx = (obj: unknown): obj is WompiTransaction => {
    if (!obj || typeof obj !== "object") return false;
    const r = obj as Record<string, unknown>;
    return typeof r.id === "string" && typeof r.reference === "string";
  };
  const unwrap = (x: unknown): WompiTransaction => {
    if (isWompiTx(x)) return x;
    if (x && typeof x === "object" && "data" in x) {
      const inner = (x as { data?: unknown }).data;
      if (isWompiTx(inner)) return inner as WompiTransaction;
    }
    throw new Error("Respuesta de Wompi sin estructura de transacción válida (sin id/reference)");
  };
  const wompiTx = unwrap(wompiTxRaw);
  console.log(`[WOMPI] POST /transactions -> 201 id=${wompiTx.id} status=${wompiTx.status} reference=${wompiTx.reference}`);

  // Mapear estado inicial y actualizar backend primero (requisito)
  const mapWompiToBackend = (s: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED"): "PENDING" | "COMPLETED" | "FAILED" =>
    s === "APPROVED" ? "COMPLETED" : s === "PENDING" ? "PENDING" : "FAILED";

  let status: "PENDING" | "COMPLETED" | "FAILED" = mapWompiToBackend(wompiTx.status);

  console.log(`[Backend] Actualizando estado inicial -> ${status}`);
  const firstPatch = await api<BackendTransaction>(`${API_CONFIG.BASE_URL}/transactions/${id}`, {
    method: "PATCH",
    headers: { [HEADERS.API_KEY_HEADER]: API_CONFIG.API_KEY },
    body: JSON.stringify({
      status,
      wompiTransactionId: wompiTx.id
    }),
  });
  console.log(`[Backend] PATCH (inicial) OK -> status=${firstPatch.status}`);

  // Luego volver a consultar la misma API para obtener el estado real (polling breve)
  const isFinal = (s: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED") => s === "APPROVED" || s === "DECLINED" || s === "VOIDED";
  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  let latestWompiStatus = wompiTx.status;
  let latestWompiMsg = wompiTx.status_message;

  const maxAttempts = 3; // Reducir intentos de 5 a 3
  for (let attempt = 1; attempt <= maxAttempts && !isFinal(latestWompiStatus); attempt++) {
    console.log(`[WOMPI] Intento ${attempt}/${maxAttempts} -> consultando GET /transactions/${wompiTx.id}`);
    await sleep(attempt === 1 ? 500 : 1000); // Reducir tiempos: 500ms inicial, 1000ms subsecuentes
    try {
      const check = await getWompiTransaction(wompiTx.id);
      latestWompiStatus = check.status;
      latestWompiMsg = check.status_message;
      console.log(`[WOMPI] GET estado=${latestWompiStatus} msg=${latestWompiMsg ?? "sin_mensaje"}`);
    } catch (e) {
      console.warn("[WOMPI] Error consultando estado: ", e);
      // continuar intentando en el próximo ciclo
    }
  }

  // Si el estado cambió respecto al inicial, actualizar backend de nuevo en orden
  const finalStatus = mapWompiToBackend(latestWompiStatus);
  if (finalStatus !== status) {
    console.log(`[Backend] Estado final diferente detectado (${status} -> ${finalStatus}). Actualizando backend...`);
    const finalPatch = await api<BackendTransaction>(`${API_CONFIG.BASE_URL}/transactions/${id}`, {
      method: "PATCH",
      headers: { [HEADERS.API_KEY_HEADER]: API_CONFIG.API_KEY },
      body: JSON.stringify({
        status: finalStatus,
        wompiTransactionId: wompiTx.id
      }),
    });
    console.log(`[Backend] PATCH (final) OK -> status=${finalPatch.status}`);
    status = finalPatch.status;
  } else {
    console.log(`[Backend] Estado final coincide con el inicial (${status}). No se requiere PATCH adicional.`);
  }

  return {
    id: id,
    productId: backendTx.product_id,
    amount: backendTx.amount ?? 0,
    status,
    createdAt: backendTx.created_at,
  } as Transaction;
}

export async function createCustomer(customerData: { id: string; name: string; email: string; phone?: string; address?: string }): Promise<Customer> {
  return api<Customer>(`${API_CONFIG.BASE_URL}/customers`, {
    method: "POST",
    headers: { [HEADERS.API_KEY_HEADER]: API_CONFIG.API_KEY },
    body: JSON.stringify({ name: customerData.name, email: customerData.email, phone: customerData.phone, address: customerData.address }),
  });
}

export async function getTransactionsByCustomer(customerId: string = DEMO_CONFIG.CUSTOMER_ID): Promise<Transaction[]> {
  const response = await api<BackendTransaction[]>(`${API_CONFIG.BASE_URL}/transactions?customerId=${encodeURIComponent(customerId)}`, {
    headers: { [HEADERS.API_KEY_HEADER]: API_CONFIG.API_KEY },
  });
  return (response || []).map((tx) => ({ id: tx.id, productId: tx.product_id, amount: tx.amount ?? 0, status: tx.status, createdAt: tx.created_at } as Transaction));
}

// --- Deliveries ---
export async function createDelivery(productId: string, customerId: string = DEMO_CONFIG.CUSTOMER_ID): Promise<BackendDelivery> {
  return api<BackendDelivery>(`${API_CONFIG.BASE_URL}/deliveries`, {
    method: "POST",
    headers: { [HEADERS.API_KEY_HEADER]: API_CONFIG.API_KEY },
    body: JSON.stringify({ customerId, productId })
  });
}

export async function getDelivery(id: string): Promise<BackendDelivery> {
  return api<BackendDelivery>(`${API_CONFIG.BASE_URL}/deliveries/${id}`, {
    headers: { [HEADERS.API_KEY_HEADER]: API_CONFIG.API_KEY },
  });
}