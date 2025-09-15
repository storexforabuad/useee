"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../../lib/db';
import { ProductCategory } from '../../types/store';

interface CategoryBarProps {
  storeId: string;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

// Hard-coded system categories that appear first
const SYSTEM_CATEGORIES = ["New Arrivals", "Promo"];

export default function CategoryBar({ storeId, selectedCategory, onSelectCategory }: CategoryBarProps) {
  const [vendorCategories, setVendorCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, `stores/${storeId}/categories`), orderBy("name"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedCategories: ProductCategory[] = [];
      snapshot.forEach(doc => {
        // We only fetch vendor-defined categories from Firestore
        const name = doc.data().name;
        if (!SYSTEM_CATEGORIES.includes(name)) {
          fetchedCategories.push({ id: doc.id, ...doc.data() } as ProductCategory);
        }
      });
      setVendorCategories(fetchedCategories);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching vendor categories:", err);
      setError("Couldn't load product categories.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [storeId]);

  // Combine system and vendor categories for display
  const allCategories = [...SYSTEM_CATEGORIES, ...vendorCategories.map(c => c.name)];

  return (
    <div className="sticky top-[calc(var(--navbar-height,64px))] z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-sm">
      <div className="overflow-x-auto whitespace-nowrap px-2 sm:px-4">
        <div className="flex items-center justify-center space-x-2 py-3">
          {isLoading ? (
            <p className="text-sm text-gray-500">Loading categories...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : (
            allCategories.map((category) => (
              <button
                key={category}
                onClick={() => onSelectCategory(category)}
                className={`px-4 py-2 text-sm font-semibold rounded-full transition-colors duration-200 ease-in-out whitespace-nowrap ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}>
                {category}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
