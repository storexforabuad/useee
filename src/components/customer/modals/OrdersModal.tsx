'use client';

import { motion } from 'framer-motion';
import { ShoppingBag, Repeat, MessageSquare } from 'lucide-react';
import { Order } from '../../../hooks/useOrders';
import Image from 'next/image';
import { formatPrice } from '../../../utils/price';
import { CustomerModal } from './CustomerModal';

interface OrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: Order[];
}

export function OrdersModal({ isOpen, onClose, orders }: OrdersModalProps) {

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
    <CustomerModal isOpen={isOpen} onClose={onClose} title="Your Orders">
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
                  <p className="text-lg font-bold text-blue-500 dark:text-blue-400 mb-3">{formatPrice(order.product.price)}</p>
                  
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
    </CustomerModal>
  );
}
