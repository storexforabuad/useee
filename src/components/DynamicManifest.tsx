'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function DynamicManifest() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return;

    const segments = pathname.split('/').filter(Boolean);
    let storeId = '';
    let scope = 'public';

    if (segments[0] === 'admin' && segments[1]) {
      storeId = segments[1];
      scope = 'admin';
    } else if (segments.length > 0 && segments[0] !== 'api' && segments[0] !== 'signin') {
      storeId = segments[0];
      scope = 'public';
    }

    const finalStoreId = storeId || 'default';
    const manifestScope = storeId ? scope : 'public';
    const manifestUrl = `/api/manifest?storeId=${finalStoreId}&scope=${manifestScope}`;

    let link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'manifest';
      document.head.appendChild(link);
    } else if (!link.href.includes(manifestUrl)) {
        link.href = manifestUrl;
    }

  }, [pathname]);

  return null; // This component does not render anything visible.
}
