export type TransactionStatus = "PENDING" | "COMPLETED" | "FAILED";

export type Transaction = {
  id: string;
  productId: string;
  amount: number;
  status: TransactionStatus;
  createdAt: string;
};