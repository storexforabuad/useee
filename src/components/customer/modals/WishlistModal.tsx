'use client';

import { CustomerModal } from './CustomerModal';

import { Heart } from 'lucide-react';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WishlistModal({ isOpen, onClose }: WishlistModalProps) {
  return (
    <CustomerModal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Your Wishlist</h2>
          
        </div>
        <div className="text-center py-12">
            <Heart className="w-16 h-16 mx-auto text-slate-300 dark:text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Your wishlist is empty</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Start adding items you love!</p>
        </div>
      </div>
    </CustomerModal>
  );
}
