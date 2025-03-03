import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { CartItem as CartItemType } from '../../lib/cartContext';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

export default function CartItem({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-card-hover transition-colors rounded-lg">
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md bg-card-background">
        <Image
          src={item.images[0]}
          alt={item.name}
          fill
          className="object-cover object-center"
        />
      </div>
      
      <div className="flex flex-1 flex-col">
        <div className="flex justify-between">
          <h3 className="text-base font-medium text-text-primary">{item.name}</h3>
          <p className="ml-4 text-text-primary">{formatPrice(item.price * item.quantity)}</p>
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="p-1 rounded-md hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed text-text-primary"
            >
              <Minus size={16} />
            </button>
            <span className="text-text-secondary min-w-[24px] text-center">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-1 rounded-md hover:bg-card-hover text-text-primary"
            >
              <Plus size={16} />
            </button>
          </div>
          
          <button
            onClick={() => onRemove(item.id)}
            className="text-[var(--button-danger)] hover:text-[var(--button-danger-hover)] transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}