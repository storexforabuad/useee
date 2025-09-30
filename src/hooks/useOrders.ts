'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types/product';
import { StoreMeta } from '../types/store';

export interface Order {
  product: Product;
  storeMeta: StoreMeta;
  orderDate: string;
}

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    try {
      const storedOrders = localStorage.getItem('customer_orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
    } catch (error) {
      console.error("Failed to fetch orders from localStorage", error);
      // Handle potential JSON parsing errors or other issues
      setOrders([]);
    }
    setLoading(false);
  }, []);

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
      const updatedOrders = [newOrder, ...orders];
      setOrders(updatedOrders);
      localStorage.setItem('customer_orders', JSON.stringify(updatedOrders));
    } catch (error) {
      console.error("Failed to save order to localStorage", error);
    }
  };

  return { orders, addOrder, fetchOrders, loading };
}
