'use client';

import { ShoppingBag, Gift, Heart } from 'lucide-react';
import { Order } from '../../hooks/useOrders';
import { OrdersModal } from './modals/OrdersModal';
import { ReferralsModal } from './modals/ReferralsModal';
import { WishlistModal } from './modals/WishlistModal';
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
  isWishlistModalOpen: boolean;
  onWishlistModalOpen: () => void;
  onWishlistModalClose: () => void;
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
  isWishlistModalOpen,
  onWishlistModalOpen,
  onWishlistModalClose,
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
        <CustomerStatCard
          icon={<Heart className="w-7 h-7 opacity-80" />}
          value={0}
          label="My Wishlist"
          gradient="bg-gradient-to-br from-pink-500 to-red-600 dark:from-pink-600 dark:to-red-700"
          onClick={onWishlistModalOpen}
        />
      </div>

      <OrdersModal isOpen={isOrdersModalOpen} onClose={onOrdersModalClose} orders={orders} />
      <ReferralsModal isOpen={isReferralsModalOpen} onClose={onReferralsModalClose} storeId={storeId} />
      <WishlistModal isOpen={isWishlistModalOpen} onClose={onWishlistModalClose} />
    </>
  );
}
