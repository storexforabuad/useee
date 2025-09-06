'use client';

import { useState, useEffect, Suspense } from 'react';
import { getProducts, updateProduct, deleteProduct, getCategories } from '../../lib/db';
import { Product } from '../../types/product';
import ProtectedRoute from '../../components/ProtectedRoute';
import dynamic from 'next/dynamic';
import { getAuth, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AdminHeader from '../../components/admin/AdminHeader';
import AdminSkeleton from '../../components/admin/AdminSkeleton';
import MobileNav from '../../components/admin/MobileNav';
import FloatingActionButton from '../../components/admin/FloatingActionButton';
import { toast } from 'react-hot-toast';
import { ProductCache } from '../../lib/productCache';
import AdminHomeCards from '../../components/admin/AdminHomeCards';
import AddProductSection from '../../components/AddProductSection';

// Lazy load components
const ManageProductsSection = dynamic(() => import('../../components/ManageProductsSection'));
const CategoryManagementSection = dynamic(() => import('../../components/CategoryManagementSection'));

// Mock data for contacts to calculate totalContacts
const mockWholesaleData = [
  {
    id: 'vendor-state',
    name: 'Your Vendor State',
    contacts: [
      {
        name: 'Local Supply Co.',
        role: 'Sales Manager',
        phone: '+2348012345678',
        email: 'sales@localsupply.com',
        specialization: 'General Goods',
      },
      {
        name: 'Agro Distributors',
        role: 'Account Manager',
        phone: '+2348023456789',
        email: 'info@agrodist.com',
        specialization: 'Agricultural Products',
      },
    ],
  },
  {
    id: 'your-region',
    name: 'Your Region',
    contacts: [
      {
        name: 'Regional Wholesalers Ltd.',
        role: 'Operations Head',
        phone: '+2347011223344',
        email: 'ops@regionalwholesale.com',
        specialization: 'Electronics, Home Goods',
      },
      {
        name: 'Textile Hub',
        role: 'Manager',
        phone: '+2347022334455',
        email: 'contact@textilehub.com',
        specialization: 'Fabrics, Clothing',
      },
    ],
  },
  {
    id: 'kano-nigeria',
    name: 'Kano, Nigeria',
    contacts: [
      {
        name: 'Kano Commodities',
        role: 'Logistics',
        phone: '+2349033445566',
        email: 'logistics@kanocommodities.com',
        specialization: 'Foodstuffs, Grains',
      },
      {
        name: 'Central Market Suppliers',
        role: 'Wholesale Rep',
        phone: '+2349044556677',
        email: 'sales@centralmarket.com',
        specialization: 'Consumer Goods',
      },
    ],
  },
  {
    id: 'lagos-nigeria',
    name: 'Lagos, Nigeria',
    contacts: [
      {
        name: 'Lagos Import/Export',
        role: 'Director',
        phone: '+2348155667788',
        email: 'ceo@lagosimport.com',
        specialization: 'Variety of Imported Goods',
      },
      {
        name: 'Balogun Market Wholesalers',
        role: 'Sales',
        phone: '+2348166778899',
        email: 'info@balogunwholesale.com',
        specialization: 'Fashion, Beauty Products',
      },
    ],
  },
  {
    id: 'china',
    name: 'China',
    contacts: [
      {
        name: 'Shenzhen Tech Solutions',
        role: 'International Sales',
        phone: '+8613912345678',
        email: 'intlsales@shenzhentech.cn',
        specialization: 'Electronics, Gadgets',
      },
      {
        name: 'Guangzhou General Trading',
        role: 'Export Manager',
        phone: '+8613898765432',
        email: 'export@guangzhoutrade.cn',
        specialization: 'Clothing, Accessories, Small Wares',
      },
    ],
  },
];

const AdminDashboard = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('home');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isManageProductsOpen, setIsManageProductsOpen] = useState(false);
  const [isCategoryManagementOpen, setIsCategoryManagementOpen] = useState(false);
  const [batchTemplate, setBatchTemplate] = useState<Partial<Product> | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(true);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'all' | 'popular' | 'limited' | 'soldout'>('all');

  const auth = getAuth();
  const router = useRouter();

  const fetchData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    try {
      const [fetchedProducts, fetchedCategories] = await Promise.all([
        getProducts(),
        getCategories(),
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

  const handleUpdateProduct = async (id: string, updatedProduct: Partial<Product>) => {
    try {
      await updateProduct(id, updatedProduct);
      ProductCache.clear();
      await fetchData(true);
      toast.success('Product updated successfully');
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    } 
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      ProductCache.clear();
      await fetchData(true);
      toast.success('Product deleted');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleDuplicateProduct = (product: Product) => {
    const duplicatedProduct: Partial<Product> = {
      ...product,
      name: `${product.name} - Copy`,
      images: [],
    };
    delete duplicatedProduct.id;
    setBatchTemplate(null);
    setActiveSection('add');
    setIsAddProductOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyToBatch = (product: Product) => {
    const template: Partial<Product> = {
      ...product,
      name: product.name,
      images: [],
    };
    delete template.id;

    setBatchTemplate(template);
    setActiveSection('add');
    setIsAddProductOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };


  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Calculate total contacts here
  const totalContacts = mockWholesaleData.reduce((sum, region) => sum + region.contacts.length, 0);

  if (loading) {
    return <AdminSkeleton screen="home" />;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background pb-16 md:pb-0 transition-colors">
        <AdminHeader onLogout={handleLogout} isRefreshing={isRefreshing} />
        <main className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
          <Suspense fallback={<AdminSkeleton isNavigation={true} />}>
            {activeSection === 'home' && (
              <div className="mb-8">
                <AdminHomeCards
                  totalProducts={products.length}
                  totalCategories={categories.length}
                  popularProducts={products.filter(p => p.views && p.views > 10).length}
                  limitedStock={products.filter(p => p.limitedStock).length}
                  totalViews={products.reduce((sum, p) => sum + (p.views || 0), 0)}
                  soldOut={products.filter(p => (typeof p.inStock === 'number' && p.inStock === 0) || p.soldOut === true).length}
                  setActiveSection={setActiveSection}
                  setIsManageProductsOpen={setIsManageProductsOpen}
                  setManageTab={setViewMode}
                  products={products}
                  categories={categories}
                  debtors={0}
                  subscriptionStatus={"Active"}
                  storeLink={'http://https://tinyurl.com/alaniqint'}
                  referrals={0}
                  setIsModalOpen={setIsModalOpen}
                  onRefresh={fetchData}
                  isRefreshing={isRefreshing}
                  totalContacts={totalContacts} // Pass totalContacts as a prop
                />
              </div>
            )}

            {activeSection === 'manage' && (
              <div className="mb-8">
                <ManageProductsSection
                  products={products}
                  handleUpdateProduct={handleUpdateProduct}
                  handleDeleteProduct={handleDeleteProduct}
                  handleDuplicateProduct={handleDuplicateProduct}
                  handleCopyToBatch={handleCopyToBatch}
                  isManageProductsOpen={isManageProductsOpen}
                  setIsManageProductsOpen={setIsManageProductsOpen}
                  viewMode={viewMode}
                  setViewMode={setViewMode}
                  categories={categories}
                />
              </div>
            )}

            {activeSection === 'categories' && (
              <div className="mb-8">
                <CategoryManagementSection
                  isCategoryManagementOpen={isCategoryManagementOpen}
                  setIsCategoryManagementOpen={setIsCategoryManagementOpen}
                />
              </div>
            )}

            {activeSection === 'add' && (
              <div className="mb-8">
                <AddProductSection
                  batchTemplate={batchTemplate}
                  isAddProductOpen={isAddProductOpen}
                  setIsAddProductOpen={setIsAddProductOpen}
                  categories={categories}
                  onProductAdded={() => {
                    ProductCache.clear();
                    fetchData(true);
                  }}
                />
              </div>
            )}
          </Suspense>
        </main>
        <FloatingActionButton />
        <MobileNav 
          activeSection={activeSection} 
          setActiveSection={setActiveSection} 
          isModalOpen={isModalOpen} 
        />
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
