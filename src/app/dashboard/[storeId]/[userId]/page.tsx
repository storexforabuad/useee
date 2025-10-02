'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../../../components/layout/navbar';
import { useOrders } from '../../../../hooks/useOrders';
import { CustomerDashboard } from '../../../../components/customer/CustomerDashboard';
import { CustomerMobileNav, CustomerSection } from '../../../../components/customer/CustomerMobileNav';
import { OrdersSection } from '../../../../components/customer/sections/OrdersSection';
import { ReferralsSection } from '../../../../components/customer/sections/ReferralsSection';
import { WishlistSection } from '../../../../components/customer/sections/WishlistSection';
import { ProfileSection } from '../../../../components/customer/sections/ProfileSection';

const sectionConfig = {
  home: { title: 'Your Activity', subtitle: 'A summary of your recent orders and interactions.' },
  orders: { title: 'Your Orders', subtitle: 'Review and track all your past orders.' },
  referrals: { title: 'Your Referrals', subtitle: 'Track your referrals and see your rewards.' },
  wishlist: { title: 'Your Wishlist', subtitle: 'View and share items you have saved.' },
  profile: { title: 'Your Profile', subtitle: 'Manage your account details and preferences.' },
};

export default function DashboardPage() {
  const params = useParams();
  const storeId = Array.isArray(params.storeId) ? params.storeId[0] : params.storeId;
  const { orders, fetchOrders, loading } = useOrders(storeId || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeSection, setActiveSection] = useState<CustomerSection>('home');
  
  // State for modals
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    fetchOrders();
    setIsRefreshing(false);
  };

  const currentSection = sectionConfig[activeSection];
  const isAnyModalOpen = isOrdersModalOpen || isReferralsModalOpen || isRewardsModalOpen;

  return (
    <div className="bg-slate-50 dark:bg-black min-h-screen">
      <Navbar storeName={currentSection.title} />
      <main className="p-4 pt-20 pb-28 max-w-2xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-slate-100 mb-2">{currentSection.title}</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          {currentSection.subtitle}
        </p>

        <div className="mt-8">
          {activeSection === 'home' && (
            <CustomerDashboard 
              orders={orders}
              onRefresh={handleRefresh}
              isRefreshing={isRefreshing || loading}
              storeId={storeId}
              isOrdersModalOpen={isOrdersModalOpen}
              onOrdersModalOpen={() => setIsOrdersModalOpen(true)}
              onOrdersModalClose={() => setIsOrdersModalOpen(false)}
              isReferralsModalOpen={isReferralsModalOpen}
              onReferralsModalOpen={() => setIsReferralsModalOpen(true)}
              onReferralsModalClose={() => setIsReferralsModalOpen(false)}
              isRewardsModalOpen={isRewardsModalOpen}
              onRewardsModalOpen={() => setIsRewardsModalOpen(true)}
              onRewardsModalClose={() => setIsRewardsModalOpen(false)}
            />
          )}
          {activeSection === 'orders' && <OrdersSection storeId={storeId} />}
          {activeSection === 'referrals' && <ReferralsSection storeId={storeId} />}
          {activeSection === 'wishlist' && <WishlistSection storeId={storeId} />}
          {activeSection === 'profile' && <ProfileSection storeId={storeId} />}
        </div>
      </main>
      <CustomerMobileNav 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
        isModalOpen={isAnyModalOpen} 
      />
    </div>
  );
}
