'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getProductById } from '../../../lib/db';
import { Phone, PlusCircle } from 'lucide-react';
import { useCart } from '../../../lib/cartContext';
import { Product } from '../../../types/product';
import SkeletonLoader from '../../../components/SkeletonLoader';

export default function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const { state, dispatch } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { id } = await params;
        const fetchedProduct = await getProductById(id);
        setProduct(fetchedProduct);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [params]);

  useEffect(() => {
    if (product) {
      const productInCart = state.items.find(item => item.id === product.id);
      setIsInCart(!!productInCart);
    }
  }, [product, state.items]);

  if (isLoading) {
    return (
      <div className="p-4">
        <SkeletonLoader />
      </div>
    );
  }

  if (!product) {
    return <div className="p-4">Product not found</div>;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(price);
  };

  const createWhatsAppMessage = () => {
    const message = `Hello! I'm interested in buying:\n\n*${product.name}*\nPrice: ${formatPrice(product.price)}\n\nCan you help me with this order?\n\nProduct Link: ${window.location.href}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappLink = `https://wa.me/+2348164981183?text=${encodedMessage}`;
    window.open(whatsappLink, '_blank');
  };

  const handleAddToCart = () => {
    setIsAdding(true);
    dispatch({ type: 'ADD_ITEM', payload: product });
    setIsAdding(false);
    setIsInCart(true);
  };

  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Electronics': 'bg-orange-400',
      'Men': 'bg-red-500',
      'Women': 'bg-yellow-500',
      'Watches': 'bg-blue-400',
      'Home': 'bg-green-400',
      // Add more mappings as needed
    };
    return colorMap[categoryName] || 'bg-gray-500';
  };

  return (
    <div className="mx-auto max-w-7xl px-2 sm:px-4 lg:px-6 py-4">
      <div className="grid gap-4 md:gap-8 md:grid-cols-2">
        <div>
          <div className="aspect-square overflow-hidden rounded-lg">
            {product.images[selectedImage] ? (
              <Image
                src={product.images[selectedImage]}
                alt={product.name}
                width={500}
                height={500}
                className="h-full w-full object-cover"
                priority={false}
                loading="lazy"
              />
            ) : (
              <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                <span>No Image Available</span>
              </div>
            )}
          </div>
          {product.images.length > 1 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded-lg border-2 
                    ${selectedImage === index ? 'border-gray-600' : 'border-transparent'}`}
                >
                  {image ? (
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      width={100}
                      height={100}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                      <span>No Image</span>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            {product.limitedStock && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                Limited Stock
              </span>
            )}
            <span className={`text-white text-xs font-bold px-2 py-1 rounded-lg ${getCategoryColor(product.category)}`}>
              {product.category}
            </span>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-text-primary">{product.name}</h1>
          <p className="mt-2 text-lg md:text-xl font-medium text-text-primary">
            {formatPrice(product.price)}
          </p>
          {product.features && (
            <div className="mt-2">
              <h2 className="text-sm font-medium text-text-primary">Features</h2>
              <ul className="mt-1 list-inside list-disc text-sm text-text-secondary">
                {product.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 flex flex-col gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isAdding || isInCart}
              className={`flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-white shadow-sm
                ${isAdding || isInCart
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gray-800 hover:bg-gray-900'
                }`}
            >
              <PlusCircle size={24} />
              <span className="text-lg transition-all duration-300">
                {isAdding || isInCart ? 'Added to list' : ' Add to list'}
              </span>
            </button>
            <button
              onClick={createWhatsAppMessage}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-500 px-6 py-3 text-white shadow-sm hover:bg-green-800"
            >
              <Phone size={24} />
              <span className="text-lg">Order via WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    

      <footer className="py-12 text-center text-text-secondary">
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2">
          <span>powered by ABS &copy; {new Date().getFullYear()}.</span>
          <a 
            href={`https://wa.me/+2349099933360`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center gap-1"
          >
            <Phone size={16} />
            <span>09099933360</span>
          </a>
        </div>
      </footer>
    </div>
  ); 
}