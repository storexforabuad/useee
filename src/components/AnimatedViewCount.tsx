'use client';

import { useEffect, useState } from 'react';
import { EyeIcon } from 'lucide-react';

interface AnimatedViewCountProps {
  value: number;
}

export default function AnimatedViewCount({ value }: AnimatedViewCountProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Don't animate if value is 0
    if (value === 0) {
      setCount(0);
      return;
    }

    // Start from 0
    setCount(0);

    // Calculate animation duration based on value
    const duration = 2000; // 1 second
    const steps = 60; // 60 frames
    const increment = value / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium
      bg-[var(--badge-gray-bg)] px-2.5 py-0.5 rounded-full shadow-sm">
      <EyeIcon className="w-3.5 h-3.5" />
      <span>{count.toLocaleString()} views</span>
    </div>
  );
}