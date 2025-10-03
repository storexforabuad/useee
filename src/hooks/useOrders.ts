'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Product } from '../types/product';
import { StoreMeta } from '../types/store';

export interface Order {
  product: Product;
  storeMeta: StoreMeta;
  orderDate: string;
}

// Helper to simulate a network delay. Remove this when using a real fetch call.
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function useOrders(storeId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // A ref to hold the abort controller. This ensures we can cancel the same request.
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchOrders = useCallback(async (signal: AbortSignal) => {
    setLoading(true);
    try {
      // This simulates a network request. In your real hook, this would be a fetch() call.
      await sleep(500);

      // If the signal is aborted, it means the component unmounted, so we stop.
      if (signal.aborted) return;

      const storedOrders = localStorage.getItem('customer_orders');
      if (storedOrders) {
        const allOrders: Order[] = JSON.parse(storedOrders);
        
        if (storeId && storeId !== 'bizcon') {
          const filteredOrders = allOrders.filter(order => order.storeMeta.id === storeId);
          setOrders(filteredOrders);
        } else {
          setOrders(allOrders);
        }
      }
    } catch (error) {
      // We ignore AbortError because it's an expected cancellation
      if ((error as Error).name !== 'AbortError') {
        console.error("Failed to fetch orders from localStorage", error);
        setOrders([]);
      }
    } finally {
      // Only stop loading if the request wasn't aborted
      if (!signal.aborted) {
        setLoading(false);
      }
    }
  }, [storeId]);

  useEffect(() => {
    // Create a new AbortController for this effect run
    const controller = new AbortController();
    
    fetchOrders(controller.signal);

    // The cleanup function is the key: it runs when the component unmounts
    return () => {
      controller.abort();
    };
  }, [fetchOrders]); // Re-run the effect if storeId changes

  const addOrder = (product: Product, storeMeta: StoreMeta) => {
    try {
      const newOrder: Order = { 
        product, 
        storeMeta, 
        orderDate: new Date().toISOString() 
      };
      const storedOrders = localStorage.getItem('customer_orders');
      const allOrders = storedOrders ? JSON.parse(storedOrders) : [];
      const updatedOrders = [newOrder, ...allOrders];
      localStorage.setItem('customer_orders', JSON.stringify(updatedOrders));
      
      // After adding, refetch to apply the correct filter
      const controller = new AbortController();
      fetchOrders(controller.signal);

    } catch (error) {
      console.error("Failed to save order to localStorage", error);
    }
  };

  const manualRefresh = useCallback(() => {
    const controller = new AbortController();
    fetchOrders(controller.signal);
  }, [fetchOrders]);

  return { orders, addOrder, fetchOrders: manualRefresh, loading, isRefreshing: loading };
}
