'use client';

import dynamic from 'next/dynamic';
import { useCart } from '../../lib/cartContext';
import { ShoppingCart } from 'lucide-react';
import { getStoreMeta } from '../../lib/db';
import { useState, useEffect } from 'react';

const CartItem = dynamic(
  () => import('../../components/cart/CartItem'),
  { 
    loading: () => <div className="animate-pulse h-24 bg-gray-200 rounded-lg"></div>,
    ssr: false 
  }
);

export default function CartPage() {
  const { state, dispatch } = useCart();
  const [storeMeta, setStoreMeta] = useState<{ whatsapp?: string } | null>(null);
  const routeParams = typeof window !== 'undefined' ? window.location.pathname.split('/') : [];
  const storeId = routeParams.length > 1 ? routeParams[1] : 'alaniq';

  useEffect(() => {
    async function fetchMeta() {
      if (!storeId) return;
      const meta = await getStoreMeta(storeId);
      setStoreMeta(meta && meta.whatsapp ? { whatsapp: meta.whatsapp } : null);
    }
    fetchMeta();
  }, [storeId]);

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
  
  const createWhatsAppMessage = () => {
    const itemsList = state.items
      .map((item, index) => 
        `${index + 1}. *${item.name}*\n` +
        `• Quantity: ${item.quantity}\n` +
        `• Price: ${formatPrice(item.price * item.quantity)}\n` +
        `• Product Link: ${window.location.origin}/products/${item.id}`
      )
      .join('\n\n');
  
    const message = 
      `🛍️ *New Order Request*\n\n` +
      `Hello! I would like to place an order for the following items:\n\n` +
      `${itemsList}\n\n` +
      `Total Items: ${state.totalItems}\n` +
      `Total Amount: ${formatPrice(state.totalAmount)}\n\n` +
      `Thank you! 🙏`;
  
    const encodedMessage = encodeURIComponent(message);
    const whatsappNumber = storeMeta?.whatsapp || '+2349021067212';
    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappLink, '_blank');
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
      <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Your List</h1>
      
      <div className="mt-6 sm:mt-8 space-y-3">
        {state.items.map(item => (
          <CartItem 
            key={item.id} 
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>

      <div className="mt-6 sm:mt-8 border-t border-[var(--border-color)] pt-6 sm:pt-8">
        <div className="flex justify-between text-base sm:text-lg font-medium text-text-primary">
          <span>Total</span>
          <span>{formatPrice(state.totalAmount)}</span>
        </div>

        <button
  onClick={createWhatsAppMessage}
  className="mt-6 sm:mt-8 group relative w-full inline-flex items-center justify-center gap-2 
    px-6 py-3.5 rounded-[980px] bg-[var(--button-success)] text-white font-medium
    shadow-sm hover:shadow-md transition-all duration-300
    hover:bg-[var(--button-success-hover)] transform-gpu
    active:scale-[0.98] cursor-default
    disabled:opacity-75 disabled:cursor-not-allowed
    product-detail-button-success"
>
  <ShoppingCart className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" />
  <span className="relative tracking-[-0.01em]">Order Now</span>
</button>
</div>

      {/* <footer className="py-8 sm:py-12 text-center text-sm sm:text-base text-text-secondary">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
          <span>powered by Compass Engine &copy; {new Date().getFullYear()}.</span>
          <a 
            href={`https://wa.me/+2349099933360`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-primary)] hover:text-[var(--button-primary)] 
              transition-colors duration-200 flex items-center gap-1 touch-manipulation"
          >
            <ShoppingCart size={16} />
            <span>09099933360</span>
          </a>
        </div>
      </footer> */}
    </div>
  );
}