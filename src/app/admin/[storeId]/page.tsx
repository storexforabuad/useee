'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { getProducts, getCategories, updateProduct, deleteProduct, getContacts, WholesaleData, getStoreMeta } from '../../../lib/db';
import { Product } from '../../../types/product';
import { StoreMeta } from '../../../types/store';
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminSkeleton from '../../../components/admin/AdminSkeleton';
import MobileNav from '../../../components/admin/MobileNav';
import FloatingActionButton from '../../../components/admin/FloatingActionButton';
import AdminHomeCards from '../../../components/admin/AdminHomeCards';
import AddProductSection from '../../../components/AddProductSection';
import dynamic from 'next/dynamic';
import PreviewSkeleton from '../../../components/admin/PreviewSkeleton';
import SubscriptionBanner from '../../../components/admin/SubscriptionBanner';
import { markOnboardingAsCompleted } from '../../../app/actions/onboardingActions';

const ManageProductsSection = dynamic(() => import('../../../components/ManageProductsSection'));
const CategoryManagementSection = dynamic(() => import('../../../components/CategoryManagementSection'));
const OnboardingFlow = dynamic(() => import('../../../components/admin/onboarding/OnboardingFlow'));

export default function AdminStorePage() {
  const params = useParams();
  const storeId = typeof params?.storeId === 'string' ? params.storeId : Array.isArray(params?.storeId) ? params.storeId[0] : '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<WholesaleData[]>([]);
  const [storeMeta, setStoreMeta] = useState<StoreMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [isManageProductsOpen, setIsManageProductsOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'popular' | 'limited' | 'soldout'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
  const [uiVisible, setUiVisible] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (!storeId) return;
    fetchData();
    // eslint-disable-next-line
  }, [storeId]);

  useEffect(() => {
    if (activeSection === 'preview') {
      setIsPreviewLoading(true);
    }
  }, [activeSection]);

  async function fetchData(showRefresh = false) {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [fetchedProducts, fetchedCategories, fetchedContacts, fetchedStoreMeta] = await Promise.all([
        getProducts(storeId),
        getCategories(storeId),
        getContacts(storeId),
        getStoreMeta(storeId)
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setContacts(fetchedContacts);
      setStoreMeta(fetchedStoreMeta as StoreMeta);

      if (fetchedStoreMeta?.hasCompletedOnboarding) {
        setShowOnboarding(false);
        setUiVisible(true);
      } else {
        setShowOnboarding(true);
        setUiVisible(false);
      }

    } catch {
      // handle error
    } finally {
      if (showRefresh) setIsRefreshing(false);
      setLoading(false);
    }
  }

  function handleOnboardingComplete() {
    // Stop showing the onboarding flow AND start the transition
    setShowOnboarding(false);
    setIsTransitioning(true);

    // Fire-and-forget the database update
    markOnboardingAsCompleted(storeId);

    // After a delay, end the transition and show the main UI
    setTimeout(() => {
      setIsTransitioning(false);
      setUiVisible(true);
    }, 800); // Increased delay for a smoother feel
  }

  async function handleUpdateProduct(id: string, updatedProduct: Partial<Product>) {
    await updateProduct(storeId, id, updatedProduct);
    fetchData();
  }

  async function handleDeleteProduct(id: string) {
    await deleteProduct(storeId, id);
    fetchData();
  }

  const totalRevenue = products.reduce((sum, p) => sum + (Number(p.currentPrice) || 0), 0);

  if (loading || showOnboarding === null) return <AdminSkeleton screen="home" />;

  // Check for the transition state FIRST
  if (isTransitioning) {
    return <AdminSkeleton screen="home" />;
  }

  // THEN, check if we need to show the onboarding
  if (showOnboarding) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} storeName={storeMeta?.name || ''} />;
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0 transition-colors">
      <AdminHeader onLogout={async () => {}} isRefreshing={false} />
      
      {activeSection !== 'preview' ? (
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <Suspense fallback={<AdminSkeleton isNavigation={true} />}>
            {activeSection === 'home' && (
              <div className={`mb-8 transition-opacity duration-500 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
                <SubscriptionBanner />
                <AdminHomeCards
                  products={products}
                  categories={categories}
                  contacts={contacts}
                  setActiveSection={setActiveSection}
                  storeLink={`/${storeId}`}
                  setManageTab={setViewMode}
                  setIsManageProductsOpen={setIsManageProductsOpen}
                  onRefresh={fetchData}
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
                  promoCaption={storeMeta?.promoCaption}
                  uiVisible={uiVisible}
                  storeName={storeMeta?.name}
                  totalRevenue={totalRevenue}
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
                  storeId={storeId}
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
                  onProductAdded={() => {}}
                  storeId={storeId}
                />
              </div>
            )}
          </Suspense>
        </main>
      ) : (
        <div className="w-full h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
          {isPreviewLoading && <PreviewSkeleton />}
          <iframe
            src={`/${storeId}`}
            title="Store Preview"
            onLoad={() => setIsPreviewLoading(false)}
            className={`w-full h-full border-0 ${isPreviewLoading ? 'hidden' : 'block'}`}
          />
        </div>
      )}

      <div className={`transition-opacity duration-500 ${uiVisible ? 'opacity-100' : 'opacity-0'}`}>
        {activeSection !== 'preview' && <FloatingActionButton />}
        <MobileNav activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>
    </div>
  );
}
