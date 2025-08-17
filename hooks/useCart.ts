import { useLocalStorage } from "./useLocalStorage";
import type { Product } from "@/types/product";

export function useCart() {
  const [items, setItems] = useLocalStorage<Product[]>("cart", []);

  const addItem = (product: Product) => {
    setItems((prev) => {
      const exists = prev.find((p) => p.id === product.id);
      if (exists) return prev;
      return [...prev, product];
    });
  };

  const clear = () => setItems([]);

  return { items, addItem, clear };
}