'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ClipboardListIcon, Moon, Sun, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../lib/cartContext';
import { useTheme } from '../../lib/themeContext';
import { usePathname, useRouter } from 'next/navigation';

interface NavbarProps {
  storeName?: string;
}

export default function Navbar({ storeName }: NavbarProps) {
  const { state } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [isBouncing, setIsBouncing] = useState(false);
  const [prevTotalItems, setPrevTotalItems] = useState(state.totalItems);
  const pathname = usePathname();
  const router = useRouter();
  const isAdminRoute = pathname?.startsWith('/admin');
  
  // Improved route detection for multi-vendor product detail pages
  const pathSegments = pathname?.split('/').filter(Boolean) || [];
  // Matches /[storeId]/products/[productId]
  const isStoreProductPage = pathSegments.length === 3 && pathSegments[1] === 'products';
  const isProductPage = pathname?.startsWith('/products/');
  const isCartPage = pathname === '/cart' || (pathSegments.length === 2 && pathSegments[1] === 'cart');
  const showBackButton = isProductPage || isStoreProductPage || isCartPage;

  useEffect(() => {
    if (state.totalItems > prevTotalItems) {
      setIsBouncing(true);
      setTimeout(() => setIsBouncing(false), 500);
    }
    setPrevTotalItems(state.totalItems);
  }, [state.totalItems, prevTotalItems]);
  
  const handleBack = () => {
    if (showBackButton) {
      router.back();
    }
  };

  if (isAdminRoute) return null;

  return (
    <nav className="fixed top-0 z-50 w-full transition-colors duration-200">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center gap-2">
            {showBackButton ? (
              <>
                <button
                  onClick={handleBack}
                  className="p-2 rounded-lg hover:bg-card-hover transition-colors"
                  aria-label="Go back"
                >
                  <ArrowLeft className="h-6 w-6 text-text-primary" />
                </button>
                <span className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  {storeName || 'Alaniq INT.'}
                </span>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-8 w-8 text-text-primary" />
                <span className="text-xl font-semibold text-text-primary flex items-center gap-2">
                  {isAdminRoute ? 'Admin' : (storeName || 'Alaniq INT.')}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-3 rounded-lg hover:bg-card-hover transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-text-primary" />
              )}
            </button>
  
            {/* Only show cart icon on non-admin routes */}
            {!isAdminRoute && (
              <Link 
                href="/cart"
                className="relative group p-2"
              >
                <div className="relative">
                  <ClipboardListIcon 
                    className="h-6 w-6 text-text-primary transition-colors"
                  />
                  <span 
                    className={`absolute -top-1 -right-1 
                      ${state.totalItems > 0 ? 'bg-red-500' : 'bg-[var(--badge-gray-bg)]'} 
                      ${state.totalItems > 0 ? 'text-white' : 'text-[var(--badge-gray-text)]'}
                      text-xs rounded-full h-5 w-5 flex items-center justify-center
                      transition-all duration-300
                      ${isBouncing ? 'animate-badge-bounce' : ''}`}
                    style={{
                      transform: 'translateZ(0)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    {state.totalItems}
                  </span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
