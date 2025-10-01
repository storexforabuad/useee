'use client';

import dynamic from 'next/dynamic';
import { useCart } from '../../lib/cartContext';
import { ShoppingCart } from 'lucide-react';
import { getStoreMeta } from '../../lib/db';
import { useState, useEffect } from 'react';
import { StoreMeta } from '../../types/store';
import { Product } from '../../types/product';
import { incrementOrderCount } from '../../app/actions/orderActions';

const CartItem = dynamic(
  () => import('../../components/cart/CartItem'),
  { 
    loading: () => <div className="animate-pulse h-24 bg-gray-200 rounded-lg"></div>,
    ssr: false 
  }
);

interface GroupedCart {
  [storeId: string]: Product[];
}

export default function CartPage() {
  const { state, dispatch } = useCart();
  const [storeMetas, setStoreMetas] = useState<{[storeId: string]: StoreMeta}>({});
  const [groupedCart, setGroupedCart] = useState<GroupedCart>({});

  useEffect(() => {
    const newGroupedCart: GroupedCart = state.items.reduce((acc, item) => {
      const storeId = item.storeId || 'unknown';
      if (!acc[storeId]) {
        acc[storeId] = [];
      }
      acc[storeId].push(item);
      return acc;
    }, {} as GroupedCart);
    setGroupedCart(newGroupedCart);

    async function fetchMetas() {
      const storeIds = Object.keys(newGroupedCart);
      const metas: {[storeId: string]: StoreMeta} = {};
      for (const id of storeIds) {
        if (id !== 'unknown') {
            const meta = await getStoreMeta(id);
            if (meta) {
                metas[id] = meta as StoreMeta;
            }
        }
      }
      setStoreMetas(metas);
    }

    if (Object.keys(newGroupedCart).length > 0) {
        fetchMetas();
    }
  }, [state.items]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const handleRemoveItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };
  
  const createWhatsAppMessage = async (storeId: string, items: Product[]) => {
    const storeMeta = storeMetas[storeId];
    if (!storeMeta || !storeMeta.whatsapp) return;

    await incrementOrderCount(storeId, items.length);

    const itemsList = items
      .map((item, index) => 
        `${index + 1}. *${item.name}*\n` +
        `• Quantity: ${item.quantity}\n` +
        `• Price: ${formatPrice(item.price * item.quantity)}\n` +
        `• Product Link: ${window.location.origin}/${storeId}/products/${item.id}`
      )
      .join('\n\n');

    const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  
    const message = 
      `🛍️ *New Order Request*\n\n` +
      `Hello! I would like to place an order for the following items:\n\n` +
      `${itemsList}\n\n` +
      `Total Items: ${totalItems}\n` +
      `Total Amount: ${formatPrice(totalAmount)}\n\n` +
      `Thank you! 🙏`;
  
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/${storeMeta.whatsapp.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappLink, '_blank');
    
    // Remove only ordered items from cart
    items.forEach(item => {
        dispatch({ type: 'REMOVE_ITEM', payload: item.id });
    });
  };

  if (state.items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-8 sm:py-16">
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Your list is empty</h2>
        <p className="mt-2 text-sm sm:text-base text-text-secondary">
          Start shopping by adding items to your list.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] mx-auto max-w-2xl px-3 sm:px-4 py-6 sm:py-8">
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">Your List</h1>
      
      {Object.entries(groupedCart).map(([storeId, items]) => {
        const storeMeta = storeMetas[storeId];
        const totalAmount = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

        return (
          <div key={storeId} className="mb-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <h2 className="text-lg font-bold text-text-primary mb-4">{storeMeta?.name || 'Unknown Store'}</h2>
            <div className="space-y-3">
              {items.map(item => (
                <CartItem 
                  key={item.id} 
                  item={item}
                  onUpdateQuantity={handleUpdateQuantity}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
            <div className="mt-6 border-t border-[var(--border-color)] pt-6">
              <div className="flex justify-between text-base font-medium text-text-primary">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <button
                onClick={() => createWhatsAppMessage(storeId, items)}
                disabled={!storeMeta || !storeMeta.whatsapp}
                className="mt-6 group relative w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-[980px] bg-[var(--button-success)] text-white font-medium shadow-sm hover:shadow-md transition-all duration-300 hover:bg-[var(--button-success-hover)] transform-gpu active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="relative tracking-[-0.01em]">Order from {storeMeta?.name || '...'}</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
