"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import AddProductSection from "../../components/AddProductSection";
import { getCategories } from "../../lib/db";

import AdminSkeleton from "../../components/admin/AdminSkeleton";
import { ProductCache } from "../../lib/productCache";

export default function AdminAddProductPage() {
  const params = useParams();
  const storeId = typeof params?.storeId === 'string' ? params.storeId : Array.isArray(params?.storeId) ? params.storeId[0] : undefined;
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isAddProductOpen, setIsAddProductOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
        const cats = storeId ? await getCategories(storeId) : [];
        setCategories(cats);
    } catch (error) {
        console.error("Failed to fetch initial data:", error);
    } finally {
        setLoading(false);
    }
  }, [storeId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleProductAdded = () => {
    ProductCache.clear();
    fetchData();
  };

  if (!storeId) {
    return <div className="text-red-500">Error: Store ID is missing. Cannot upload products.</div>;
  }

  if (loading) {
    return <AdminSkeleton screen="default" />;
  }

  return (
    <main className="max-w-4xl mx-auto py-8 px-4">
      <AddProductSection
        storeId={storeId}
        batchTemplate={null}
        isAddProductOpen={isAddProductOpen}
        setIsAddProductOpen={setIsAddProductOpen}
        categories={categories}
        onProductAdded={handleProductAdded}
      />
    </main>
  );
}
