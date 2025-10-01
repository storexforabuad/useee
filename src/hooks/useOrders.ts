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
    try {
      const storedOrders = localStorage.getItem('customer_orders');
      if (storedOrders) {
        const allOrders: Order[] = JSON.parse(storedOrders);
        if (storeId) {
          const filteredOrders = allOrders.filter(order => order.storeMeta.id === storeId);
          setOrders(filteredOrders);
        } else {
          setOrders(allOrders);
        }
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
