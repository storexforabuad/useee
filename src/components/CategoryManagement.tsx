'use client';

import { useState, useEffect } from 'react';
import { collection, onSnapshot, deleteDoc, doc, query, addDoc } from "firebase/firestore";
import { db } from '../lib/db';
import { ProductCategory } from '../types/store';
import { updateStoreMeta } from '../lib/db';
import { Trash2, PlusCircle } from 'lucide-react';

interface CategoryManagementProps {
  storeId: string;
  onCategoryCreated?: () => void;
}

const SYSTEM_CATEGORIES = ["Promo", "New Arrivals"];

export default function CategoryManagement({ storeId, onCategoryCreated }: CategoryManagementProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
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

  const handleAddCategory = async () => {
    if (!storeId || !newCategoryName.trim()) return;
    try {
      await addDoc(collection(db, `stores/${storeId}/categories`), { name: newCategoryName });

      // Update the store metadata to mark that user has created a category
      await updateStoreMeta(storeId, {
        onboardingTasks: {
          hasCreatedCategory: true
        }
      } as any);

      setNewCategoryName('');

      // Notify parent component that a category was created
      if (onCategoryCreated) {
        onCategoryCreated();
      }
    } catch (err) {
      console.error("Error adding category:", err);
      setError("Failed to add category.");
    }
  };

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
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          placeholder="Enter new category name"
          className="flex-grow p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          onClick={handleAddCategory}
          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 flex items-center gap-2"
        >
          <PlusCircle size={18} />
          <span>Add</span>
        </button>
      </div>
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
