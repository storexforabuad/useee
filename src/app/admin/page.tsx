'use client';

import { useState, useEffect, Suspense } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct, getCategories } from '../../lib/db';
import { uploadImageToCloudinary } from '../../lib/cloudinaryClient';
import { Product } from '../../types/product';
import ProtectedRoute from '../../components/ProtectedRoute';
import dynamic from 'next/dynamic';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSkeleton from '../../components/admin/AdminSkeleton';
import MobileNav from '../../components/admin/MobileNav';

// Lazy load components
const AddProductSection = dynamic(() => import('../../components/AddProductSection'));
const PopularProductsSection = dynamic(() => import('../../components/PopularProductsSection'));
const ManageProductsSection = dynamic(() => import('../../components/ManageProductsSection'));
const CategoryManagementSection = dynamic(() => import('../../components/CategoryManagementSection'));

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('add');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    category: '',
    images: [],
    inStock: true,
    limitedStock: false,
  });
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(true);
  const [isManageProductsOpen, setIsManageProductsOpen] = useState(false);
  const [isPopularProductsOpen, setIsPopularProductsOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  
  const auth = getAuth();
  const router = useRouter();

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        getProducts(),
        getCategories()
      ]);
      setProducts(fetchedProducts);
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      if (showRefresh) setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddProduct = async () => {
    if (imageFile) {
      try {
        const imageUrl = await uploadImageToCloudinary(imageFile);
        newProduct.images = [imageUrl];
      } catch (error) {
        console.error('Image upload failed:', error);
        return;
      }
    }
    
    try {
      await addProduct(newProduct as Product);
      await fetchData(true);
      setNewProduct({
        name: '',
        description: '',
        price: 0,
        category: '',
        images: [],
        inStock: true,
        limitedStock: false,
      });
      setImageFile(null);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      await updateProduct(id, updatedProduct);
      await fetchData(true);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      await fetchData(true);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return <AdminSkeleton />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-16 md:pb-0 transition-colors">
        <AdminHeader onLogout={handleLogout} isRefreshing={isRefreshing} />
        
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <Suspense fallback={<AdminSkeleton />}>
            {activeSection === 'add' && (
              <AddProductSection
                newProduct={newProduct}
                setNewProduct={setNewProduct}
                imageFile={imageFile}
                setImageFile={setImageFile}
                handleAddProduct={handleAddProduct}
                isAddProductOpen={isAddProductOpen}
                setIsAddProductOpen={setIsAddProductOpen}
                categories={categories}
              />
            )}

            {activeSection === 'popular' && (
              <PopularProductsSection
                isPopularProductsOpen={isPopularProductsOpen}
                setIsPopularProductsOpen={setIsPopularProductsOpen}
              />
            )}

            {activeSection === 'manage' && (
              <ManageProductsSection
                products={products}
                handleUpdateProduct={handleUpdateProduct}
                handleDeleteProduct={handleDeleteProduct}
                isManageProductsOpen={isManageProductsOpen}
                setIsManageProductsOpen={setIsManageProductsOpen}
              />
            )}

            {activeSection === 'categories' && (
              <CategoryManagementSection
                isCategoryManagementOpen={isCategoryManagementOpen}
                setIsCategoryManagementOpen={setIsCategoryManagementOpen}
              />
            )}
          </Suspense>
        </main>

        <MobileNav activeSection={activeSection} setActiveSection={setActiveSection} />
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;