'use client';

import dynamic from 'next/dynamic';
import { SpotlightProvider, useSpotlightContext } from '@/context/SpotlightContext';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from '@/context/AuthContext';
import SignInModal from './auth/SignInModal';

const InstallPrompt = dynamic(() => import('../components/InstallPrompt'), {
  ssr: false
});

const Toaster = dynamic(() => import('react-hot-toast').then(mod => mod.Toaster), {
  ssr: false
});

function SpotlightOverlay() {
  const spotlightContext = useSpotlightContext();

  const handleOverlayClick = () => {
    if (spotlightContext.isTipsSpotlightActive) {
      spotlightContext.setIsTipsSpotlightActive(false);
    }
    if (spotlightContext.spotlightStep !== 'inactive') {
      spotlightContext.setSpotlightStep('inactive');
    }
  };

  const isActive = spotlightContext.isTipsSpotlightActive || spotlightContext.spotlightStep !== 'inactive';

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
          onClick={handleOverlayClick}
        />
      )}
    </AnimatePresence>
  );
}

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SpotlightProvider>
        {children}
        <InstallPrompt />
        <Toaster 
          position="bottom-center"
          toastOptions={{
            className: 'toast',
            style: {
              background: 'var(--card-background)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
            },
          }}
        />
        <SignInModal />
        <SpotlightOverlay />
      </SpotlightProvider>
    </AuthProvider>
  );
}
