'use client';

import { motion } from 'framer-motion';

interface SpotlightTooltipProps {
  text: string;
  className?: string;
}

const SpotlightTooltip = ({ text, className = '' }: SpotlightTooltipProps) => {
  const variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={variants}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`absolute z-50 w-48 ${className}`}
    >
      {/* SVG Container for Arrow */}
      <div className="absolute -top-12 -left-16 w-24 h-20">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="5"
              markerHeight="3.5"
              refX="0"
              refY="1.75"
              orient="auto"
            >
              <polygon
                points="0 0, 5 1.75, 0 3.5"
                className="fill-gray-300 dark:fill-zinc-600"
              />
            </marker>
          </defs>
          <path
            d="M 90 60 C 70 80, 50 80, 40 50"
            strokeLinecap="round"
            markerEnd="url(#arrowhead)"
            className="stroke-gray-300 dark:stroke-zinc-600"
            strokeWidth="2.5"
            fill="none"
          />
        </svg>
      </div>

      {/* Main bubble */}
      <div
        className="relative text-center shadow-2xl rounded-2xl p-4 bg-gray-200 text-gray-800 dark:bg-zinc-700 dark:text-gray-100"
      >
        <p className="text-sm font-medium">{text}</p>
      </div>
    </motion.div>
  );
};

export default SpotlightTooltip;
