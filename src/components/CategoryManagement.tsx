"use client";

import { useState, useEffect, FormEvent } from 'react';
import { addCategory, deleteCategory, getCategories } from '../lib/db';
import { ProductCategory } from '../../types/store';
import { Trash2 } from 'lucide-react';

interface CategoryManagementProps {
  storeId: string;
}

const SYSTEM_CATEGORIES = ["Promo", "New Arrivals"];

export default function CategoryManagement({ storeId }: CategoryManagementProps) {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) return;

    const fetchCategories = async () => {
      try {
        const categoriesData = await getCategories(storeId);
        const filteredCategories = categoriesData.filter(category => !SYSTEM_CATEGORIES.includes(category.name));
        setCategories(filteredCategories);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load categories. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [storeId]);

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!storeId || !newCategory.trim()) return;

    try {
      await addCategory(storeId, newCategory.trim());
      setNewCategory("");
      // Refetch categories to update the list
      const categoriesData = await getCategories(storeId);
      const filteredCategories = categoriesData.filter(category => !SYSTEM_CATEGORIES.includes(category.name));
      setCategories(filteredCategories);
    } catch (err) {
      console.error("Error adding category:", err);
      setError("Failed to add category.");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!storeId) return;
    try {
      await deleteCategory(storeId, categoryId);
      // Refetch categories to update the list
      const categoriesData = await getCategories(storeId);
      const filteredCategories = categoriesData.filter(category => !SYSTEM_CATEGORIES.includes(category.name));
      setCategories(filteredCategories);
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
      <form onSubmit={handleAddCategory} className="flex items-center mb-4">
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Add new category"
          className="flex-grow p-2 border rounded-l-md bg-input-background focus:ring-2 border-input-border focus:ring-blue-500"
        />
        <button type="submit" className="p-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700">Add</button>
      </form>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        These are the categories for your products. System categories like 'Promo' and 'New Arrivals' are managed automatically.
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
          <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">You haven't added any custom product categories yet.</p>
      )}
    </div>
  );
}
