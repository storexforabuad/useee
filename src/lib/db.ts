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
  setDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product } from '../types/product';

// Store metadata type
export interface StoreMeta {
  id: string;
  name: string;
  createdAt?: any;
  // Add more fields as needed (e.g., description, contact, etc.)
}

function assertDb() {
  if (!db) throw new Error('Firestore db is not initialized. Check your Firebase config and imports.');
}

// Create a new store (vendor) and seed default categories/products
export async function createStore(store: { id: string; name: string }): Promise<void> {
  try {
    const storeRef = doc(db, 'stores', store.id);
    await setDoc(storeRef, {
      name: store.name,
      createdAt: serverTimestamp(),
    });
    // Seed default categories if not present
    const categoriesRef = collection(db, 'stores', store.id, 'categories');
    const snapshot = await getDocs(categoriesRef);
    if (snapshot.empty) {
      await addDoc(categoriesRef, { name: 'Promo', createdAt: serverTimestamp() });
      await addDoc(categoriesRef, { name: 'New Arrivals', createdAt: serverTimestamp() });
    }
    // Optionally seed a sample product (uncomment if desired)
    // const productsRef = collection(db, 'stores', store.id, 'products');
    // await addDoc(productsRef, {
    //   name: 'Sample Product',
    //   price: 1000,
    //   category: 'Promo',
    //   createdAt: serverTimestamp(),
    //   views: 0,
    //   soldOut: false,
    // });
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
export async function getStoreMeta(storeId: string): Promise<{ id: string; name: string } | null> {
  try {
    const storeRef = doc(db, 'stores', storeId);
    const storeSnap = await getDoc(storeRef);
    if (!storeSnap.exists()) return null;
    return { id: storeSnap.id, ...storeSnap.data() } as { id: string; name: string };
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
      
      // Check if product is changing from soldOut to in stock
      if (currentData.soldOut === true && data.soldOut === false) {
        data.backInStock = true; // Set backInStock flag
        await handleBackInStock(storeId, productId); // Handle notifications
      }
      
      await updateDoc(productRef, data);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
}

// Add this helper function
// Update the handleBackInStock function
// Update handleBackInStock to require storeId
async function handleBackInStock(storeId: string, productId: string): Promise<void> {
  try {
    const notifications = await getStockNotificationsForProduct(productId);
    const product = await getProductById(storeId, productId);
    if (!product) return;

    const notificationPromises = notifications.map(async (notification) => {
      try {
        if (!notification.pushSubscription) return;

        // Add productId to the notification payload
        await fetch('/api/notifications', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            subscription: notification.pushSubscription,
            message: {
              text: `${product.name} is back in stock!`,
              productId: productId // Add this
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
        id: doc.id, // Always use Firestore doc.id
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
        id: doc.id, // Always use Firestore doc.id
      } as Product;
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

export async function getProductById(storeId: string, id: string): Promise<Product | null> {
  assertDb();
  if (!storeId || !id) {
    console.error('Missing storeId or product id');
    return null;
  }
  try {
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