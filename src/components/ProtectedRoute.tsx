// filepath: /c:/Users/m/Desktop/m/src/components/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' instead of 'next/router'
import { getAuth } from 'firebase/auth';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setIsAuthenticated(true);
      } else {
        router.push('/signin');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;