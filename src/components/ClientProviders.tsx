'use client';

import dynamic from 'next/dynamic';

const InstallPrompt = dynamic(() => import('../components/InstallPrompt'), {
  ssr: false
});

const Toaster = dynamic(() => import('react-hot-toast').then(mod => mod.Toaster), {
  ssr: false
});

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <InstallPrompt />
      <Toaster 
        position="bottom-center"
        toastOptions={{
          className: 'toast',
          style: {
            background: 'var(--card-background)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
          },
        }}
      />
    </>
  );
}