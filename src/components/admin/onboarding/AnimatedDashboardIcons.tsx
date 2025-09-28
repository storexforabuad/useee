'use client';
import { Eye, ShoppingCart, BadgeDollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const icons = [
  { component: Eye, color: '#3b82f6' }, // blue-500
  { component: ShoppingCart, color: '#8b5cf6' }, // purple-500
  { component: BadgeDollarSign, color: '#22c55e' }, // green-500
];

const AnimatedDashboardIcons = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % icons.length);
    }, 2000); // Change icon every 2 seconds

    return () => clearInterval(interval);
  }, []);

  const { component: Icon, color } = icons[index];

  return (
    <div className="flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ color }}
        >
          <Icon className="w-24 h-24 sm:w-32 sm:h-32 drop-shadow-lg" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AnimatedDashboardIcons;
