export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  images: string[];
  inStock: boolean;
  features?: string[];
  limitedStock?: boolean;
  selectedSize?: string;
  size?: string;
  views: number;
  quantity: number;
  backInStock?: boolean;
  createdAt: {
    toMillis: () => number;
  };
  soldOut?: boolean;
}