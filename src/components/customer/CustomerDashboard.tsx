'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, RefreshCw, ArrowRight } from 'lucide-react';
import { Order } from '../../hooks/useOrders';
import { OrdersModal } from './modals/OrdersModal';

interface OrdersCardProps {
  orders: Order[];
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function OrdersCard({ orders, onRefresh, isRefreshing }: OrdersCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

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

        <motion.div
          layout
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="bg-white dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-lg w-full overflow-hidden"
          onClick={handleOpenModal}
        >
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 dark:bg-blue-900/40 p-3 rounded-full">
                <ShoppingBag className="w-6 h-6 text-blue-500 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">My Orders</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">You have {orders.length} order(s)</p>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          </div>
        </motion.div>
      </div>
      
      <OrdersModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} orders={orders} />
    </>
  );
}
