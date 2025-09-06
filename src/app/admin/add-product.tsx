
"use client";

import { useState, useEffect, useCallback } from "react";
import AddProductSection from "../../components/AddProductSection";
import { getCategories } from "../../lib/db";

import AdminSkeleton from "../../components/admin/AdminSkeleton";
import { ProductCache } from "../../lib/productCache";

export default function AdminAddProductPage() {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
 
  const [isAddProductOpen, setIsAddProductOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const cats = await getCategories();
        setCategories(cats);
        // If you need to update other states based on products, do it here
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProductAdded = () => {
    // Clear relevant caches
    ProductCache.clear();
    // Refetch data to ensure UI is up-to-date
    fetchData();
  };

  if (loading) {
    return <AdminSkeleton screen="default" />;
  }

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <AddProductSection
       
        batchTemplate={null} // Assuming no batch template on this dedicated page
        isAddProductOpen={isAddProductOpen}
        setIsAddProductOpen={setIsAddProductOpen}
        categories={categories}
        onProductAdded={handleProductAdded}
      />
    </main>
  );
}
