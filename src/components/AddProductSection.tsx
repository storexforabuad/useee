import React, { useState, useEffect, useRef} from 'react';
import { PlusIcon, ChevronUpIcon, ChevronDownIcon, XMarkIcon, ArrowUpOnSquareIcon, ArrowPathIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Product } from '../types/product';
import { addProduct } from '../lib/db';
import { uploadImageToCloudinary } from '../lib/cloudinaryClient';
import { compressImage } from '../utils/imageCompression';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

type UploadStatus = 'idle' | 'compressing' | 'uploading' | 'success' | 'error';

interface UploadProgress {
  fileName: string;
  status: UploadStatus;
  statusText: string;
  error?: string;
}

interface BatchProduct extends Partial<Product> {
  file: File;
  useAsTemplate?: boolean;
  isPromo?: boolean;
  promoPrice?: number;
  commission?: number;
}

interface AddProductSectionProps {
  batchTemplate: Partial<Product> | null;
  isAddProductOpen: boolean;
  setIsAddProductOpen: React.Dispatch<React.SetStateAction<boolean>>;
  categories: { id: string; name: string }[];
  onProductAdded: () => void;
  storeId?: string;
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

const AddProductSection: React.FC<AddProductSectionProps> = ({
  batchTemplate,
  isAddProductOpen,
  setIsAddProductOpen,
  categories,
  onProductAdded,
  storeId,
}) => {
  const [batchProducts, setBatchProducts] = useState<BatchProduct[]>([]);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeBatchIndex, setActiveBatchIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [templateProductDetails, setTemplateProductDetails] = useState<Partial<BatchProduct> | null>(null);
  const [showUploadSummary, setShowUploadSummary] = useState(false);

  
  const resetForm = () => {
    setBatchProducts([]);
    setUploadProgress([]);
    setIsUploading(false);
    setLoading(false);
    setActiveBatchIndex(0);
    setTemplateProductDetails(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  useEffect(() => {
    if (window.innerWidth < 640 && itemRefs.current[activeBatchIndex]) {
      itemRefs.current[activeBatchIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [activeBatchIndex]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newBatchProducts: BatchProduct[] = newFiles.map((file, index) => {
        const baseName = batchTemplate?.name || file.name.replace(/\.[^/.]+$/, "");
        
        const shouldUseTemplate = templateProductDetails && batchProducts.length + index > 0;
        
        return {
          file,
          name: shouldUseTemplate ? templateProductDetails.name : baseName,
          price: shouldUseTemplate ? templateProductDetails.price : (batchTemplate?.price || undefined),
          isPromo: shouldUseTemplate ? templateProductDetails.isPromo : false,
          promoPrice: shouldUseTemplate ? templateProductDetails.promoPrice : undefined,
          commission: shouldUseTemplate ? templateProductDetails.commission : 10,
          category: shouldUseTemplate ? templateProductDetails.category : (batchTemplate?.category || ''),
          description: shouldUseTemplate ? templateProductDetails.description : (batchTemplate?.description || ''),
          limitedStock: shouldUseTemplate ? templateProductDetails.limitedStock : (batchTemplate?.limitedStock || false),
          soldOut: shouldUseTemplate ? templateProductDetails.soldOut : (batchTemplate?.soldOut || false),
          useAsTemplate: false,
        };
      });
      setBatchProducts(prev => [...prev, ...newBatchProducts]);
    }
  };

  const removeFile = (index: number) => {
    setBatchProducts(prev => prev.filter((_, i) => i !== index));
    if(activeBatchIndex >= batchProducts.length - 1) {
        setActiveBatchIndex(Math.max(0, batchProducts.length - 2));
    }
  };
  
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

  const handleBatchProductChange = (index: number, field: string, value: string | number | boolean) => {
    setBatchProducts(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
    
    if (field === 'useAsTemplate' && value === true) {
      const currentProduct = batchProducts[index];
      const newTemplateDetails: Partial<BatchProduct> = {
        name: currentProduct.name,
        price: currentProduct.price,
        isPromo: currentProduct.isPromo,
        promoPrice: currentProduct.promoPrice,
        commission: currentProduct.commission,
        category: currentProduct.category,
        description: currentProduct.description,
        limitedStock: currentProduct.limitedStock,
        soldOut: currentProduct.soldOut,
      };
      setTemplateProductDetails(newTemplateDetails);
      
      setBatchProducts(prev => prev.map((p, i) => {
        if (i > index) {
          return {
            ...p,
            name: newTemplateDetails.name,
            price: newTemplateDetails.price,
            isPromo: newTemplateDetails.isPromo,
            promoPrice: newTemplateDetails.promoPrice,
            commission: newTemplateDetails.commission,
            category: newTemplateDetails.category,
            description: newTemplateDetails.description,
            limitedStock: newTemplateDetails.limitedStock,
            soldOut: newTemplateDetails.soldOut,
          };
        }
        return p;
      }));
      
      setBatchProducts(prev => prev.map((p, i) => i !== index ? { ...p, useAsTemplate: false } : p));
    }
    
    if (field === 'useAsTemplate' && value === false) {
      setTemplateProductDetails(null);
    }
    
    if (batchProducts[index]?.useAsTemplate && field !== 'useAsTemplate') {
      const updatedTemplate = { ...templateProductDetails, [field]: value };
      setTemplateProductDetails(updatedTemplate);
      
      setBatchProducts(prev => prev.map((p, i) => {
        if (i > index) {
          return { ...p, [field]: value };
        }
        return p;
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (batchProducts.length === 0) {
      toast.error("Please select at least one image.");
      return;
    }

    for (let i = 0; i < batchProducts.length; i++) {
      const p = batchProducts[i];
      if (!p.name || !p.price || !p.category) {
        toast.error(`Please fill all required fields for "${p.file.name}".`);
        setActiveBatchIndex(i);
        return;
      }
      if (p.isPromo && (!p.promoPrice || p.promoPrice <= 0)) {
        toast.error(`Please enter a valid promo price for "${p.file.name}".`);
        setActiveBatchIndex(i);
        return;
      }
      if (p.isPromo && p.promoPrice && p.price && p.promoPrice >= p.price) {
        toast.error(`Promo price must be less than the original price for "${p.file.name}".`);
        setActiveBatchIndex(i);
        return;
      }
    }

    setLoading(true);
    setIsUploading(true);
    setUploadProgress(batchProducts.map(p => ({ fileName: p.file.name, status: 'idle', statusText: 'Waiting...' })));

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < batchProducts.length; i++) {
        const productData = batchProducts[i];
        
        try {
            setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'compressing', statusText: 'Compressing...' } : p));
            const compressedFile = await compressImage(productData.file);

            setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'uploading', statusText: 'Uploading...' } : p));
            if (!storeId) throw new Error('Missing storeId for image upload');
            const imageUrl = await uploadImageToCloudinary(compressedFile, storeId);

            const productToAdd: Omit<Product, 'id' | 'createdAt'> = {
                name: productData.name!,
                price: productData.isPromo ? Number(productData.promoPrice!) : Number(productData.price!),
                originalPrice: productData.isPromo ? Number(productData.price!) : undefined,
                category: productData.category!,
                images: [imageUrl],
                description: productData.description || '',
                soldOut: productData.soldOut || false,
                limitedStock: productData.limitedStock || false,
                inStock: !(productData.soldOut || false),
                features: [],
                views: 0,
                quantity: 1,
                commission: productData.commission || 10,
            };
            
            if (storeId) {
              await addProduct(storeId, productToAdd as Product);
            } else {
              toast.error('Missing storeId. Cannot add product.');
              setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error', statusText: 'No storeId', error: 'Missing storeId' } : p));
              errorCount++;
              continue;
            }
            setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'success', statusText: 'Success' } : p));
            successCount++;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, status: 'error', statusText: 'Failed', error: errorMessage } : p));
            errorCount++;
        }
    }
    
    if (errorCount === 0) {
        toast.success(`${successCount} product(s) added successfully!`);
    } else if (successCount > 0) {
        toast.error(`${successCount} succeeded, but ${errorCount} failed. Please check progress.`);
    } else {
        toast.error(`All ${errorCount} uploads failed. Please check progress and try again.`);
    }

    onProductAdded();
    setLoading(false);
    setIsUploading(false);
    setShowUploadSummary(true);
  };
  
  const renderProgressIcon = (status: UploadStatus) => {
    switch (status) {
      case 'compressing':
      case 'uploading':
        return <ArrowPathIcon className="w-5 h-5 text-gray-500 animate-spin" />;
      case 'success':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (!storeId) {
    return <div className="text-red-500">Error: Store ID is missing. Cannot upload products.</div>;
  }

  if (isUploading) {
    return (
        <div className="bg-card-background p-6 rounded-xl shadow-lg border border-border-color">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Upload Summary</h3>
            <div className="space-y-3">
                {uploadProgress.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-input-background rounded-lg border border-border-color">
                        <span className="text-sm font-medium text-text-primary truncate w-1/2">{item.fileName}</span>
                        <div className="flex items-center gap-3 w-1/2 justify-end">
                            <span className={`text-xs font-semibold ${item.status === 'error' ? 'text-red-500' : 'text-text-secondary'}`}>{item.statusText}</span>
                            {renderProgressIcon(item.status)}
                        </div>
                    </div>
                ))}
            </div>
            {!loading && (
                <button onClick={resetForm} className="mt-6 w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-sm">
                    Add More Products
                </button>
            )}
        </div>
    );
  }

  if (showUploadSummary) {
    return (
      <div className="flex flex-col items-center justify-center px-2 py-4 w-full max-w-xs mx-auto rounded-lg bg-green-50 dark:bg-green-900/40 shadow-md mt-4">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span className="text-sm font-medium text-green-700 dark:text-green-300">Product uploaded successfully!</span>
        </div>
        <button
          className="w-full mt-2 py-2 px-4 rounded-lg bg-green-600 text-white text-base font-semibold shadow hover:bg-green-700 active:bg-green-800 transition-all"
          onClick={() => { resetForm(); setShowUploadSummary(false); }}
          style={{ minHeight: 44 }}
        >
          Add More Products
        </button>
      </div>
    );
  }

  const vendorCategories = categories.filter(c => c.name !== 'Promo' && c.name !== '' && c.name !== 'New Arrivals' && c.name !== 'Back in Stock');

  return (
    <section className="mb-8">
      <div 
        className="flex justify-between items-center cursor-pointer bg-card-background p-4 rounded-xl shadow-sm hover:bg-card-hover transition-colors border border-border-color" 
        onClick={() => setIsAddProductOpen(!isAddProductOpen)}
      >
        <div className="flex items-center gap-3">
          <PlusIcon className="w-6 h-6 text-text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">Add Product(s)</h2>
        </div>
        {isAddProductOpen ? <ChevronUpIcon className="w-6 h-6 text-text-secondary" /> : <ChevronDownIcon className="w-6 h-6 text-text-secondary" />}
      </div>

      {isAddProductOpen && (
        <form onSubmit={handleSubmit} className="mt-4 p-4 sm:p-6 bg-card-background rounded-xl border border-border-color shadow-inner space-y-8 animate-fadeIn">
          {batchTemplate && (
            <div className="p-3 mb-4 bg-blue-500/10 text-blue-400 border-l-4 border-blue-500 rounded-r-lg text-sm">
              Using &quot;<strong>{batchTemplate.name}</strong>&quot; as a template.
            </div>
          )}

          <div className="p-4 border border-dashed border-input-border rounded-lg bg-input-background/50">
            <input type="file" accept="image/*" multiple onChange={handleFileChange} ref={fileInputRef} className="hidden" />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center py-6 text-text-secondary hover:text-blue-500 transition">
                <ArrowUpOnSquareIcon className="w-8 h-8 mb-2"/>
                <span className="font-semibold">Tap to upload picture</span>
                <span className="text-xs">You can select up to 10 products</span>
            </button>
          </div>
          
          {batchProducts.length > 0 && (
            <div>
              <div className="sm:hidden flex items-center justify-between mb-4">
                <button type="button" onClick={() => setActiveBatchIndex(p => p - 1)} disabled={activeBatchIndex === 0} className="px-4 py-2 text-sm font-medium rounded-lg bg-button-secondary disabled:opacity-50">Prev</button>
                <span className="text-sm font-semibold">{activeBatchIndex + 1} / {batchProducts.length}</span>
                <button type="button" onClick={() => setActiveBatchIndex(p => p + 1)} disabled={activeBatchIndex === batchProducts.length - 1} className="px-4 py-2 text-sm font-medium rounded-lg bg-button-secondary disabled:opacity-50">Next</button>
              </div>

              {templateProductDetails && (
                <div className="mb-6 p-4 bg-green-500/10 text-green-400 border-l-4 border-green-500 rounded-r-lg text-sm">
                  <strong>Batch Upload Active:</strong> Product details from the first product are being applied to all subsequent products automatically.
                </div>
              )}

              <div className="space-y-6 sm:space-y-0 sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {batchProducts.map((product, index) => {
                  const displayPrice = product.isPromo ? product.promoPrice : product.price;
                  const commissionAmount = (displayPrice || 0) * ((product.commission || 10) / 100);

                  return (
                  <div ref={el => { itemRefs.current[index] = el; }} key={index} className={`p-4 border rounded-lg ${activeBatchIndex === index ? 'border-blue-500 shadow-lg' : 'border-border-color'} ${activeBatchIndex !== index ? 'hidden sm:block' : ''}`}>
                    <div className="space-y-4">
                        <div className="relative w-full h-48">
                            <Image src={URL.createObjectURL(product.file)} alt={product.file.name} layout="fill" className="object-cover rounded-lg shadow-sm" />
                            <button type="button" onClick={() => removeFile(index)} className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white">
                                <XMarkIcon className="w-4 h-4"/>
                            </button>
                        </div>
                        <div className="space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Name*</label>
                                <input type="text" value={product.name || ''} onChange={e => handleBatchProductChange(index, 'name', e.target.value)} className="w-full p-2 border rounded-md bg-input-background focus:ring-2 border-input-border focus:ring-blue-500" />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Price*</label>
                                <input 
                                  type="text" 
                                  value={formatNumberWithCommas(product.price || '')} 
                                  onChange={e => {
                                    const numericValue = parseFormattedNumber(e.target.value);
                                    handleBatchProductChange(index, 'price', numericValue);
                                  }} 
                                  placeholder="0.00"
                                  className="w-full p-2 border border-input-border rounded-md bg-input-background focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-3 pt-2">
                               <ModernToggle
                                  label="Promo?"
                                  checked={!!product.isPromo}
                                  onChange={(checked) => handleBatchProductChange(index, 'isPromo', checked)}
                                />
                            </div>
                           {product.isPromo && (
                              <div className="animate-fadeIn">
                                  <label className="block text-sm font-medium text-text-secondary mb-1">Promo Price*</label>
                                  <input 
                                    type="text" 
                                    value={formatNumberWithCommas(product.promoPrice || '')} 
                                    onChange={e => {
                                      const numericValue = parseFormattedNumber(e.target.value);
                                      handleBatchProductChange(index, 'promoPrice', numericValue);
                                    }} 
                                    placeholder="0.00"
                                    className="w-full p-2 border border-input-border rounded-md bg-input-background focus:ring-2 focus:ring-blue-500"
                                  />
                                  {product.promoPrice && product.price && product.promoPrice >= product.price && (
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
                                    <input 
                                      type="range" 
                                      min="1" 
                                      max="10" 
                                      step="1"
                                      value={product.commission || 10}
                                      onChange={e => handleBatchProductChange(index, 'commission', parseInt(e.target.value))}
                                      className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer slider-thumb"
                                    />
                                    <div className="text-center text-sm font-medium text-text-primary mt-2">
                                      {product.commission || 10}% Commission (₦{formatNumberWithCommas(commissionAmount.toFixed(2))})
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-secondary mb-1">Category*</label>
                                <select value={product.category || ''} onChange={e => handleBatchProductChange(index, 'category', e.target.value)} className="w-full p-2 border border-input-border rounded-md bg-input-background focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Category</option>
                                    {vendorCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                </select>
                            </div>
                             <div className="space-y-3 pt-2">
                                <ModernToggle
                                    label="Batch Upload"
                                    checked={!!product.useAsTemplate}
                                    onChange={(checked) => handleBatchProductChange(index, 'useAsTemplate', checked)}
                                />
                                <ModernToggle
                                    label="Limited Stock"
                                    checked={!!product.limitedStock}
                                    onChange={(checked) => handleBatchProductChange(index, 'limitedStock', checked)}
                                />
                                <ModernToggle
                                    label="Sold Out"
                                    checked={!!product.soldOut}
                                    onChange={(checked) => handleBatchProductChange(index, 'soldOut', checked)}
                                />
                            </div>
                        </div>
                    </div>
                  </div>
                  )})}
              </div>
            </div>
          )}

          {batchProducts.length > 0 && (
            <div className="flex justify-end gap-4 border-t border-border-color pt-6">
              <button type="button" onClick={resetForm} className="px-6 py-2 rounded-lg bg-button-secondary text-text-primary font-semibold hover:bg-button-secondary-hover transition">Cancel</button>
              <button type="submit" className="px-6 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50" disabled={loading}>
                {loading ? <><ArrowPathIcon className="w-5 h-5 animate-spin" /> Uploading...</> : `Upload ${batchProducts.length} Product(s)`}
              </button>
            </div>
          )}
        </form>
      )}

      <div className="mt-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-transparent p-4 rounded-xl border border-border-color">
            <h3 className="font-semibold text-orange-400 text-base mb-2 flex items-center gap-2"><span>📸</span> Quick Upload Tips</h3>
            <ul className="space-y-1 text-xs sm:text-sm text-text-secondary list-disc list-inside">
              <li>Use clear, descriptive product names.</li>
              <li>Upload bright, high-quality images.</li>
              <li>Set a fair, competitive price.</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent p-4 rounded-xl border border-border-color">
            <h3 className="font-semibold text-cyan-400 text-base mb-2 flex items-center gap-2"><span>💡</span> Pro Tips</h3>
            <ul className="space-y-1 text-xs sm:text-sm text-text-secondary list-disc list-inside">
              <li>Use &quot;Limited Stock&quot; to create urgency.</li>
              <li>Enable &quot;Batch Upload&quot; on the first product to auto-fill others.</li>
              <li>Update info anytime from the &quot;Product&quot; section.</li>
            </ul>
          </div>
        </div>
      </div>
      <style jsx>{`
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

export default AddProductSection;