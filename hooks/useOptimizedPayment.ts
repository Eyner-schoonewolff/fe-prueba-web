import { useCallback, useMemo } from "react";
import { usePayment } from "./usePayment";

/**
 * Hook optimizado para el flujo de pago que reduce re-renders
 * y mejora el rendimiento del proceso de pago
 */
export function useOptimizedPayment() {
  const { tx, setTx } = usePayment();

  const paymentInfo = useMemo(() => {
    if (!tx) return null;

    const baseAmount = tx.amount || 0;
    const shipping = Math.round(baseAmount * 0.005);
    const fee = Math.round(baseAmount * 0.02);
    const total = baseAmount + shipping + fee;

    return {
      baseAmount,
      shipping,
      fee,
      total,
      formattedBase: `$${(baseAmount/100).toFixed(2)}`,
      formattedShipping: `$${(shipping/100).toFixed(2)}`,
      formattedFee: `$${(fee/100).toFixed(2)}`,
      formattedTotal: `$${(total/100).toFixed(2)}`
    };
  }, [tx]);

  const updateTransaction = useCallback((updates: Partial<typeof tx>) => {
    if (!tx) return;
    setTx({ ...tx, ...updates });
  }, [tx, setTx]);

  return {
    tx,
    paymentInfo,
    updateTransaction,
    isReady: !!tx
  };
}
