import React, { useState, useEffect } from 'react';
import { CubeIcon, ChevronUpIcon, ChevronDownIcon, PencilIcon, TrashIcon, StarIcon, DocumentDuplicateIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ShoppingCart, Star, AlertTriangle, XCircle, TagIcon, PackageCheckIcon, PackageIcon } from 'lucide-react';
import Image from 'next/image';
import { Product } from '../types/product';
import { getPopularProducts } from '../lib/db';
import { formatPrice } from '../utils/price';

interface ManageProductsSectionProps {
  products: Product[];
  handleUpdateProduct: (id: string, updatedProduct: Partial<Product>) => void;
  handleDeleteProduct: (id: string) => void;
  handleDuplicateProduct: (product: Product) => void;
  handleCopyToBatch: (product: Product) => void;
  isManageProductsOpen: boolean;
  setIsManageProductsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  viewMode: 'all' | 'popular' | 'limited' | 'soldout';
  setViewMode: (mode: 'all' | 'popular' | 'limited' | 'soldout') => void;
  categories: { id: string; name: string }[];
  storeId: string;
}

const ModernToggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; }> = ({ checked, onChange, label }) => (
  <label className="flex items-center cursor-pointer justify-between w-full">
      <span className="text-sm font-medium text-text-secondary">{label}</span>
      <div className="relative">
          <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
          <div className={`block w-12 h-7 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'}`}></div>
          <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${checked ? 'translate-x-5' : ''}`}></div>
      </div>
  </label>
);

const formatNumberWithCommas = (value: string | number): string => {
  if (!value && value !== 0) return '';
  const stringValue = value.toString();
  const cleanValue = stringValue.replace(/[^\d.]/g, '');
  if (!cleanValue) return '';
  const parts = cleanValue.split('.');
  if (parts.length > 2) {
    parts[1] = parts.slice(1).join('');
    parts.length = 2;
  }
  if (parts[0]) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  return parts.join('.');
};

const parseFormattedNumber = (value: string): number => {
  const cleanValue = value.replace(/,/g, '');
  const parsed = parseFloat(cleanValue);
  return isNaN(parsed) ? 0 : parsed;
};


const ManageProductsSection: React.FC<ManageProductsSectionProps> = ({ 
  products, 
  handleUpdateProduct, 
  handleDeleteProduct,
  handleDuplicateProduct,
  handleCopyToBatch,
  isManageProductsOpen, 
  setIsManageProductsOpen,
  viewMode,
  setViewMode,
  categories,
  storeId,
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatedFields, setUpdatedFields] = useState<Partial<Product> & { isPromo?: boolean, promoPrice?: number }>({});
  const [popularProducts, setPopularProducts] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function fetchPopularProducts() {
      try {
        if(storeId) {
            const popular = await getPopularProducts(storeId, 6);
            setPopularProducts(popular.map(p => p.id));
        }
      } catch (error) {
        console.error('Error fetching popular products:', error);
      }
    }
    fetchPopularProducts();
  }, [storeId]);

  if (!storeId) {
    return <div className="text-red-500">Error: Store ID is missing. Cannot manage products.</div>;
  }

  const filteredProducts = (() => {
    if (viewMode === 'popular') return products.filter(p => popularProducts.includes(p.id));
    if (viewMode === 'limited') return products.filter(p => p.limitedStock);
    if (viewMode === 'soldout') return products.filter(
      p => (typeof p.inStock === 'number' && p.inStock === 0) || p.soldOut === true
    );
    return products;
  })();

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    const isPromo = !!(product.originalPrice && product.originalPrice > product.price);
    setUpdatedFields({
      name: product.name,
      description: product.description,
      price: isPromo ? product.originalPrice : product.price,
      isPromo: isPromo,
      promoPrice: isPromo ? product.price : undefined,
      commission: product.commission ?? 10, // Default to 10 if not set
      category: product.category,
      limitedStock: product.limitedStock,
      soldOut: product.soldOut || false,
    });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setUpdatedFields({});
  };

  const handleSave = async () => {
    if (editingProduct) {
      setIsSaving(true);
      const changes: Partial<Product> = {};
      
      // Logic for price and originalPrice based on promo
      if (updatedFields.isPromo) {
          changes.price = updatedFields.promoPrice!;
          changes.originalPrice = updatedFields.price!;
      } else {
          changes.price = updatedFields.price!;
          changes.originalPrice = updatedFields.price!;
      }

      // Check other fields for changes
      if (updatedFields.name !== editingProduct.name) changes.name = updatedFields.name;
      if (updatedFields.category !== editingProduct.category) changes.category = updatedFields.category;
      if (updatedFields.commission !== (editingProduct.commission ?? 10)) changes.commission = updatedFields.commission;
      if (updatedFields.limitedStock !== editingProduct.limitedStock) changes.limitedStock = updatedFields.limitedStock;
      if (updatedFields.soldOut !== editingProduct.soldOut) changes.soldOut = updatedFields.soldOut;
  
      if (Object.keys(changes).length > 0) {
        await handleUpdateProduct(editingProduct.id, changes);
      }

      setEditingProduct(null);
      setUpdatedFields({});
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = (id: string) => {
    if (deleteConfirm === id) {
      handleDeleteProduct(id);
      setDeleteConfirm(null);
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const colorMap: { [key: string]: string } = {
        'Bespoke': 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300',
        'Ready To Wear': 'bg-pink-100 text-pink-800 dark:bg-pink-500/20 dark:text-pink-300',
    };
    return colorMap[categoryName] || 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300';
  };

  const getStockColor = (product: Product) => {
    if (product.soldOut) return 'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300';
    if (product.limitedStock) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300';
    return 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300';
  };

  return (
    <section className="mb-8">
      <div 
        className="flex justify-between items-center cursor-pointer bg-card-background p-4 rounded-xl shadow-sm hover:bg-card-hover transition-colors border border-border-color" 
        onClick={() => setIsManageProductsOpen(!isManageProductsOpen)}
      >
        <div className="flex items-center gap-3">
          <CubeIcon className="w-6 h-6 text-text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">Manage Products</h2>
        </div>
        <div className="text-text-primary">
          {isManageProductsOpen ? <ChevronUpIcon className="w-6 h-6" /> : <ChevronDownIcon className="w-6 h-6" />}
        </div>
      </div>
      
      {isManageProductsOpen && (
        <div className="mt-4 space-y-4">
          <div className="flex gap-2 p-2 bg-[--button-secondary] rounded-full justify-center">
            {[
              { mode: 'all', icon: ShoppingCart, label: 'All' },
              { mode: 'popular', icon: Star, label: 'Popular' },
              { mode: 'limited', icon: AlertTriangle, label: 'Limited' },
              { mode: 'soldout', icon: XCircle, label: 'Sold' }
            ].map(({mode, icon: Icon, label}) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode as 'all' | 'popular' | 'limited' | 'soldout')}
                className={`flex-1 sm:flex-none px-3 py-2 rounded-full text-sm font-semibold flex items-center justify-center transition-all duration-200
                  ${viewMode === mode ? 'bg-[--card-background] text-[--text-primary] shadow-md' : 'bg-transparent text-[--text-secondary] hover:bg-[--card-hover] gap-2'}`}
              >
                <Icon className="w-4 h-4" />
                {viewMode === mode && <span>{label}</span>}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-[--card-background] border border-[--border-color] rounded-2xl shadow-md shadow-[--shadow-color] transition-all duration-300 flex flex-col"
              >
                {editingProduct?.id === product.id ? (
                  // Edit View
                  <div className="p-4 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Name*</label>
                        <input type="text" value={updatedFields.name} onChange={e => setUpdatedFields({...updatedFields, name: e.target.value})} className="w-full p-2 border rounded-md bg-input-background focus:ring-2 border-input-border focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Price*</label>
                        <input type="text" value={formatNumberWithCommas(updatedFields.price || '')} onChange={e => setUpdatedFields({...updatedFields, price: parseFormattedNumber(e.target.value)})} className="w-full p-2 border rounded-md bg-input-background focus:ring-2 border-input-border focus:ring-blue-500" />
                    </div>
                    <ModernToggle label="Promo?" checked={!!updatedFields.isPromo} onChange={checked => setUpdatedFields({...updatedFields, isPromo: checked})} />
                    {updatedFields.isPromo && (
                         <div className="animate-fadeIn">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Promo Price*</label>
                            <input type="text" value={formatNumberWithCommas(updatedFields.promoPrice || '')} onChange={e => setUpdatedFields({...updatedFields, promoPrice: parseFormattedNumber(e.target.value)})} className="w-full p-2 border rounded-md bg-input-background focus:ring-2 border-input-border focus:ring-blue-500" />
                            {updatedFields.promoPrice && updatedFields.price && updatedFields.promoPrice >= updatedFields.price && (
                                <p className="text-xs text-red-500 mt-1">Promo price should be lower than the original price.</p>
                            )}
                        </div>
                    )}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Commission</label>
                        <div className="relative pt-2">
                            <div className="absolute top-0 left-0 right-0 flex justify-between text-xs text-text-secondary">
                              <span>1%</span>
                              <span>10%</span>
                            </div>
                            <input type="range" min="1" max="10" step="1" value={updatedFields.commission || 10} onChange={e => setUpdatedFields({...updatedFields, commission: parseInt(e.target.value)})} className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer slider-thumb"/>
                            <div className="text-center text-sm font-medium text-text-primary mt-2">
                              {updatedFields.commission || 10}% Commission (₦{formatNumberWithCommas(((updatedFields.isPromo ? updatedFields.promoPrice : updatedFields.price) || 0) * ((updatedFields.commission || 10) / 100))})
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-1">Category*</label>
                        <select value={updatedFields.category} onChange={e => setUpdatedFields({...updatedFields, category: e.target.value})} className="w-full p-2 border border-input-border rounded-md bg-input-background focus:ring-2 focus:ring-blue-500">
                            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    </div>
                     <div className="space-y-3 pt-2">
                        <ModernToggle label="Limited Stock" checked={!!updatedFields.limitedStock} onChange={checked => setUpdatedFields({...updatedFields, limitedStock: checked})} />
                        <ModernToggle label="Sold Out" checked={!!updatedFields.soldOut} onChange={checked => setUpdatedFields({...updatedFields, soldOut: checked})} />
                    </div>
                    <div className="flex justify-end gap-2">
                        <button onClick={handleCancelEdit} className="px-4 py-2 rounded-lg bg-[--button-secondary] text-[--text-primary] font-semibold flex items-center gap-2" disabled={isSaving}><XMarkIcon className="w-5 h-5" /> Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center gap-2 border border-green-700 disabled:opacity-60 disabled:cursor-not-allowed" disabled={isSaving}>
                          {isSaving ? <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path></svg> : <CheckIcon className="w-5 h-5" />}
                          {isSaving ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                  </div>
                ) : (
                  // Normal View
                  <>
                    <div className="p-4 flex gap-4">
                        {product.images[0] && (
                        <div className="w-24 h-24 flex-shrink-0 relative">
                            <Image src={product.images[0]} alt={product.name} fill className="object-cover rounded-lg" sizes="96px"/>
                        </div>
                        )}
                        <div className="flex-1">
                            <h3 className="font-semibold text-text-primary mb-1 line-clamp-2">{product.name}</h3>
                            <p className="text-sm text-text-secondary line-clamp-2">{product.description}</p>
                        </div>
                    </div>

                    <div className="px-4 pb-3 flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${getCategoryColor(product.category)}`}><TagIcon className="w-3 h-3" />{product.category}</span>
                        {product.soldOut ? (
                            <span className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${getStockColor(product)}`}><XCircle className="w-3 h-3" />Sold Out</span>
                        ) : product.limitedStock ? (
                            <span className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${getStockColor(product)}`}><PackageIcon className="w-3 h-3" />Limited Stock</span>
                        ) : (
                            <span className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${getStockColor(product)}`}><PackageCheckIcon className="w-3 h-3" />In Stock</span>
                        )}
                         <span className={`px-2.5 py-1 rounded-full font-medium text-blue-800 bg-blue-100 dark:bg-blue-500/20 dark:text-blue-300`}>{formatPrice(product.price)}</span>
                    </div>

                    <div className="px-4 py-3 border-t border-[--border-color] grid grid-cols-2 md:grid-cols-4 gap-1">
                        <button onClick={() => handleEdit(product)} className="action-button"><PencilIcon className="w-4 h-4" /><span>Edit</span></button>
                        <button onClick={() => handleDuplicateProduct(product)} className="action-button"><DocumentDuplicateIcon className="w-4 h-4" /><span>Copy</span></button>
                        <button onClick={() => handleCopyToBatch(product)} className="action-button"><DocumentDuplicateIcon className="w-4 h-4" /><span>Copy To Batch</span></button>
                        <button onClick={() => handleConfirmDelete(product.id)} className={`action-button ${deleteConfirm === product.id ? 'text-red-500 dark:text-red-400' : 'hover:bg-red-500/10 hover:text-red-500 dark:hover:bg-red-500/20 dark:hover:text-red-400'}`}>
                            <TrashIcon className="w-4 h-4" />
                            <span>{deleteConfirm === product.id ? 'Confirm?' : 'Delete'}</span>
                        </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 px-2 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-900/50 dark:via-indigo-900/50 dark:to-blue-900/50 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-purple-800 dark:text-purple-300 text-base mb-2 flex items-center gap-2">
              <span className="bg-white/60 dark:bg-black/20 p-1.5 rounded-full"><CubeIcon className="w-4 h-4" /></span> Bulk Actions
            </h3>
            <ul className="space-y-1 text-xs sm:text-sm text-purple-700/90 dark:text-purple-300/80 list-disc list-inside">
            <li>Use &quot;Copy&quot; to duplicate a single item.</li>
            <li>Use &quot;Batch&quot; to create multiple variants from one product.</li>
              <li>Edit products to quickly update price and stock levels.</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 dark:from-green-900/50 dark:via-teal-900/50 dark:to-cyan-900/50 rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-green-800 dark:text-green-300 text-base mb-2 flex items-center gap-2">
            <span className="bg-white/60 dark:bg-black/20 p-1.5 rounded-full"><StarIcon className="w-4 h-4" /></span> Pro Tips
            </h3>
            <ul className="space-y-1 text-xs sm:text-sm text-green-700/90 dark:text-green-300/80 list-disc list-inside">
              <li>Use filters to quickly find products.</li>
              <li>Check &quot;Limited&quot; to see what might need restocking soon.</li>
<li>Monitor &quot;Popular&quot; items to understand customer demand.</li>
            </ul>
          </div>
        </div>
      </div>
      <style jsx>{`
        .action-button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            padding: 0.5rem 0.75rem;
            border-radius: 0.5rem;
            font-size: 0.875rem;
            font-weight: 500;
            color: var(--text-secondary);
            background-color: transparent;
            transition: all 0.2s ease-in-out;
        }
        .action-button:hover {
            background-color: var(--button-secondary-hover);
            color: var(--text-primary);
        }
        .slider-thumb::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .slider-thumb::-moz-range-thumb {
          width: 24px;
          height: 24px;
          background: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
};

export default ManageProductsSection;
