'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShoppingBagIcon } from 'lucide-react';
import { ListIcon } from 'lucide-react';
import { WalletIcon } from 'lucide-react';
import { useCart } from '../../lib/cartContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { state } = useCart();
  const [isBouncing, setIsBouncing] = useState(false);
  const [prevTotalItems, setPrevTotalItems] = useState(state.totalItems);
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  useEffect(() => {
    if (state.totalItems > prevTotalItems) {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 1000);
    }
    setPrevTotalItems(state.totalItems);
  }, [state.totalItems, prevTotalItems]);

  return (
    <nav className="fixed top-0 z-50 w-full bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href={isAdminRoute ? '/admin' : '/'} className="flex items-center">
              <ShoppingBagIcon className="h-8 w-8 text-gray-600 mr-2" />
              <span className="text-xl font-semibold text-gray-900">
                {isAdminRoute ? 'Admin' : 'LaDevida'}
              </span>
            </Link>
          </div>
          
          <div className="flex items-center">
            <Link 
              href={isAdminRoute ? '/admin/referrals' : '/cart'} 
              className="relative group"
            >
              {isAdminRoute ? (
                <WalletIcon className="h-6 w-6 text-gray-600 group-hover:text-gray-900 transition-colors" />
              ) : (
                <>
                  <ListIcon 
                    className={`h-6 w-6 text-gray-600 group-hover:text-gray-900 transition-colors
                      ${isBouncing ? 'animate-bounce' : ''}`}
                  />
                  {state.totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {state.totalItems}
                    </span>
                  )}
                </>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}