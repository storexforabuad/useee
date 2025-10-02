'use client';

import { User } from 'lucide-react';

interface ProfileSectionProps {
  storeId?: string;
}

export function ProfileSection({ storeId }: ProfileSectionProps) {
  return (
    <div className="text-center py-20 px-6">
      <User className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Profile & Settings</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">Manage your profile and settings here.</p>
    </div>
  );
}
