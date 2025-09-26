'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeScreen from './screens/WelcomeScreen';
import FeatureScreen from './screens/FeatureScreen';
import { Tag, Plus, Share2, Eye } from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
  storeName: string;
}

export default function OnboardingFlow({ onComplete, storeName }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  const handleNext = () => setStep(prev => prev + 1);
  const handleBack = () => setStep(prev => prev - 1);

  const steps = [
    {
      component: WelcomeScreen,
      props: { onNext: handleNext, storeName },
    },
    {
      component: FeatureScreen,
      props: { 
        onNext: handleNext, 
        onBack: handleBack, 
        title: 'Get Organized, Sell More 🗂️', 
        description: "Use Categories to group your products (e.g., 'T-Shirts', 'Accessories'). An organized store is an easy-to-shop store.",
        icon: <Tag className="w-16 h-16" />,
        showHint: true,
        hintPosition: 'bottom',
      },
    },
    {
      component: FeatureScreen,
      props: { 
        onNext: handleNext, 
        onBack: handleBack, 
        title: 'Stock Your Shelves 📦', 
        description: "Tap the '+' button anytime to add products. Pro tip: Clear photos and good prices are the keys to catching a customer\'s eye.",
        icon: <Plus className="w-16 h-16" />,
        showHint: true,
        hintPosition: 'bottom-right',
      },
    },
    {
      component: FeatureScreen,
      props: { 
        onNext: handleNext, 
        onBack: handleBack, 
        title: 'Spread the Word! 📣', 
        description: "No customers? No sales. Use the 'Share Store' card to post your link on WhatsApp, Instagram, and Facebook. Go get your first visitor!",
        icon: <Share2 className="w-16 h-16" /> 
      },
    },
    {
      component: FeatureScreen,
      props: { 
        onNext: onComplete, // The final step simply calls onComplete
        onBack: handleBack, 
        title: 'Watch Your Store Come to Life 👀', 
        description: 'The \'Views\' card shows your traffic. The more you share, the more this number will climb. More views lead to more orders. Now, go make it happen!',
        icon: <Eye className="w-16 h-16" />,
        isLastStep: true,
      },
    },
  ];

  const CurrentScreen = steps[step].component;

  return (
    <motion.div 
        className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5 } }}
    >
        <AnimatePresence mode="wait">
            <CurrentScreen key={step} {...steps[step].props} />
        </AnimatePresence>
        <div className="absolute bottom-4 flex gap-2 p-4">
            {steps.map((_, i) => (
                <motion.div 
                    key={i} 
                    className={`w-2 h-2 rounded-full ${i === step ? 'bg-primary' : 'bg-muted'}`}
                    animate={{ scale: i === step ? 1.5 : 1 }}
                    transition={{ duration: 0.3 }}
                />
            ))}
        </div>
    </motion.div>
  );
}
