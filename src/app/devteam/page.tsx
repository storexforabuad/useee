"use client";

import { useState, useEffect, useMemo } from 'react';
import { getStores, StoreMeta, getProducts, getPopularProducts } from '../../lib/db';
import Link from 'next/link';
import { Plus, Search, BarChart, Store, Package, Settings, Bell, ArrowRight, AlertTriangle } from 'lucide-react';
import CreateStoreModal from '../../components/admin/modals/CreateStoreModal';
import { motion, AnimatePresence } from 'framer-motion';

// --- Data Interfaces ---
interface StoreStats {
  id: string;
  name: string;
  totalProducts: number;
  limitedStock: number;
  soldOut: number;
  popularCount: number;
  totalViews: number;
}

interface GlobalStats {
  totalStores: number;
  totalProducts: number;
  totalViews: number;
  totalSoldOut: number;
}

// --- Main Dashboard Component ---
export default function DevTeamDashboardPage() {
  // --- State Management ---
  const [stores, setStores] = useState<StoreMeta[]>([]);
  const [allStats, setAllStats] = useState<StoreStats[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  // --- Data Fetching with Error Handling ---
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const storesData = await getStores();
        if (!storesData) throw new Error("Could not fetch stores.");

        setStores(storesData);

        const statsPromises = storesData.map(async (store) => {
          try {
            const products = await getProducts(store.id);
            const popularProducts = await getPopularProducts(store.id, 6);
            const totalViews = products.reduce((sum, p) => sum + (p.views || 0), 0);
            return {
              id: store.id,
              name: store.name,
              totalProducts: products.length,
              limitedStock: products.filter(p => p.limitedStock && !p.soldOut).length,
              soldOut: products.filter(p => p.soldOut).length,
              popularCount: popularProducts.length,
              totalViews,
            };
          } catch (e) {
            console.error(`Failed to fetch stats for store: ${store.id}`, e);
            return null; // Return null on failure for this store
          }
        });

        const statsResults = await Promise.all(statsPromises);
        const validStats = statsResults.filter((s): s is StoreStats => s !== null);
        setAllStats(validStats);

        if (storesData.length > 0) {
          setSelectedStoreId(storesData[0].id);
        }

      } catch (e) {
        console.error("Dashboard loading failed:", e);
        setError(e instanceof Error ? e.message : "An unknown error occurred.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleModalClose = () => {
      setIsModalOpen(false);
      // A simple refresh is okay for now, but a more advanced solution would involve re-fetching data.
      window.location.reload();
  }

  // --- Memoized Calculations ---
  const filteredStores = useMemo(() => {
    return stores.filter(store => store.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [stores, searchTerm]);

  const globalStats: GlobalStats = useMemo(() => ({
    totalStores: stores.length,
    totalProducts: allStats.reduce((sum, s) => sum + s.totalProducts, 0),
    totalViews: allStats.reduce((sum, s) => sum + s.totalViews, 0),
    totalSoldOut: allStats.reduce((sum, s) => sum + s.soldOut, 0),
  }), [stores, allStats]);
  
  const selectedStore = useMemo(() => {
    return stores.find(s => s.id === selectedStoreId);
  }, [stores, selectedStoreId]);

  const selectedStoreStats = useMemo(() => {
    return allStats.find(s => s.id === selectedStoreId);
  }, [allStats, selectedStoreId]);

  // --- Conditional Rendering ---
  if (isLoading) {
    return <DashboardLoader />;
  }

  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // --- Main Render ---
  return (
    <>
      <CreateStoreModal isOpen={isModalOpen} onClose={handleModalClose} />
      <div className="bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col lg:flex-row">
          
          <aside className="w-full lg:w-72 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-xl font-bold text-gray-800 dark:text-white">Alaniq INT.</h1>
                <span className="text-xs text-gray-500">DevTeam Dashboard</span>
            </div>

            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 space-y-2">
                <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stores ({filteredStores.length})</p>
                {filteredStores.map(store => (
                    <button 
                        key={store.id}
                        onClick={() => {
                            setSelectedStoreId(store.id);
                            setActiveTab('overview');
                        }}
                        className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${selectedStoreId === store.id ? 'bg-blue-600 text-white shadow' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                    >
                        <span>{store.name}</span>
                        <div className="flex items-center gap-2">
                           <span className={`w-2 h-2 rounded-full ${allStats.some(s => s.id === store.id) ? 'bg-green-500' : 'bg-red-500'}`} title={allStats.some(s => s.id === store.id) ? 'Online' : 'Stats Failed'}></span>
                        </div>
                    </button>
                ))}
            </nav>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800 mt-auto">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="hidden lg:flex w-full items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg font-semibold shadow-md hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Add New Store
                </button>
            </div>
          </aside>

          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">A global overview of your platform.</p>
                </div>
                <div className="flex items-center gap-4 mt-4 sm:mt-0">
                    <button className="p-2 rounded-full bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300"/>
                    </button>
                </div>
            </div>
            
            <GlobalStatsSection stats={globalStats} />

            <AnimatePresence>
            {selectedStore ? (
                <motion.div 
                    key={selectedStoreId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="mt-8"
                >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                         <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedStore.name}</h3>
                         <div className="flex items-center gap-3 mt-3 md:mt-0">
                             <Link href={`/${selectedStore.id}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition">
                                 Live Store <ArrowRight className="w-4 h-4" />
                             </Link>
                             <Link href={`/admin/${selectedStore.id}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-lg bg-gray-800 text-white text-sm font-semibold hover:bg-gray-900 transition">
                                 Admin Panel
                             </Link>
                         </div>
                    </div>

                    {selectedStoreStats ? (
                        <>
                            <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
                                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                                    <TabButton name="Overview" icon={BarChart} activeTab={activeTab} setActiveTab={setActiveTab} />
                                    <TabButton name="Products" icon={Package} activeTab={activeTab} setActiveTab={setActiveTab} />
                                    <TabButton name="Analytics" icon={BarChart} activeTab={activeTab} setActiveTab={setActiveTab} />
                                    <TabButton name="Settings" icon={Settings} activeTab={activeTab} setActiveTab={setActiveTab} />
                                </nav>
                            </div>

                            <div className="mt-6">
                                {activeTab === 'overview' && <StoreOverviewTab stats={selectedStoreStats} />}
                                {activeTab === 'products' && <ComingSoon feature="Products Management" />}
                                {activeTab === 'analytics' && <ComingSoon feature="Store Analytics" />}
                                {activeTab === 'settings' && <ComingSoon feature="Store Settings" />}
                            </div>
                        </>
                    ) : (
                        <div className="mt-6 text-center py-16 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
                            <AlertTriangle className="w-10 h-10 mx-auto text-red-500" />
                            <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-white">Could Not Load Store Stats</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">There was an error fetching the details for this store.</p>
                        </div>
                    )}
                </motion.div>
            ) : (
                 <div className="mt-8 text-center py-16 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Select a Store</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Choose a store from the sidebar to view its details.</p>
                </div>
            )}
            </AnimatePresence>
          </main>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-110 z-50"
          aria-label="Add New Store"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </>
  );
}

// --- Sub-components ---

function GlobalStatsSection({ stats }: { stats: GlobalStats }) {
    return (
        <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Stores" value={stats.totalStores} icon={Store} color="blue" />
                <StatCard title="Total Products" value={stats.totalProducts.toLocaleString()} icon={Package} color="purple" />
                <StatCard title="Platform Views" value={stats.totalViews.toLocaleString()} icon={BarChart} color="green" />
                <StatCard title="Total Sold Out" value={stats.totalSoldOut.toLocaleString()} icon={Package} color="red" />
            </div>
        </section>
    )
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: React.ElementType; color: string }) {
    const colorClasses = {
        blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300',
        purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300',
        green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300',
        red: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300',
    };
    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl shadow-sm flex items-start justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                <Icon className="w-5 h-5" />
            </div>
        </div>
    );
}

function TabButton({ name, icon: Icon, activeTab, setActiveTab }: { name: string; icon: React.ElementType; activeTab: string; setActiveTab: (name: string) => void; }) {
    const isActive = activeTab === name.toLowerCase();
    return (
        <button
            onClick={() => setActiveTab(name.toLowerCase())}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 text-sm font-medium transition-colors ${
                isActive
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
        >
            <Icon className="w-5 h-5"/>
            {name}
        </button>
    )
}

function StoreOverviewTab({ stats }: { stats: StoreStats }) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
             <InfoCard title="Total Products" value={stats.totalProducts} />
             <InfoCard title="Limited Stock" value={stats.limitedStock} />
             <InfoCard title="Sold Out" value={stats.soldOut} />
             <InfoCard title="Popular Items" value={stats.popularCount} />
             <InfoCard title="Total Views" value={stats.totalViews.toLocaleString()} />
        </div>
    )
}

function InfoCard({title, value}: {title: string, value: string | number}) {
    return (
        <div className="bg-white dark:bg-gray-800/50 p-5 rounded-xl shadow-sm">
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
        </div>
    )
}

function ComingSoon({ feature }: { feature: string }) {
    return (
        <div className="text-center py-16 bg-white dark:bg-gray-800/50 rounded-lg shadow-sm">
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{feature}</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">This feature is coming soon!</p>
        </div>
    );
}

function DashboardLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 dark:text-gray-300 mt-4">Loading Dashboard...</p>
      </div>
    </div>
  );
}

function ErrorDisplay({ message }: { message: string }) {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <AlertTriangle className="w-12 h-12 mx-auto text-red-500"/>
                <h2 className="mt-4 text-xl font-bold text-gray-800 dark:text-white">Something went wrong</h2>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{message}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Try Again
                </button>
            </div>
        </div>
    );
}
