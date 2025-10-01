'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../../components/layout/navbar';
import { useOrders } from '../../../../hooks/useOrders';
import { OrdersCard } from '../../../../components/customer/CustomerDashboard';

export default function DashboardPage() {
  const params = useParams();
  const storeId = Array.isArray(params.storeId) ? params.storeId[0] : params.storeId;
  
  // If the storeId is 'bizcon' or the string 'null', treat it as a global context.
  const hookStoreId = (storeId === 'bizcon' || storeId === 'null') ? null : storeId;
  
  const { orders, fetchOrders, loading } = useOrders(hookStoreId);
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    fetchOrders();
    setIsRefreshing(false);
  };

  const storeName = (storeId === 'bizcon' || storeId === 'null') ? 'Global Dashboard' : 'My Dashboard';

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen">
      <Navbar storeName={storeName} />
      <div className="p-4 pt-20 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">Your Activity</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          A summary of your recent orders and interactions.
        </p>

        <div className="mt-8">
          <OrdersCard 
            orders={orders}
            onRefresh={handleRefresh}
            isRefreshing={isRefreshing || loading}
          />
        </div>
      </div>
    </div>
  );
}
