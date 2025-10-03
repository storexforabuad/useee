'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '@/components/Modal'; // Assuming a base modal component exists

interface CustomerData {
  id: string;
  name: string;
  email: string;
  referralCode: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (customer: CustomerData) => void;
}

export const LoginOrSignupModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [view, setView] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // On unmount, abort any in-flight request.
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/customers/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (res.ok) {
        onSuccess(data);
      } else if (res.status === 404 && data.requiresSignup) {
        setView('signup');
      } else {
        setError(data.message || 'An unexpected error occurred.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to connect to the server.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!name) {
      setError('Please enter your name.');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const res = await fetch('/api/customers/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
        signal: controller.signal,
      });

      const data = await res.json();

      if (res.ok || res.status === 201) {
        onSuccess(data);
      } else {
        setError(data.message || 'An unexpected error occurred.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to connect to the server.');
      }
    } finally {
      if (!controller.signal.aborted) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const resetState = () => {
    setView('login');
    setEmail('');
    setName('');
    setError('');
    onClose();
  }

  return (
    <Modal isOpen={isOpen} onClose={resetState}>
      <div className="p-6 bg-white rounded-lg shadow-xl text-gray-800">
        {view === 'login' ? (
          <form onSubmit={handleLogin}>
            <h2 className="text-2xl font-bold mb-4 text-center">Welcome Back!</h2>
            <p className="text-center text-gray-600 mb-6">Enter your email to log in.</p>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <div className="mb-4">
              <label htmlFor="email-login" className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email"
                id="email-login"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                placeholder="you@example.com"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Loading...' : 'Continue'}
            </button>
            <p className="mt-6 text-center text-sm">
              New here?{' '}
              <button type="button" onClick={() => { setView('signup'); setError(''); }} className="font-medium text-indigo-600 hover:text-indigo-500">
                Create an account
              </button>
            </p>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <h2 className="text-2xl font-bold mb-4 text-center">Create Your Account</h2>
            <p className="text-center text-gray-600 mb-6">Join us! It only takes a second.</p>
            {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
            <div className="mb-4">
                <label htmlFor="name-signup" className="block text-sm font-medium text-gray-700">Your Name</label>
                <input 
                    type="text"
                    id="name-signup"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    required
                    placeholder="Jane Doe"
                />
            </div>
            <div className="mb-4">
              <label htmlFor="email-signup" className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email"
                id="email-signup"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                required
                placeholder="you@example.com"
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? 'Creating Account...' : 'Sign Up'}
            </button>
            <p className="mt-6 text-center text-sm">
              Already have an account?{' '}
              <button type="button" onClick={() => { setView('login'); setError(''); }} className="font-medium text-indigo-600 hover:text-indigo-500">
                Log In
              </button>
            </p>
          </form>
        )}
      </div>
    </Modal>
  );
};
