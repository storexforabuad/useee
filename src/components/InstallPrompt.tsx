'use client';

import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useEffect, useState } from 'react';
import { usePathname, useParams } from 'next/navigation';
import { getStoreMeta } from '../lib/db';

export default function InstallPrompt() {
  const { showPrompt, setShowPrompt, deferredPrompt } = useInstallPrompt();
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') || pathname === '/signin';
  const params = useParams();
  const storeId = typeof params?.storeId === 'string' ? params.storeId : Array.isArray(params?.storeId) ? params.storeId[0] : '';
  const [storeName, setStoreName] = useState('');

  useEffect(() => {
    console.log('InstallPrompt mounted, showPrompt:', showPrompt);
  }, [showPrompt]);

  useEffect(() => {
    async function fetchStoreName() {
      if (!storeId) return;
      const meta = await getStoreMeta(storeId);
      setStoreName(meta?.name || storeId || 'Alaniq INT.');
    }
    fetchStoreName();
  }, [storeId]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install prompt outcome:', outcome);
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
      } catch (error) {
        console.error('Error showing install prompt:', error);
      }
    } else {
      console.log('No deferred prompt available');
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1000]" />
      {/* Modal */}
      <div className="fixed inset-x-0 bottom-8 flex items-end justify-center z-[1010] px-2 sm:px-0">
        <div className="bg-card-background rounded-lg shadow-[var(--shadow-lg)] p-4 w-full max-w-md border border-border-color relative mx-auto">
          <button 
            onClick={handleDismiss}
            className="absolute top-2 right-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
          <div className="flex flex-col items-start">
            <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
              <span className="text-xl">📱</span>{' '}
              {isAdmin ? 'Install Control Center ' : `Get ${storeName} App`}
            </h3>
            <p className="mt-2 text-sm text-text-secondary space-y-2 leading-relaxed">
              {isAdmin ? (
                <>
                  <span className="flex items-center gap-2"><span>🛒</span> See what’s selling at a glance</span>
                  <span className="flex items-center gap-2"><span>👀</span> Track store views and top products</span>
                  <span className="flex items-center gap-2"><span>💰</span> Know who owes you (debtors)</span>
                  <span className="flex items-center gap-2"><span>📈</span> Watch your store grow in real time</span>
                  <span className="flex items-center gap-2"><span>🗂️</span> Manage everything—all in one place</span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-2"><span>🔥</span> Never miss a promo or flash sale</span>
                  <span className="flex items-center gap-2"><span>📋</span> Create lists for future purchases</span>
                  <span className="flex items-center gap-2"><span>🔔</span> Get alerts for back in stock items, new arrivals etc..</span>
                  <span className="flex items-center gap-2"><span>⚡</span> Lightning-fast shopping experience</span>
                </>
              )}
            </p>
            <button
              onClick={handleInstall}
              className="mt-4 w-full bg-[var(--button-primary)] text-white px-4 py-3 rounded-lg hover:bg-[var(--button-primary-hover)] transition-colors font-medium text-base flex items-center justify-center gap-2"
            >
              <span>Install (5mb) </span>
              <ArrowDownTrayIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}