export async function api<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, { 
    ...init, 
    headers: { 
      "Content-Type": "application/json", 
      ...(init?.headers || {}) 
    },
    cache: 'no-store'
  });
  
  if (!res.ok) {
    // Proporcionar más información sobre errores específicos
    if (res.status === 401) {
      console.error('Error 401: No autorizado. Verifica que el API key sea válido.');
      console.error('URL:', input);
      console.error('Headers enviados:', init?.headers);
    } else if (res.status === 403) {
      console.error('Error 403: Prohibido. El API key no tiene permisos suficientes.');
    } else if (res.status === 404) {
      console.error('Error 404: Endpoint no encontrado:', input);
    }
    
    throw new Error(`API error ${res.status}: ${res.statusText}`);
  }
  
  return res.json() as Promise<T>;
}