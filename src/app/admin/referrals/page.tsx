'use client';

import { useEffect } from 'react';
import ProtectedRoute from '../../../components/ProtectedRoute';
import AdminHeader from '../../../components/admin/AdminHeader';
import { useRouter } from 'next/navigation';
import { getAuth, signOut } from 'firebase/auth';
import MobileNav from '../../../components/admin/MobileNav';
import { initializeApp, getApps } from 'firebase/app';
import { firebaseConfig } from '../../../lib/firebase'; // Make sure this path is correct

export default function ReferralsPage() {
  const router = useRouter();
  
  // Initialize Firebase if it hasn't been initialized yet
  useEffect(() => {
    if (!getApps().length) {
      initializeApp(firebaseConfig);
    }
  }, []);

  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
        <AdminHeader onLogout={handleLogout} isRefreshing={false} />
        
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <div className="bg-card-background rounded-lg shadow-sm p-6">
            <h1 className="text-2xl font-semibold text-text-primary mb-6">
              Referrals Dashboard
            </h1>
            <p className="text-text-secondary">
              Referral system coming soon...
            </p>
          </div>
        </main>
        
        <MobileNav activeSection="referrals" setActiveSection={() => {}} />
      </div>
    </ProtectedRoute>
  );
}