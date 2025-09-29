'use client';

import { createContext, useContext, useState, useMemo } from 'react';

export type SpotlightStep = 'inactive' | 'tips' | 'nav';

interface SpotlightContextType {
  spotlightStep: SpotlightStep;
  setSpotlightStep: (step: SpotlightStep) => void;
}

const SpotlightContext = createContext<SpotlightContextType | undefined>(undefined);

export function SpotlightProvider({ children }: { children: React.ReactNode }) {
  const [spotlightStep, setSpotlightStep] = useState<SpotlightStep>('inactive');

  const contextValue = useMemo(() => ({
    spotlightStep,
    setSpotlightStep,
  }), [spotlightStep]);

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
