'use client';

import { ShoppingBag, Gift, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { Order } from '../../hooks/useOrders';
import { OrdersModal } from './modals/OrdersModal';
import { ReferralsModal } from './modals/ReferralsModal';
import { WishlistModal } from './modals/WishlistModal';
import { CustomerStatCard } from './CustomerStatCard';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

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
      <motion.div 
        className="grid grid-cols-2 gap-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <CustomerStatCard
            icon={<ShoppingBag className="w-7 h-7 opacity-80" />}
            value={orders.length}
            label="My Orders"
            gradient="bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-600 dark:to-purple-700"
            onClick={onOrdersModalOpen}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <CustomerStatCard
            icon={<Gift className="w-7 h-7 opacity-80" />}
            value={0}
            label="My Referrals"
            gradient="bg-gradient-to-br from-green-500 to-teal-600 dark:from-green-600 dark:to-teal-700"
            onClick={onReferralsModalOpen}
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <CustomerStatCard
            icon={<Heart className="w-7 h-7 opacity-80" />}
            value={0}
            label="My Wishlist"
            gradient="bg-gradient-to-br from-pink-500 to-red-600 dark:from-pink-600 dark:to-red-700"
            onClick={onWishlistModalOpen}
          />
        </motion.div>
      </motion.div>

      <OrdersModal isOpen={isOrdersModalOpen} onClose={onOrdersModalClose} orders={orders} />
      <ReferralsModal isOpen={isReferralsModalOpen} onClose={onReferralsModalClose} storeId={storeId} />
      <WishlistModal isOpen={isWishlistModalOpen} onClose={onWishlistModalClose} />
    </>
  );
}
