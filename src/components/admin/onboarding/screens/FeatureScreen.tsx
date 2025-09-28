'use client';

import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';

interface FeatureScreenProps {
  onNext: () => void;
  onBack: () => void;
  title: string;
  description: string;
  icon: React.ReactNode;
  showHint?: boolean;
  hintPosition?: 'bottom' | 'bottom-right';
  isLastStep?: boolean;
}

export default function FeatureScreen({ onNext, onBack, title, description, icon, showHint, hintPosition, isLastStep }: FeatureScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 300 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -300 }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
      className="w-full h-full flex flex-col items-center justify-center text-center p-8 relative"
    >
      <div className="mb-8 flex items-center justify-center text-primary">
        {icon}
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-3">{title}</h2>
      <p className="text-md md:text-lg text-text-secondary mb-10 max-w-sm">{description}</p>

      {showHint && hintPosition === 'bottom' && (
        <motion.div 
          className="absolute bottom-24 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ArrowDown className="w-8 h-8 text-primary" />
        </motion.div>
      )}

      {showHint && hintPosition === 'bottom-right' && (
        <motion.div 
          className="absolute bottom-28 right-12 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0], x: [0, 5, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 bg-primary rounded-full" />
          </div>
        </motion.div>
      )}

      <div className="absolute bottom-10 flex gap-4">
        <button onClick={onBack} className="px-6 py-3 bg-muted text-muted-foreground rounded-full font-semibold hover:bg-muted/80 transition-all">
          Back
        </button>
        {isLastStep ? (
           <button onClick={onNext} className="px-8 py-3 bg-green-500 text-white rounded-full font-semibold shadow-lg hover:bg-green-600 transition-all">
            Start Selling
          </button>
        ) : (
          <button onClick={onNext} className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold shadow-lg hover:bg-primary/90 transition-all">
            Next
          </button>
        )}
      </div>
    </motion.div>
  );
}
