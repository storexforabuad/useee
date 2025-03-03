import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="bg-card-background rounded-xl shadow-sm overflow-hidden">
      {/* Image placeholder */}
      <div className="h-48 animate-preload w-full"/>
      
      {/* Content placeholder */}
      <div className="p-4 space-y-3">
        {/* Title placeholder */}
        <div className="h-4 animate-preload rounded w-3/4"></div>
        
        {/* Price placeholder */}
        <div className="h-6 animate-preload rounded w-1/3"></div>
        
        {/* Category tag placeholder */}
        <div className="h-5 animate-preload rounded w-1/4"></div>
      </div>
    </div>
  );
};

export default SkeletonLoader;