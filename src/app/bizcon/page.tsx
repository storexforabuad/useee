'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  getGlobalPromoProducts,
  getAllProductsByCategory,
  getPopularCategories,
} from '../../lib/db';
import { useConnectionCheck } from '../../hooks/useConnectionCheck';
import Navbar from '../../components/layout/navbar';
import CategoryBar from '../../components/layout/CategoryBar';
import SkeletonLoader from '../../components/SkeletonLoader';
import type { Product } from '../../types/product';
import ConnectionErrorToast from '../../components/ConnectionErrorToast';
import { CategoryCache } from '../../lib/categoryCache';
import { ProductListCache } from '../../lib/productCache';

const ProductGrid = dynamic(
  () => import('../../components/products/ProductGrid'),
  { ssr: false }
);

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3 sm:gap-4 px-4">
    {Array.from({ length: 6 }).map((_, index) => (
      <SkeletonLoader key={`product-${index}`} />
    ))}
  </div>
);

const LoadingGrid = () => (
  <div className="space-y-6">
    <ProductGridSkeleton />
  </div>
);

const PRODUCTS_PAGE_SIZE = 24;

export default function BizconPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const storeName = "Bizcon Marketplace"; // Static store name
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Promo');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isConnectionError, setIsConnectionError } = useConnectionCheck();
  const productGridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const fetchMoreProducts = useCallback(async () => {
    if (loading || !hasMore) return;

    const nextPage = page + 1;
    setLoading(true);

    try {
      const cacheKey = `bizcon_products_${activeCategory || 'all'}_page${nextPage}`;
      let fetchedProducts;
      const cached = ProductListCache.get(cacheKey);

      if (cached && Array.isArray(cached)) {
        fetchedProducts = cached;
      } else {
        if (activeCategory === 'Promo') {
          fetchedProducts = await getGlobalPromoProducts(nextPage, PRODUCTS_PAGE_SIZE);
        } else {
          fetchedProducts = await getAllProductsByCategory(activeCategory, nextPage, PRODUCTS_PAGE_SIZE);
        }
        ProductListCache.set(cacheKey, fetchedProducts);
      }
      
      if (fetchedProducts.length > 0) {
        setProducts(prevProducts => {
          const existingIds = new Set(prevProducts.map(p => p.id));
          const newProducts = fetchedProducts.filter(p => !existingIds.has(p.id));
          return [...prevProducts, ...newProducts];
        });
        setPage(nextPage);
      }
      setHasMore(fetchedProducts.length === PRODUCTS_PAGE_SIZE);
    } catch (error) {
      console.error('Error fetching more global products:', error);
      setIsConnectionError(true);
    } finally {
      setLoading(false);
    }
  }, [page, activeCategory, loading, hasMore, setIsConnectionError]);


  const handleCategorySelect = useCallback((category: string) => {
    setActiveCategory(category);
    setPage(1);
    setProducts([]);
    setHasMore(true);
    // Initial fetch for new category handled by useEffect below
  }, []);

  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);
      try {
        const cacheKey = 'bizcon_popular_categories';
        let fetchedCategories;
        const cached = CategoryCache.get(cacheKey);

        if (cached) {
          fetchedCategories = cached;
        } else {
          fetchedCategories = await getPopularCategories();
          CategoryCache.save(fetchedCategories, cacheKey);
        }
        setCategories(fetchedCategories);

        // Fetch initial products for the active category
        const productsCacheKey = `bizcon_products_${activeCategory || 'all'}_page1`;
        let initialProducts;
        const cachedProducts = ProductListCache.get(productsCacheKey);

        if (cachedProducts && Array.isArray(cachedProducts)){
            initialProducts = cachedProducts;
        } else {
            if (activeCategory === 'Promo') {
                initialProducts = await getGlobalPromoProducts(1, PRODUCTS_PAGE_SIZE);
            } else {
                initialProducts = await getAllProductsByCategory(activeCategory, 1, PRODUCTS_PAGE_SIZE);
            }
            ProductListCache.set(productsCacheKey, initialProducts);
        }

        setProducts(initialProducts);
        setHasMore(initialProducts.length === PRODUCTS_PAGE_SIZE);

      } catch (error) {
        console.error("Error fetching initial bizcon data:", error);
        setIsConnectionError(true);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [activeCategory, setIsConnectionError]);
  
  const scrollProductGridToTop = () => {
    if (productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchMoreProducts();
      }
    }, { threshold: 1 });

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, fetchMoreProducts]);

  return (
    <div className="min-h-screen bg-background overscroll-none">
      <Navbar storeName={storeName} />
      <div className="pt-16 pb-safe-area-inset-bottom">
        <CategoryBar 
          onCategorySelect={handleCategorySelect}
          activeCategory={activeCategory}
          categories={categories}
          onActiveCategoryClick={scrollProductGridToTop}
        />
        <div className="mt-3 sm:mt-4">
          {initialLoading ? (
            <LoadingGrid />
          ) : (
            <>
              {isConnectionError && (
                <ConnectionErrorToast onRetry={() => window.location.reload()} />
              )}
              {products.length === 0 && !loading ? (
                 <div className="text-center py-10">No products found in this category.</div>
              ) : (
                <ProductGrid 
                  products={products}
                  containerRef={productGridRef}
                  storeId={null} // No single storeId for bizcon view
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
