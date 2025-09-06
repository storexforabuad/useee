'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSwipeable } from 'react-swipeable';
import { getProducts, getProductsByCategory, getCategories } from '../lib/db';
import { useConnectionCheck } from '../hooks/useConnectionCheck';
import Navbar from '../components/layout/navbar';
import CategoryBar from '../components/layout/CategoryBar';
import SkeletonLoader from '../components/SkeletonLoader';
import type { Product } from '../types/product';
import NavigationStore from '@/lib/navigationStore';
import ConnectionErrorToast from '../components/ConnectionErrorToast';
import { CategoryCache } from '../lib/categoryCache';
import { ProductCache, ProductListCache } from '../lib/productCache';
import { CartCache } from '@/lib/cartCache';

const ProductGrid = dynamic(
  () => import('../components/products/ProductGrid'),
  { ssr: false }
);

type Category = {
  id: string;
  name: string;
  icon?: string;
};

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3 sm:gap-4 px-4">
    {Array.from({ length: 3 }).map((_, index) => (
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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Promo'); // Set default to 'Promo'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isConnectionError, setIsConnectionError } = useConnectionCheck();
  const productGridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const handleCategorySelect = useCallback(async (category: string) => {
    setActiveCategory(category);
    setPage(1); // Reset infinite scroll page when switching category
    setLoading(true);

    try {
      let fetchedProducts;
      const cacheKey = `products_${category || 'all'}_page1`;
      const cached = ProductListCache.get(cacheKey);
      if (cached && Array.isArray(cached)) {
        console.log('Using cached products');
        fetchedProducts = cached;
      } else {
        switch (category) {
          case 'Promo': {
            const promoProducts = await getProducts();
            fetchedProducts = promoProducts.filter(product =>
              product.soldOut ||
              (product.originalPrice && product.originalPrice > product.price)
            );
            break;
          }
          case 'Back in Stock': {
            const allProducts = await getProducts();
            fetchedProducts = allProducts.filter(product =>
              !product.soldOut && product.backInStock
            );
            break;
          }
          case '': {
            fetchedProducts = await getProducts();
            break;
          }
          default: {
            fetchedProducts = await getProductsByCategory(category);
          }
        }
        // Sort by createdAt descending
        fetchedProducts = Array.isArray(fetchedProducts)
          ? fetchedProducts.sort((a, b) => {
              const aTime = a.createdAt?.toMillis?.() || 0;
              const bTime = b.createdAt?.toMillis?.() || 0;
              return bTime - aTime;
            })
          : [];
        ProductListCache.set(cacheKey, fetchedProducts);
      }
      setProducts(Array.isArray(fetchedProducts) ? fetchedProducts.slice(0, PRODUCTS_PAGE_SIZE) : []);
      setHasMore(Array.isArray(fetchedProducts) ? PRODUCTS_PAGE_SIZE < fetchedProducts.length : false);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const savedState = NavigationStore.getState();
    
    const fetchInitialData = async () => {
      try {
        const cachedCategories = CategoryCache.get();
        
        if (cachedCategories) {
          console.log('Using cached categories');
          setCategories(cachedCategories);
          
          if (savedState.category) {
            setActiveCategory(savedState.category);
            await handleCategorySelect(savedState.category);
          } else {
            await handleCategorySelect('Promo');
          }
        } else {
          console.log('Fetching fresh categories');
          const [fetchedCategories] = await Promise.all([
            getProducts(),
            getCategories()
          ]);
          
          setCategories(fetchedCategories);
          CategoryCache.save(fetchedCategories);
          
          if (savedState.category) {
            setActiveCategory(savedState.category);
            await handleCategorySelect(savedState.category);
          } else {
            await handleCategorySelect('Promo');
          }
        }

        if (savedState.scrollPosition) {
          setTimeout(() => {
            window.scrollTo(0, savedState.scrollPosition);
            NavigationStore.clearState();
          }, 100);
        }
      } catch (error) {
        console.error('Error:', error);
        setIsConnectionError(true);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [handleCategorySelect, setIsConnectionError]); // Add missing dependencies

  const scrollProductGridToTop = () => {
    if (productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const switchCategory = (direction: 'left' | 'right') => {
    // Include all categories in specific order
    const allCategories = [
      '', // New Arrivals
      'Promo',
      'Back in Stock',
      ...categories.map(c => c.name)
    ];
    
    const currentIndex = allCategories.indexOf(activeCategory);
    
    let newIndex;
    if (direction === 'left') {
      newIndex = currentIndex === allCategories.length - 1 ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex === 0 ? allCategories.length - 1 : currentIndex - 1;
    }
    
    handleCategorySelect(allCategories[newIndex]);
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => switchCategory('left'),
    onSwipedRight: () => switchCategory('right'),
    preventScrollOnSwipe: true,
    trackMouse: false,
    delta: 50,
  });

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading || initialLoading) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setPage((prev) => prev + 1);
      }
    }, { threshold: 1 });
    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, loading, initialLoading]);

  // Fetch products for infinite scroll
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const cacheKey = `products_${activeCategory || 'all'}_page${page}`;
        const cachedProducts = ProductListCache.get(cacheKey);
        let fetchedProducts;
        if (cachedProducts && Array.isArray(cachedProducts)) {
          fetchedProducts = cachedProducts;
        } else {
          switch (activeCategory) {
            case 'Promo': {
              const promoProducts = await getProducts();
              fetchedProducts = promoProducts.filter(product =>
                product.soldOut ||
                (product.originalPrice && product.originalPrice > product.price)
              );
              break;
            }
            case 'Back in Stock': {
              const allProducts = await getProducts();
              fetchedProducts = allProducts.filter(product =>
                !product.soldOut && product.backInStock
              );
              break;
            }
            case '': {
              fetchedProducts = await getProducts();
              break;
            }
            default: {
              fetchedProducts = await getProductsByCategory(activeCategory);
            }
          }
          // Sort by createdAt descending
          fetchedProducts = Array.isArray(fetchedProducts)
            ? fetchedProducts.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
              })
            : [];
          ProductListCache.set(cacheKey, fetchedProducts);
        }
        // Defensive: always ensure array before slice
        if (!Array.isArray(fetchedProducts)) fetchedProducts = [];
        const paged = fetchedProducts.slice(0, page * PRODUCTS_PAGE_SIZE);
        setProducts(paged);
        setHasMore(paged.length < fetchedProducts.length);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, page]);

  return (
    <div className="min-h-screen bg-background overscroll-none">
      <Navbar />
      <div className="pt-16 pb-safe-area-inset-bottom">
        <CategoryBar 
          onCategorySelect={handleCategorySelect}
          activeCategory={activeCategory}
          categories={categories}
          onActiveCategoryClick={scrollProductGridToTop}
        />
        <div {...swipeHandlers} className="mt-3 sm:mt-4">
          {initialLoading ? (
            <LoadingGrid />
          ) : (
            <>
              {isConnectionError && (
                <ConnectionErrorToast onRetry={() => window.location.reload()} />
              )}
              {/* Show skeleton loader while loading, else ProductGrid or empty state */}
              {loading ? (
                <LoadingGrid />
              ) : products.length === 0 ? (
                <ProductGrid products={[]} containerRef={productGridRef} />
              ) : (
                <ProductGrid 
                  products={products}
                  containerRef={productGridRef}
                />
              )}
              {/* Infinite scroll sentinel */}
              {hasMore && !loading && (
                <div ref={observerRef} className="h-8" />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}