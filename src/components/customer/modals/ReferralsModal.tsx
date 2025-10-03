'use client';

import { Info, Link, Copy, Users, Share2 } from 'lucide-react';
import { CustomerModal } from './CustomerModal';
import { useCustomer } from '@/context/CustomerSessionProvider';
import { toast } from 'react-hot-toast';

interface ReferralsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId?: string;
}

export function ReferralsModal({ isOpen, onClose, storeId }: ReferralsModalProps) {
  const { customer } = useCustomer();
  const isStoreContext = storeId && storeId !== 'bizcon';

  const referralLink = customer ? `${window.location.origin}/?ref=${customer.referralCode}` : '';

  const handleCopy = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink).then(() => {
      toast.success('Referral link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      toast.error('Failed to copy link.');
    });
  };

  const handleShare = () => {
    if (navigator.share && referralLink) {
      navigator.share({
        title: 'Get a discount on your first order!',
        text: `I'm giving you a discount on your first order. Use my link to claim it! `,
        url: referralLink,
      })
      .then(() => console.log('Successful share'))
      .catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback for browsers that don't support the Web Share API
      handleCopy();
    }
  };

  return (
    <CustomerModal isOpen={isOpen} onClose={onClose} title="My Referrals">
      <div className="p-4 sm:p-6 flex flex-col gap-6 text-sm sm:text-base">
        {/* Section 1: How It Works */}
        <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3 mb-3">
            <Info className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">How It Works</h3>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            {isStoreContext
              ? "Give your friends 15% off their first order at this store, and you'll get a ₦1,000 credit when they make a purchase."
              : "Give your friends 10% off their first order on Bizcon, and you'll get a ₦500 credit you can use anywhere."
            }
          </p>
        </div>

        {/* Section 2: Share Your Link */}
        {customer && (
          <div className="pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
            <div className="flex items-center gap-3 mb-4">
              <Link className="w-5 h-5 text-slate-400" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Share Your Link</h3>
            </div>
            <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800/50 rounded-lg mb-4">
              <p className="text-slate-500 dark:text-slate-400 overflow-x-auto whitespace-nowrap scrollbar-hide flex-1">
                {referralLink}
              </p>
              <button onClick={handleCopy} className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <Copy className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              </button>
            </div>
            <button 
              onClick={handleShare}
              className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:bg-blue-600 transition-all duration-200 ease-in-out"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        )}

        {/* Section 3: Referral Status */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-slate-400" />
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Your Referrals</h3>
          </div>
          <div className="text-center py-10 px-6 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
            <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-700 dark:text-slate-200">Nothing to see here yet</h4>
            <p className="text-slate-500 dark:text-slate-400">Your referred friends will appear here once they sign up.</p>
          </div>
        </div>
      </div>
    </CustomerModal>
  );
}
