"use client";
import { useEffect, useState } from "react";
import { getTransactionsByCustomer } from "@/lib/wompi";
import type { Transaction } from "@/types/transaction";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    
    async function loadTransactions() {
      try {
        setLoading(true);
        setError(null);
        const txs = await getTransactionsByCustomer();
        if (!aborted) {
          setTransactions(txs);
        }
      } catch (err) {
        if (!aborted) {
          setError("Error al cargar transacciones");
          console.error("Error loading transactions:", err);
        }
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }
    }

    loadTransactions();
    return () => { aborted = true; };
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-pulse text-[var(--muted)]">
          Cargando transacciones...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("es-ES", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return dateStr;
    }
  };

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "FAILED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "Completada";
      case "PENDING":
        return "Pendiente";
      case "FAILED":
        return "Fallida";
      default:
        return status;
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Mis Transacciones</h1>
        <p className="text-[var(--muted)]">Usuario DEMO - Historial de compras</p>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-[var(--muted)] mb-4">
            No tienes transacciones aún
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors"
          >
            Ir al catálogo
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-4 card-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm text-[var(--muted)]">
                      #{tx.id.slice(0, 8)}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                        tx.status
                      )}`}
                    >
                      {getStatusText(tx.status)}
                    </span>
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    Producto: {tx.productId.slice(0, 8)}...
                  </div>
                  <div className="text-sm text-[var(--muted)]">
                    {formatDate(tx.createdAt)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {formatAmount(tx.amount)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 text-center">
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
  );
}