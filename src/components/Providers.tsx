'use client';

import { SpotlightProvider, useSpotlightContext } from '@/context/SpotlightContext';
import { AnimatePresence, motion } from 'framer-motion';

function SpotlightOverlay() {
  const { isTipsSpotlightActive, setIsTipsSpotlightActive } = useSpotlightContext();

  const handleOverlayClick = () => {
    setIsTipsSpotlightActive(false);
  };

  return (
    <AnimatePresence>
      {isTipsSpotlightActive && (
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

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SpotlightProvider>
      {children}
      <SpotlightOverlay />
    </SpotlightProvider>
  );
}
