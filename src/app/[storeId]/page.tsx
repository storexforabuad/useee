'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useSwipeable } from 'react-swipeable';
import { useParams } from 'next/navigation';
import { getProducts, getProductsByCategory, getCategories, getStoreMeta } from '../../lib/db';
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

const InstallPrompt = dynamic(() => import('../../components/InstallPrompt'), {
  ssr: false,
});

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

export default function StorefrontPage() {
  const params = useParams();
  const storeId = typeof params?.storeId === 'string' ? params.storeId : Array.isArray(params?.storeId) ? params.storeId[0] : '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('Promo');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { isConnectionError, setIsConnectionError } = useConnectionCheck();
  const productGridRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const handleCategorySelect = useCallback(async (category: string) => {
    setActiveCategory(category);
    setPage(1);
    setLoading(true);
    try {
      let fetchedProducts;
      const cacheKey = `products_${storeId}_${category || 'all'}_page1`;
      const cached = ProductListCache.get(cacheKey);
      if (cached && Array.isArray(cached)) {
        fetchedProducts = cached;
      } else {
        switch (category) {
          case 'Promo': {
            const promoProducts = await getProducts(storeId);
            fetchedProducts = promoProducts.filter(product =>
              product.soldOut ||
              (product.originalPrice && product.originalPrice > product.price)
            );
            break;
          }
          case 'Back in Stock': {
            const allProducts = await getProducts(storeId);
            fetchedProducts = allProducts.filter(product =>
              !product.soldOut && product.backInStock
            );
            break;
          }
          case '': {
            fetchedProducts = await getProducts(storeId);
            break;
          }
          default: {
            fetchedProducts = await getProductsByCategory(storeId, category);
          }
        }
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
    } catch {
      console.error('Error fetching products:');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (!storeId) return;
    const fetchInitialData = async () => {
      try {
        const cachedCategories = CategoryCache.get();
        let fetchedCategories;
        if (cachedCategories) {
          fetchedCategories = cachedCategories;
        } else {
          fetchedCategories = await getCategories(storeId);
          CategoryCache.save(fetchedCategories);
        }
        setCategories(fetchedCategories);
        const storeMeta = await getStoreMeta(storeId);
        setStoreName(storeMeta?.name || storeId);
        await handleCategorySelect('Promo');
      } catch {
        setIsConnectionError(true);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchInitialData();
  }, [storeId, handleCategorySelect, setIsConnectionError]);

  const scrollProductGridToTop = () => {
    if (productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const switchCategory = (direction: 'left' | 'right') => {
    const allCategories = [
      '',
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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const cacheKey = `products_${storeId}_${activeCategory || 'all'}_page${page}`;
        const cachedProducts = ProductListCache.get(cacheKey);
        let fetchedProducts;
        if (cachedProducts && Array.isArray(cachedProducts)) {
          fetchedProducts = cachedProducts;
        } else {
          switch (activeCategory) {
            case 'Promo': {
              const promoProducts = await getProducts(storeId);
              fetchedProducts = promoProducts.filter(product =>
                product.soldOut ||
                (product.originalPrice && product.originalPrice > product.price)
              );
              break;
            }
            case 'Back in Stock': {
              const allProducts = await getProducts(storeId);
              fetchedProducts = allProducts.filter(product =>
                !product.soldOut && product.backInStock
              );
              break;
            }
            case '': {
              fetchedProducts = await getProducts(storeId);
              break;
            }
            default: {
              fetchedProducts = await getProductsByCategory(storeId, activeCategory);
            }
          }
          fetchedProducts = Array.isArray(fetchedProducts)
            ? fetchedProducts.sort((a, b) => {
                const aTime = a.createdAt?.toMillis?.() || 0;
                const bTime = b.createdAt?.toMillis?.() || 0;
                return bTime - aTime;
              })
            : [];
          ProductListCache.set(cacheKey, fetchedProducts);
        }
        if (!Array.isArray(fetchedProducts)) fetchedProducts = [];
        const paged = fetchedProducts.slice(0, page * PRODUCTS_PAGE_SIZE);
        setProducts(paged);
        setHasMore(paged.length < fetchedProducts.length);
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory, page, storeId]);

  return (
    <div className="min-h-screen bg-background overscroll-none">
      <InstallPrompt />
      <Navbar storeName={storeName} />
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
              {loading ? (
                <LoadingGrid />
              ) : products.length === 0 ? (
                <ProductGrid products={[]} containerRef={productGridRef} storeId={storeId} />
              ) : (
                <ProductGrid 
                  products={products}
                  containerRef={productGridRef}
                  storeId={storeId}
                />
              )}
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
