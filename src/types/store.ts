import { Timestamp } from 'firebase/firestore';

export interface StoreMeta {
  // Original fields
  name: string;
  whatsapp?: string;
  instagram?: string;
  ceoName?: string;
  ceoImage?: string;
  ceoPhone?: string;
  ceoEmail?: string;
  ceoInstagram?: string;
  businessDescription?: string;
  hasPhysicalShop?: boolean;
  shopNumber?: string;
  plazaBuildingName?: string;
  streetAddress?: string;
  country?: string;
  state?: string;
  businessInstagram?: string;
  storeId?: string; 
  totalOrders?: number;

  // New Subscription and Onboarding Fields
  isSubscriptionActive: boolean;
  createdAt: Timestamp;
  subscriptionStatus: 'prospect' | 'trial' | 'grace_period' | 'locked';
  subscriptionEndDate?: Timestamp;
  onboardingTasks: {
    productUploads: number;
    views: number;
    hasCreatedCategory: boolean;
  };
}

export interface ProductCategory {
    id: string;
    name: string;
}
