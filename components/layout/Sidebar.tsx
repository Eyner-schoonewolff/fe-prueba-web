"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, createContext, useContext } from "react";
import { HomeIcon, BanknotesIcon, DocumentTextIcon, TruckIcon } from "@heroicons/react/24/solid";

const menu = [
  { label: "Inicio", href: "/", icon: HomeIcon },
  { label: "Mis Transacciones", href: "/transactions", icon: DocumentTextIcon },
  { label: "Entregas", href: "/deliveries", icon: TruckIcon },
  { label: "Recibir pagos", href: "/payment", icon: BanknotesIcon },
];

// Context para manejar el estado del sidebar
const SidebarContext = createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

// Hook para usar el contexto
export function useSidebar() {
  return useContext(SidebarContext);
}

// Provider del contexto
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Componente del botón del menú
export function MenuButton() {
  const { setOpen } = useSidebar();

  return (
    <button
      type="button"
      aria-label="Abrir menú"
      className="relative z-40 inline-flex h-10 w-10 items-center justify-center bg-transparent hover:bg-gray-100 text-[var(--foreground)] transition-colors focus:outline-none rounded-lg"
      onClick={() => setOpen(true)}
    >
      <span className="relative block w-6 h-4" aria-hidden="true">
        <span className="absolute top-0 left-0 h-0.5 w-6 bg-[var(--foreground)] rounded"></span>
        <span className="absolute top-1/2 -translate-y-1/2 left-0 h-0.5 w-6 bg-[var(--foreground)] rounded"></span>
        <span className="absolute bottom-0 left-0 h-0.5 w-6 bg-[var(--foreground)] rounded"></span>
      </span>
    </button>
  );
}

// Componente principal del Sidebar
export function Sidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-64 border-r border-[var(--border-color)] bg-[var(--sidebar-bg)] p-4 transform transition-transform duration-200 ease-out overflow-y-auto ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="mb-8 mt-3 px-4 flex items-center justify-center">
          <Image src="https://public-assets.wompi.com/brand_wompi/logos/logo-primary.svg" alt="Wompi" width={180} height={28} />
        </div>
        <nav className="space-y-1">
          {menu.map((m) => {
            const active = pathname === m.href;
            return (
              <Link
                key={m.href}
                href={m.href}
                className={`flex items-center gap-2 rounded px-3 py-2 transition-colors hover:bg-neutral-100 ${active ? "bg-neutral-100 font-medium text-[var(--foreground)] border-l-4 border-[var(--primary)]" : "text-[var(--foreground)]"}`}
              >
                {m.icon ? <m.icon className="h-5 w-5" /> : null}
                <span>{m.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}