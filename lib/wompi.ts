// Real API client for backend integration
import type { Product } from "@/types/product";
import type { Transaction } from "@/types/transaction";
import type { Customer } from "@/types/customer";
import { api } from "./apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL!;
const DEMO_CUSTOMER_ID = process.env.NEXT_PUBLIC_BYPASS_USER_ID!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

// Wompi API Configuration
const WOMPI_BASE_URL = process.env.NEXT_PUBLIC_WOMPI_BASE_URL!;
const WOMPI_PUBLIC_KEY = process.env.NEXT_PUBLIC_WOMPI_KEY!;
const WOMPI_PRIVATE_KEY = process.env.NEXT_PUBLIC_WOMPI_PRIVATE_KEY!;


// Backend response type (snake_case)
interface BackendTransaction {
  id: string;
  product_id: string;
  customer_id: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  created_at: string;
}

// Wompi API Types
interface WompiTransaction {
  id: string;
  created_at: string;
  amount_in_cents: number;
  reference: string;
  currency: string;
  payment_method_type: string;
  payment_method: {
    type: string;
    extra: Record<string, unknown>;
    installments: number;
  };
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED";
  status_message: string | null;
  shipping_address: Record<string, unknown> | null;
  redirect_url: string;
  payment_source_id: string | null;
  payment_link_id: string | null;
  customer_email: string;
  customer_data: {
    phone_number: string;
    full_name: string;
  };
  billing_data: Record<string, unknown> | null;
}

interface WompiTokenResponse {
  id: string;
  created_at: string;
  brand: string;
  name: string;
  last_four: string;
  bin: string;
  exp_year: string;
  exp_month: string;
  card_holder: string;
  expires_at: string;
  validity: {
    valid: boolean;
    message: string;
  };
}

export async function getProducts(): Promise<Product[]> {
  return api<Product[]>(`${BASE_URL}/products`, {
    headers: {
      "x-api-key": API_KEY,
    },
  });
}

// Wompi Integration Functions
export async function tokenizeCard(cardData: {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}): Promise<WompiTokenResponse> {
  // Validar y limpiar datos antes de enviar
  const cleanCardData = {
    number: cardData.number.replace(/\s/g, ''), // Remover espacios
    cvc: cardData.cvc,
    exp_month: cardData.exp_month.padStart(2, '0'), // Asegurar 2 dígitos
    exp_year: cardData.exp_year.slice(-2).padStart(2, '0'), // Asegurar formato YY
    card_holder: cardData.card_holder.trim()
  };

  // Validaciones adicionales para formato Wompi
  if (!/^\d{2}$/.test(cleanCardData.exp_year)) {
    throw new Error(`Año de expiración inválido: ${cleanCardData.exp_year}. Debe ser formato YY`);
  }

  if (!/^\d{2}$/.test(cleanCardData.exp_month)) {
    throw new Error(`Mes de expiración inválido: ${cleanCardData.exp_month}. Debe ser formato MM`);
  }

  console.log('🔍 Datos enviados a Wompi:', {
    ...cleanCardData,
    number: cleanCardData.number.slice(-4).padStart(cleanCardData.number.length, '*')
  });

  const response = await fetch(`${WOMPI_BASE_URL}/tokens/cards`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WOMPI_PUBLIC_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanCardData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('❌ Error de Wompi:', errorData);
    throw new Error(
      `Error tokenizando tarjeta: ${
        errorData.error?.reason || errorData.error?.messages?.exp_year?.[0] || "Error desconocido"
      }`
    );
  }

  const result = await response.json();
  console.log('✅ Tokenización exitosa:', { id: result.id, brand: result.brand, last_four: result.last_four });
  return result;
}

export async function createWompiTransaction(data: {
  amount_in_cents: number;
  currency: string;
  customer_email: string;
  payment_method: {
    type: string;
    token: string;
    installments: number;
  };
  reference: string;
  customer_data?: {
    phone_number?: string;
    full_name?: string;
  };
}): Promise<WompiTransaction> {
  const response = await fetch(`${WOMPI_BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error creando transacción: ${
        errorData.error?.reason || "Error desconocido"
      }`
    );
  }

  return response.json();
}

export async function getWompiTransaction(
  transactionId: string
): Promise<WompiTransaction> {
  const response = await fetch(
    `${WOMPI_BASE_URL}/transactions/${transactionId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${WOMPI_PRIVATE_KEY}`,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Error obteniendo transacción: ${
        errorData.error?.reason || "Error desconocido"
      }`
    );
  }

  return response.json();
}

export async function createTransaction(
  productId: string
): Promise<Transaction> {
  const response = await api<BackendTransaction>(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      productId,
      customerId: DEMO_CUSTOMER_ID,
      customerName: "Cliente DEMO",
      customerEmail: "demo@example.com",
    }),
  });

  // Map backend response (snake_case) to frontend Transaction type
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
  cardData?: {
    number: string;
    cvc: string;
    exp_month: string;
    exp_year: string;
    card_holder: string;
  }
): Promise<Transaction> {
  try {
    // Obtener la transacción del backend para obtener detalles
    const backendTx = await api<BackendTransaction>(
      `${BASE_URL}/transactions/${id}`,
      {
        headers: { "x-api-key": API_KEY },
      }
    );

    if (!cardData) {
      throw new Error("Datos de tarjeta requeridos para procesar el pago");
    }

    // 1. Tokenizar la tarjeta
    const cardToken = await tokenizeCard(cardData);

    if (!cardToken.validity.valid) {
      throw new Error(`Tarjeta inválida: ${cardToken.validity.message}`);
    }

    // 2. Crear transacción en Wompi
    const wompiTx = await createWompiTransaction({
      amount_in_cents: backendTx.amount,
      currency: "COP",
      customer_email: "demo@example.com",
      payment_method: {
        type: "CARD",
        token: cardToken.id,
        installments: 1,
      },
      reference: `TX_${id}_${Date.now()}`,
      customer_data: {
        phone_number: "+573001234567",
        full_name: "Cliente DEMO",
      },
    });

    // 3. Mapear estado de Wompi a nuestro sistema
    let status: "PENDING" | "COMPLETED" | "FAILED" = "PENDING";
    switch (wompiTx.status) {
      case "APPROVED":
        status = "COMPLETED";
        break;
      case "DECLINED":
      case "VOIDED":
        status = "FAILED";
        break;
      default:
        status = "PENDING";
    }

    // 4. Actualizar transacción en nuestro backend
    const response = await api<BackendTransaction>(
      `${BASE_URL}/transactions/${id}`,
      {
        method: "PATCH",
        headers: { "x-api-key": API_KEY },
        body: JSON.stringify({
          status,
          wompiTransactionId: wompiTx.id,
          wompiReference: wompiTx.reference,
          wompiStatus: wompiTx.status,
          wompiStatusMessage: wompiTx.status_message,
        }),
      }
    );

    return {
      id: response.id,
      productId: response.product_id,
      amount: response.amount ?? 0,
      status: response.status,
      createdAt: response.created_at,
    } as Transaction;
  } catch (error) {
    console.error("Error procesando pago:", error);

         // En caso de error, marcar como fallida
     const response = await api<BackendTransaction>(
       `${BASE_URL}/transactions/${id}`,
       {
         method: "PATCH",
         headers: { "x-api-key": API_KEY },
         body: JSON.stringify({
           status: "FAILED",
           // Remover errorMessage ya que el backend no lo acepta
         }),
       }
     );

    return {
      id: response.id,
      productId: response.product_id,
      amount: response.amount ?? 0,
      status: response.status,
      createdAt: response.created_at,
    } as Transaction;
  }
}

export async function createCustomer(customerData: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}): Promise<Customer> {
  return api<Customer>(`${BASE_URL}/customers`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
    },
    body: JSON.stringify({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address,
    }),
  });
}

export async function getTransactionsByCustomer(
  customerId: string = DEMO_CUSTOMER_ID
): Promise<Transaction[]> {
  const response = await api<BackendTransaction[]>(
    `${BASE_URL}/transactions?customerId=${encodeURIComponent(customerId)}`,
    {
      headers: {
        "x-api-key": API_KEY,
      },
    }
  );
  return (response || []).map(
    (tx) =>
      ({
        id: tx.id,
        productId: tx.product_id,
        amount: tx.amount ?? 0,
        status: tx.status,
        createdAt: tx.created_at,
      } as Transaction)
  );
}
