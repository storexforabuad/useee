'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { DocumentSnapshot } from 'firebase/firestore';
import {
  getGlobalPromoProducts,
  getAllProductsByCategory,
  getPopularCategories,
  getGlobalNewestProducts,
  getGlobalPopularProducts,
  PaginatedProductsResult
} from '../../lib/db';
import { useConnectionCheck } from '../../hooks/useConnectionCheck';
import Navbar from '../../components/layout/navbar';
import CategoryBar from '../../components/layout/CategoryBar';
import SkeletonLoader from '../../components/SkeletonLoader';
import type { Product } from '../../types/product';
import ConnectionErrorToast from '../../components/ConnectionErrorToast';
import { CategoryCache } from '../../lib/categoryCache';
import { CustomerSessionProvider } from '@/context/CustomerSessionProvider';

const ProductGrid = dynamic(
  () => import('../../components/products/ProductGrid'),
  { ssr: false }
);

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3 sm:gap-4 px-4">
    {Array.from({ length: 12 }).map((_, index) => (
      <SkeletonLoader key={`product-skeleton-${index}`} />
    ))}
  </div>
);

const LoadingGrid = () => (
  <div className="space-y-6">
    <ProductGridSkeleton />
  </div>
);

const PRODUCTS_PAGE_SIZE = 24;

function BizconPageContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const storeName = "Bizcon Marketplace";
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Promo');
  const [lastVisible, setLastVisible] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const { isConnectionError, setIsConnectionError } = useConnectionCheck();
  const observerRef = useRef<HTMLDivElement>(null);
  const productGridRef = useRef<HTMLDivElement>(null);

  const fetchProducts = useCallback(async (category: string, lastDoc: DocumentSnapshot | null = null) => {
    if (loading) return;
    setLoading(true);
    
    const isInitialLoad = lastDoc === null;

    try {
      let result: PaginatedProductsResult;
      
      switch (category) {
        case 'Promo':
          result = await getGlobalPromoProducts(lastDoc, PRODUCTS_PAGE_SIZE);
          break;
        case 'Popular':
          result = await getGlobalPopularProducts(lastDoc, PRODUCTS_PAGE_SIZE);
          break;
        case 'New Arrivals':
          result = await getGlobalNewestProducts(lastDoc, PRODUCTS_PAGE_SIZE);
          break;
        default:
          result = await getAllProductsByCategory(category, lastDoc, PRODUCTS_PAGE_SIZE);
          break;
      }
      
      if (result && result.products) {
        setProducts(prev => isInitialLoad ? result.products : [...prev, ...result.products]);
        setLastVisible(result.lastVisible);
        setHasMore(result.lastVisible !== null);
      } else {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error(`Error fetching products for category ${category}:`, error);
      setIsConnectionError(true);
    } finally {
      setLoading(false);
      if (isInitialLoad) setInitialLoading(false);
    }
  }, [loading, setIsConnectionError]);

  const handleCategorySelect = useCallback((category: string) => {
    setActiveCategory(category);
    setInitialLoading(true);
    setProducts([]);
    setLastVisible(null);
    setHasMore(true);
    fetchProducts(category, null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [fetchProducts]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const cacheKey = 'bizcon_popular_categories';
        const cached = CategoryCache.get(cacheKey);
        if (cached) {
          setCategories(cached);
        } else {
          const fetchedCategories = await getPopularCategories();
          CategoryCache.save(fetchedCategories, cacheKey);
          setCategories(fetchedCategories);
        }
        fetchProducts(activeCategory, null);
      } catch (error) {
        console.error("Error fetching initial bizcon data:", error);
        setIsConnectionError(true);
        setInitialLoading(false);
      }
    };
    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        fetchProducts(activeCategory, lastVisible);
      }
    }, { threshold: 1.0 });

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [hasMore, loading, activeCategory, fetchProducts, lastVisible]);

  return (
    <div className="min-h-screen bg-background overscroll-none">
      <Navbar storeName={storeName} />
      <div className="pt-16 pb-safe-area-inset-bottom">
        <CategoryBar 
          onCategorySelect={handleCategorySelect}
          activeCategory={activeCategory}
          categories={categories}
          onActiveCategoryClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
        <div className="mt-3 sm:mt-4">
          {initialLoading ? (
            <LoadingGrid />
          ) : (
            <>
              {isConnectionError && (
                <ConnectionErrorToast onRetry={() => fetchProducts(activeCategory, null)} />
              )}
              {products.length === 0 && !loading ? (
                 <div className="text-center py-10 px-4">No products found in this category.</div>
              ) : (
                <ProductGrid 
                  products={products}
                  containerRef={productGridRef}
                  storeId={null}
                />
              )}
              {hasMore && (
                <div ref={observerRef} className="h-8 flex items-center justify-center">
                   {loading && <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BizconPage() {
  return (
    <CustomerSessionProvider>
      <BizconPageContent />
    </CustomerSessionProvider>
  )
}
