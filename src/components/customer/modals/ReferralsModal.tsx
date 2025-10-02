'use client';

import { Gift } from 'lucide-react';
import { CustomerModal } from './CustomerModal';

interface ReferralsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReferralsModal({ isOpen, onClose }: ReferralsModalProps) {
  return (
    <CustomerModal isOpen={isOpen} onClose={onClose} title="My Referrals">
      <div className="text-center py-20 px-6">
        <Gift className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Referrals Feature Coming Soon</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your referral information will be displayed here.</p>
      </div>
    </CustomerModal>
  );
}
