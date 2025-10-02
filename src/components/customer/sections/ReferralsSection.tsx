'use client';

import { Gift } from 'lucide-react';

interface ReferralsSectionProps {
  storeId?: string;
}

export function ReferralsSection({ storeId }: ReferralsSectionProps) {
  return (
    <div className="text-center py-20 px-6">
      <Gift className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Referral Details</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">Track your referral status and earnings here.</p>
    </div>
  );
}
