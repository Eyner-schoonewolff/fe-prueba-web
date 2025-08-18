"use client";
import { useEffect, useState } from "react";
import { getProducts, createTransaction } from "@/lib/api";
import type { Product } from "@/types/product";
import { ProductCard } from "@/components/product/ProductCard";
import { useRouter } from "next/navigation";
import { usePayment } from "@/hooks/usePayment";

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { setTx } = usePayment();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getProducts();
        if (mounted) setProducts(data);
      } catch (e: unknown) {
        if (mounted) setError(e instanceof Error ? e.message : "Error cargando productos");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const onBuy = async (p: Product) => {
    const tx = await createTransaction(p.id);
    setTx(tx);
    router.push("/payment");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Catálogo</h1>
        <div className="text-sm text-[var(--muted)]">Demo UI Wompi</div>
      </div>

      {loading && (
        <div className="flex items-center gap-3 text-[var(--muted)]">
          <span className="inline-block h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full animate-spin"></span>
          Cargando productos...
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onBuy={onBuy} />
          ))}
        </div>
      )}
    </div>
  );
}
