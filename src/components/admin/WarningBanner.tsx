'use client';

import { AlertTriangle } from 'lucide-react';

interface WarningBannerProps {
    daysRemaining: number;
}

// TODO: Replace with your actual Paystack link
const PAYSTACK_LINK = 'https://paystack.com/pay/your-store'; 

const WarningBanner = ({ daysRemaining }: WarningBannerProps) => {
    if (daysRemaining < 0) return null;

    const message = daysRemaining === 0 
        ? "Your access expires today! Renew now to avoid service interruption."
        : `Your access expires in ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}.`;

    return (
        <div className="w-full bg-yellow-400/20 dark:bg-yellow-600/20 border border-yellow-500/50 rounded-xl p-4 mb-6 shadow-md">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-yellow-500 dark:text-yellow-300" />
                </div>
                <div className="ml-4 flex-1 md:flex md:justify-between">
                    <p className="text-base font-medium text-yellow-800 dark:text-yellow-200">{message}</p>
                    <p className="mt-3 text-base md:ml-6 md:mt-0">
                        <a 
                            href={PAYSTACK_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="whitespace-nowrap font-bold text-yellow-900 dark:text-white hover:text-yellow-800 dark:hover:text-yellow-200 transition-colors duration-200"
                        >
                            Renew Now
                            <span aria-hidden="true"> &rarr;</span>
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default WarningBanner;
