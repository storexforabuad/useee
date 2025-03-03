'use client';

import { useCart } from '../../lib/cartContext';
import CartItem from '../../components/cart/CartItem';
import { Phone } from 'lucide-react';

export default function CartPage() {
  const { state, dispatch } = useCart();

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
      .map(item => `*${item.name}*\nQuantity: ${item.quantity}\nPrice: ${formatPrice(item.price * item.quantity)}\nLink: ${window.location.origin}/products/${item.id}`)
      .join('\n\n');
  
    const paymentDetails = `
Payment Details:
Account Name: Maryam Gambo Lawal
Account Number: 2234012781
Bank: Kuda Bank`;
  
    const message = `Hello! I would like to order the following items:\n\n${itemsList}\n\n*Total: ${formatPrice(state.totalAmount)}*\n\n${paymentDetails}\n\nThank you!`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/+2348164981183?text=${encodedMessage}`;
    window.open(whatsappLink, '_blank');
  };

  if (state.items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-text-primary">Your list is empty</h2>
        <p className="mt-2 text-text-secondary">Start shopping by adding items to your list.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary">Your List</h1>
      
      <div className="mt-8">
        {state.items.map(item => (
          <CartItem 
            key={item.id} 
            item={item}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>

      <div className="mt-8 border-t border-border-color pt-8">
        <div className="flex justify-between text-lg font-medium text-text-primary">
          <span>Total</span>
          <span>{formatPrice(state.totalAmount)}</span>
        </div>

        <button
          onClick={createWhatsAppMessage}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--button-success)] px-6 py-3 text-white shadow-[var(--shadow-sm)] hover:bg-[var(--button-success-hover)] transition-colors"
        >
          <Phone size={20} />
          Order via WhatsApp
        </button>
      </div>

      <footer className="py-12 text-center text-text-secondary">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
          <span>powered by ABS &copy; {new Date().getFullYear()}.</span>
          <a 
            href={`https://wa.me/+2349099933360`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--info)] hover:text-[var(--button-primary-hover)] transition-colors duration-200 flex items-center gap-1"
          >
            <Phone size={16} />
            <span>09099933360</span>
          </a>
        </div>
      </footer>
    </div>
  );
}