'use client';

import { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { getProducts, getProductsByCategory } from '../lib/db';
import Navbar from '../components/layout/navbar';
import CategoryBar from '../components/layout/CategoryBar';
import SkeletonLoader from '../components/SkeletonLoader';
import type { Product } from '../types/product';

// Use dynamic import with ssr: false for ProductGrid
const ProductGrid = dynamic(
  () => import('../components/products/ProductGrid'),
  { ssr: false }
);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [prevCategory, setPrevCategory] = useState<string>('');

  // Add mounted state to prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCategorySelect = async (category: string) => {
    if (prevCategory === category) return;
    setPrevCategory(category);
    setLoading(true);
    
    try {
      const fetchedProducts = category 
        ? await getProductsByCategory(category) 
        : await getProducts();
      
      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, index) => (
        <SkeletonLoader key={index} />
      ))}
    </div>
  );

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return <LoadingGrid />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        <CategoryBar onCategorySelect={handleCategorySelect} />
        <div className="mt-4 px-4 sm:px-6 lg:px-8">
          <Suspense fallback={<LoadingGrid />}>
            {loading ? <LoadingGrid /> : <ProductGrid products={products} />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}