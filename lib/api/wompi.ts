import { WOMPI_CONFIG } from "../constants";
import { generateIntegritySignature } from "../utils";

export interface WompiTokenResponse {
  status: string;
  data: {
    id: string;
    created_at: string;
    brand: string;
    name: string;
    last_four: string;
    bin: string;
    exp_year: string;
    exp_month: string;
    card_holder: string;
    created_with_cvc: boolean;
    expires_at: string;
    validity_ends_at: string;
  };
}

export interface WompiTransaction {
  id: string;
  created_at: string;
  amount_in_cents: number;
  reference: string;
  currency: string;
  payment_method_type: string;
  payment_method: { type: string; extra: Record<string, unknown>; installments: number };
  status: "PENDING" | "APPROVED" | "DECLINED" | "VOIDED";
  status_message: string | null;
  redirect_url: string | null;
  payment_source_id: string | null;
  payment_link_id: string | null;
  customer_email: string;
  customer_data: { phone_number: string; full_name: string };
  billing_data: Record<string, unknown> | null;
}

interface WompiTransactionEnvelope {
  data: WompiTransaction;
  meta?: unknown;
}

export async function getWompiAcceptanceToken(): Promise<string> {
  const response = await fetch(`${WOMPI_CONFIG.BASE_URL}/merchants/${WOMPI_CONFIG.PUBLIC_KEY}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error obteniendo acceptance_token: ${errorData.error?.reason || "Error desconocido"}`);
  }
  const result = await response.json();
  return result.data.presigned_acceptance.acceptance_token;
}

export async function tokenizeCard(cardData: {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}): Promise<WompiTokenResponse> {
  const cleanCardData = {
    number: cardData.number.replace(/\s/g, ''),
    cvc: cardData.cvc,
    exp_month: cardData.exp_month.padStart(2, '0'),
    exp_year: cardData.exp_year.slice(-2).padStart(2, '0'),
    card_holder: cardData.card_holder.trim(),
  };

  const response = await fetch(`${WOMPI_CONFIG.BASE_URL}/tokens/cards`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${WOMPI_CONFIG.PUBLIC_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(cleanCardData),
  });

  if (!response.ok) {
    const errorData = await response.json();

    let errorMsg= '';
     errorMsg =
      errorData.error?.reason ||
      Object.values(errorData.error?.messages || {})
        .flat()
        .join(", ") || 
      "Error desconocido";

    throw new Error(`${errorMsg}`);
  }

  return response.json();
}


export async function createWompiTransaction(data: {
  amount_in_cents: number; currency: string; customer_email: string;
  payment_method: { type: string; token: string; installments: number };
  reference: string; acceptance_token: string; customer_data?: { phone_number?: string; full_name?: string };
}): Promise<WompiTransaction> {
  const signature = await generateIntegritySignature(data.reference, data.amount_in_cents, data.currency);
  const transactionData = { ...data, signature };
  const response = await fetch(`${WOMPI_CONFIG.BASE_URL}/transactions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${WOMPI_CONFIG.PRIVATE_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(transactionData),
  });
  if (!response.ok) {
    const errorData = await response.json();
    let errorMessage = "Error desconocido";
    if (errorData.error?.messages) {
      const fieldErrors = Object.entries(errorData.error.messages)
        .map(([field, errors]) => (Array.isArray(errors) ? `${field}: ${errors.join(', ')}` : `${field}: ${String(errors)}`))
        .join('; ');
      errorMessage = `Errores de validación: ${fieldErrors}`;
    } else if (errorData.error?.reason) {
      errorMessage = errorData.error.reason;
    }
    throw new Error(`Error creando transacción: ${errorMessage}`);
  }
  const result: WompiTransactionEnvelope = await response.json();
  console.log( 'Resultado data -> ',result )
  return result.data; // devolver solo el objeto de transacción
}

export async function getWompiTransaction(transactionId: string): Promise<WompiTransaction> {
  const response = await fetch(`${WOMPI_CONFIG.BASE_URL}/transactions/${transactionId}`, {
    method: "GET",
    headers: { Authorization: `Bearer ${WOMPI_CONFIG.PRIVATE_KEY}` },
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error obteniendo transacción: ${errorData.error?.reason || "Error desconocido"}`);
  }
  const result: WompiTransactionEnvelope = await response.json();
  return result.data; // devolver solo el objeto de transacción
}