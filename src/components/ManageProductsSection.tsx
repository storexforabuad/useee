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
      // Auto-reset delete confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  return (
    <section className="mb-8 bg-card-background p-4 sm:p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center cursor-pointer bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors" 
           onClick={() => setIsManageProductsOpen(!isManageProductsOpen)}>
        <div className="flex items-center gap-2">
          <CubeIcon className="w-5 h-5 text-text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">Manage Products</h2>
        </div>
        {isManageProductsOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
      </div>
      {isManageProductsOpen && (
        <div className="space-y-4 mt-4">
          {products.map((product) => (
            <div key={product.id} className="bg-card-background p-4 sm:p-6 rounded-lg shadow-sm flex flex-col sm:flex-row gap-4">
              {product.images[0] && (
                <div className="w-32 h-32 flex-shrink-0 relative">
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    />
                    <textarea
                      value={updatedFields.description}
                      onChange={(e) => setUpdatedFields({ ...updatedFields, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={2}
                    />
                    <div className="flex gap-4">
                      <input
                        type="number"
                        value={updatedFields.price}
                        onChange={(e) => setUpdatedFields({ ...updatedFields, price: Number(e.target.value) })}
                        className="w-32 px-3 py-2 border border-gray-300 rounded-md"
                      />
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={updatedFields.limitedStock}
                          onChange={(e) => setUpdatedFields({ ...updatedFields, limitedStock: e.target.checked })}
                          className="w-4 h-4 text-blue-600"
                        />
                        <label>Limited Stock</label>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingProduct(null)}
                        className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
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
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">₦{product.price}</span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">{product.category}</span>
                    </div>
                  </>
                )}
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleEdit(product)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span className="sm:hidden">Edit</span>
                </button>
                <button
                  onClick={() => handleConfirmDelete(product.id)}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors
                    ${deleteConfirm === product.id ? 'bg-red-700 hover:bg-red-800' : 'bg-red-600 hover:bg-red-700'}`}
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