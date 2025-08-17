import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../styles/globals.css";
import "../styles/variables.css";
import Image from "next/image";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wompi - Pago Fácil y Seguro",
  description: "Plataforma de pagos Wompi - Realiza transacciones de manera fácil y segura",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  other: {
    google: "notranslate",
  },
};

import { Sidebar, SidebarProvider, MenuButton } from "@/components/layout/Sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" translate="no" className="notranslate">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <SidebarProvider>
          <Sidebar />
          <main className="min-h-screen md:ml-64 ml-0">
            {/* Navbar profesional */}
            <nav className="bg-gradient-to-r from-slate-50 to-white shadow-lg border-b border-[var(--border-color)] backdrop-blur-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:justify-center">
                  {/* Botón menú móvil - solo visible en móvil */}
                  <div className="md:hidden">
                    <MenuButton />
                  </div>
                
                {/* Logo y título centrados */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-[var(--primary)]/10 rounded-full blur-sm"></div>
                    <Image 
                      src="/logos/wompi_logo.png" 
                      alt="Wompi" 
                      width={56}
                      height={56}
                      className="h-14 w-auto relative z-10 drop-shadow-sm"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-[var(--muted)] font-medium">Pagos Fáciles y Seguros</p>
                  </div>
                </div>
                
                {/* Espacio para equilibrar en móvil */}
                <div className="md:hidden w-10"></div>
              </div>
            </div>
          </nav>
          
          {/* Contenido principal */}
          <div className="p-4 md:p-8">
            <div className="max-w-5xl mx-auto space-y-6">
              {children}
            </div>
          </div>
        </main>
        </SidebarProvider>
      </body>
    </html>
  );
}
