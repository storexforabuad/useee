'use client';

import { motion } from 'framer-motion';

interface WelcomeScreenProps {
  onNext: () => void;
  storeName: string;
}

export default function WelcomeScreen({ onNext, storeName }: WelcomeScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full h-full flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-background to-background-alt"
    >
      <div className="h-64 flex items-center justify-center">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, ease: "easeInOut", repeat: Infinity }}
        >
          <span className="text-8xl">🚀</span>
        </motion.div>
      </div>
      <h1 className="text-3xl font-bold mt-6 text-text-primary">{"Welcome To Your Store's Control Center"} {storeName}</h1>
      <p className="text-lg mt-4 text-text-secondary max-w-md">
        {"Let's get you set up to make your first sale. Follow these 4 steps and you'll be a pro in no time."}
      </p>
      <button
        onClick={onNext}
        className="mt-8 px-8 py-3 bg-primary text-primary-foreground font-semibold rounded-full shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300"
      >
        {"Let's Go!"}
      </button>
    </motion.div>
  );
}
