"use client";
import { usePayment } from "@/hooks/usePayment";
import { LockClosedIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/wompi";

export function Summary({ onConfirm }: { onConfirm: () => void }) {
  const { tx } = usePayment();
  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [loadingBase, setLoadingBase] = useState<boolean>(true);

  useEffect(() => {
    let aborted = false;
    async function ensureBaseAmount() {
      if (!tx) return;
      try {
        setLoadingBase(true);
        if (tx.amount && tx.amount > 0) {
          if (!aborted) setBaseAmount(tx.amount);
          return;
        }
        // Fallback: buscar el precio del producto en el catálogo si amount llegó en 0
        const products = await getProducts();
        const p = products.find(pr => pr.id === tx.productId);
        if (!aborted) setBaseAmount(p?.price ?? 0);
      } finally {
        if (!aborted) setLoadingBase(false);
      }
    }
    ensureBaseAmount();
    return () => { aborted = true; };
  }, [tx]);

  if (!tx) return null;

  // Envío 0.5% y tarifa 2% del precio del producto (baseAmount)
  const shipping = Math.round(baseAmount * 0.005);
  const fee = Math.round(baseAmount * 0.02);
  const total = baseAmount + shipping + fee;

  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 card-shadow space-y-3">
      <div className="flex justify-between text-sm text-[var(--muted)]"><span>Producto</span><span>{loadingBase ? '—' : `$${(baseAmount/100).toFixed(2)}`}</span></div>
      <div className="flex justify-between text-sm text-[var(--muted)]"><span>Tarifa base (2%)</span><span>{loadingBase ? '—' : `$${(fee/100).toFixed(2)}`}</span></div>
      <div className="flex justify-between text-sm text-[var(--muted)]"><span>Envío (0.5%)</span><span>{loadingBase ? '—' : `$${(shipping/100).toFixed(2)}`}</span></div>
      <hr className="border-[var(--border-color)]" />
      <div className="flex justify-between font-semibold text-lg"><span>Total</span><span>{loadingBase ? '—' : `$${(total/100).toFixed(2)}`}</span></div>
      <button className="w-full mt-2 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--foreground)] rounded-full font-medium shadow-md transition-colors flex items-center justify-center gap-2 disabled:opacity-60" onClick={onConfirm} disabled={loadingBase}>
        <LockClosedIcon className="h-5 w-5" />
        Confirmar pago
      </button>
    </div>
  );
}