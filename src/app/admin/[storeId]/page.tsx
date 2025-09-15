"use client";

import { useParams } from 'next/navigation';
import { useEffect, useState, Suspense, useCallback } from 'react';
import { getProducts, getCategories, updateProduct, deleteProduct, getContacts, WholesaleData } from '../../../lib/db';
import { Product } from '../../../types/product';
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSkeleton from '../../../components/admin/AdminSkeleton';
import MobileNav from '../../../components/admin/MobileNav';
import FloatingActionButton from '../../../components/admin/FloatingActionButton';
import AdminHomeCards from '../../../components/admin/AdminHomeCards';
import AddProductSection from '../../../components/AddProductSection';
import dynamic from 'next/dynamic';

const ManageProductsSection = dynamic(() => import('../../../components/ManageProductsSection'));
const CategoryManagementSection = dynamic(() => import('../../../components/CategoryManagementSection'));

export default function AdminStorePage() {
  const params = useParams();
  const storeId = typeof params?.storeId === 'string' ? params.storeId : Array.isArray(params?.storeId) ? params.storeId[0] : '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<WholesaleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [isManageProductsOpen, setIsManageProductsOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(true);
  const [isAddProductOpen, setIsAddProductOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'popular' | 'limited' | 'soldout'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = useCallback(async (showRefresh = false) => {
    if (!storeId) return;
    if (showRefresh) setIsRefreshing(true);
    try {
      const [fetchedProducts, fetchedCategories, fetchedContacts] = await Promise.all([
        getProducts(storeId),
        getCategories(storeId),
        getContacts(storeId)
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setContacts(fetchedContacts);
    } catch {
      // handle error
    } finally {
      if (showRefresh) setIsRefreshing(false);
      setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    if (storeId) {
      fetchData();
    }
  }, [storeId, fetchData]);

  async function handleUpdateProduct(id: string, updatedProduct: Partial<Product>) {
    await updateProduct(storeId, id, updatedProduct);
    fetchData();
  }

  async function handleDeleteProduct(id: string) {
    await deleteProduct(storeId, id);
    fetchData();
  }

  if (loading) return <AdminSkeleton screen="home" />;

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 transition-colors">
      <AdminHeader onLogout={async () => {}} isRefreshing={false} />
      <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        <Suspense fallback={<AdminSkeleton isNavigation={true} />}>
          {activeSection === 'home' && (
            <div className="mb-8">
              <AdminHomeCards
                products={products}
                categories={categories}
                contacts={contacts}
                setActiveSection={setActiveSection}
                storeLink={`/${storeId}`}
                setManageTab={setViewMode}
                setIsManageProductsOpen={setIsManageProductsOpen}
                onRefresh={() => fetchData(true)}
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
              />
            </div>
          )}
          {activeSection === 'manage' && (
            <div className="mb-8">
              <ManageProductsSection
                products={products}
                handleUpdateProduct={handleUpdateProduct}
                handleDeleteProduct={handleDeleteProduct}
                handleDuplicateProduct={() => {}}
                handleCopyToBatch={() => {}}
                isManageProductsOpen={isManageProductsOpen}
                setIsManageProductsOpen={setIsManageProductsOpen}
                viewMode={viewMode}
                setViewMode={setViewMode}
                categories={categories}
                storeId={storeId} // Pass storeId to ManageProductsSection
              />
            </div>
          )}
          {activeSection === 'categories' && (
            <div className="mb-8">
              <CategoryManagementSection
                isCategoryManagementOpen={isCategoryManagementOpen}
                setIsCategoryManagementOpen={setIsCategoryManagementOpen}
                storeId={storeId}
              />
            </div>
          )}
          {activeSection === 'add' && (
            <div className="mb-8">
              <AddProductSection
                batchTemplate={null}
                isAddProductOpen={isAddProductOpen}
                setIsAddProductOpen={setIsAddProductOpen}
                categories={categories}
                onProductAdded={() => { fetchData(true) }}
                storeId={storeId}
              />
            </div>
          )}
        </Suspense>
      </main>
      <FloatingActionButton />
      <MobileNav activeSection={activeSection} setActiveSection={setActiveSection} />
    </div>
  );
}
