import { useLocalStorage } from "./useLocalStorage";
import type { Transaction } from "@/types/transaction";

export function usePayment() {
  const [tx, setTx] = useLocalStorage<Transaction | null>("tx", null);
  return { tx, setTx };
}