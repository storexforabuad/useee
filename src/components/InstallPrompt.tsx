'use client';

import { XMarkIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { useInstallPrompt } from '../hooks/useInstallPrompt';
import { useEffect } from 'react';

export default function InstallPrompt() {
  const { showPrompt, setShowPrompt, deferredPrompt } = useInstallPrompt();

  useEffect(() => {
    console.log('InstallPrompt mounted, showPrompt:', showPrompt); // Debug log
  }, [showPrompt]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log('Install prompt outcome:', outcome); // Debug log
        if (outcome === 'accepted') {
          setShowPrompt(false);
        }
      } catch (error) {
        console.error('Error showing install prompt:', error);
      }
    } else {
      console.log('No deferred prompt available'); // Debug log
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('pwaPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-16 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl p-4 z-50">
      <button 
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
      <div className="flex flex-col items-start">
        <h3 className="text-lg font-semibold text-gray-900">📱 Install LaDevida App</h3>
        <p className="mt-1 text-sm text-gray-700 leading-relaxed">
          ⚡ Instant access to flash sales<br/>
          🎁 Special discounts for app users<br/>
          💨 Faster shopping experience<br/>
          📴 Shop even when offline
        </p>
        <button
          onClick={handleInstall}
          className="mt-4 w-full bg-blue-800 text-white px-4 py-3 rounded-lg hover:bg-blue-900 transition-colors font-medium text-base flex items-center justify-center gap-2"
        >
          <span>Tap To Install</span>
          <ArrowDownTrayIcon className="w-5 h-5" />
          
        </button>
      </div>
    </div>
  );
}