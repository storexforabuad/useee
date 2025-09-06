// Simple in-memory cache for product details
import type { Product } from '../types/product';

const cache: Record<string, Product> = {};

export const ProductDetailCache = {
  get(id: string): Product | undefined {
    return cache[id];
  },
  set(id: string, product: Product) {
    cache[id] = product;
  },
  clear() {
    Object.keys(cache).forEach(key => delete cache[key]);
  }
};
