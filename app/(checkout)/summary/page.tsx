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
    let prefix: string | undefined = undefined;
    if (typeof window !== 'undefined') {
      prefix = localStorage.getItem('cardNumberPrefix4') || undefined;
    }
    const updated = await confirmTransaction(tx.id, prefix);
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