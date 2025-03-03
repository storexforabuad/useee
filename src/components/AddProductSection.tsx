import React, { useState } from 'react';
import { PlusIcon, PhotoIcon, ChevronUpIcon, ChevronDownIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { Product } from '../types/product';
import { ClipLoader } from 'react-spinners';
import { FaCheckCircle } from 'react-icons/fa';

interface AddProductSectionProps {
  newProduct: Partial<Product>;
  setNewProduct: React.Dispatch<React.SetStateAction<Partial<Product>>>;
  imageFile: File | null;
  setImageFile: React.Dispatch<React.SetStateAction<File | null>>;
  handleAddProduct: () => void;
  isAddProductOpen: boolean;
  setIsAddProductOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: { id: string; name: string }[];
}

const AddProductSection: React.FC<AddProductSectionProps> = ({
  newProduct,
  setNewProduct,
  imageFile,
  setImageFile,
  handleAddProduct,
  isAddProductOpen,
  setIsAddProductOpen,
  categories,
}) => {
  const [loading, setLoading] = useState(false);
  const [added, setAdded] = useState(false);
  const [invalidFields, setInvalidFields] = useState<string[]>([]);

  const validateForm = () => {
    const newInvalidFields: string[] = [];
    if (!newProduct.name) newInvalidFields.push('name');
    if (!newProduct.price) newInvalidFields.push('price');
    if (!newProduct.category) newInvalidFields.push('category');
    if (!imageFile) newInvalidFields.push('image');
    setInvalidFields(newInvalidFields);
    return newInvalidFields.length === 0;
  };

  const handleAddProductWithFeedback = async () => {
    if (!validateForm()) return;

    setLoading(true);
    await handleAddProduct();
    setLoading(false);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 3000);
  };

  return (
    <section className="mb-8 bg-card-background p-4 sm:p-6 rounded-xl shadow-sm transition-all">
      <div 
        className="flex justify-between items-center cursor-pointer bg-card-hover p-4 rounded-lg hover:bg-opacity-80 transition-colors" 
        onClick={() => setIsAddProductOpen(!isAddProductOpen)}
      >
        <div className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5 text-text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">Add New Product</h2>
        </div>
        <div className="text-text-primary">
          {isAddProductOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
        </div>
      </div>

      {isAddProductOpen && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-4">
          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-text-primary">Product Name</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className={`w-full px-4 py-2 border bg-input-background text-text-primary
                ${invalidFields.includes('name') ? 'border-red-500 animate-pulse' : 'border-input-border'} 
                rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              placeholder="Enter product name"
            />
            {invalidFields.includes('name') && (
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 absolute right-3 top-9 transform -translate-y-1/2" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-text-primary">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">₦</span>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className={`w-full pl-8 pr-4 py-2 border bg-input-background text-text-primary
                    ${invalidFields.includes('price') ? 'border-red-500 animate-pulse' : 'border-input-border'} 
                    rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-text-primary">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className={`w-full px-4 py-2 border bg-input-background text-text-primary
                  ${invalidFields.includes('category') ? 'border-red-500 animate-pulse' : 'border-input-border'} 
                  rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="" className="bg-card-background">Select Category</option>
                {categories.map((category) => (
                  <option 
                    key={category.id} 
                    value={category.name} 
                    className="bg-card-background text-text-primary"
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-text-primary">Product Image</label>
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 
              ${invalidFields.includes('image') ? 'border-red-500 animate-pulse' : 'border-dashed border-input-border'} 
              rounded-lg cursor-pointer hover:border-blue-500 transition-colors bg-input-background`}
            >
              {imageFile ? (
                <span className="text-blue-500">{imageFile.name}</span>
              ) : (
                <div className="flex flex-col items-center text-text-secondary">
                  <PhotoIcon className="w-6 h-6 mb-2" />
                  <span className="text-sm">Click to upload</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newProduct.limitedStock}
              onChange={(e) => setNewProduct({ ...newProduct, limitedStock: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-input-border rounded focus:ring-blue-500 bg-input-background"
            />
            <label className="text-sm text-text-primary">Limited Stock</label>
          </div>

          <button 
            onClick={handleAddProductWithFeedback}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || added}
          >
            {loading ? (
              <ClipLoader size={24} color="#ffffff" />
            ) : added ? (
              <FaCheckCircle size={24} color="#ffffff" />
            ) : (
              <PlusIcon className="w-5 h-5" />
            )}
            {loading ? 'Adding...' : added ? 'Product Added' : 'Add Product'}
          </button>
        </div>
      )}
    </section>
  );
};

export default AddProductSection;