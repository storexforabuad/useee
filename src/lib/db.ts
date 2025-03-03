import { db, storage } from './firebase';
import { collection, getDocs, query, where, doc, getDoc, addDoc, updateDoc, deleteDoc, orderBy, limit } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Product } from '../types/product';

export async function getProducts(): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
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

export async function addProduct(product: Product): Promise<void> {
  try {
    const productsRef = collection(db, 'products');
    await addDoc(productsRef, product);
  } catch (error) {
    console.error('Error adding product:', error);
  }
}

export async function updateProduct(id: string, updatedProduct: Partial<Product>): Promise<void> {
  try {
    const productRef = doc(db, 'products', id);
    await updateDoc(productRef, updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
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

// New functions for categories

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
    await addDoc(categoriesRef, { name });
  } catch (error) {
    console.error('Error adding category:', error);
  }
}

export async function updateCategory(id: string, name: string): Promise<void> {
  try {
    const categoryRef = doc(db, 'categories', id);
    await updateDoc(categoryRef, { name });
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