'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Gift } from 'lucide-react';
import { Order } from '../../hooks/useOrders';
import { OrdersModal } from './modals/OrdersModal';
import { ReferralsModal } from './modals/ReferralsModal';
import { DashboardActionCard } from './DashboardActionCard';

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
  const isStoreContext = storeId && storeId !== 'bizcon';

  return (
    <>
      <div className="w-full flex flex-col gap-3">
        <DashboardActionCard
          icon={<ShoppingBag className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
          title="My Orders"
          subtitle={`You have ${orders.length} order(s)`}
          onClick={onOrdersModalOpen}
          color="blue"
        />

        <DashboardActionCard
          icon={<Gift className="w-6 h-6 text-green-500 dark:text-green-400" />}
          title="My Referrals"
          subtitle={isStoreContext ? "Refer friends to this store" : "Refer friends for global rewards"}
          onClick={onReferralsModalOpen}
          color="green"
        />
      </div>

      <OrdersModal isOpen={isOrdersModalOpen} onClose={onOrdersModalClose} orders={orders} />
      <ReferralsModal isOpen={isReferralsModalOpen} onClose={onReferralsModalClose} storeId={storeId} />
    </>
  );
}
