import { db, storage } from './firebase';
import { FirebaseError } from 'firebase/app';
import { StockNotification } from '../types/stockNotification';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  orderBy, 
  limit,
  serverTimestamp ,
  increment,
  setDoc,
  Timestamp,
  collectionGroup
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product } from '../types/product';

export { db };

// Store metadata type
export interface StoreMeta {
  id: string;
  name: string;
  createdAt?: Timestamp;
  whatsapp?: string;
  // Add more fields as needed (e.g., description, contact, etc.)
}

// Define types for the contact data
export interface Contact {
  name: string;
  role: string;
  phone: string;
  email: string;
  specialization: string;
}

export interface WholesaleData {
  id: string;
  name: string;
  contacts: Contact[];
}

function assertDb() {
  if (!db) throw new Error('Firestore db is not initialized. Check your Firebase config and imports.');
}

// Create a new store (vendor) and seed default categories/products
export async function createStore(store: { id: string; name: string; whatsapp?: string }): Promise<void> {
  try {
    const storeRef = doc(db, 'stores', store.id);
    await setDoc(storeRef, {
      name: store.name,
      createdAt: serverTimestamp(),
      whatsapp: store.whatsapp || '',
    });
    // Seed default categories if not present
    const categoriesRef = collection(db, 'stores', store.id, 'categories');
    const snapshot = await getDocs(categoriesRef);
    if (snapshot.empty) {
      await addDoc(categoriesRef, { name: 'Promo', createdAt: serverTimestamp() });
      await addDoc(categoriesRef, { name: 'New Arrivals', createdAt: serverTimestamp() });
    }
  } catch (error) {
    console.error('Error creating store:', error);
    throw error;
  }
}

// Get all stores
export async function getStores(): Promise<StoreMeta[]> {
  try {
    const storesRef = collection(db, 'stores');
    const snapshot = await getDocs(storesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as StoreMeta[];
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
}

// Ensure default store exists (e.g., 'alaniq')
export async function ensureDefaultStore(): Promise<void> {
  const defaultStoreId = 'alaniq';
  const defaultStoreName = 'Alaniq';
  const storeRef = doc(db, 'stores', defaultStoreId);
  const storeSnap = await getDoc(storeRef);
  if (!storeSnap.exists()) {
    await createStore({ id: defaultStoreId, name: defaultStoreName });
  }
}

// Fetch store metadata by storeId
export async function getStoreMeta(storeId: string): Promise<StoreMeta | null> {
  try {
    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);
    if (!storeSnap.exists()) return null;
    return { id: storeSnap.id, ...storeSnap.data() } as StoreMeta;
  } catch (error) {
    console.error('Error fetching store meta:', error);
    return null;
  }
}

// Update updateProduct to require storeId
export async function updateProduct(storeId: string, productId: string, data: Partial<Product>): Promise<void> {
  try {
    const productRef = doc(db, 'stores', storeId, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      const currentData = productSnap.data();
      
      if (currentData.soldOut === true && data.soldOut === false) {
        data.backInStock = true; 
        await handleBackInStock(storeId, productId); 
      }
      
      await updateDoc(productRef, data);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}


async function handleBackInStock(storeId: string, productId: string): Promise<void> {
  try {
    const notifications = await getStockNotificationsForProduct(productId);
    const product = await getProductById(storeId, productId);
    if (!product) return;

    const notificationPromises = notifications.map(async (notification) => {
      try {
        if (!notification.pushSubscription) return;

        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: notification.pushSubscription,
            message: {
              text: `${product.name} is back in stock!`,
              productId: productId 
            }
          }),
        });

        await updateNotificationStatus(notification.id!, 'sent');
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    });

    await Promise.all(notificationPromises);
  } catch (error) {
    console.error('Error handling back in stock:', error);
  }
}

export async function hasUserRegisteredForNotification(
  productId: string, 
  deviceInfo: { userAgent: string; platform: string; language: string }
): Promise<boolean> {
  try {
    const stockNotificationsRef = collection(db, 'stockNotifications');
    const q = query(
      stockNotificationsRef,
      where('productId', '==', productId),
      where('deviceInfo.userAgent', '==', deviceInfo.userAgent),
      where('deviceInfo.platform', '==', deviceInfo.platform),
      where('deviceInfo.language', '==', deviceInfo.language),
      where('notificationStatus', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking notification registration:', error);
    return false;
  }
}
export async function createStockNotification(
  notification: Omit<StockNotification, 'id' | 'createdAt'>
): Promise<string> {
  try {
    const stockNotificationsRef = collection(db, 'stockNotifications');
    const docRef = await addDoc(stockNotificationsRef, {
      ...notification,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating stock notification:', error);
    throw error;
  }
}

export async function getStockNotificationsForProduct(productId: string): Promise<StockNotification[]> {
  try {
    const stockNotificationsRef = collection(db, 'stockNotifications');
    const q = query(
      stockNotificationsRef, 
      where('productId', '==', productId),
      where('notificationStatus', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as StockNotification[];
  } catch (error) {
    console.error('Error getting stock notifications:', error);
    return [];
  }
}

export async function updateNotificationStatus(
  notificationId: string, 
  status: 'sent' | 'pending'
): Promise<void> {
  try {
    const notificationRef = doc(db, 'stockNotifications', notificationId);
    await updateDoc(notificationRef, {
      notificationStatus: status
    });
  } catch (error) {
    console.error('Error updating notification status:', error);
    throw error;
  }
}

export async function getProducts(storeId: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'stores', storeId, 'products');
    const q = query(productsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        name: data.name || '',
        description: data.description || '',
        currentPrice: data.currentPrice || 0,
        slashedPrice: data.slashedPrice || 0,
        inStock: typeof data.inStock === 'number' ? data.inStock : 1,
        soldOut: data.soldOut || false,
        limitedStock: data.limitedStock || false,
        category: data.category || '',
        image: data.image || '',
        views: data.views || 0,
      } as Product;
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductsByCategory(storeId: string, category: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'stores', storeId, 'products');
    const q = query(
      productsRef, 
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id, 
      } as Product;
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

// Overload getProductById: If storeId is null, it will search globally.
export async function getProductById(storeId: string, id: string): Promise<Product | null>;
export async function getProductById(storeId: null, id: string): Promise<Product | null>;
export async function getProductById(storeId: string | null, id: string): Promise<Product | null> {
  assertDb();
  if (!id) {
    console.error('Missing product id');
    return null;
  }

  try {
    // Case 1: Global search (for /bizcon)
    if (storeId === null) {
      const productsRef = collectionGroup(db, 'products');
      const q = query(productsRef, where('id', '==', id), limit(1));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        return null;
      }

      const productDoc = snapshot.docs[0];
      const product = { ...productDoc.data(), id: productDoc.id } as Product;

      // Increment views for global discovery
      await updateDoc(productDoc.ref, { views: increment(1) });

      return product;
    }

    // Case 2: Store-specific search (original functionality)
    const productRef = doc(db, 'stores', storeId, 'products', id);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      return null;
    }
    return {
      id: productSnap.id,
      ...productSnap.data()
    } as Product;

  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}


export async function addProduct(storeId: string, product: Omit<Product, 'id'>): Promise<string> {
  try {
    const productsRef = collection(db, 'stores', storeId, 'products');
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: serverTimestamp(),
      views: 0
    });
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}

export async function deleteProduct(storeId: string, id: string): Promise<void> {
  try {
    const productRef = doc(db, 'stores', storeId, 'products', id);
    await deleteDoc(productRef);
  } catch (error) {
    console.error('Error deleting product:', error);
  }
}

export async function uploadImage(file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function getCategories(storeId: string): Promise<{ id: string, name: string }[]> {
  try {
    const categoriesRef = collection(db, 'stores', storeId, 'categories');
    const snapshot = await getDocs(categoriesRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as { id: string, name: string }[];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function addCategory(storeId: string, name: string): Promise<void> {
  try {
    const categoriesRef = collection(db, 'stores', storeId, 'categories');
    await addDoc(categoriesRef, { 
      name,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding category:', error);
  }
}

export async function updateCategory(storeId: string, id: string, name: string): Promise<void> {
  try {
    const categoryRef = doc(db, 'stores', storeId, 'categories', id);
    await updateDoc(categoryRef, { 
      name,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating category:', error);
  }
}

export async function deleteCategory(storeId: string, id: string): Promise<void> {
  try {
    const categoryRef = doc(db, 'stores', storeId, 'categories', id);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
  }
}

export async function getPopularProducts(storeId: string, limitCount: number = 6): Promise<Product[]> {
  if (!storeId) {
    console.error('Missing storeId in getPopularProducts');
    return [];
  }
  assertDb();
  try {
    const productsRef = collection(db, 'stores', storeId, 'products');
    const q = query(productsRef, orderBy('views', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return [];
  }
}

export async function getContacts(storeId: string): Promise<WholesaleData[]> {
  if (!storeId) {
    console.error('Missing storeId in getContacts');
    return [];
  }
  assertDb();
  try {
    const contactsRef = collection(db, 'stores', storeId, 'contacts');
    const q = query(contactsRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WholesaleData));
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return [];
  }
}

export async function addContact(storeId: string, contact: Omit<Contact, 'id'>): Promise<string> {
  if (!storeId) {
    throw new Error('Missing storeId. Cannot add contact.');
  }
  assertDb();
  try {
    const contactsRef = collection(db, 'stores', storeId, 'contacts');
    const docRef = await addDoc(contactsRef, {
      ...contact,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding contact:', error);
    throw error;
  }
}

export async function incrementProductViews(storeId: string, productId: string): Promise<void> {
  try {
    console.log('[PROD] Incrementing views for product:', productId, 'in store:', storeId);
    const productRef = doc(db, 'stores', storeId, 'products', productId);
    const productSnap = await getDoc(productRef);
    if (!productSnap.exists()) {
      console.error('[PROD] Product not found');
      return;
    }
    const currentViews = productSnap.data()?.views || 0;
    console.log('[PROD] Current views:', currentViews);
    await updateDoc(productRef, {
      views: increment(1),
      lastViewed: serverTimestamp()
    });
    console.log('[PROD] Successfully incremented views to:', currentViews + 1);
  } catch (error) {
    if (error instanceof FirebaseError) {
      console.error('[PROD] Firebase error incrementing views:', {
        message: error.message,
        code: error.code,
        storeId,
        productId
      });
    } else if (error instanceof Error) {
      console.error('[PROD] Error incrementing views:', {
        message: error.message,
        storeId,
        productId
      });
    } else {
      console.error('[PROD] Unknown error incrementing views:', {
        error,
        storeId,
        productId
      });
    }
  }
}

// New Global Marketplace Functions

/**
 * Fetches promo products from all stores across the platform, sorted by popularity.
 */
export async function getGlobalPromoProducts(pageNum = 1, pageSize = 24): Promise<Product[]> {
  assertDb();
  try {
    const productsRef = collectionGroup(db, 'products');
    const q = query(
      productsRef,
      where('originalPrice', '>', 0),
      orderBy('views', 'desc'),
      limit(pageSize)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Product);
  } catch (error) {
    console.error("Error fetching global promo products:", error);
    return [];
  }
}

/**
 * Fetches all products for a given category from all stores, sorted by popularity.
 */
export async function getAllProductsByCategory(categoryName: string, pageNum = 1, pageSize = 24): Promise<Product[]> {
  assertDb();
  try {
    const productsRef = collectionGroup(db, 'products');
    const q = query(
      productsRef,
      where('category', '==', categoryName),
      orderBy('views', 'desc'),
      limit(pageSize)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }) as Product);
  } catch (error) {
    console.error(`Error fetching global products for category ${categoryName}:`, error);
    return [];
  }
}

/**
 * Aggregates all unique categories across all stores and sorts them by popularity (sum of product views).
 */
export async function getPopularCategories(): Promise<{ id: string; name: string }[]> {
  assertDb();
  try {
    const productsRef = collectionGroup(db, 'products');
    const snapshot = await getDocs(productsRef);
    const products = snapshot.docs.map(doc => doc.data() as Product);

    const categoryViews: { [key: string]: number } = {};

    products.forEach(product => {
      if (product.category) {
        if (!categoryViews[product.category]) {
          categoryViews[product.category] = 0;
        }
        categoryViews[product.category] += product.views || 0;
      }
    });

    const sortedCategories = Object.entries(categoryViews)
      .sort(([, viewsA], [, viewsB]) => viewsB - viewsA)
      .map(([name]) => ({ id: name, name: name }));

    return sortedCategories;
  } catch (error) {
    console.error("Error fetching popular categories:", error);
    return [];
  }
}
