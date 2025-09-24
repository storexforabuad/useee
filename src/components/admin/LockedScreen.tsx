'use client';

import { ShieldAlert } from 'lucide-react';

interface LockedScreenProps {
  status: 'locked' | 'expired';
}

// TODO: Replace with your actual Paystack link from a config file
const PAYSTACK_LINK = 'https://paystack.com/pay/your-store';

const LockedScreen = ({ status }: LockedScreenProps) => {
  const messages = {
    locked: {
      title: 'Your Setup Window Has Expired',
      body: 'You did not complete the required setup tasks within the 48-hour window. Please upgrade to a paid plan to unlock your dashboard and start selling.',
      buttonText: 'Upgrade to a Paid Plan',
    },
    expired: {
      title: 'Your Subscription Has Expired',
      body: 'Your access to the dashboard has been suspended. To continue managing your store, please renew your subscription.',
      buttonText: 'Renew Your Subscription',
    },
  };

  const { title, body, buttonText } = status === 'locked' ? messages.locked : messages.expired;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/80 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl text-center transform transition-all animate-fadeIn">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
          <ShieldAlert className="h-10 w-10 text-red-600 dark:text-red-400" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-4 text-base text-gray-600 dark:text-gray-300">{body}</p>
        <a
          href={PAYSTACK_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center w-full px-6 py-4 border border-transparent text-lg font-semibold rounded-xl text-white bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-transform transform hover:scale-105 shadow-lg"
        >
          {buttonText}
        </a>
        <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">You will be redirected to our secure payment partner, Paystack.</p>
      </div>
    </div>
  );
};

export default LockedScreen;
