import type { Product } from "@/types/product";
import Image from "next/image";

export function ProductCard({ product, onBuy }: { product: Product; onBuy: (p: Product) => void }) {
  return (
    <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 card-shadow hover:card-shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-shrink-0">
          <Image
            src={product.image}
            alt={product.name}
            width={120}
            height={120}
            priority
            className="rounded-lg object-cover bg-gray-50"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">{product.name}</h3>
          <p className="text-sm text-[var(--muted)] mb-3 leading-relaxed">{product.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                {(product.price/100).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-[var(--muted)] mt-1">Stock disponible: {product.stock}</p>
            </div>
            <button 
              className="px-6 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--foreground)] font-medium rounded-full transition-colors focus:ring-2 focus:ring-[#65B564] focus:ring-offset-2"
              onClick={() => onBuy(product)}
            >
              Pagar con tarjeta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}