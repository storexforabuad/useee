'use client';

import { Star } from 'lucide-react';
import { CustomerModal } from './CustomerModal';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  return (
    <CustomerModal isOpen={isOpen} onClose={onClose} title="My Rewards">
      <div className="text-center py-20 px-6">
        <Star className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Rewards Program Coming Soon</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your rewards and points will be available here.</p>
      </div>
    </CustomerModal>
  );
}
