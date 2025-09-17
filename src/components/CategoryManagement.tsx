'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, query } from "firebase/firestore";
import { db } from '../lib/db';
import { ProductCategory } from '../types/store';
import { Trash2 } from 'lucide-react';

interface CategoryManagementProps {
  storeId: string;
}

const SYSTEM_CATEGORIES = ["Promo", "New Arrivals"];

export default function CategoryManagement({ storeId }: CategoryManagementProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const q = query(collection(db, `stores/${storeId}/categories`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const categoriesData: ProductCategory[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Filter out system categories from the display
        if (!SYSTEM_CATEGORIES.includes(data.name)) {
            categoriesData.push({ id: doc.id, ...data } as ProductCategory);
        }
      });
      setCategories(categoriesData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching categories:", err);
      setError("Failed to load categories. Please try again later.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  const handleDeleteCategory = async (categoryId: string) => {
    if (!storeId) return;
    try {
      await deleteDoc(doc(db, `stores/${storeId}/categories`, categoryId));
    } catch (err) {
      console.error("Error deleting category:", err);
      setError("Failed to delete category.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-4">Loading categories...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <h3 className="text-lg font-bold mb-4 text-gray-800 dark:text-white">Manage Categories</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        These are the categories for your products. System categories like &apos;Promo&apos; and &apos;New Arrivals&apos; are managed automatically.
      </p>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
            <span className="text-gray-800 dark:text-gray-200">{category.name}</span>
            <button 
              onClick={() => handleDeleteCategory(category.id)}
              className="text-gray-500 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
      {categories.length === 0 && (
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">You haven&apos;t added any custom product categories yet.</p>
      )}
    </div>
  );
}
