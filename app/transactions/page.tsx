"use client";
import { useEffect, useState, useMemo } from "react";
import { getTransactionsByCustomer } from "@/lib/api";
import type { Transaction } from "@/types/transaction";
import Link from "next/link";
import { ArrowLeftIcon, FunnelIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface Filters {
  status: string;
  dateFrom: string;
  dateTo: string;
  minAmount: string;
  maxAmount: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deliveryMap, setDeliveryMap] = useState<Record<string, string>>({});
  
  // Estados para filtros y paginación
  const [filters, setFilters] = useState<Filters>({
    status: '',
    dateFrom: '',
    dateTo: '',
    minAmount: '',
    maxAmount: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    let aborted = false;
    
    async function loadTransactions() {
      try {
        setLoading(true);
        setError(null);
        const txs = await getTransactionsByCustomer();
        if (!aborted) {
          setTransactions(txs);
          // Cargar mapa de entregas desde localStorage
          if (typeof window !== 'undefined') {
            try {
              const stored = JSON.parse(localStorage.getItem('txDeliveries') || '{}');
              setDeliveryMap(stored);
            } catch {
              setDeliveryMap({});
            }
          }
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

  // Filtrar transacciones
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Filtro por estado
      if (filters.status && tx.status !== filters.status) {
        return false;
      }

      // Filtro por fecha
      if (filters.dateFrom) {
        const txDate = new Date(tx.createdAt);
        const fromDate = new Date(filters.dateFrom);
        if (txDate < fromDate) return false;
      }

      if (filters.dateTo) {
        const txDate = new Date(tx.createdAt);
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Incluir todo el día
        if (txDate > toDate) return false;
      }

      // Filtro por monto
      if (filters.minAmount) {
        const minAmount = parseFloat(filters.minAmount) * 100; // Convertir a centavos
        if (tx.amount < minAmount) return false;
      }

      if (filters.maxAmount) {
        const maxAmount = parseFloat(filters.maxAmount) * 100; // Convertir a centavos
        if (tx.amount > maxAmount) return false;
      }

      return true;
    });
  }, [transactions, filters]);

  // Paginación
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage);

  // Reset página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      dateFrom: '',
      dateTo: '',
      minAmount: '',
      maxAmount: ''
    });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Mis Transacciones</h1>
            <p className="text-[var(--muted)]">Usuario DEMO - Historial de compras</p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--card-bg)] hover:bg-[var(--card-hover)] border border-[var(--border-color)] rounded-lg font-medium transition-colors"
          >
            <FunnelIcon className="h-4 w-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </button>
        </div>

        {/* Panel de Filtros */}
        {showFilters && (
          <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg p-4 mb-6 card-shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Filtro por Estado */}
              <div>
                <label className="block text-sm font-medium mb-2">Estado</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                >
                  <option value="">Todos</option>
                  <option value="COMPLETED">Completada</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="FAILED">Fallida</option>
                </select>
              </div>

              {/* Filtro Fecha Desde */}
              <div>
                <label className="block text-sm font-medium mb-2">Desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              {/* Filtro Fecha Hasta */}
              <div>
                <label className="block text-sm font-medium mb-2">Hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              {/* Filtro Monto Mínimo */}
              <div>
                <label className="block text-sm font-medium mb-2">Monto Min ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.minAmount}
                  onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>

              {/* Filtro Monto Máximo */}
              <div>
                <label className="block text-sm font-medium mb-2">Monto Max ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={filters.maxAmount}
                  onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                  placeholder="999.99"
                  className="w-full px-3 py-2 border border-[var(--border-color)] rounded-lg bg-[var(--card-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mt-4 pt-4 border-t border-[var(--border-color)]">
              <div className="text-sm text-[var(--muted)]">
                Mostrando {paginatedTransactions.length} de {filteredTransactions.length} transacciones
                {filteredTransactions.length !== transactions.length && ` (${transactions.length} total)`}
              </div>
              <button
                onClick={clearFilters}
                className="px-3 py-1 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        )}
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
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-[var(--muted)] mb-4">
            No se encontraron transacciones que coincidan con los filtros
          </div>
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-medium transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginatedTransactions.map((tx) => (
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
                  {deliveryMap[tx.id] && (
                    <div className="mt-2 text-sm">
                      <span className="text-[var(--muted)]">Entrega: </span>
                      <Link href={`/deliveries`} className="font-mono underline">
                        {deliveryMap[tx.id]}
                      </Link>
                      <button
                        className="ml-2 text-xs underline text-[var(--muted)] hover:text-[var(--foreground)]"
                        onClick={() => {
                          try {
                            localStorage.setItem('lastDeliveryId', deliveryMap[tx.id]);
                          } catch {}
                        }}
                      >
                        consultar
                      </button>
                    </div>
                  )}
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

          {/* Componente de Paginación */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-8 gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--muted)] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeftIcon className="h-4 w-4" />
                Anterior
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Mostrar solo páginas cercanas a la actual
                  const showPage = 
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 2 && page <= currentPage + 2);
                  
                  if (!showPage) {
                    // Mostrar puntos suspensivos
                    if (page === currentPage - 3 || page === currentPage + 3) {
                      return (
                        <span key={page} className="px-3 py-2 text-sm text-[var(--muted)]">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-[var(--primary)] text-white'
                          : 'text-[var(--muted)] bg-[var(--card-bg)] border border-[var(--border-color)] hover:bg-[var(--card-hover)]'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-[var(--muted)] bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg hover:bg-[var(--card-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
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