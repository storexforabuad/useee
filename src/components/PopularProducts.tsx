import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getPopularProducts } from '../lib/db';
import { Product } from '../types/product';

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const popularProducts = await getPopularProducts();
        setProducts(popularProducts);
      } catch (error) {
        console.error('Error fetching popular products:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-card-hover h-24 rounded-lg"></div>
      ))}
    </div>;
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <Link 
          key={product.id} 
          href={`/products/${product.id}`}
          className="bg-card-background rounded-lg shadow-[var(--shadow-md)] hover:shadow-[var(--shadow-lg)] 
            p-4 transition-all hover:-translate-y-1"
        >
          <div className="aspect-square relative mb-3 overflow-hidden rounded-lg bg-card-hover">
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="text-text-primary font-semibold truncate">{product.name}</h3>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-text-secondary">
              {new Intl.NumberFormat('en-NG', {
                style: 'currency',
                currency: 'NGN'
              }).format(product.price)}
            </p>
            <div className="text-xs px-2 py-1 rounded-full bg-card-hover text-text-secondary">
              Popular
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}1