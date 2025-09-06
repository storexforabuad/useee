'use client';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  // Authentication temporarily disabled
  return <>{children}</>;
};

export default ProtectedRoute;
