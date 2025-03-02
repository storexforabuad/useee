'use client';

import { useState, useEffect } from 'react';
import { getPopularProducts } from '../lib/db';
import { Product } from '../types/product';
import Image from 'next/image';
import Link from 'next/link';
import SkeletonLoader from './SkeletonLoader';

const PopularProducts = () => {
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      const products = await getPopularProducts(5); // Get top 5 popular products
      setPopularProducts(products);
      setLoading(false);
    };
    fetchPopularProducts();
  }, []);

  if (loading) {
    return (
      <div>
        <h2 className="text-xl font-semibold">Popular Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {[...Array(5)].map((_, index) => (
            <SkeletonLoader key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold">Popular Products</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {popularProducts.map((product) => (
          <Link key={product.id} href={`/products/${product.id}`} className="border p-4 rounded-lg hover:shadow-lg transition-shadow">
            {product.images[0] && (
              <Image
                src={product.images[0]}
                alt={product.name}
                width={300}
                height={300}
                className="object-cover rounded-lg"
                loading="lazy" // Add lazy loading
              />
            )}
            <h3 className="mt-2 text-lg font-bold">{product.name}</h3>
            <p className="mt-1 text-gray-600">{product.description}</p>
            <p className="mt-1 text-gray-900 font-semibold">{product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default PopularProducts;