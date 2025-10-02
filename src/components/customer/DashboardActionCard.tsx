'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface DashboardActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  color: 'blue' | 'green' | 'yellow';
}

export function DashboardActionCard({ icon, title, subtitle, onClick, color }: DashboardActionCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900/40',
    green: 'bg-green-100 dark:bg-green-900/40',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/40',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="bg-white dark:bg-slate-900/80 backdrop-blur-lg border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-lg w-full overflow-hidden cursor-pointer"
      onClick={onClick}
    >
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400 dark:text-slate-500" />
      </div>
    </motion.div>
  );
}
