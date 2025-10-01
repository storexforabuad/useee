'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';
import { StoreMeta } from '../types/store';

export interface Order {
  product: Product;
  storeMeta: StoreMeta;
  orderDate: string;
}

export function useOrders(storeId: string | null) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    console.log(`[DEBUG] useOrders Hook: Fetching orders. Filtering for storeId:`, storeId);
    try {
      const storedOrders = localStorage.getItem('customer_orders');
      if (storedOrders) {
        const allOrders: Order[] = JSON.parse(storedOrders);
        console.log('[DEBUG] useOrders Hook: Found this raw data in localStorage:', allOrders);

        if (storeId) {
          const filteredOrders = allOrders.filter(order => order.storeMeta.id === storeId);
          console.log('[DEBUG] useOrders Hook: After filtering, these orders remain:', filteredOrders);
          setOrders(filteredOrders);
        } else {
          console.log('[DEBUG] useOrders Hook: No storeId provided, returning all orders.');
          setOrders(allOrders);
        }
      } else {
        console.log('[DEBUG] useOrders Hook: No customer_orders found in localStorage.');
      }
    } catch (error) {
      console.error("Failed to fetch orders from localStorage", error);
      setOrders([]);
    }
    setLoading(false);
  }, [storeId]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

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
      
      // After adding, we need to refetch to apply the filter
      fetchOrders();

    } catch (error) {
      console.error("Failed to save order to localStorage", error);
    }
  };

  return { orders, addOrder, fetchOrders, loading, isRefreshing: loading };
}
