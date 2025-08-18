import { WOMPI_CONFIG } from './constants';

// Genera la firma de integridad para Wompi usando Web Crypto API (browser) o Node (SSR)
export async function generateIntegritySignature(reference: string, amountInCents: number, currency: string): Promise<string> {
  const payload = `${reference}${amountInCents}${currency}${WOMPI_CONFIG.INTEGRITY_SECRET}`;

  // Web Crypto API (navegador)
  const g: typeof globalThis | undefined = typeof globalThis !== 'undefined' ? globalThis : undefined;
  const subtle: SubtleCrypto | undefined = (g && 'crypto' in g && g.crypto && 'subtle' in g.crypto ? g.crypto.subtle : undefined) as SubtleCrypto | undefined;
  if (subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  // Node.js fallback (por si se ejecuta del lado del servidor)
  const { createHash } = await import('crypto');
  return createHash('sha256').update(payload).digest('hex');
}

// Safe JSON fetch helper
export async function fetchJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, init);
  if (!res.ok) {
    let errorMessage = `API error ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error?.reason) errorMessage = body.error.reason;
    } catch (_) { /* ignore */ }
    throw new Error(errorMessage);
  }
  return res.json() as Promise<T>;
}