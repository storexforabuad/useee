'use client';

import { useEffect } from 'react';
import { getAuth, signInWithPopup } from 'firebase/auth';
import { useRouter } from 'next/navigation'; // Use 'next/navigation' instead of 'next/router'
import { googleProvider } from '../lib/firebase';
import { FcGoogle } from 'react-icons/fc';

const SignIn = () => {
  const router = useRouter();
  const auth = getAuth();

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      router.push('/admin');
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/admin');
      }
    });

    return () => unsubscribe();
  }, [auth, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900">Sign In</h1>
        <button
          onClick={handleSignIn}
          className="flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors w-full"
        >
          <FcGoogle className="w-6 h-6 bg-white rounded-full p-1" />
          <span className="font-medium">Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default SignIn;