import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../../lib/cartContext';
import { Product } from '../../types/product';

interface CartItemProps {
  item: Product & { quantity: number };
}

export default function CartItem({ item }: CartItemProps) {
  const { dispatch } = useCart();
  
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  return (
    <div className="flex items-center gap-4 border-b border-gray-200 py-4">
      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
        <Image
          src={item.images[0]}
          alt={item.name}
          width={80}
          height={80}
          className="h-full w-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{formatPrice(item.price)}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => 
            dispatch({
              type: 'UPDATE_QUANTITY',
              payload: { id: item.id, quantity: item.quantity - 1 }
            })
          }
          className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
        >
          <Minus size={16} />
        </button>
        
        <span className="w-8 text-center">{item.quantity}</span>
        
        <button
          onClick={() =>
            dispatch({
              type: 'UPDATE_QUANTITY',
              payload: { id: item.id, quantity: item.quantity + 1 }
            })
          }
          className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
        >
          <Plus size={16} />
        </button>

        <button
          onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
          className="ml-2 rounded-md p-1 text-red-600 hover:bg-red-50"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}
