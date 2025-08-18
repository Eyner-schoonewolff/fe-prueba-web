"use client";
import { usePayment } from "@/hooks/usePayment";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";
import { useEffect, useState } from "react";
import { getProducts } from "@/lib/wompi";

export default function StatusPage() {
  const { tx } = usePayment();
  const [stock, setStock] = useState<number | null>(null);
  const [loadingStock, setLoadingStock] = useState<boolean>(true);
  const [actualPrice, setActualPrice] = useState<number | null>(null);

  useEffect(() => {
    let aborted = false;
    async function loadProductData() {
      if (!tx) return;
      try {
        setLoadingStock(true);
        const products = await getProducts();
        if (!aborted) {
          const p = products.find(pr => pr.id === tx.productId);
          // Si no se encuentra (porque pudo quedar en 0 y ya no se lista), asumimos 0 stock
          setStock(p?.stock ?? 0);
          // Si tx.amount es 0, usar el precio del producto como fallback
          setActualPrice(tx.amount > 0 ? tx.amount : (p?.price ?? 0));
        }
      } catch {
        if (!aborted) {
          setStock(null);
          setActualPrice(tx.amount);
        }
      } finally {
        if (!aborted) setLoadingStock(false);
      }
    }
    
    // Limpiar datos sensibles de la tarjeta del localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cardData');
      localStorage.removeItem('cardLast4');
      localStorage.removeItem('cardNumberPrefix4');
    }
    
    loadProductData();
    return () => { aborted = true; };
  }, [tx]);

  if (!tx) return <div className="p-6">No hay transacción activa.</div>;
  const approved = tx.status === "COMPLETED";
  const displayAmount = actualPrice ?? tx.amount;
  
  return (
    <div className="p-6 max-w-xl">
      <div className={`bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-8 card-shadow text-center`}>
        <div className={`mx-auto mb-4 h-12 w-12 rounded-full flex items-center justify-center ${approved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {approved ? '✓' : '✕'}
        </div>
        <h1 className="text-2xl font-bold mb-2">{approved ? 'Pago aprobado' : 'Pago rechazado'}</h1>
        <p className="text-sm text-[var(--muted)]">Transacción #{tx.id.slice(0,6)}</p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Monto: ${(displayAmount/100).toFixed(2)}
          {loadingStock && tx.amount === 0 && <span className="ml-1 animate-pulse">(actualizando...)</span>}
        </p>

        {/* Saldo real del producto */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <span className="text-[var(--muted)]">Saldo actual del producto:</span>
          {loadingStock ? (
            <span className="inline-flex items-center h-6 px-3 rounded-full border border-[var(--border-color)] bg-neutral-50 text-neutral-500 animate-pulse">
              Consultando...
            </span>
          ) : stock === null ? (
            <span className="inline-flex items-center h-6 px-3 rounded-full border border-red-200 bg-red-50 text-red-700">
              Error al consultar
            </span>
          ) : stock === 0 ? (
            <span className="inline-flex items-center h-6 px-3 rounded-full border border-red-200 bg-red-50 text-red-700">
              Agotado
            </span>
          ) : (
            <span className="inline-flex items-center h-6 px-3 rounded-full border border-green-200 bg-green-50 text-green-700">
              {stock} unidades
            </span>
          )}
        </div>

        <div className="mt-6">
          <Link
            href="/"
            aria-label="Volver al catálogo"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-md transition-all bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#65B564] focus:ring-offset-2 border border-[var(--border-color)]"
          >
            <ArrowLeftIcon className="h-5 w-5" />
            Volver al catálogo
          </Link>
        </div>
      </div>
    </div>
  );
}