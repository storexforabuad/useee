const AdminSkeleton = () => {
    return (
      <div className="p-4 animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  };
  
  export default AdminSkeleton;