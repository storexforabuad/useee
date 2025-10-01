import { Timestamp } from 'firebase/firestore';

export interface StoreMeta {
  id: string;
  name: string;
  logo: string;
  category: string[];
  followers: number;
  views: number;
  createdAt: Timestamp;
  owner: string;
  products: string[];
  totalOrders?: number;
  promoCaption?: string;
  hasCompletedOnboarding?: boolean;

  // Business contact and details
  whatsapp: string;
  businessDescription?: string;
  businessInstagram?: string;
  ceoName?: string;
  ceoImage?: string;
  
  // Physical address details
  hasPhysicalShop?: boolean;
  shopNumber?: string;
  plazaBuildingName?: string;
  streetAddress?: string;
  state?: string;
  country?: string;
}
