export async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { 
    ...init, 
    headers: { 
      "Content-Type": "application/json", 
      ...(init?.headers || {}) 
    },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json() as Promise<T>;
}