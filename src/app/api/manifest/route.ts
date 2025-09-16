
import { NextResponse } from 'next/server';
import { getStoreMeta } from '../../../lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get('storeId');
  const scope = searchParams.get('scope') || 'public';

  if (!storeId) {
    return new NextResponse('Missing storeId', { 
      status: 400, 
      headers: { 'Access-Control-Allow-Origin': '*' } 
    });
  }

  let storeName = 'Alaniq'; // Default name
  let startUrl = '/';
  let description = 'Discover Beautiful RTW, Perfumes, Incense & More';

  if (storeId !== 'default') {
    try {
      const storeMeta = await getStoreMeta(storeId);
      storeName = storeMeta?.name || storeId;
    } catch (error) {
      console.error(`Failed to fetch metadata for storeId: ${storeId}`, error);
      // Use default name if fetch fails
      storeName = storeId;
    }
  }

  if (scope === 'admin' && storeId !== 'default') {
    storeName = `${storeName} Admin`;
    startUrl = `/admin/${storeId}`;
    description = `Admin dashboard for ${storeName}`;
  } else if (storeId !== 'default') {
    startUrl = `/${storeId}`;
    description = `Public store for ${storeName}`;
  }

  const manifest = {
    name: storeName,
    short_name: storeName,
    description: description,
    start_url: startUrl,
    display: 'standalone',
    background_color: '#000',
    theme_color: '#000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
