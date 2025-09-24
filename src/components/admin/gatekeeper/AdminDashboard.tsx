
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
import CongratulatoryModal from '../modals/CongratulatoryModal';
import WhatsAppShareModal from '../modals/WhatsAppShareModal';

// Dynamic Imports
const ManageProductsSection = dynamic(() => import('../../ManageProductsSection'));
const CategoryManagementSection = dynamic(() => import('../../CategoryManagementSection'));

interface AdminDashboardProps {
  storeId: string;
  storeMeta: StoreMeta;
  daysRemaining: number | null;
  isOnboarding: boolean;
  onOnboardingComplete: () => void;
  onDismissOnboarding?: () => void;
}

export default function AdminDashboard({ storeId, storeMeta, daysRemaining, isOnboarding, onOnboardingComplete, onDismissOnboarding }: AdminDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState('home');
  const [isManageProductsOpen, setIsManageProductsOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [onCategoryCreated, setOnCategoryCreated] = useState<(() => void) | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'all' | 'popular' | 'limited' | 'soldout'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(true);
  const [showCongratulatoryModal, setShowCongratulatoryModal] = useState(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const [congratulatoryData, setCongratulatoryData] = useState<{
    taskType: string;
    message: string;
    nextAction: string;
  } | null>(null);
  const [initialCategoriesLoaded, setInitialCategoriesLoaded] = useState(false);
  const [initialCategoryCount, setInitialCategoryCount] = useState(0);
  const [userCreatedCategories, setUserCreatedCategories] = useState<{ id: string, name: string }[]>([]);

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

        // Set initial category count on first load (excluding system categories)
        if (!initialCategoriesLoaded) {
            const userCategories = fetchedCategories.filter(cat =>
                !['Promo', 'New Arrivals'].includes(cat.name)
            );
            setInitialCategoryCount(userCategories.length);
            setUserCreatedCategories(userCategories);
            setInitialCategoriesLoaded(true);
        }
    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    } finally {
        if (showRefresh) setIsRefreshing(false);
    }
  }, [storeId, initialCategoriesLoaded]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);


  // Category completion detection - only trigger when user creates a new category during this session
  useEffect(() => {
    if (!isOnboarding || !initialCategoriesLoaded) return;

    // Filter out system categories to get user-created ones
    const currentUserCategories = categories.filter(cat =>
      !['Promo', 'New Arrivals'].includes(cat.name)
    );

    // Only show congratulatory modal if:
    // 1. User is in onboarding
    // 2. Initial categories have been loaded
    // 3. Current user category count is greater than initial count (new category created)
    // 4. The hasCreatedCategory flag is true (indicating it was just updated)
    // 5. Modal hasn't been shown yet
    const hasCreatedNewCategory = currentUserCategories.length > initialCategoryCount;
    const wasCategoryTaskJustCompleted = storeMeta.onboardingTasks.hasCreatedCategory;

    if (hasCreatedNewCategory && wasCategoryTaskJustCompleted && !showCongratulatoryModal) {
      // Find the newly created category (the last one in the user categories array)
      const newCategory = currentUserCategories[currentUserCategories.length - 1];
      setCongratulatoryData({
        taskType: 'categories',
        message: `Great! You've created your first category "${newCategory.name}"! This will help organize your products for customers.`,
        nextAction: 'products'
      });
      setShowCongratulatoryModal(true);
    }
  }, [categories, initialCategoryCount, initialCategoriesLoaded, storeMeta.onboardingTasks.hasCreatedCategory, isOnboarding, showCongratulatoryModal]);

  // Product upload completion detection
  useEffect(() => {
    if (!isOnboarding) return;

    const productCount = storeMeta.onboardingTasks.productUploads || 0;
    const hasCompletedProducts = productCount >= 20;
    const wasProductTaskIncomplete = productCount < 20;

    if (hasCompletedProducts && wasProductTaskIncomplete && !showCongratulatoryModal) {
      const userCategoryNames = categories
        .filter(cat => !['Promo', 'New Arrivals'].includes(cat.name))
        .map(cat => cat.name)
        .join(', ') || 'your products';
      setCongratulatoryData({
        taskType: 'products',
        message: `Amazing! You've uploaded ${productCount} products for ${userCategoryNames}! Your store is really taking shape.`,
        nextAction: 'sharing'
      });
      setShowCongratulatoryModal(true);
    }
  }, [storeMeta.onboardingTasks.productUploads, categories, isOnboarding, showCongratulatoryModal]);

  // Show WhatsApp sharing modal when user clicks "Get Store Link" task
  const handleShowWhatsAppModal = () => {
    if (isOnboarding && storeMeta.onboardingTasks.hasCreatedCategory && storeMeta.onboardingTasks.productUploads >= 20) {
      setShowWhatsAppModal(true);
    }
  };

  // Handle WhatsApp sharing completion
  const handleWhatsAppComplete = () => {
    setShowWhatsAppModal(false);
    // Mark sharing as completed in the database (you might want to add this to StoreMeta)
    // For now, we'll just show a congratulatory message
    setCongratulatoryData({
      taskType: 'sharing',
      message: "Perfect! Your store link has been shared with your contacts. Keep sharing to get more views and boost your sales!",
      nextAction: 'views'
    });
    setShowCongratulatoryModal(true);
  };

  // Handle category creation - refresh data immediately
  const handleCategoryCreated = useCallback(() => {
    fetchDashboardData(true); // Force refresh to get updated store metadata
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
                    onComplete={async () => {
                      await onOnboardingComplete();
                      if (onDismissOnboarding) {
                        onDismissOnboarding();
                      }
                    }}
                    onTaskClick={(section) => {
                      setActiveSection(section);
                      // Dismiss onboarding when user clicks on a task
                      if (onDismissOnboarding) {
                        onDismissOnboarding();
                      }
                    }}
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
                        onShowWhatsApp={handleShowWhatsAppModal}
                        isOnboarding={isOnboarding}
                      />
                    )}
                    {activeSection === 'manage' && <ManageProductsSection products={products} handleUpdateProduct={async() => {}} handleDeleteProduct={async () => {}} handleDuplicateProduct={()=>{}} handleCopyToBatch={()=>{}} isManageProductsOpen={isManageProductsOpen} setIsManageProductsOpen={setIsManageProductsOpen} viewMode={viewMode} setViewMode={setViewMode} categories={categories} storeId={storeId}/>}
                    {activeSection === 'categories' && <CategoryManagementSection isCategoryManagementOpen={isCategoryManagementOpen} setIsCategoryManagementOpen={setIsCategoryManagementOpen} storeId={storeId} onCategoryCreated={handleCategoryCreated} />}
                    {activeSection === 'add' && <AddProductSection batchTemplate={null} isAddProductOpen={isAddProductOpen} setIsAddProductOpen={setIsAddProductOpen} categories={categories} onProductAdded={fetchDashboardData} storeId={storeId}/>}
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

        {/* Congratulatory Modal */}
        {showCongratulatoryModal && congratulatoryData && (
          <CongratulatoryModal
            isOpen={showCongratulatoryModal}
            onClose={() => setShowCongratulatoryModal(false)}
            onContinue={() => {
              setShowCongratulatoryModal(false);
              // Stay on current section based on task type
              if (congratulatoryData.taskType === 'categories') {
                setActiveSection('categories');
              } else if (congratulatoryData.taskType === 'products') {
                setActiveSection('add');
              }
            }}
            onNext={() => {
              setShowCongratulatoryModal(false);
              // Go to next appropriate section
              if (congratulatoryData.nextAction === 'products') {
                setActiveSection('add');
              } else if (congratulatoryData.nextAction === 'sharing') {
                setActiveSection('home'); // Home section has the store link
              }
            }}
            title="Task Completed! 🎉"
            message={congratulatoryData.message}
            continueText={
              congratulatoryData.taskType === 'categories'
                ? "Continue Adding Categories"
                : "Continue Adding Products"
            }
            nextText={
              congratulatoryData.nextAction === 'products'
                ? "Add Products"
                : "Share Store Link"
            }
            animationType="bounce"
            confetti={true}
          />
        )}

        {/* WhatsApp Share Modal */}
        <WhatsAppShareModal
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          onComplete={handleWhatsAppComplete}
          storeMeta={storeMeta}
          categories={categories}
          storeLink={`/${storeId}`}
        />
    </div>
  );
}
