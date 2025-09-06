interface AdminSkeletonProps {
  isNavigation?: boolean;
  screen?: 'home' | 'default';
}

const AdminSkeleton = ({ isNavigation = false, screen = 'default' }: AdminSkeletonProps) => {

  const HomeSkeleton = () => (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto animate-pulse">
      {/* Title skeleton */}
      <div className="h-5 w-3/4 sm:w-1/2 md:w-1/3 bg-[var(--skeleton-background)] rounded-md mb-6" />

      {/* Cards Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(10)].map((_, index) => (
          <div
            key={index}
            className="rounded-2xl bg-[var(--card-background)] p-3 sm:p-4 shadow-md border border-[var(--border-color)]"
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              {/* Icon placeholder */}
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[var(--skeleton-background)]" />
              {/* Text placeholders */}
              <div className="h-6 w-10 bg-[var(--skeleton-background)] rounded-md" />
              <div className="h-4 w-24 bg-[var(--skeleton-background)] rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const DefaultSkeleton = () => (
    <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto space-y-6 animate-pulse">
        {/* Section Title */}
        <div className="h-8 w-48 bg-[var(--skeleton-background)] rounded-lg" />

        {/* Generic Card Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-[var(--card-background)] p-6 rounded-lg shadow-md">
                    <div className="h-6 w-3/4 bg-[var(--skeleton-background)] rounded-md mb-4" />
                    <div className="h-4 w-1/2 bg-[var(--skeleton-background)] rounded-md" />
                </div>
            ))}
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background)] pb-16 md:pb-0">
      {!isNavigation && (
       <div className="bg-[var(--card-background)] border-b border-[var(--border-color)]">
         <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
           <div className="h-8 w-32 bg-[var(--skeleton-background)] rounded-md animate-pulse" />
           <div className="h-8 w-24 bg-[var(--skeleton-background)] rounded-md animate-pulse" />
         </div>
       </div>
      )}

      {/* Main Content Skeleton */}
      {screen === 'home' ? <HomeSkeleton /> : <DefaultSkeleton />}

      {/* Mobile Navigation Skeleton */}
      {!isNavigation && (
       <div className="fixed bottom-0 left-0 right-0 h-16 bg-[var(--card-background)] backdrop-blur-xl border-t border-[var(--border-color)] md:hidden">
         <div className="grid grid-cols-4 h-full">
           {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center justify-center">
                  <div className="h-6 w-6 bg-[var(--skeleton-background)] rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
};

export default AdminSkeleton;
