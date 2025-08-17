import { useCallback, useEffect, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Solo en el cliente después de la hidratación
    if (typeof window === "undefined") return;
    try {
      const item = window.localStorage.getItem(key);
      const value = item ? (JSON.parse(item) as T) : initialValue;
      setStoredValue(value);
    } catch {
      setStoredValue(initialValue);
    }
    setHydrated(true);
  }, [key, initialValue]);

  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch {}
    }
  }, [key, storedValue, hydrated]);

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    setStoredValue((prev) => (value instanceof Function ? value(prev) : value));
  }, []);

  return [storedValue, setValue] as const;
}