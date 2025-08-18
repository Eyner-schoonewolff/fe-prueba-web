"use client";
import { usePayment } from "@/hooks/usePayment";
import { CardForm, type CardData } from "@/components/payment/CardForm";
import { useRouter } from "next/navigation";

export default function PaymentPage(){
  const { tx } = usePayment();
  const router = useRouter();

  const handleValid = (card: CardData) => {
    console.log("card ok", { ...card, number: card.number.slice(-4).padStart(card.number.length, "*") });
    
    // Guardar datos completos de la tarjeta para Wompi (de forma segura)
    if (typeof window !== 'undefined') {
      // Guardar datos para la integración con Wompi
      const expParts = card.exp.split('/');
      const month = expParts[0].padStart(2, '0'); // Asegurar 2 dígitos
      const year = expParts[1];
      
      // Wompi requiere formato YY (2 dígitos), no YYYY
      const twoDigitYear = year.length === 4 ? year.slice(-2) : year.padStart(2, '0');
      
      const cardDataForWompi = {
        number: card.number.replace(/\s/g, ''), // Remover espacios
        cvc: card.cvc,
        exp_month: month,
        exp_year: twoDigitYear, // YY format
        card_holder: card.name
      };
      
      localStorage.setItem('cardData', JSON.stringify(cardDataForWompi));
      
      // Mantener compatibilidad con código existente
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