import { useEffect } from 'react';
import { getProductById } from '../lib/db';
import { ProductDetailCache } from '../lib/productDetailCache';

export function useProductDetailPrefetch(productId: string, shouldPrefetch: boolean) {
  useEffect(() => {
    if (!productId || !shouldPrefetch || ProductDetailCache.get(productId)) return;
    getProductById(productId).then(product => {
      if (product) ProductDetailCache.set(productId, product);
    });
  }, [productId, shouldPrefetch]);
}
