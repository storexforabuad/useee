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
import { useSpotlightContext } from '@/context/SpotlightContext';

const ManageProductsSection = dynamic(() => import('../../../components/ManageProductsSection'));
const CategoryManagementSection = dynamic(() => import('../../../components/CategoryManagementSection'));
const OnboardingFlow = dynamic(() => import('../../../components/admin/onboarding/OnboardingFlow'));

interface Referral {
  id: string;
  businessName: string;
  businessNumber: string;
}

async function getReferrals(storeId: string): Promise<Referral[]> {
    if (!storeId) return [];
    try {
      const response = await fetch(`/api/stores/${storeId}/referrals`);
      if (!response.ok) {
        console.error("Failed to fetch referrals");
        return [];
      }
      return response.json();
    } catch (error) {
      console.error("Error in getReferrals:", error);
      return [];
    }
}

export default function AdminStorePage() {
  const params = useParams();
  const storeId = typeof params?.storeId === 'string' ? params.storeId : Array.isArray(params?.storeId) ? params.storeId[0] : '';
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<WholesaleData[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
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
  const { spotlightStep, setSpotlightStep } = useSpotlightContext();
  const [shouldShowSpotlight, setShouldShowSpotlight] = useState(false);

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
      const [fetchedProducts, fetchedCategories, fetchedContacts, fetchedStoreMeta, fetchedReferrals] = await Promise.all([
        getProducts(storeId),
        getCategories(storeId),
        getContacts(storeId),
        getStoreMeta(storeId),
        getReferrals(storeId)
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
      setContacts(fetchedContacts);
      setStoreMeta(fetchedStoreMeta as StoreMeta);
      setReferrals(fetchedReferrals);

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
    setShowOnboarding(false);
    setIsTransitioning(true);
    setShouldShowSpotlight(true); // Signal intent to show spotlight
    markOnboardingAsCompleted(storeId);

    setTimeout(() => {
      setIsTransitioning(false);
      setUiVisible(true);
    }, 800);
  }

  const handleAnimationComplete = () => {
    if (shouldShowSpotlight) {
      setTimeout(() => {
        setSpotlightStep('tips');
      }, 500); // Delay for smoother feel
      setShouldShowSpotlight(false); // Reset signal to prevent re-triggering
    }
  };

  async function handleUpdateProduct(id: string, updatedProduct: Partial<Product>) {
    await updateProduct(storeId, id, updatedProduct);
    fetchData();
  }

  async function handleDeleteProduct(id: string) {
    await deleteProduct(storeId, id);
    fetchData();
  }

  const totalRevenue = products.reduce((sum, p) => sum + (Number(p.price) || 0), 0);

  if (loading || showOnboarding === null) return <AdminSkeleton screen="home" />;

  if (isTransitioning) {
    return <AdminSkeleton screen="home" />;
  }

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
                  referrals={referrals.length}
                  onReferralAdded={() => fetchData()}
                  soldOut={products.filter(p => (typeof p.inStock === 'number' && p.inStock === 0) || p.soldOut === true).length}
                  totalContacts={contacts.reduce((sum, region) => sum + (region.contacts?.length || 0), 0)}
                  storeId={storeId}
                  totalOrders={storeMeta?.totalOrders || 0}
                  promoCaption={storeMeta?.promoCaption}
                  uiVisible={uiVisible}
                  storeName={storeMeta?.name}
                  totalRevenue={totalRevenue}
                  onAnimationComplete={handleAnimationComplete}
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
        { spotlightStep !== 'tips' && <MobileNav activeSection={activeSection} setActiveSection={setActiveSection} /> }
      </div>
    </div>
  );
}
