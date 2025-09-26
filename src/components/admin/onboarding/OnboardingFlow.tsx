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
        title: 'Organize Your Inventory', 
        description: 'Use Categories to help customers find exactly what they are looking for. You can manage them anytime from the navbar at the bottom of your screen.',
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
        title: 'Upload Products with Ease', 
        description: "Adding new items is just a tap away. Use the '+' button to add products, photos, and prices directly from your device.",
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
        title: 'Share and Go Viral', 
        description: "Your 'Store Link' card creates a ready-to-share message with a custom caption. Post it everywhere to drive traffic and sales.",
        icon: <Share2 className="w-16 h-16" /> 
      },
    },
    {
      component: FeatureScreen,
      props: { 
        onNext: onComplete, // This is the last step
        onBack: handleBack, 
        title: 'Watch Your Audience Grow', 
        description: 'Track your store views in real-time. Share screenshots of your stats along with your store link to create buzz and show off your popularity!',
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
