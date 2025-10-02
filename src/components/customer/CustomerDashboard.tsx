'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, RefreshCw, Gift, Star } from 'lucide-react';
import { Order } from '../../hooks/useOrders';
import { OrdersModal } from './modals/OrdersModal';
import { ReferralsModal } from './modals/ReferralsModal';
import { RewardsModal } from './modals/RewardsModal';
import { DashboardActionCard } from './DashboardActionCard';

interface CustomerDashboardProps {
  orders: Order[];
  onRefresh: () => void;
  isRefreshing: boolean;
  storeId?: string;
}

export function CustomerDashboard({ orders, onRefresh, isRefreshing, storeId }: CustomerDashboardProps) {
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);

  const isStoreContext = storeId && storeId !== 'bizcon';

  return (
    <>
      <div className="w-full flex flex-col gap-3">
        <motion.button
          onClick={onRefresh}
          className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold py-3 px-4 rounded-xl shadow-sm transition-all duration-200 ease-in-out hover:shadow-md active:scale-[0.98]"
          whileTap={{ scale: 0.98 }}
          disabled={isRefreshing}
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">Refresh</span>
        </motion.button>

        <DashboardActionCard
          icon={<ShoppingBag className="w-6 h-6 text-blue-500 dark:text-blue-400" />}
          title="My Orders"
          subtitle={`You have ${orders.length} order(s)`}
          onClick={() => setIsOrdersModalOpen(true)}
          color="blue"
        />

        <DashboardActionCard
          icon={<Gift className="w-6 h-6 text-green-500 dark:text-green-400" />}
          title="My Referrals"
          subtitle={isStoreContext ? "Refer friends to this store" : "Refer friends for global rewards"}
          onClick={() => setIsReferralsModalOpen(true)}
          color="green"
        />

        <DashboardActionCard
          icon={<Star className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />}
          title="My Rewards"
          subtitle={isStoreContext ? "View your rewards from this store" : "View your global rewards"}
          onClick={() => setIsRewardsModalOpen(true)}
          color="yellow"
        />
      </div>

      <OrdersModal isOpen={isOrdersModalOpen} onClose={() => setIsOrdersModalOpen(false)} orders={orders} />
      <ReferralsModal isOpen={isReferralsModalOpen} onClose={() => setIsReferralsModalOpen(false)} />
      <RewardsModal isOpen={isRewardsModalOpen} onClose={() => setIsRewardsModalOpen(false)} />
    </>
  );
}
