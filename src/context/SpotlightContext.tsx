'use client';

import { createContext, useContext, useState, useMemo } from 'react';

interface SpotlightContextType {
  isTipsSpotlightActive: boolean;
  setIsTipsSpotlightActive: (isActive: boolean) => void;
}

const SpotlightContext = createContext<SpotlightContextType | undefined>(undefined);

export function SpotlightProvider({ children }: { children: React.ReactNode }) {
  const [isTipsSpotlightActive, setIsTipsSpotlightActive] = useState(false);

  const contextValue = useMemo(() => ({
    isTipsSpotlightActive,
    setIsTipsSpotlightActive,
  }), [isTipsSpotlightActive]);

  return (
    <SpotlightContext.Provider value={contextValue}>
      {children}
    </SpotlightContext.Provider>
  );
}

export function useSpotlightContext() {
  const context = useContext(SpotlightContext);
  if (context === undefined) {
    throw new Error('useSpotlightContext must be used within a SpotlightProvider');
  }
  return context;
}
