import { Tag, Star, AlertTriangle, Eye, Layers, CheckCircle, Link2, Gift, XCircle, RefreshCw, Archive, Handshake, ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';


// Import the new modal components
import TotalProductsModal from './modals/TotalProductsModal';
import CategoriesModal from './modals/CategoriesModal';
import PopularProductsModal from './modals/PopularProductsModal';
import LimitedStockModal from './modals/LimitedStockModal';
import TotalViewsModal from './modals/TotalViewsModal';
import DebtorsModal from './modals/DebtorsModal';
import StoreLinkModal from './modals/StoreLinkModal';
import SubscriptionModal from './modals/SubscriptionModal';
import ReferralsModal from './modals/ReferralsModal';
import SoldOutModal from './modals/SoldOutModal';
import ContactsModal from './modals/ContactsModal'; // Updated import
import OrdersModal from './modals/OrdersModal';
import { Product } from '../../types/product';
import { WholesaleData } from '../../lib/db';

interface AdminHomeCardsProps {
  totalProducts: number;
  totalCategories: number;
  popularProducts: number;
  limitedStock: number;
  totalViews: number;
  debtors: number;
  subscriptionStatus: string;
  products: Product[];
  categories: { id: string; name: string }[];
  contacts: WholesaleData[];
  setActiveSection: (section: string) => void;
  storeLink: string;
  referrals: number;
  setIsModalOpen?: (open: boolean) => void;
  soldOut: number;
  setManageTab: (tab: 'all' | 'popular' | 'limited' | 'soldout') => void;
  setIsManageProductsOpen?: (open: boolean) => void;
  onRefresh: (showRefresh: boolean) => void;
  isRefreshing: boolean;
  totalContacts: number;
  storeId: string; // Added storeId
  totalOrders: number;
  onShowWhatsApp?: () => void; // Add this for onboarding
  isOnboarding?: boolean; // Add this to check onboarding state
}

const cardData = [
    {
      label: 'Orders',
      valueKey: 'totalOrders',
      icon: ShoppingCart,
      gradient: 'from-teal-400 via-cyan-500 to-sky-600',
      text: 'text-white',
      component: OrdersModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(20,184,166,0.5)]',
    },
    {
      label: 'Contacts',
      valueKey: 'totalContacts',
      icon: Handshake,
      gradient: 'from-purple-400 via-indigo-500 to-blue-600',
      text: 'text-white',
      component: ContactsModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(168,85,247,0.5)]',
    },
    {
      label: 'Products',
      valueKey: 'totalProducts',
      icon: Archive,
      gradient: 'from-blue-400 via-blue-500 to-blue-600',
      text: 'text-white',
      component: TotalProductsModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(59,130,246,0.5)]',
    },
    {
      label: 'Categories',
      valueKey: 'totalCategories',
      icon: Tag,
      gradient: 'from-pink-400 via-pink-500 to-pink-600',
      text: 'text-white',
      component: CategoriesModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(236,72,153,0.5)]',
    },
    {
      label: 'Popular',
      valueKey: 'popularProducts',
      icon: Star,
      gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
      text: 'text-white',
      component: PopularProductsModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(234,179,8,0.5)]',
    },
    {
      label: 'Limited',
      valueKey: 'limitedStock',
      icon: AlertTriangle,
      gradient: 'from-orange-400 via-orange-500 to-orange-600',
      text: 'text-white',
      component: LimitedStockModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(249,115,22,0.5)]',
    },
    {
      label: 'Sold Out',
      valueKey: 'soldOut',
      icon: XCircle,
      gradient: 'from-red-400 via-red-500 to-red-600',
      text: 'text-white',
      component: SoldOutModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(239,68,68,0.5)]',
    },
    {
      label: 'Views',
      valueKey: 'totalViews',
      icon: Eye,
      gradient: 'from-green-400 via-green-500 to-green-600',
      text: 'text-white',
      component: TotalViewsModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(34,197,94,0.5)]',
    },
    {
      label: 'Debtors',
      valueKey: 'debtors',
      icon: Layers,
      gradient: 'from-fuchsia-400 via-fuchsia-500 to-fuchsia-600',
      text: 'text-white',
      component: DebtorsModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(217,70,239,0.5)]',
    },
    {
      label: 'Subscription',
      valueKey: 'subscriptionStatus',
      icon: CheckCircle,
      gradient: 'from-cyan-100 to-cyan-300',
      text: 'text-gray-800',
      component: SubscriptionModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(22,163,74,0.5)]',
    },
    {
      label: 'Store Link',
      valueKey: 'storeLink',
      icon: Link2,
      gradient: 'from-gray-200 to-gray-400',
      text: 'text-gray-800',
      component: StoreLinkModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(156,163,175,0.5)]',
    },
    {
      label: 'Referrals',
      valueKey: 'referrals',
      icon: Gift,
      gradient: 'from-orange-400 via-red-400 to-pink-500',
      text: 'text-white',
      component: ReferralsModal,
      glowClass: 'shadow-[0_0_25px_-5px_rgba(244,63,94,0.5)]',
    },
    
  ];

export default function AdminHomeCards(props: AdminHomeCardsProps) {
  const [openModal, setOpenModal] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const { setIsModalOpen, onRefresh, onShowWhatsApp, isOnboarding } = props;

  useEffect(() => {
    if (openModal !== null) {
      window.history.pushState({ modalOpen: true }, '');
      const handlePopState = () => {
        setOpenModal(null);
        if (setIsModalOpen) setIsModalOpen(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => {
        window.removeEventListener('popstate', handlePopState);
        if (window.history.state && window.history.state.modalOpen) {
          window.history.back();
        }
      };
    }
  }, [openModal, setIsModalOpen]);

  const handleOpenModal = (idx: number) => {
    // Check if it's the Store Link card during onboarding
    if (idx === 10 && isOnboarding && onShowWhatsApp) {
      onShowWhatsApp();
      return;
    }

    setOpenModal(idx);
    if (props.setIsModalOpen) props.setIsModalOpen(true);
  };
  const handleCloseModal = () => {
    setOpenModal(null);
    if (props.setIsModalOpen) props.setIsModalOpen(false);
  };

  return (
    <section className="w-full max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 overflow-x-hidden">
        <div className="mb-4">
            <button
                onClick={async () => {
                  setRefreshing(true);
                  await onRefresh(true);
                  setRefreshing(false);
                }}
                disabled={refreshing}
                className="col-span-2 sm:col-span-3 md:col-span-4 w-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold py-3 px-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center dark:hover:shadow-lg dark:hover:shadow-purple-500/30"
            >
                <RefreshCw className={`mr-2 h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-4">
            <style jsx>{`
              .card-blob {
                position: absolute;
                top: -10px;
                right: -10px;
                width: 40px;
                height: 40px;
                background: radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 70%);
                filter: blur(8px);
                animation: blobMove 4s infinite alternate ease-in-out;
                z-index: 0;
              }
              @keyframes blobMove {
                0% { transform: scale(1) translateY(0); }
                100% { transform: scale(1.05) translateY(3px); }
              }
              .dashboard-card {
                min-width: 0;
                max-width: 100%;
                word-wrap: break-word;
                overflow: hidden;
              }
            `}</style>
            {cardData.map((card, idx) => {
              const Icon = card.icon;
              return (
                <button
                  key={card.label}
                  className={`dashboard-card relative flex flex-col items-center justify-center rounded-2xl p-2 sm:p-3 md:p-4 shadow-md transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] focus:outline-none overflow-hidden bg-gradient-to-br ${card.gradient} ${card.text} ${card.glowClass}`}
                  tabIndex={0}
                  type="button"
                  onClick={() => handleOpenModal(idx)}
                >
                  <span className="card-blob" />
                  <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-white bg-opacity-20 mb-1 sm:mb-2 shadow">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 drop-shadow" />
                  </div>
                  <div className="flex flex-col items-center min-w-0 z-10 w-full">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow">
                      {card.label === 'Store Link'
                        ? 'Your'
                        : card.label === 'Contacts'
                          ? props.totalContacts
                          : card.label === 'Sold Out'
                            ? props.soldOut
                            : (() => {
                                const value = props[card.valueKey as keyof AdminHomeCardsProps];
                                if (typeof value === 'number' || typeof value === 'string') return value;
                                return '';
                              })()}
                    </div>
                    <div className="text-xs sm:text-sm font-medium opacity-90 text-center px-1 leading-tight">
                      {card.label}
                    </div>
                  </div>
                </button>
              );
            })}
        </div>
      {openModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md"
          onClick={handleCloseModal}
        >
          <div
            className="relative w-full max-w-sm sm:max-w-md md:max-w-lg mx-2 sm:mx-auto bg-white rounded-2xl border border-gray-200 shadow-2xl flex flex-col items-center animate-fadeIn overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 bg-transparent p-2 rounded-full focus:outline-none transition-colors duration-200"
              onClick={handleCloseModal}
              aria-label="Close"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
            {(() => {
              const card = cardData[openModal];
              const ModalComponent = card.component;
              const modalProps = {
                ...props,
                handleClose: handleCloseModal,
                setIsManageProductsOpen: props.setIsManageProductsOpen || (() => {}),
                onContactAdded: () => props.onRefresh(true),
              };
              return <ModalComponent {...modalProps} />;
              
            })()}
          </div>
        </div>
      )}
    </section>
  );
}
