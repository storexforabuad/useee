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
    }, 3000); // Hide check mark after 3 seconds
  };

  return (
    <section className="mb-8 bg-card-background p-4 sm:p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center cursor-pointer bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors" onClick={() => setIsAddProductOpen(!isAddProductOpen)}>
        <div className="flex items-center gap-2">
          <PlusIcon className="w-5 h-5 text-text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">Add New Product</h2>
        </div>
        {isAddProductOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
      </div>
      {isAddProductOpen && (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 mt-4">
          <div className="space-y-1 relative">
            <label className="text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              value={newProduct.name}
              onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
              className={`w-full px-4 py-2 border ${invalidFields.includes('name') ? 'border-red-500 animate-pulse' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
            />
            {invalidFields.includes('name') && (
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gray-700">Price</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₦</span>
                <input
                  type="number"
                  value={newProduct.price}
                  onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  className={`w-full pl-8 pr-4 py-2 border ${invalidFields.includes('price') ? 'border-red-500 animate-pulse' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />
              </div>
              {invalidFields.includes('price') && (
                <ExclamationCircleIcon className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
              )}
            </div>

            <div className="space-y-1 relative">
              <label className="text-sm font-medium text-gray-700">Category</label>
              <select
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                className={`w-full px-4 py-2 border ${invalidFields.includes('category') ? 'border-red-500 animate-pulse' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>
              {invalidFields.includes('category') && (
                <ExclamationCircleIcon className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
              )}
            </div>
          </div>

          <div className="space-y-2 relative">
            <label className="text-sm font-medium text-gray-700">Product Image</label>
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 ${invalidFields.includes('image') ? 'border-red-500 animate-pulse' : 'border-dashed border-gray-300'} rounded-lg cursor-pointer hover:border-blue-500 transition-colors`}>
              {imageFile ? (
                <span className="text-blue-600">{imageFile.name}</span>
              ) : (
                <div className="flex flex-col items-center text-gray-500">
                  <PhotoIcon className="w-6 h-6 mb-2" />
                  <span className="text-sm">Click to upload</span>
                </div>
              )}
              <input
                type="file"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
            {invalidFields.includes('image') && (
              <ExclamationCircleIcon className="w-5 h-5 text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
            )}
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={newProduct.limitedStock}
              onChange={(e) => setNewProduct({ ...newProduct, limitedStock: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">Limited Stock</label>
          </div>

          <button 
            onClick={handleAddProductWithFeedback}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            disabled={loading || added}
          >
            {loading ? <ClipLoader size={24} color="#ffffff" /> : added ? <FaCheckCircle size={24} color="#ffffff" /> : <PlusIcon className="w-5 h-5" />}
            {loading ? 'Adding...' : added ? 'Product Added' : 'Add Product'}
          </button>
        </div>
      )}
    </section>
  );
};

export default AddProductSection;