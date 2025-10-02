'use client';

import { ShoppingBag, Gift } from 'lucide-react';
import { Order } from '../../hooks/useOrders';
import { OrdersModal } from './modals/OrdersModal';
import { ReferralsModal } from './modals/ReferralsModal';
import { CustomerStatCard } from './CustomerStatCard';

interface CustomerDashboardProps {
  orders: Order[];
  storeId?: string;
  isOrdersModalOpen: boolean;
  onOrdersModalOpen: () => void;
  onOrdersModalClose: () => void;
  isReferralsModalOpen: boolean;
  onReferralsModalOpen: () => void;
  onReferralsModalClose: () => void;
}

export function CustomerDashboard({ 
  orders, 
  storeId, 
  isOrdersModalOpen,
  onOrdersModalOpen,
  onOrdersModalClose,
  isReferralsModalOpen,
  onReferralsModalOpen,
  onReferralsModalClose,
}: CustomerDashboardProps) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <CustomerStatCard
          icon={<ShoppingBag className="w-7 h-7 opacity-80" />}
          value={orders.length}
          label="My Orders"
          gradient="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700"
          onClick={onOrdersModalOpen}
        />
        <CustomerStatCard
          icon={<Gift className="w-7 h-7 opacity-80" />}
          value={0}
          label="My Referrals"
          gradient="bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700"
          onClick={onReferralsModalOpen}
        />
      </div>

      <OrdersModal isOpen={isOrdersModalOpen} onClose={onOrdersModalClose} orders={orders} />
      <ReferralsModal isOpen={isReferralsModalOpen} onClose={onReferralsModalClose} storeId={storeId} />
    </>
  );
}
