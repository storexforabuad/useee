import React from 'react';

const PreviewSkeleton = () => {
  return (
    <div className="p-4 max-w-7xl mx-auto animate-pulse">
      {/* Navbar Skeleton */}
      <div className="h-14 mb-4 bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>

      {/* Category Bar Skeleton */}
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
        <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
        <div className="hidden sm:block h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full"></div>
      </div>
      
      {/* Product Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="space-y-3">
             <div className="aspect-square bg-gray-200 dark:bg-zinc-800 rounded-lg"></div>
             <div className="space-y-2">
                <div className="h-4 w-5/6 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-zinc-800 rounded-md"></div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PreviewSkeleton;
