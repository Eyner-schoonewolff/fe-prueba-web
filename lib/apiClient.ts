export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

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
    let errorMessage = `API error ${res.status}`;
    try {
      const errorBody = await res.text();
      if (errorBody) {
        try {
          const parsed = JSON.parse(errorBody);
          errorMessage = parsed.message || parsed.error || errorMessage;
        } catch {
          errorMessage = errorBody;
        }
      }
    } catch {
      // If we can't read the error body, use the default message
    }
    throw new ApiError(res.status, res.statusText, errorMessage);
  }
  
  return res.json() as Promise<T>;
}