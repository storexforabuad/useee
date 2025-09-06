import React from 'react';

const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 pt-[calc(var(--navbar-height)+1rem)] lg:pt-[calc(var(--navbar-height)+2rem)] animate-pulse">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-x-8">
        {/* Image Section Skeleton */}
        <div className="flex-1 flex flex-col">
          <div className="relative overflow-hidden rounded-2xl bg-[var(--skeleton-background)] h-[320px] sm:h-[400px] lg:h-[500px] w-full" />
          {/* Thumbnails Skeleton */}
          <div className="mt-4 grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-[var(--skeleton-background)] rounded-lg" />
            ))}
          </div>
        </div>
        {/* Info Section Skeleton */}
        <div className="mt-8 lg:mt-0 flex-1 flex flex-col gap-4">
          {/* Badges and View Count Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
              <div className="h-6 w-20 bg-[var(--skeleton-background)] rounded-full" />
              <div className="h-6 w-16 bg-[var(--skeleton-background)] rounded-full" />
              <div className="h-6 w-24 bg-[var(--skeleton-background)] rounded-full" />
            </div>
            <div className="h-6 w-16 bg-[var(--skeleton-background)] rounded" />
          </div>
          {/* Title Skeleton */}
          <div className="h-8 w-2/3 bg-[var(--skeleton-background)] rounded mb-4" />
          {/* Price Skeleton */}
          <div className="h-6 w-1/3 bg-[var(--skeleton-background)] rounded mb-2" />
          {/* Features Skeleton */}
          <div className="space-y-2 mb-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 w-1/2 bg-[var(--skeleton-background)] rounded" />
            ))}
          </div>
          {/* Action Buttons Skeleton */}
          <div className="flex flex-col gap-3">
            <div className="h-12 w-full bg-[var(--skeleton-background)] rounded-[980px]" />
            <div className="h-12 w-full bg-[var(--skeleton-background)] rounded-[980px]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailSkeleton;