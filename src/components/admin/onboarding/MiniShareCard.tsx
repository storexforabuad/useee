'use client';

import { Share2 } from 'lucide-react';

export default function MiniShareCard() {
  return (
    <div className="w-48 h-28 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex flex-row items-center justify-center p-4 text-white shadow-lg">
      <div className="w-12 h-12 rounded-full bg-white/30 flex items-center justify-center">
        <Share2 className="w-6 h-6 text-white" />
      </div>
      <div className="ml-4">
        <p className="font-bold text-lg">Share</p>
        <p className="text-sm opacity-80">Caption</p>
      </div>
    </div>
  );
}
