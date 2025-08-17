// Real API client for backend integration
import type { Product } from "@/types/product";
import type { Transaction } from "@/types/transaction";
import type { Customer } from "@/types/customer";
import { api } from "./apiClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:9000";
const DEMO_CUSTOMER_ID = "8690975e-02f5-42cc-9df1-b3f66febb094";

// Backend response type (snake_case)
interface BackendTransaction {
  id: string;
  product_id: string;
  customer_id: string;
  amount: number;
  status: "PENDING" | "COMPLETED" | "FAILED";
  created_at: string;
}

export async function getProducts(): Promise<Product[]> {
  return api<Product[]>(`${BASE_URL}/products`);
}

export async function createTransaction(productId: string): Promise<Transaction> {
  const response = await api<BackendTransaction>(`${BASE_URL}/transactions`, {
    method: 'POST',
    body: JSON.stringify({ 
      productId,
      customerId: DEMO_CUSTOMER_ID,
      customerName: "Cliente DEMO", 
      customerEmail: "demo@example.com" 
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

export async function confirmTransaction(id: string, cardNumber?: string): Promise<Transaction> {
  // Simular aprobación/rechazo basado en número de tarjeta
  let status: "COMPLETED" | "FAILED" = "COMPLETED";
  if (cardNumber) {
    if (cardNumber.startsWith("4000") || cardNumber.startsWith("4100")) {
      status = "FAILED";
    }
  }
  
  const response = await api<BackendTransaction>(`${BASE_URL}/transactions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ 
      status, 
      wompiTransactionId: `WOMPI_${id}_${Date.now()}` 
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

export async function createCustomer(customerData: { 
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}): Promise<Customer> {
  return api<Customer>(`${BASE_URL}/customers`, {
    method: 'POST',
    body: JSON.stringify({
      name: customerData.name,
      email: customerData.email,
      phone: customerData.phone,
      address: customerData.address
    }),
  });
}

export async function getTransactionsByCustomer(customerId: string = DEMO_CUSTOMER_ID): Promise<Transaction[]> {
  const response = await api<BackendTransaction[]>(`${BASE_URL}/transactions?customerId=${encodeURIComponent(customerId)}`);
  return (response || []).map(tx => ({
    id: tx.id,
    productId: tx.product_id,
    amount: tx.amount ?? 0,
    status: tx.status,
    createdAt: tx.created_at,
  }) as Transaction);
}

