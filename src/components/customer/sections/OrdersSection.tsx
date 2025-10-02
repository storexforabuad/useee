'use client';

import { Package } from 'lucide-react';

interface OrdersSectionProps {
  storeId?: string;
}

export function OrdersSection({ storeId }: OrdersSectionProps) {
  return (
    <div className="text-center py-20 px-6">
      <Package className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Order History</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">Detailed order history will be shown here.</p>
    </div>
  );
}
