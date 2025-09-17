export interface StoreMeta {
  name: string;
  whatsapp?: string;
  instagram?: string; // Optional field
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
  storeId?: string; // This is the document ID in Firestore
}

export interface ProductCategory {
    id: string;
    name: string;
}
