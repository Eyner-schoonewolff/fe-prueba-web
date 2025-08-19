"use client";
import { useRouter } from "next/navigation";
import { usePayment } from "@/hooks/usePayment";
import { Summary } from "@/components/payment/Summary";
import { confirmTransaction, createDelivery } from "@/lib/api";

export default function SummaryPage(){
  const router = useRouter();
  const { tx, setTx } = usePayment();

  if (!tx) return <div className="p-6">No hay transacción activa.</div>;

  const onConfirm = async () => {
    let cardData: {
      number: string;
      cvc: string;
      exp_month: string;
      exp_year: string;
      card_holder: string;
    } | undefined = undefined;

    // Obtener datos completos de la tarjeta del localStorage
    if (typeof window !== 'undefined') {
      const storedCardData = localStorage.getItem('cardData');
      if (storedCardData) cardData = JSON.parse(storedCardData);
    }

    if (!cardData) {
      throw new Error('No se encontraron datos de la tarjeta. Por favor, regresa al paso anterior.');
    }

    console.log(`[UI] Confirmando transacción ${tx.id}...`);
    const updated = await confirmTransaction(tx.id, cardData);
    console.log(`[UI] Transacción ${tx.id} confirmada. Estado final -> ${updated.status}`);

    // Si el pago fue aceptado (COMPLETED), crear la entrega en el backend
    if (updated.status === "COMPLETED") {
      try {
        const delivery = await createDelivery(tx.productId);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastDeliveryId', delivery.id);
          // Mapear transacción -> entrega para poder mostrarlo en "Mis Transacciones"
          const key = 'txDeliveries';
          const prev = (() => { try { return JSON.parse(localStorage.getItem(key) || '{}'); } catch { return {}; } })();
          prev[tx.id] = delivery.id;
          localStorage.setItem(key, JSON.stringify(prev));
        }
        console.log(`[UI] Delivery creado id=${delivery.id} para producto=${tx.productId}`);
      } catch (e) {
        console.warn("[UI] No se pudo crear la entrega automáticamente:", e);
      }
    }

    setTx({ ...tx, status: updated.status });
    router.push("/status");
  };

  return (
    <div className="p-6 max-w-xl space-y-4">
      <div>
        <h2 className="text-2xl font-semibold">Resumen de pago</h2>
        <p className="text-sm text-[var(--muted)]">Revisa el detalle antes de confirmar</p>
      </div>
      <Summary onConfirm={onConfirm} />
    </div>
  )
}