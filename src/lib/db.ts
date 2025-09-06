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
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product } from '../types/product';

// Add this new function
export async function updateProduct(productId: string, data: Partial<Product>): Promise<void> {
  try {
    const productRef = doc(db, 'products', productId);
    const productSnap = await getDoc(productRef);
    
    if (productSnap.exists()) {
      const currentData = productSnap.data();
      
      // Check if product is changing from soldOut to in stock
      if (currentData.soldOut === true && data.soldOut === false) {
        data.backInStock = true; // Set backInStock flag
        await handleBackInStock(productId); // Handle notifications
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
async function handleBackInStock(productId: string): Promise<void> {
  try {
    const notifications = await getStockNotificationsForProduct(productId);
    const product = await getProductById(productId);
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

export async function getProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
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

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
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

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const productRef = doc(db, 'products', id);
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

export async function addProduct(product: Omit<Product, 'id'>): Promise<string> {
  try {
    const productsRef = collection(db, 'products');
    const docRef = await addDoc(productsRef, {
      ...product,
      createdAt: serverTimestamp(),
      views: 0
    });
    // Update the product with the generated Firestore ID
    await updateDoc(docRef, { id: docRef.id });
    return docRef.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
}



export async function deleteProduct(id: string): Promise<void> {
  try {
    const productRef = doc(db, 'products', id);
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

export async function getCategories(): Promise<{ id: string, name: string }[]> {
  try {
    const categoriesRef = collection(db, 'categories');
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

export async function addCategory(name: string): Promise<void> {
  try {
    const categoriesRef = collection(db, 'categories');
    await addDoc(categoriesRef, { 
      name,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error adding category:', error);
  }
}

export async function updateCategory(id: string, name: string): Promise<void> {
  try {
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, { 
      name,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('Error updating category:', error);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    const categoryRef = doc(db, 'categories', id);
    await deleteDoc(categoryRef);
  } catch (error) {
    console.error('Error deleting category:', error);
  }
}

export async function getPopularProducts(limitCount: number = 6): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(
      productsRef,
      orderBy('views', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];
  } catch (error) {
    console.error('Error fetching popular products:', error);
    return [];
  }
}

export async function incrementProductViews(productId: string): Promise<void> {
  try {
    console.log('[PROD] Incrementing views for product:', productId);
    const productRef = doc(db, 'products', productId);
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
        productId
      });
    } else if (error instanceof Error) {
      console.error('[PROD] Error incrementing views:', {
        message: error.message,
        productId
      });
    } else {
      console.error('[PROD] Unknown error incrementing views:', {
        error,
        productId
      });
    }
  }
}