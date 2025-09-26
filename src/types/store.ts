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
}
