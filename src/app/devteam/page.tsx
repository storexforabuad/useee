"use client";

import { useEffect, useState } from 'react';
import { getStores, createStore, ensureDefaultStore, StoreMeta } from '../../lib/db';

export default function DevteamPage() {
  const [stores, setStores] = useState<StoreMeta[]>([]);
  const [newStoreId, setNewStoreId] = useState('');
  const [newStoreName, setNewStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    ensureDefaultStore().then(fetchStores);
  }, []);

  async function fetchStores() {
    setLoading(true);
    setError('');
    try {
      const stores = await getStores();
      setStores(stores);
    } catch (e) {
      setError('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateStore(e: React.FormEvent) {
    e.preventDefault();
    if (!newStoreId.trim() || !newStoreName.trim()) return;
    setLoading(true);
    setError('');
    try {
      await createStore({ id: newStoreId.trim(), name: newStoreName.trim() });
      setNewStoreId('');
      setNewStoreName('');
      fetchStores();
    } catch (e) {
      setError('Failed to create store');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 mt-16">
      {/* Added mt-16 for top margin to avoid navbar overlap */}
      <h1 className="text-2xl font-bold mb-6">Devteam: Store Management</h1>
      <form onSubmit={handleCreateStore} className="mb-8 flex gap-2">
        <input
          type="text"
          placeholder="Store ID (e.g. alaniq)"
          value={newStoreId}
          onChange={e => setNewStoreId(e.target.value)}
          className="border px-3 py-2 rounded w-1/3"
        />
        <input
          type="text"
          placeholder="Store Name"
          value={newStoreName}
          onChange={e => setNewStoreName(e.target.value)}
          className="border px-3 py-2 rounded w-1/2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded" disabled={loading}>
          Add Store
        </button>
      </form>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <h2 className="text-lg font-semibold mb-2">All Stores</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul className="space-y-2">
          {stores.map(store => (
            <li key={store.id} className="border rounded px-4 py-2 flex items-center justify-between">
              <span>
                <b>{store.name}</b> <span className="text-gray-500">({store.id})</span>
              </span>
              <div className="flex gap-2 items-center">
                <a
                  href={`/admin/${store.id}`}
                  className="text-blue-600 hover:underline text-sm font-medium px-2 py-1 rounded bg-blue-50 border border-blue-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Admin Dashboard
                </a>
                <a
                  href={`/${store.id}`}
                  className="text-green-600 hover:underline text-sm font-medium px-2 py-1 rounded bg-green-50 border border-green-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Customer Site
                </a>
              </div>
              <span className="text-xs text-gray-400">Created: {store.createdAt?.toDate?.().toLocaleString?.() || 'N/A'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
