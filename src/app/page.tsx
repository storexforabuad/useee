'use client';

import { useState, useEffect, Suspense, lazy } from 'react';
import { getProducts, getProductsByCategory } from '../lib/db';
import Navbar from '../components/layout/navbar';
import CategoryBar from '../components/layout/CategoryBar';
import SkeletonLoader from '../components/SkeletonLoader';
import { Product } from '../types/product';

// Lazy load ProductGrid
const ProductGrid = lazy(() => import('../components/products/ProductGrid'));

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [prevCategory, setPrevCategory] = useState<string>('');

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

  // Initial data fetch with cleanup
  useEffect(() => {
    let mounted = true;

    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts();
        if (mounted) {
          setProducts(fetchedProducts);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        if (mounted) setLoading(false);
      }
    };

    fetchProducts();

    return () => {
      mounted = false;
    };
  }, []);

  const LoadingGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
      {[...Array(8)].map((_, index) => (
        <SkeletonLoader key={index} />
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
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