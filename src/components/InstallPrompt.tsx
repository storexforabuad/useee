'use client';

import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useEffect } from 'react';

export default function InstallPrompt() {
  const { showPrompt, setShowPrompt, deferredPrompt } = useInstallPrompt();

  useEffect(() => {
    console.log('InstallPrompt mounted, showPrompt:', showPrompt);
  }, [showPrompt]);

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
    <div className="fixed bottom-16 left-4 right-4 md:left-auto md:right-4 md:w-96 
      bg-card-background rounded-lg shadow-[var(--shadow-lg)] p-4 z-50 
      border border-border-color">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-text-secondary hover:text-text-primary 
          transition-colors"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
      <div className="flex flex-col items-start">
        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
          <span className="text-xl">📱</span> Install LaDevida App
        </h3>
        <p className="mt-2 text-sm text-text-secondary space-y-1 leading-relaxed">
          <span className="flex items-center gap-2">
            <span>⚡</span> Instant access to flash sales
          </span>
          <span className="flex items-center gap-2">
            <span>🎁</span> Special discounts for app users
          </span>
          <span className="flex items-center gap-2">
            <span>💨</span> Faster shopping experience
          </span>
        </p>
        <button
          onClick={handleInstall}
          className="mt-4 w-full bg-[var(--button-primary)] text-white px-4 py-3 
            rounded-lg hover:bg-[var(--button-primary-hover)] transition-colors 
            font-medium text-base flex items-center justify-center gap-2"
        >
          <span>Tap To Install</span>
          <ArrowDownTrayIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}