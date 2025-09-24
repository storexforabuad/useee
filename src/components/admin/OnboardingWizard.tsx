'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Circle, ArrowRight, Gift, ShoppingBag, Share2, Eye } from 'lucide-react';
import { ONBOARDING_WINDOW_HOURS, ONBOARDING_TASKS_GOALS } from '../../config/business';
import { StoreMeta } from '../../types/store';

interface OnboardingWizardProps {
  storeMeta: StoreMeta;
  onComplete: () => Promise<void>;
  onTaskClick: (section: string) => void;
}

interface Countdown {
  hours: string;
  minutes: string;
  seconds: string;
}

// --- Helper Components ---
const TaskItem = ({ isComplete, icon, title, description, buttonText, onAction }: any) => {
  const Icon = icon;
  return (
    <div className={`flex items-start space-x-4 p-4 rounded-lg transition-all ${isComplete ? 'bg-green-50 dark:bg-green-900/40' : 'bg-gray-50 dark:bg-gray-800/60'}`}>
      <div className={`mt-1 ${isComplete ? 'text-green-500' : 'text-gray-400'}`}>
        {isComplete ? <CheckCircle size={24} /> : <Circle size={24} />}
      </div>
      <div className="flex-1">
        <h3 className={`font-bold ${isComplete ? 'text-green-800 dark:text-green-300' : 'text-gray-800 dark:text-white'}`}>{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
        {!isComplete && onAction && (
          <button 
            onClick={onAction}
            className="mt-3 inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            {buttonText} <ArrowRight size={16} className="ml-1" />
          </button>
        )}
      </div>
    </div>
  );
};

const WelcomeStep = ({ onNext }: { onNext: () => void }) => (
  <div className="text-center p-4">
    <div className="mb-12">
      <Gift size={60} className="block mx-auto text-blue-500 animate-bounce" />
    </div>
    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mt-20">Welcome to Your New Store!</h1>
    <p className="mt-4 max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-300">You're just a few steps away from unlocking your dashboard and starting a 1-month free trial.</p>
    <button 
      onClick={onNext}
      className="mt-8 inline-flex items-center justify-center w-full max-w-xs px-8 py-4 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-transform transform hover:scale-105 shadow-lg"
    >
      Let's Get Started
    </button>
  </div>
);

const CompletionStep = ({ onComplete }: { onComplete: () => void }) => (
    <div className="text-center p-4">
      <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
      <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">Setup Complete!</h1>
      <p className="mt-4 max-w-xl mx-auto text-lg text-gray-600 dark:text-gray-300">Congratulations! You've completed all the tasks and unlocked your 1-month free trial.</p>
      <button 
        onClick={onComplete}
        className="mt-8 inline-flex items-center justify-center w-full max-w-xs px-8 py-4 text-lg font-bold rounded-xl text-white bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-transform transform hover:scale-105 shadow-lg"
      >
        Explore My Dashboard
      </button>
    </div>
  );

// --- Main Component ---
const OnboardingWizard = ({ storeMeta, onComplete, onTaskClick }: OnboardingWizardProps) => {
  const [step, setStep] = useState(0);
  const [countdown, setCountdown] = useState<Countdown | null>(null);

  const tasks = {
    hasCreatedCategory: storeMeta.onboardingTasks.hasCreatedCategory,
    hasUploaded20Products: storeMeta.onboardingTasks.productUploads >= ONBOARDING_TASKS_GOALS.PRODUCT_COUNT,
    hasReached100Views: storeMeta.onboardingTasks.views >= ONBOARDING_TASKS_GOALS.VIEW_COUNT,
  };

  const allTasksComplete = tasks.hasCreatedCategory && tasks.hasUploaded20Products && tasks.hasReached100Views;

  useEffect(() => {
    const interval = setInterval(() => {
      const endTime = storeMeta.createdAt.toDate().getTime() + ONBOARDING_WINDOW_HOURS * 60 * 60 * 1000;
      const now = new Date().getTime();
      const distance = endTime - now;

      if (distance < 0) {
        setCountdown({ hours: '00', minutes: '00', seconds: '00' });
        // The parent component will handle the lockout logic
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0'),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [storeMeta.createdAt]);

  const handleAction = (section: string) => {
    onTaskClick(section);
  };

  const renderContent = () => {
    if (allTasksComplete) {
      return <CompletionStep onComplete={onComplete} />;
    }
    if (step === 0) {
        return <WelcomeStep onNext={() => setStep(1)} />
    }
    return (
        <div className="p-4 sm:p-6">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Complete these tasks to unlock your trial</h2>
                {countdown && (
                    <div className="mt-2 text-lg font-mono bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 inline-block shadow-inner">
                        <span className="text-red-500 font-bold">{countdown.hours}:{countdown.minutes}:{countdown.seconds}</span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">remaining</span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <TaskItem 
                    isComplete={tasks.hasCreatedCategory}
                    icon={ShoppingBag}
                    title={`Create at least ${ONBOARDING_TASKS_GOALS.CATEGORY_COUNT} category`}
                    description="Organize your products for your customers."
                    buttonText="Manage Categories"
                    onAction={() => handleAction('categories')}
                />
                <TaskItem 
                    isComplete={tasks.hasUploaded20Products}
                    icon={ShoppingBag}
                    title={`Upload at least ${ONBOARDING_TASKS_GOALS.PRODUCT_COUNT} products`}
                    description={`${storeMeta.onboardingTasks.productUploads || 0} / ${ONBOARDING_TASKS_GOALS.PRODUCT_COUNT} products uploaded.`}
                    buttonText="Add Products"
                    onAction={() => handleAction('add')}
                />
                <TaskItem 
                    isComplete={false} // This is manually confirmed by the user
                    icon={Share2}
                    title="Share your store link" 
                    description="Share on WhatsApp, Instagram, or anywhere else."
                    buttonText="Get Store Link"
                    onAction={() => handleAction('home')} // 'home' will have the store link card
                />
                <TaskItem 
                    isComplete={tasks.hasReached100Views}
                    icon={Eye}
                    title={`Get ${ONBOARDING_TASKS_GOALS.VIEW_COUNT} total views`}
                    description={`${storeMeta.onboardingTasks.views} / ${ONBOARDING_TASKS_GOALS.VIEW_COUNT} views. Views are counted when customers visit your product pages.`}
                />
            </div>
        </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
      <div className="min-h-full flex flex-col justify-center items-center py-12 sm:px-6 lg:px-8">
        <div className="relative w-full max-w-2xl mx-auto">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;