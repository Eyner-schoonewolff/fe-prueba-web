"use client";
import { usePayment } from "@/hooks/usePayment";
import { CardForm, type CardData } from "@/components/payment/CardForm";
import { useRouter } from "next/navigation";

export default function PaymentPage(){
  const { tx } = usePayment();
  const router = useRouter();

  const handleValid = (card: CardData) => {
    console.log("card ok", { ...card, number: card.number.slice(-4).padStart(card.number.length, "*") });
    // Guardar últimos 6 dígitos para simulación en confirmación
    if (typeof window !== 'undefined') {
      localStorage.setItem('cardLast4', card.number.slice(-4));
      localStorage.setItem('cardNumberPrefix4', card.number.slice(0,4));
    }
    router.push("/summary");
  };

  if (!tx) return <div className="p-6">No hay transacción activa. Regresa al producto.</div>;

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4">
        <h2 className="text-2xl font-semibold">Pago</h2>
        <p className="text-sm text-[var(--muted)]">Transacción #{tx.id.slice(0,6)}</p>
      </div>
      <CardForm onValid={handleValid} />
    </div>
  )
}