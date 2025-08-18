"use client";
import { useRouter } from "next/navigation";
import { usePayment } from "@/hooks/usePayment";
import { Summary } from "@/components/payment/Summary";
import { confirmTransaction } from "@/lib/wompi";

export default function SummaryPage(){
  const router = useRouter();
  const { tx, setTx } = usePayment();

  if (!tx) return <div className="p-6">No hay transacción activa.</div>;

  const onConfirm = async () => {
    try {
      let cardData: {
        number: string;
        cvc: string;
        exp_month: string;
        exp_year: string;
        card_holder: string;
      } | undefined = undefined;
      if (typeof window !== 'undefined') {
        // Obtener datos completos de la tarjeta del localStorage
        const storedCardData = localStorage.getItem('cardData');
        if (storedCardData) {
          cardData = JSON.parse(storedCardData);
        }
      }

      if (!cardData) {
        throw new Error('No se encontraron datos de la tarjeta. Por favor, regresa al paso anterior.');
      }

      const updated = await confirmTransaction(tx.id, cardData);
      setTx({ ...tx, status: updated.status });
      router.push("/status");
    } catch (error) {
      console.error('Error confirmando transacción:', error);
      // Mostrar error al usuario o manejar de otra forma
      alert(`Error procesando el pago: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
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