"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { validateCardNumber, validateCVC, validateExp, validateEmail } from "@/lib/validators";

export type CardData = { 
  number: string; 
  name: string; 
  exp: string; 
  cvc: string; 
  email: string;
  // Delivery information
  fullName: string;
  phone: string;
  address: string;
  city: string;
};

export function CardForm({ onValid }: { onValid: (card: CardData) => void }) {
  const [form, setForm] = useState<CardData>({ 
    number: "", 
    name: "", 
    exp: "", 
    cvc: "", 
    email: "",
    fullName: "",
    phone: "",
    address: "",
    city: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Ciudades de Colombia desde API pública
  const [cities, setCities] = useState<{id: number, name: string}[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const [citiesError, setCitiesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCities() {
      try {
        setLoadingCities(true);
        setCitiesError(null);
        // Endpoint público de API-Colombia para listar ciudades
        const res = await fetch("https://api-colombia.com/api/v1/City");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        // Se espera un arreglo de ciudades con propiedad name e id
        const filtered = (Array.isArray(data) ? data : [])
          .filter((c: { name?: string; id?: number }) => c?.name && c?.id)
          .map((c: { name: string; id: number }) => ({id: c.id, name: c.name}));
        if (!cancelled) {
          // Orden alfabético
          filtered.sort((a, b) => a.name.localeCompare(b.name, "es"));
          setCities(filtered);
        }
      } catch (_err: unknown) {
        if (!cancelled) setCitiesError('No fue posible cargar las ciudades. Puedes escribirla manualmente.' + _err);
      } finally {
        if (!cancelled) setLoadingCities(false);
      }
    }
    loadCities();
    return () => { cancelled = true; };
  }, []);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!validateCardNumber(form.number)) e.number = "Número inválido";
    if (!validateExp(form.exp)) e.exp = "MM/YY";
    if (!validateCVC(form.cvc)) e.cvc = "CVC inválido";
    if (!validateEmail(form.email)) e.email = "Email inválido";
    if (!form.fullName.trim()) e.fullName = "Nombre completo requerido";
    if (!form.phone.trim()) e.phone = "Teléfono requerido";
    if (!form.address.trim()) e.address = "Dirección requerida";
    if (!form.city.trim()) e.city = "Ciudad requerida";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev?: React.SyntheticEvent) => {
    ev?.preventDefault();
    if (validate()) onValid(form);
  };

  // Handlers con restricciones
  const handleExpChange = (value: string) => {
    // Solo dígitos, máximo 4, formateado como MM/YY
    const digits = value.replace(/\D/g, "").slice(0, 4);
    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    }
    setForm({ ...form, exp: formatted });
  };

  const handleCvcChange = (value: string) => {
    // Solo 3 dígitos
    const digits3 = value.replace(/\D/g, "").slice(0, 3);
    setForm({ ...form, cvc: digits3 });
  };

  return (
    <div className="space-y-6">
      {/* Card Information Section */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 card-shadow">
        <h3 className="text-lg font-semibold mb-4">Información de pago</h3>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Número de tarjeta</label>
            <div className="relative">
              <input 
                className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-wider" 
                value={form.number} 
                onChange={(e)=>setForm({...form, number:e.target.value.replace(/\s/g,"")})} 
                placeholder="4111 1111 1111 1111" 
                inputMode="numeric"
                autoComplete="cc-number"
                aria-invalid={!!errors.number}
              />
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-90">
                <Image src="/logos/visa.png" alt="Visa" width={32} height={20} />
                <Image src="/logos/mastercard.png" alt="Mastercard" width={32} height={20} />
              </div>
            </div>
            <p className="text-xs text-[var(--muted)] mt-1">Aceptamos Visa y Mastercard</p>
            {errors.number && <p className="text-[var(--error)] text-sm mt-1">{errors.number}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Nombre en la tarjeta</label>
            <input 
              className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={form.name} 
              onChange={(e)=>setForm({...form, name:e.target.value})} 
              placeholder="Como aparece en la tarjeta"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Expiración</label>
              <input 
                className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={form.exp} 
                onChange={(e)=>handleExpChange(e.target.value)} 
                placeholder="MM/YY" 
                inputMode="numeric"
                maxLength={5}
                autoComplete="cc-exp"
              />
              {errors.exp && <p className="text-[var(--error)] text-sm mt-1">{errors.exp}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">CVC</label>
              <input 
                className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={form.cvc} 
                onChange={(e)=>handleCvcChange(e.target.value)} 
                placeholder="Cód. seguridad" 
                type="password"
                inputMode="numeric"
                maxLength={3}
                autoComplete="cc-csc"
              />
              {errors.cvc && <p className="text-[var(--error)] text-sm mt-1">{errors.cvc}</p>}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Email</label>
            <input 
              className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={form.email} 
              onChange={(e)=>setForm({...form, email:e.target.value})} 
              placeholder="Tu correo para el recibo" 
            />
            <p className="text-xs text-[var(--muted)] mt-1">Te enviaremos el comprobante de pago a este correo</p>
            {errors.email && <p className="text-[var(--error)] text-sm mt-1">{errors.email}</p>}
          </div>
        </form>
      </div>

      {/* Delivery Information Section */}
      <div className="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-6 card-shadow">
        <h3 className="text-lg font-semibold mb-4">Información de entrega</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Nombre completo</label>
            <input 
              className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={form.fullName} 
              onChange={(e)=>setForm({...form, fullName:e.target.value})} 
              placeholder="Ej. Juan Andrés Pérez García"
            />
            {errors.fullName && <p className="text-[var(--error)] text-sm mt-1">{errors.fullName}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Teléfono</label>
            <input 
              className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={form.phone} 
              onChange={(e)=>setForm({...form, phone:e.target.value})} 
              placeholder="Ej. +57 300 123 4567"
            />
            {errors.phone && <p className="text-[var(--error)] text-sm mt-1">{errors.phone}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Dirección</label>
            <input 
              className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={form.address} 
              onChange={(e)=>setForm({...form, address:e.target.value})} 
              placeholder="Calle 123 #45-67, Apto 8B"
            />
            {errors.address && <p className="text-[var(--error)] text-sm mt-1">{errors.address}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-2">Ciudad</label>
            {citiesError ? (
              <input
                className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Ej. Bogotá"
              />
            ) : (
              <select
                className="w-full border border-[var(--border-color)] rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-[var(--card-bg)]"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              >
                <option value="" disabled>
                  {loadingCities ? "Cargando ciudades..." : "Selecciona una ciudad"}
                </option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            )}
            {citiesError && (
              <p className="text-[var(--error)] text-sm mt-1">{citiesError}</p>
            )}
            {errors.city && <p className="text-[var(--error)] text-sm mt-1">{errors.city}</p>}
          </div>
        </div>
      </div>

      <button 
        className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--foreground)] font-semibold rounded-full transition-colors focus:ring-2 focus:ring-[#65B564] focus:ring-offset-2"
        onClick={() => submit()}
      >
        Continuar al resumen
      </button>
    </div>
  );
}