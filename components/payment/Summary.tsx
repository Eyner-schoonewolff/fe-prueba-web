"use client";
import { useOptimizedPayment } from "@/hooks/useOptimizedPayment";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { useEffect, useState, memo } from "react";
import { getProducts } from "@/lib/api";

export const Summary = memo(function Summary({ onConfirm }: { onConfirm: () => Promise<void> }) {
  const { tx, paymentInfo, isReady } = useOptimizedPayment();
  const [loadingBase, setLoadingBase] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [processingStep, setProcessingStep] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    let aborted = false;
    async function ensureBaseAmount() {
      if (!tx) return;
      try {
        setLoadingBase(true);
        if (tx.amount && tx.amount > 0) {
          if (!aborted) setLoadingBase(false);
          return;
        }
        // Fallback: buscar el precio del producto en el catálogo si amount llegó en 0
        await getProducts();
        // El hook optimizado ya maneja los cálculos, solo necesitamos verificar que tengamos el amount
        if (!aborted) setLoadingBase(false);
      } finally {
        if (!aborted) setLoadingBase(false);
      }
    }
    ensureBaseAmount();
    return () => { aborted = true; };
  }, [tx]);

  if (!isReady || !paymentInfo) return null;

  const handleConfirm = async () => {
    setErrorMsg("");
    setSubmitting(true);
    setProcessingStep("Procesando pago...");
    
    try {
      await onConfirm();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error desconocido";
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
      setProcessingStep("");
    }
  };

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 card-shadow space-y-3">
      <div className="flex justify-between text-sm text-[var(--muted)]"><span>Producto</span><span>{loadingBase ? '—' : paymentInfo.formattedBase}</span></div>
      <div className="flex justify-between text-sm text-[var(--muted)]"><span>Tarifa base (2%)</span><span>{loadingBase ? '—' : paymentInfo.formattedFee}</span></div>
      <div className="flex justify-between text-sm text-[var(--muted)]"><span>Envío (0.5%)</span><span>{loadingBase ? '—' : paymentInfo.formattedShipping}</span></div>
      <hr className="border-[var(--border-color)]" />
      <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{loadingBase ? '—' : paymentInfo.formattedTotal}</span></div>
      <button
        className="w-full mt-2 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--foreground)] rounded-full font-medium shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        onClick={handleConfirm}
        disabled={loadingBase || submitting}
        aria-busy={submitting}
      >
        {submitting ? (
          <>
            <span className="inline-block h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" aria-hidden="true"></span>
            {processingStep || "Procesando..."}
          </>
        ) : (
          <>
            <LockClosedIcon className="h-5 w-5" />
            Confirmar pago
          </>
        )}
      </button>
      {errorMsg && (
        <div className="mt-3 text-sm rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2">
          {errorMsg}
        </div>
      )}
    </div>
  );
});