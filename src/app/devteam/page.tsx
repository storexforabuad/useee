"use client";

import { useState, useEffect } from 'react';
import { getStores, StoreMeta, getProducts, getPopularProducts } from '../../lib/db';
import CategoryManagement from '../../components/CategoryManagement';
import Link from 'next/link';
import { ShoppingBag, ClipboardListIcon, Sun } from 'lucide-react';

interface StoreStats {
  id: string;
  name: string;
  totalProducts: number;
  limitedStock: number;
  soldOut: number;
  popularCount: number;
  totalViews: number;
  rank: number;
}

export default function DevteamPage() {
  const [stores, setStores] = useState<StoreMeta[]>([]);
  const [selectedStore, setSelectedStore] = useState<string | null>(null);
  const [storeStats, setStoreStats] = useState<StoreStats[]>([]);
  const [newStoreId, setNewStoreId] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreWhatsapp, setNewStoreWhatsapp] = useState('');
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  async function handleCreateStore(e: React.FormEvent) {
    e.preventDefault();
    if (!newStoreId.trim() || !newStoreName.trim() || !newStoreWhatsapp.trim()) {
      setError('Store ID, Name, and WhatsApp/Phone are required');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await getStores().then(async stores => {
        if (stores.some(s => s.id === newStoreId.trim())) {
          setError('Store ID already exists');
          setCreating(false);
          return;
        }
        await import('../../lib/db').then(db => db.createStore({ id: newStoreId.trim(), name: newStoreName.trim(), whatsapp: newStoreWhatsapp.trim() }));
      });
      setNewStoreId('');
      setNewStoreName('');
      setNewStoreWhatsapp('');
      setError('');
      setCreating(false);
      // Refresh stores
      const data = await getStores();
      setStores(data);
    } catch {
      setError('Failed to create store');
      setCreating(false);
    }
  }

  useEffect(() => {
    async function fetchStores() {
      const data = await getStores();
      setStores(data);
    }
    fetchStores();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      const stores = await getStores();
      const stats = await Promise.all(stores.map(async (store) => {
        const products = await getProducts(store.id);
        const totalProducts = products.length;
        const limitedStock = products.filter(p => p.limitedStock).length;
        const soldOut = products.filter(p => p.soldOut).length;
        const popularProducts = await getPopularProducts(store.id, 6);
        const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
        return {
          id: store.id,
          name: store.name,
          totalProducts,
          limitedStock,
          soldOut,
          popularCount: popularProducts.length,
          totalViews,
          rank: 0 // will be set after sorting
        };
      }));
      // Rank by views
      stats.sort((a, b) => b.totalViews - a.totalViews);
      stats.forEach((s, i) => s.rank = i + 1);
      setStoreStats(stats);
    }
    fetchStats();
  }, []);

  // Find selected store meta and stats
  const selectedStoreMeta = stores.find(s => s.id === selectedStore);
  const selectedStoreStats = storeStats.find(s => s.id === selectedStore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 px-2 py-4 pt-[calc(var(--navbar-height,64px)+1.5rem)]">
      <header className="flex flex-col items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">DevTeam Dashboard</h1>
        <p className="text-sm text-gray-500 text-center max-w-md">
          Manage stores, categories, and view live stats. Optimized for mobile and fast workflows.
        </p>
      </header>
      {/* Store creation form */}
      <form onSubmit={handleCreateStore} className="mb-6 flex flex-col sm:flex-row gap-2 items-center max-w-lg mx-auto">
        <input
          type="text"
          placeholder="Store ID (e.g. alaniq)"
          value={newStoreId}
          onChange={e => setNewStoreId(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/4 text-sm"
        />
        <input
          type="text"
          placeholder="Store Name"
          value={newStoreName}
          onChange={e => setNewStoreName(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/3 text-sm"
        />
        <input
          type="text"
          placeholder="WhatsApp/Phone Number (e.g. +234... )"
          value={newStoreWhatsapp}
          onChange={e => setNewStoreWhatsapp(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-1/3 text-sm"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded font-semibold text-sm" disabled={creating}>
          {creating ? 'Creating...' : 'Add Store'}
        </button>
      </form>
      {error && <div className="text-red-500 mb-4 text-sm text-center">{error}</div>}
      <section className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Select Store</label>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {stores.map((store: StoreMeta) => (
            <button
              key={store.id}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${selectedStore === store.id ? 'bg-blue-600 text-white' : 'bg-white text-blue-700 border-blue-200'}`}
              onClick={() => setSelectedStore(store.id)}
            >
              {store.name}
            </button>
          ))}
        </div>
      </section>

      {/* Only show stats card and category manager when a store is selected */}
      {selectedStore && selectedStoreMeta && selectedStoreStats && (
        <section className="mb-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 flex flex-col justify-between min-w-[220px] mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-base text-blue-700">{selectedStoreStats.name}</span>
              <span className="text-xs text-gray-400">{selectedStoreStats.id}</span>
            </div>
            <div className="flex gap-2 mb-2">
              <a href={`/admin/${selectedStoreStats.id}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100 transition">Admin</a>
              <a href={`/${selectedStoreStats.id}`} target="_blank" rel="noopener noreferrer" className="px-2 py-1 rounded bg-green-50 text-green-700 text-xs font-semibold hover:bg-green-100 transition">Customer</a>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-semibold">Products: {selectedStoreStats.totalProducts}</span>
              <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">Limited: {selectedStoreStats.limitedStock}</span>
              <span className="px-2 py-1 rounded bg-red-100 text-red-800 text-xs font-semibold">Sold Out: {selectedStoreStats.soldOut}</span>
              <span className="px-2 py-1 rounded bg-green-100 text-green-800 text-xs font-semibold">Popular: {selectedStoreStats.popularCount}</span>
              <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-semibold">Views: {selectedStoreStats.totalViews}</span>
              <span className="px-2 py-1 rounded bg-gray-100 text-gray-800 text-xs font-semibold">Rank: {selectedStoreStats.rank}</span>
            </div>
            <div className="mt-3 text-xs text-gray-500">Created: {selectedStoreMeta.createdAt?.toDate?.().toLocaleDateString?.() || 'N/A'}</div>
          </div>
          <CategoryManagement storeId={selectedStore} />
        </section>
      )}

      {/* Sticky/floating bottom nav for mobile */}
      <nav className="fixed bottom-0 left-0 w-full z-40 bg-white border-t border-gray-200 shadow-lg flex sm:hidden justify-around py-2 px-2">
        <Link href="/devteam" className="flex flex-col items-center text-blue-600 hover:text-blue-800 text-xs font-semibold">
          <ShoppingBag className="w-6 h-6 mb-1" />
          Dashboard
        </Link>
        <Link href="/devteam" className="flex flex-col items-center text-blue-600 hover:text-blue-800 text-xs font-semibold">
          <ClipboardListIcon className="w-6 h-6 mb-1" />
          Stores
        </Link>
        <Link href="/settings" className="flex flex-col items-center text-blue-600 hover:text-blue-800 text-xs font-semibold">
          <Sun className="w-6 h-6 mb-1" />
          Settings
        </Link>
      </nav>
    </div>
  );
}
