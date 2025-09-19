'use client';

import { Sparkles } from 'lucide-react';

export default function SubscriptionBanner() {
  return (
    <div className="rounded-lg p-4 mb-6 bg-gradient-to-br from-gray-50 to-gray-200/50 dark:from-gray-800 dark:to-gray-900/70 border border-gray-200 dark:border-gray-700/60">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-x-4 gap-y-3">
        <div className="flex-shrink-0 hidden sm:block">
           <div className="p-2 bg-primary/10 rounded-full">
                <Sparkles size={24} className="text-primary" />
            </div>
        </div>
        <div className="flex-grow">
          <h3 className="font-semibold text-gray-800 dark:text-white">You are on a free trial</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Upgrade now for <span className="font-bold text-gray-900 dark:text-white">50% off</span> — pay <span className="font-bold text-gray-900 dark:text-white">₦900</span> instead of <s className="opacity-70">₦1800</s>.
          </p>
        </div>
        <div className="flex-shrink-0 w-full sm:w-auto">
          <a
            href="https://paystack.shop/pay/5zy8w5sx97"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full text-center bg-gray-900 text-white dark:bg-white dark:text-gray-900 font-medium py-2.5 px-5 rounded-lg text-sm hover:opacity-90 transition-opacity"
          >
            Upgrade
          </a>
        </div>
      </div>
    </div>
  );
}
