'use client';

import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import welcomeAnimation from './animations/welcome.json';

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
      <div className="w-64 h-64">
        <Lottie animationData={welcomeAnimation} loop={true} />
      </div>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.4 } }} 
        className="text-3xl md:text-4xl font-bold text-text-primary mb-3"
      >
        Welcome, {storeName}!
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.4 } }} 
        className="text-md md:text-lg text-text-secondary mb-10 max-w-sm"
      >
        We're thrilled to have you. Let's get you set up to start selling in just a few taps.
      </motion.p>
      <motion.button 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0, transition: { delay: 0.4, duration: 0.4 } }} 
        onClick={onNext} 
        className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold shadow-lg hover:bg-primary/90 transform hover:scale-105 transition-all duration-300"
      >
        Let's Go!
      </motion.button>
    </motion.div>
  );
}
