'use client';
import React, { useState, useEffect, Fragment, useMemo } from 'react';
import { Dialog, Transition, Switch, Listbox } from '@headlessui/react';
import { XMarkIcon, CheckIcon, ChevronUpDownIcon } from '@heroicons/react/24/solid';
import { Product } from '../../types/product';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../utils/price';

interface EditProductPanelProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  // We'll need categories for the dropdown
  // categories: { id: string; name: string }[]; 
  // onSave: (updatedProduct: Product) => void;
}

const EditProductPanel: React.FC<EditProductPanelProps> = ({ product, isOpen, onClose }) => {
  const [editedProduct, setEditedProduct] = useState<Product | null>(product);

  useEffect(() => {
    // When the product prop changes, update the state
    setEditedProduct(product);
  }, [product]);

  const handleInputChange = (field: keyof Product, value: any) => {
    if (editedProduct) {
      setEditedProduct({ ...editedProduct, [field]: value });
    }
  };

  const handleSave = () => {
    if (editedProduct) {
      // onSave(editedProduct);
      console.log('Saving:', editedProduct);
      onClose();
    }
  };
  
  // Calculate commission amount for display
  const commissionAmount = useMemo(() => {
      if (!editedProduct) return 0;
      const price = editedProduct.promoPrice || editedProduct.price;
      return (price * (editedProduct.commission || 0)) / 100;
  }, [editedProduct]);


  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child as={Fragment} enter="ease-in-out duration-500" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in-out duration-500" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child as={Fragment} enter="transform transition ease-in-out duration-500 sm:duration-700" enterFrom="translate-x-full" enterTo="translate-x-0" leave="transform transition ease-in-out duration-500 sm:duration-700" leaveFrom="translate-x-0" leaveTo="translate-x-full">
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-card-background shadow-xl">
                    
                    {/* Header */}
                    <div className="p-4 sm:p-6 bg-card-background border-b border-border-color sticky top-0 z-10">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-bold text-text-primary">Edit Product</Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button type="button" className="rounded-md bg-card-background text-text-secondary hover:text-text-primary focus:outline-none focus:ring-2 focus:ring-blue-500" onClick={onClose}><span className="sr-only">Close panel</span><XMarkIcon className="h-6 w-6" aria-hidden="true" /></button>
                        </div>
                      </div>
                    </div>

                    {/* Form Content */}
                    {editedProduct ? (
                      <div className="relative flex-1 p-4 sm:p-6 space-y-6">
                        
                        {/* Product Name */}
                        <div>
                          <label htmlFor="product-name" className="block text-sm font-medium text-text-secondary">Product Name</label>
                          <input type="text" id="product-name" value={editedProduct.name} onChange={(e) => handleInputChange('name', e.target.value)} className="mt-1 block w-full rounded-md border-input-border bg-input-background shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                        </div>

                        {/* Price & Promo */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium text-text-secondary">Pricing</h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-text-secondary">Promo</span>
                                    <Switch checked={editedProduct.onPromo || false} onChange={(checked) => handleInputChange('onPromo', checked)} className={`${ (editedProduct.onPromo) ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}>
                                        <span className={`${ (editedProduct.onPromo) ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} />
                                    </Switch>
                                </div>
                            </div>
                            
                            <AnimatePresence mode="wait">
                                <motion.div key={editedProduct.onPromo ? 'promo' : 'normal'} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                                    {editedProduct.onPromo ? (
                                        <div className="grid grid-cols-2 gap-4">
                                             <div>
                                                <label className="block text-xs font-medium text-text-secondary">Original Price</label>
                                                <p className="mt-1 text-lg font-semibold text-text-secondary line-through">{formatPrice(editedProduct.price)}</p>
                                             </div>
                                             <div>
                                                <label htmlFor="promo-price" className="block text-xs font-medium text-text-primary">Promo Price</label>
                                                 <input type="number" id="promo-price" value={editedProduct.promoPrice || ''} onChange={(e) => handleInputChange('promoPrice', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-input-border bg-input-background shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                             </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label htmlFor="price" className="block text-sm font-medium text-text-primary">Price</label>
                                            <input type="number" id="price" value={editedProduct.price} onChange={(e) => handleInputChange('price', parseFloat(e.target.value))} className="mt-1 block w-full rounded-md border-input-border bg-input-background shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Commission Slider */}
                        <div>
                            <label className="block text-sm font-medium text-text-secondary">Commission</label>
                            <div className="mt-2 bg-input-background p-4 rounded-lg">
                                <input type="range" min="1" max="25" value={editedProduct.commission || 0} onChange={e => handleInputChange('commission', parseInt(e.target.value))} className="w-full h-2 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-lg appearance-none cursor-pointer slider-thumb"/>
                                <div className="flex justify-center items-center text-sm font-medium text-text-primary mt-2">
                                    <span>{editedProduct.commission || 0}%</span>
                                    <span className="text-text-secondary mx-2">-</span>
                                    <span className="font-bold">{formatPrice(commissionAmount)}</span>
                                </div>
                            </div>
                        </div>

                         {/* Stock Management */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-text-secondary">Inventory</h3>
                             <Switch.Group as="div" className="flex items-center justify-between">
                                <Switch.Label as="span" className="flex-grow flex flex-col">
                                    <span className="text-sm font-medium text-text-primary">Limited Stock</span>
                                    <span className="text-xs text-text-secondary">Mark item as having limited availability.</span>
                                </Switch.Label>
                                <Switch checked={editedProduct.limitedStock || false} onChange={(checked) => handleInputChange('limitedStock', checked)} className={`${ (editedProduct.limitedStock) ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}><span className={`${ (editedProduct.limitedStock) ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} /></Switch>
                            </Switch.Group>
                             <Switch.Group as="div" className="flex items-center justify-between">
                                <Switch.Label as="span" className="flex-grow flex flex-col">
                                    <span className="text-sm font-medium text-text-primary">Sold Out</span>
                                     <span className="text-xs text-text-secondary">Mark item as completely unavailable.</span>
                                </Switch.Label>
                                <Switch checked={editedProduct.soldOut || false} onChange={(checked) => handleInputChange('soldOut', checked)} className={`${ (editedProduct.soldOut) ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full`}><span className={`${ (editedProduct.soldOut) ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`} /></Switch>
                            </Switch.Group>
                        </div>

                      </div>
                    ) : (
                      <div className="text-center p-8"> <p>No product selected</p> </div>
                    )}

                    {/* Footer with Actions */}
                    <div className="flex-shrink-0 border-t border-border-color px-4 py-4 sm:px-6">
                      <div className="flex justify-end space-x-3">
                        <button type="button" className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onClick={onClose}>Cancel</button>
                        <button type="button" className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" onClick={handleSave}>Save Changes</button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default EditProductPanel;
