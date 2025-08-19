"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getDelivery } from "@/lib/api";
import { ApiError } from "@/lib/apiClient";

type Delivery = {
  id: string;
  product_id: string;
  customer_id: string;
  status: "CREATED" | "IN_PROGRESS" | "DELIVERED";
  created_at?: string;
};

export default function DeliveriesPage() {
  const [lastId, setLastId] = useState<string | null>(null);
  const [queryId, setQueryId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [delivery, setDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = window.localStorage.getItem("lastDeliveryId");
    if (stored) setLastId(stored);
  }, []);

  const chip = useMemo(() => {
    if (!delivery) return null;
    const base = "inline-flex items-center h-6 px-3 rounded-full border text-sm";
    if (delivery.status === "DELIVERED")
      return <span className={`${base} border-green-200 bg-green-50 text-green-700`}>Entregado</span>;
    if (delivery.status === "IN_PROGRESS")
      return <span className={`${base} border-amber-200 bg-amber-50 text-amber-700`}>En progreso</span>;
    return <span className={`${base} border-neutral-200 bg-neutral-50 text-neutral-700`}>Creado</span>;
  }, [delivery]);

  const fetchDelivery = async (id: string) => {
    setError("");
    setLoading(true);
    setDelivery(null);
    try {
      const d = await getDelivery(id);
      setDelivery(d as Delivery);
    } catch (e) {
      if (e instanceof ApiError) {
        if (e.status === 400 || e.status === 404) {
          setError("Código de entrega inválido o no encontrado");
        } else {
          setError("No se pudo consultar la entrega. Intenta nuevamente.");
        }
      } else {
        setError("No se pudo consultar la entrega. Intenta nuevamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (lastId) fetchDelivery(lastId);
  }, [lastId]);

  const onQuery = () => {
    if (!queryId || !queryId.trim()) {
      setError("Ingresa un código de entrega");
      setDelivery(null);
      return;
    }
    fetchDelivery(queryId.trim());
  };

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Estado de entregas</h1>
        <p className="text-sm text-[var(--muted)]">Consulta el estado de tu entrega. Si realizaste un pago aprobado, se habrá creado una entrega automáticamente.</p>
      </div>

      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-5 card-shadow space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            placeholder="ID de entrega"
            value={queryId}
            onChange={(e) => setQueryId(e.target.value)}
            className="flex-1 rounded-md border border-[var(--border-color)] bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#65B564]"
          />
          <button
            onClick={onQuery}
            disabled={loading}
            className="mt-2 sm:mt-0 inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--primary-hover)] disabled:opacity-60"
          >
            Consultar
          </button>
        </div>

        {lastId && (
          <div className="text-xs text-[var(--muted)]">
            Última entrega creada automáticamente: <span className="font-mono">{lastId}</span>
            <button className="ml-2 underline" onClick={() => fetchDelivery(lastId)} disabled={loading}>
              Ver estado
            </button>
          </div>
        )}

        {loading && (
          <div className="text-sm text-[var(--muted)]">Consultando estado...</div>
        )}

        {error && (
          <div className="text-sm rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2">{error}</div>
        )}

        {delivery && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <div className="text-[var(--muted)]">Entrega</div>
                <div className="font-mono text-sm">{delivery.id}</div>
              </div>
              {chip}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-[var(--muted)]">Producto</div>
                <div className="font-mono">{delivery.product_id}</div>
              </div>
              <div>
                <div className="text-[var(--muted)]">Cliente</div>
                <div className="font-mono">{delivery.customer_id}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6">
        <Link
          href="/"
          aria-label="Volver al catálogo"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium shadow-md transition-all bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[#65B564] focus:ring-offset-2 border border-[var(--border-color)]"
        >
          Volver al catálogo
        </Link>
      </div>
    </div>
  );
}