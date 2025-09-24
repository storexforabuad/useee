'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

interface CongratulatoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue?: () => void;
  onNext?: () => void;
  title: string;
  message: string;
  continueText?: string;
  nextText?: string;
  showProgress?: boolean;
  progressValue?: number;
  progressLabel?: string;
  animationType?: 'bounce' | 'sparkle' | 'pulse' | 'scale';
  confetti?: boolean;
}

const CongratulatoryModal = ({
  isOpen,
  onClose,
  onContinue,
  onNext,
  title,
  message,
  continueText = "Continue Adding",
  nextText = "Next Step",
  showProgress = false,
  progressValue = 0,
  progressLabel,
  animationType = 'bounce',
  confetti = false
}: CongratulatoryModalProps) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Small delay for smooth entrance animation
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Confetti effect
  useEffect(() => {
    if (confetti && isOpen) {
      const createConfetti = () => {
        const confettiContainer = document.createElement('div');
        confettiContainer.className = 'fixed inset-0 pointer-events-none z-60';
        confettiContainer.id = 'confetti-container';

        for (let i = 0; i < 50; i++) {
          const confetti = document.createElement('div');
          confetti.className = 'absolute animate-confetti';
          confetti.style.left = Math.random() * 100 + '%';
          confetti.style.animationDelay = Math.random() * 3 + 's';
          confetti.style.backgroundColor = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b'][Math.floor(Math.random() * 6)];
          confettiContainer.appendChild(confetti);
        }

        document.body.appendChild(confettiContainer);

        // Clean up after animation
        setTimeout(() => {
          const container = document.getElementById('confetti-container');
          if (container) {
            document.body.removeChild(container);
          }
        }, 4000);
      };

      createConfetti();
    }
  }, [confetti, isOpen]);

  if (!isOpen) return null;

  const getAnimationClasses = () => {
    const baseClasses = "transition-all duration-500 ease-out";
    switch (animationType) {
      case 'bounce':
        return `${baseClasses} animate-bounce`;
      case 'sparkle':
        return `${baseClasses} animate-pulse`;
      case 'pulse':
        return `${baseClasses} animate-pulse`;
      case 'scale':
        return `${baseClasses} scale-105`;
      default:
        return baseClasses;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-8 text-center">
          {/* Icon with animation */}
          <div className={`mb-6 ${getAnimationClasses()}`}>
            <div className="relative inline-block">
              <CheckCircle size={64} className="text-green-500" />
              {animationType === 'sparkle' && (
                <Sparkles size={24} className="absolute -top-2 -right-2 text-yellow-400 animate-spin" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            {title}
          </h2>

          {/* Message */}
          <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Progress indicator */}
          {showProgress && (
            <div className="mb-6">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-2">
                <div
                  className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
              {progressLabel && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {progressLabel}
                </p>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="space-y-3">
            {onContinue && (
              <button
                onClick={onContinue}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {continueText}
                <ArrowRight size={18} />
              </button>
            )}

            {onNext && (
              <button
                onClick={onNext}
                className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
              >
                {nextText}
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CongratulatoryModal;