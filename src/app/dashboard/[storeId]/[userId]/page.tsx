'use client';

import { useParams } from 'next/navigation';
import Navbar from '../../../../components/layout/navbar';

export default function DashboardPage() {
  const params = useParams();
  const { storeId, userId } = params;

  return (
    <div>
      <Navbar storeName="My Dashboard" />
      <div className="p-4 text-center">
        <h1 className="text-2xl font-bold mt-16">Customer Activity</h1>
        <p className="text-slate-500 dark:text-slate-400">Store ID: {storeId}</p>
        <p className="text-slate-500 dark:text-slate-400">User ID: {userId}</p>
        <p className="mt-4">This page is under construction.</p>
      </div>
    </div>
  );
}
