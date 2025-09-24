
'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Product } from '../../../types/product';
import { StoreMeta } from '../../../types/store';
import { getProducts, getCategories, getContacts, updateProduct, deleteProduct } from '../../../lib/db';

// Component Imports
import AdminHeader from '../AdminHeader';
import AdminSkeleton from '../AdminSkeleton';
import MobileNav from '../MobileNav';
import FloatingActionButton from '../FloatingActionButton';
import AdminHomeCards from '../AdminHomeCards';
import AddProductSection from '../../AddProductSection';
import PreviewSkeleton from '../PreviewSkeleton';
import WarningBanner from '../WarningBanner';
import OnboardingWizard from '../OnboardingWizard';

// Dynamic Imports
const ManageProductsSection = dynamic(() => import('../../ManageProductsSection'));
const CategoryManagementSection = dynamic(() => import('../../CategoryManagementSection'));

interface AdminDashboardProps {
  storeId: string;
  storeMeta: StoreMeta;
  daysRemaining: number | null;
  isOnboarding: boolean;
  onOnboardingComplete: () => void;
}

export default function AdminDashboard({ storeId, storeMeta, daysRemaining, isOnboarding, onOnboardingComplete }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [isManageProductsOpen, setIsManageProductsOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'popular' | 'limited' | 'soldout'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);

  const fetchDashboardData = useCallback(async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
        const [fetchedProducts, fetchedCategories, fetchedContacts] = await Promise.all([
            getProducts(storeId),
            getCategories(storeId),
            getContacts(storeId),
        ]);
        setProducts(fetchedProducts);
        setCategories(fetchedCategories);
        setContacts(fetchedContacts);
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    } finally {
        if (showRefresh) setIsRefreshing(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 transition-colors">
        <AdminHeader onLogout={async () => {}} isRefreshing={false} />
        
        {activeSection !== 'preview' ? (
            <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
                {daysRemaining !== null && <WarningBanner daysRemaining={daysRemaining} />}

                {isOnboarding && (
                  <OnboardingWizard 
                    storeMeta={storeMeta} 
                    onComplete={onOnboardingComplete}
                    onTaskClick={setActiveSection} 
                  />
                )}
                
                <Suspense fallback={<AdminSkeleton isNavigation={true} />}>
                    {activeSection === 'home' && (
                      <AdminHomeCards
                        products={products}
                        categories={categories}
                        contacts={contacts}
                        setActiveSection={setActiveSection}
                        storeLink={`/${storeId}`}
                        setManageTab={setViewMode}
                        setIsManageProductsOpen={setIsManageProductsOpen}
                        onRefresh={fetchDashboardData}
                        isRefreshing={isRefreshing}
                        totalProducts={products.length}
                        totalCategories={categories.length}
                        popularProducts={products.filter(p => p.views && p.views > 10).length}
                        limitedStock={products.filter(p => p.limitedStock).length}
                        totalViews={products.reduce((sum, p) => sum + (p.views || 0), 0)}
                        debtors={0}
                        subscriptionStatus={"Active"}
                        referrals={0}
                        soldOut={products.filter(p => (typeof p.inStock === 'number' && p.inStock === 0) || p.soldOut === true).length}
                        totalContacts={contacts.reduce((sum, region) => sum + (region.contacts?.length || 0), 0)}
                        storeId={storeId}
                        totalOrders={storeMeta?.totalOrders || 0}
                      />
                    )}
                    {activeSection === 'manage' && <ManageProductsSection products={products} handleUpdateProduct={async() => {}} handleDeleteProduct={async () => {}} handleDuplicateProduct={()=>{}} handleCopyToBatch={()=>{}} isManageProductsOpen={isManageProductsOpen} setIsManageProductsOpen={setIsManageProductsOpen} viewMode={viewMode} setViewMode={setViewMode} categories={categories} storeId={storeId}/>}
                    {activeSection === 'categories' && <CategoryManagementSection isCategoryManagementOpen={isCategoryManagementOpen} setIsCategoryManagementOpen={setIsCategoryManagementOpen} storeId={storeId} />}
                    {activeSection === 'add' && <AddProductSection batchTemplate={null} isAddProductOpen={isAddProductOpen} setIsAddProductOpen={setIsAddProductOpen} categories={categories} onProductAdded={()=>{}} storeId={storeId}/>}
                </Suspense>
            </main>
        ) : (
            <div className="w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
                {isPreviewLoading && <PreviewSkeleton />}
                <iframe src={`/${storeId}`} title="Store Preview" onLoad={() => setIsPreviewLoading(false)} className={`w-full h-full border-0 ${isPreviewLoading ? 'hidden' : 'block'}`}/>
            </div>
        )}

        {activeSection !== 'preview' && <FloatingActionButton />}
        <MobileNav activeSection={activeSection} setActiveSection={setActiveSection} />
    </div>
  );
}
