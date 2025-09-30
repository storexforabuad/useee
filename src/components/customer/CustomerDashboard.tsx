'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, RefreshCw, X, ArrowRight, MessageSquare, Repeat } from 'lucide-react';
import { Order } from '../../hooks/useOrders';
import Image from 'next/image';
import { formatPrice } from '../../utils/price';

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


interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

function OrdersModal({ isOpen, onClose, orders }: OrdersModalProps) {

  const handleReorder = (order: Order) => {
    const storePhoneNumber = order.storeMeta.whatsapp;
    const productName = order.product.name;
    const productPrice = formatPrice(order.product.price);
    const productLink = `${window.location.origin}/${order.product.storeId}/products/${order.product.id}`;

    const message = 
      `Hello! 👋 I'd like to reorder this item:\n\n` +
      `🛍️ *${productName}*\n` +
      `*Price:* ${productPrice}\n\n` +
      `Here is the link for confirmation:\n` +
      `${productLink}\n\n` +
      `Thank you! 🙏`;

    const whatsappUrl = `https://wa.me/${storePhoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDispute = (order: Order) => {
    console.log('Dispute button clicked for order:', order.product.id);
  };


  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-lg p-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full sm:max-w-lg mx-auto bg-slate-50 dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
            initial={{ y: '100vh', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100vh', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Your Orders</h2>
              <motion.button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"
                whileTap={{ scale: 0.9 }}
              >
                <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </motion.button>
            </div>

            <div className="flex-grow overflow-y-auto p-1">
              {orders.length > 0 ? (
                <ul className="divide-y divide-slate-200 dark:divide-slate-800">
                  {orders.map((order, index) => (
                    <motion.li
                      key={index}
                      className="p-4"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 flex-shrink-0">
                          <Image 
                            src={order.product.images[0]} 
                            alt={order.product.name} 
                            fill
                            className="object-cover" 
                          />
                        </div>

                        <div className="flex-grow">
                          <p className="text-sm text-slate-500 dark:text-slate-400">{order.storeMeta.name}</p>
                          <h3 className="font-semibold text-md text-slate-800 dark:text-slate-100 mb-1">{order.product.name}</h3>
                          <p className="text-lg font-bold text-blue-500 dark:text-blue-400 mb-3">${order.product.price}</p>
                          
                          <div className="flex items-center gap-2">
                            <motion.button
                              onClick={() => handleReorder(order)}
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-3 rounded-lg shadow-sm"
                              whileTap={{ scale: 0.95 }}
                            >
                              <Repeat className="w-4 h-4" />
                              <span className="text-sm">Reorder</span>
                            </motion.button>

                            <motion.button
                              onClick={() => handleDispute(order)}
                              className="flex-1 flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-3 rounded-lg"
                              whileTap={{ scale: 0.95 }}
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-sm">Dispute</span>
                            </motion.button>
                          </div>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-20 px-6">
                  <ShoppingBag className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No Orders Yet</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Start shopping to see your orders here.</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
