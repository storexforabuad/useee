import React, { useState } from 'react';
import { CubeIcon, ChevronUpIcon, ChevronDownIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { Product } from '../types/product';

interface ManageProductsSectionProps {
  products: Product[];
  handleUpdateProduct: (id: string, updatedProduct: Partial<Product>) => void;
  handleDeleteProduct: (id: string) => void;
  isManageProductsOpen: boolean;
  setIsManageProductsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const ManageProductsSection: React.FC<ManageProductsSectionProps> = ({ 
  products, 
  handleUpdateProduct, 
  handleDeleteProduct, 
  isManageProductsOpen, 
  setIsManageProductsOpen 
}) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [updatedFields, setUpdatedFields] = useState<Partial<Product>>({});

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setUpdatedFields({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      limitedStock: product.limitedStock,
      inStock: product.inStock
    });
  };

  const handleSave = async () => {
    if (editingProduct && Object.keys(updatedFields).length > 0) {
      await handleUpdateProduct(editingProduct.id, updatedFields);
      setEditingProduct(null);
      setUpdatedFields({});
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

  return (
    <section className="mb-8 bg-card-background p-4 sm:p-6 rounded-xl shadow-[var(--shadow-sm)] transition-all">
      <div 
        className="flex justify-between items-center cursor-pointer bg-card-hover p-4 rounded-lg hover:bg-opacity-80 transition-colors" 
        onClick={() => setIsManageProductsOpen(!isManageProductsOpen)}
      >
        <div className="flex items-center gap-2">
          <CubeIcon className="w-5 h-5 text-text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">Manage Products</h2>
        </div>
        <div className="text-text-primary">
          {isManageProductsOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        </div>
      </div>
      
      {isManageProductsOpen && (
        <div className="space-y-4 mt-4">
          {products.map((product) => (
            <div key={product.id} className="bg-card-background border border-border-color p-4 sm:p-6 rounded-lg shadow-[var(--shadow-sm)] flex flex-col sm:flex-row gap-4">
              {product.images[0] && (
                <div className="w-32 h-32 flex-shrink-0 relative bg-input-background rounded-lg">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain rounded-lg"
                    sizes="(max-width: 128px) 100vw, 128px"
                  />
                </div>
              )}
              
              <div className="flex-1 space-y-2">
                {editingProduct?.id === product.id ? (
                  // Edit Mode
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={updatedFields.name}
                      onChange={(e) => setUpdatedFields({ ...updatedFields, name: e.target.value })}
                      className="w-full px-3 py-2 border border-input-border bg-input-background text-text-primary rounded-md focus:ring-2 focus:ring-[var(--border-focus)]"
                    />
                    <textarea
                      value={updatedFields.description}
                      onChange={(e) => setUpdatedFields({ ...updatedFields, description: e.target.value })}
                      className="w-full px-3 py-2 border border-input-border bg-input-background text-text-primary rounded-md focus:ring-2 focus:ring-[var(--border-focus)]"
                      rows={2}
                    />
                    <div className="flex gap-4">
                      <input
                        type="number"
                        value={updatedFields.price}
                        onChange={(e) => setUpdatedFields({ ...updatedFields, price: Number(e.target.value) })}
                        className="w-32 px-3 py-2 border border-input-border bg-input-background text-text-primary rounded-md focus:ring-2 focus:ring-[var(--border-focus)]"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={updatedFields.limitedStock}
                          onChange={(e) => setUpdatedFields({ ...updatedFields, limitedStock: e.target.checked })}
                          className="w-4 h-4 text-[var(--button-primary)] bg-input-background border-input-border rounded focus:ring-[var(--border-focus)]"
                        />
                        <label className="text-text-primary">Limited Stock</label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-[var(--button-success)] text-white rounded-md hover:bg-[var(--button-success-hover)] transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 bg-[var(--button-secondary)] text-text-primary rounded-md hover:bg-[var(--button-secondary-hover)] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <h3 className="text-lg font-medium text-text-primary">{product.name}</h3>
                    <p className="text-sm text-text-secondary">{product.description}</p>
                    <div className="flex flex-wrap gap-4">
                      <span className="px-2 py-1 bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)] text-sm rounded">
                        ₦{product.price}
                      </span>
                      <span className="px-2 py-1 bg-card-hover text-text-primary text-sm rounded">
                        {product.category}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleEdit(product)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--button-primary)] hover:bg-[var(--button-primary-hover)] rounded-lg transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span className="sm:hidden">Edit</span>
                </button>
                <button
                  onClick={() => handleConfirmDelete(product.id)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
                    ${deleteConfirm === product.id ? 'bg-[var(--button-danger-hover)]' : 'bg-[var(--button-danger)] hover:bg-[var(--button-danger-hover)]'}`}
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>{deleteConfirm === product.id ? 'Confirm Delete?' : 'Delete'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ManageProductsSection;