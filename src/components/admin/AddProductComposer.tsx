'use client';
import React, { useState, useEffect, useRef, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PhotoIcon, ChevronLeftIcon, ChevronRightIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon, CheckIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { Product } from '../../types/product';
import { addProduct } from '../../lib/db';
import { uploadImageToCloudinary } from '../../lib/cloudinaryClient';
import { compressImage } from '../../utils/imageCompression';
import { formatPrice } from '../../utils/price';


// --- TYPES ---
type UploadStatus = 'idle' | 'compressing' | 'uploading' | 'success' | 'error';
interface UploadProgress {
  id: string;
  fileName: string;
  status: UploadStatus;
  statusText: string;
  error?: string;
  imageUrl?: string;
}
interface BatchProduct {
  id: string;
  file: File;
  name: string;
  price: number;
  isPromo: boolean;
  promoPrice?: number;
  commission: number;
  category: string;
  limitedStock: boolean;
  soldOut: boolean;
  useAsTemplate: boolean;
}
interface AddProductComposerProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  categories: { id: string; name: string }[];
  onProductAdded: () => void;
}

// --- HELPER COMPONENTS ---

const ModernToggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string; }> = ({ checked, onChange, label }) => (
    <label className="flex items-center cursor-pointer justify-between w-full py-2">
        <span className="text-base font-medium text-text-primary">{label}</span>
        <div className="relative">
            <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-input-background'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
    </label>
);

const FloatingLabelInput = ({ label, value, onChange, type = 'text', placeholder = ' ' }: any) => (
  <div className="relative">
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="block w-full px-4 py-3 text-base text-text-primary bg-input-background rounded-lg border-2 border-input-border appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
    />
    <label className="absolute text-base text-text-secondary duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-input-background px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-3">
      {label}
    </label>
  </div>
);

const CategorySelector = ({ isOpen, onClose, categories, onSelect }: any) => (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>
        <div className="fixed inset-x-0 bottom-0 z-10">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="translate-y-full" enterTo="translate-y-0" leave="ease-in duration-200" leaveFrom="translate-y-0" leaveTo="translate-y-full">
              <Dialog.Panel className="bg-card-background rounded-t-2xl shadow-xl">
                  <div className="p-4 border-b border-border-color">
                      <Dialog.Title className="text-lg font-semibold text-center text-text-primary">Select a Category</Dialog.Title>
                  </div>
                  <div className="p-4 max-h-60 overflow-y-auto">
                      {categories.map((cat: any) => (
                          <button key={cat.id} onClick={() => { onSelect(cat.name); onClose(); }} className="w-full text-left p-4 text-lg font-medium text-text-primary rounded-lg hover:bg-button-secondary-hover transition-colors">
                              {cat.name}
                          </button>
                      ))}
                  </div>
              </Dialog.Panel>
            </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
);


// --- MAIN COMPOSER COMPONENT ---

const AddProductComposer: React.FC<AddProductComposerProps> = ({ isOpen, onClose, storeId, categories, onProductAdded }) => {
  const [currentStep, setCurrentStep] = useState(0); // 0: Upload, 1: Details, 2: Pricing, 3: Inventory, 4: Uploading, 5: Summary
  const [batchProducts, setBatchProducts] = useState<BatchProduct[]>([]);
  const [activeProductIndex, setActiveProductIndex] = useState(0);
  const [isCategorySelectorOpen, setCategorySelectorOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [template, setTemplate] = useState<Partial<BatchProduct> | null>(null);

  const resetState = () => {
    setCurrentStep(0);
    setBatchProducts([]);
    setActiveProductIndex(0);
    setUploadProgress([]);
    setIsUploading(false);
    setTemplate(null);
  };
  
  const handleClose = () => {
    onClose();
    // Delay reset to allow for exit animation
    setTimeout(resetState, 300);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map((file, index) => {
        const name = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
        const baseProduct: BatchProduct = {
          id: `${Date.now()}-${index}`,
          file,
          name: template?.name || name,
          price: template?.price || 0,
          isPromo: template?.isPromo || false,
          promoPrice: template?.promoPrice,
          commission: template?.commission || 10,
          category: template?.category || '',
          limitedStock: template?.limitedStock || false,
          soldOut: template?.soldOut || false,
          useAsTemplate: false,
        };
        return baseProduct;
      });

      if (newFiles.length > 0) {
        setBatchProducts(newFiles);
        setCurrentStep(1);
      }
    }
  };
  
  const handleProductChange = (index: number, field: string, value: any) => {
    let newBatchProducts = batchProducts.map((p, i) => i === index ? { ...p, [field]: value } : p);

    const changedProduct = newBatchProducts[index];

    if (field === 'useAsTemplate') {
        if (value === true) {
            // Set this product as the new template
            setTemplate({ ...changedProduct });
            // Unset all others
            newBatchProducts = newBatchProducts.map((p, i) => i === index ? p : { ...p, useAsTemplate: false });
        } else {
            // If the current template is being disabled, clear it
            if(template?.id === changedProduct.id) {
                setTemplate(null);
            }
        }
    } else if (template && template.id === changedProduct.id) {
        // If the template itself is being edited, update the template state
        const newTemplate = { ...template, [field]: value };
        setTemplate(newTemplate);
        // And apply changes to all other products
        newBatchProducts = newBatchProducts.map((p, i) => {
            if (i !== index) {
                return { ...p, [field]: value };
            }
            return p;
        });
    }

    setBatchProducts(newBatchProducts);
  };

  const handleSubmit = async () => {
      // Validation
      for (let i = 0; i < batchProducts.length; i++) {
        const p = batchProducts[i];
        if (!p.name || !p.price || !p.category) {
          toast.error(`Please fill all required fields for "${p.name}".`);
          setActiveProductIndex(i);
          setCurrentStep(1); // Go back to details
          return;
        }
      }
      setIsUploading(true);
      setCurrentStep(4); // Move to uploading screen

      const initialProgress: UploadProgress[] = batchProducts.map(p => ({ id: p.id, fileName: p.name, status: 'idle', statusText: 'Waiting...' }));
      setUploadProgress(initialProgress);
      
      let successCount = 0;

      for (const productData of batchProducts) {
          try {
              setUploadProgress(prev => prev.map(p => p.id === productData.id ? { ...p, status: 'compressing', statusText: 'Compressing...' } : p));
              const compressedFile = await compressImage(productData.file);

              setUploadProgress(prev => prev.map(p => p.id === productData.id ? { ...p, status: 'uploading', statusText: 'Uploading...' } : p));
              const imageUrl = await uploadImageToCloudinary(compressedFile, storeId);

              const productToAdd: Partial<Product> = {
                  name: productData.name,
                  price: productData.isPromo ? productData.promoPrice! : productData.price,
                  category: productData.category,
                  images: [imageUrl],
                  description: '', // Add description field later if needed
                  soldOut: productData.soldOut,
                  limitedStock: productData.limitedStock,
                  inStock: !productData.soldOut,
                  commission: productData.commission,
                  storeId: storeId,
                  views: 0,
                  quantity: 1,
              };

              if (productData.isPromo) {
                productToAdd.originalPrice = productData.price;
              }

              await addProduct(storeId, productToAdd as Product);
              
              setUploadProgress(prev => prev.map(p => p.id === productData.id ? { ...p, status: 'success', statusText: 'Success!', imageUrl } : p));
              successCount++;
          } catch (error) {
              const errorMessage = error instanceof Error ? error.message : String(error);
              setUploadProgress(prev => prev.map(p => p.id === productData.id ? { ...p, status: 'error', statusText: 'Failed', error: errorMessage } : p));
          }
      }
      
      if (successCount > 0) {
        onProductAdded(); // Trigger re-fetch on parent page
      }
      setIsUploading(false);
      setCurrentStep(5); // Move to summary
  };

  const renderStepContent = () => {
    const activeProduct = batchProducts[activeProductIndex];
    const MotionDiv = motion.div;
    
    switch (currentStep) {
      case 0: // Initial Upload Step
        return (
          <MotionDiv key={0} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="p-4 sm:p-6">
             <input type="file" accept="image/*" multiple onChange={handleFileChange} ref={fileInputRef} className="hidden" />
             <div onClick={() => fileInputRef.current?.click()} className="cursor-pointer w-full flex flex-col items-center justify-center py-16 px-6 rounded-2xl bg-input-background/50 border-2 border-dashed border-input-border text-text-secondary hover:bg-input-background transition-colors duration-300">
                <PhotoIcon className="w-16 h-16 mb-4 text-gray-400"/>
                <span className="font-semibold text-xl text-text-primary">Tap to upload pictures</span>
                <span className="text-base text-text-secondary mt-1">Add one or more images to get started</span>
             </div>
          </MotionDiv>
        );

      case 1: // Details Step
      case 2: // Pricing Step
      case 3: // Inventory Step
        if (!activeProduct) return null;
        const commissionAmount = (activeProduct.isPromo ? activeProduct.promoPrice || 0 : activeProduct.price || 0) * (activeProduct.commission / 100);

        return (
          <MotionDiv key={1} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="relative w-full h-64 sm:h-80">
                <AnimatePresence>
                    <motion.div
                        key={activeProduct.id}
                        className="absolute inset-0"
                        initial={{ opacity: 0, x: 100 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -100 }}
                        transition={{ ease: 'easeInOut' }}
                    >
                        <Image src={URL.createObjectURL(activeProduct.file)} alt="Product Preview" layout="fill" className="object-cover rounded-t-lg" />
                    </motion.div>
                </AnimatePresence>
                {batchProducts.length > 1 && (
                    <>
                        <button onClick={() => setActiveProductIndex(p => (p - 1 + batchProducts.length) % batchProducts.length)} className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"><ChevronLeftIcon className="w-6 h-6"/></button>
                        <button onClick={() => setActiveProductIndex(p => (p + 1) % batchProducts.length)} className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"><ChevronRightIcon className="w-6 h-6"/></button>
                    </>
                )}
            </div>
            <div className="p-4 sm:p-6 space-y-6">
                {currentStep === 1 && (
                    <motion.div key="details" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <FloatingLabelInput label="Product Name" value={activeProduct.name} onChange={(e: any) => handleProductChange(activeProductIndex, 'name', e.target.value)} />
                        <button onClick={() => setCategorySelectorOpen(true)} className="w-full text-left p-4 bg-input-background rounded-lg border-2 border-input-border">
                            <span className={activeProduct.category ? 'text-text-primary' : 'text-text-secondary'}>{activeProduct.category || 'Select a category'}</span>
                        </button>
                    </motion.div>
                )}
                {currentStep === 2 && (
                    <motion.div key="pricing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <FloatingLabelInput label="Price" type="number" value={activeProduct.price} onChange={(e: any) => handleProductChange(activeProductIndex, 'price', parseFloat(e.target.value) || 0)} />
                        <ModernToggle label="Add Promo Price" checked={activeProduct.isPromo} onChange={checked => handleProductChange(activeProductIndex, 'isPromo', checked)} />
                        <AnimatePresence>
                            {activeProduct.isPromo && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                    <FloatingLabelInput label="Promo Price" type="number" value={activeProduct.promoPrice || ''} onChange={(e: any) => handleProductChange(activeProductIndex, 'promoPrice', parseFloat(e.target.value) || 0)} />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div>
                           <label className="block text-sm font-medium text-text-secondary mb-2">Commission</label>
                           <input type="range" min="1" max="10" value={activeProduct.commission} onChange={e => handleProductChange(activeProductIndex, 'commission', parseInt(e.target.value))} className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer slider-thumb"/>
                           <div className="flex justify-center items-center text-sm font-medium text-text-primary mt-2">
                               <span>{activeProduct.commission}%</span>
                               <span className="text-text-secondary mx-2">-</span>
                               <span className="font-bold">{formatPrice(commissionAmount)}</span>
                           </div>
                        </div>
                    </motion.div>
                )}
                {currentStep === 3 && (
                    <motion.div key="inventory" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                         <ModernToggle label="Batch Upload Mode" checked={activeProduct.useAsTemplate} onChange={checked => handleProductChange(activeProductIndex, 'useAsTemplate', checked)} />
                         <ModernToggle label="Mark as Limited Stock" checked={activeProduct.limitedStock} onChange={checked => handleProductChange(activeProductIndex, 'limitedStock', checked)} />
                         <ModernToggle label="Mark as Sold Out" checked={activeProduct.soldOut} onChange={checked => handleProductChange(activeProductIndex, 'soldOut', checked)} />
                    </motion.div>
                )}
            </div>
          </MotionDiv>
        );
      case 4: // Uploading
        return(
            <MotionDiv key={4} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 sm:p-6">
                <h3 className="text-xl font-semibold text-center text-text-primary mb-4">Uploading Products...</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                    {uploadProgress.map(p => (
                        <div key={p.id} className="flex items-center gap-4 p-2 bg-input-background rounded-lg">
                            <Image src={p.imageUrl || URL.createObjectURL(batchProducts.find(prod => prod.id === p.id)!.file)} alt={p.fileName} width={48} height={48} className="w-12 h-12 object-cover rounded-md" />
                            <div className="flex-1">
                                <p className="font-semibold text-text-primary truncate">{p.fileName}</p>
                                <p className="text-sm text-text-secondary">{p.statusText}</p>
                            </div>
                            <div>
                                {p.status === 'uploading' && <ArrowPathIcon className="w-6 h-6 text-blue-500 animate-spin"/>}
                                {p.status === 'compressing' && <ArrowPathIcon className="w-6 h-6 text-yellow-500 animate-spin"/>}
                                {p.status === 'success' && <CheckCircleIcon className="w-6 h-6 text-green-500"/>}
                                {p.status === 'error' && <XMarkIcon className="w-6 h-6 text-red-500"/>}
                            </div>
                        </div>
                    ))}
                </div>
            </MotionDiv>
        );
      case 5: // Summary
        const successes = uploadProgress.filter(p => p.status === 'success').length;
        const failures = uploadProgress.filter(p => p.status === 'error').length;
        return(
            <MotionDiv key={5} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-6 text-center">
                <CheckCircleIcon className="w-20 h-20 text-green-500 mx-auto mb-4"/>
                <h3 className="text-2xl font-bold text-text-primary mb-2">Upload Complete!</h3>
                <p className="text-lg text-text-secondary">{successes} product(s) added successfully.</p>
                {failures > 0 && <p className="text-lg text-red-500">{failures} product(s) failed to upload.</p>}
            </MotionDiv>
        );

      default: return null;
    }
  }

  const STEPS = [ {name: 'Upload'}, {name: 'Details'}, {name: 'Pricing'}, {name: 'Stock'}];

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40" onClose={handleClose}>
        {/* --- Overlay --- */}
        <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        {/* --- Modal Content --- */}
        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-stretch justify-center text-center md:items-center md:px-2 lg:px-4">
            <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0 translate-y-full md:translate-y-0 md:scale-95" enterTo="opacity-100 translate-y-0 md:scale-100" leave="ease-in duration-200" leaveFrom="opacity-100 translate-y-0 md:scale-100" leaveTo="opacity-0 translate-y-full md:translate-y-0 md:scale-95">
              <Dialog.Panel className="relative flex w-full max-w-lg transform text-left text-base transition md:my-8">
                <div className="relative flex w-full flex-col overflow-hidden rounded-t-2xl md:rounded-2xl bg-card-background shadow-2xl">
                    <div className="p-4 sm:p-6 flex justify-between items-center border-b border-border-color">
                        <Dialog.Title as="h3" className="text-xl font-bold text-text-primary">
                            {currentStep === 4 ? 'Uploading...' : currentStep === 5 ? 'Summary' : 'Add New Product'}
                        </Dialog.Title>
                        <button onClick={handleClose} className="p-1 rounded-full hover:bg-button-secondary transition">
                            <XMarkIcon className="h-6 w-6 text-text-secondary" />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    {currentStep > 0 && currentStep < 4 && (
                        <div className="w-full bg-input-background h-1.5">
                            <motion.div 
                                className="bg-blue-600 h-1.5"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                                transition={{ ease: "easeInOut", duration: 0.5 }}
                            />
                        </div>
                    )}
                    
                    <div className="flex-1">
                      <AnimatePresence mode="wait">
                        {renderStepContent()}
                      </AnimatePresence>
                    </div>

                    {/* Navigation */}
                    <div className="p-4 sm:p-6 flex justify-between sm:justify-end gap-4 border-t border-border-color">
                       {currentStep === 0 && ( // New Cancel Button for initial step
                           <button onClick={handleClose} className="px-6 py-3 rounded-lg bg-button-secondary text-text-primary font-semibold hover:bg-button-secondary-hover transition">Cancel</button>
                       )}
                       {currentStep > 0 && currentStep < 4 && (
                           <button onClick={() => setCurrentStep(s => s - 1)} className="px-6 py-3 rounded-lg bg-button-secondary text-text-primary font-semibold hover:bg-button-secondary-hover transition">Back</button>
                       )}
                       {currentStep > 0 && currentStep < 3 && (
                           <button onClick={() => setCurrentStep(s => s + 1)} className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Next</button>
                       )}
                       {currentStep === 3 && (
                           <button onClick={handleSubmit} className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition" disabled={isUploading}>
                               {isUploading ? 'Please Wait...' : `Upload ${batchProducts.length} Product(s)`}
                           </button>
                       )}
                       {currentStep === 5 && (
                           <>
                               <button onClick={handleClose} className="px-6 py-3 rounded-lg bg-button-secondary text-text-primary font-semibold hover:bg-button-secondary-hover transition">Done</button>
                               <button onClick={resetState} className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Add More</button>
                           </>
                       )}
                    </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
        <CategorySelector isOpen={isCategorySelectorOpen} onClose={() => setCategorySelectorOpen(false)} categories={categories} onSelect={(cat: string) => handleProductChange(activeProductIndex, 'category', cat)} />
      </Dialog>
    </Transition.Root>
  );
};

export default AddProductComposer;
