'use client';

import { useState, useEffect } from 'react';
import { X, MessageCircle, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { StoreMeta } from '../../../types/store';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  storeMeta: StoreMeta;
  categories: { id: string; name: string }[];
  storeLink: string;
}

const WhatsAppShareModal = ({
  isOpen,
  onClose,
  onComplete,
  storeMeta,
  categories,
  storeLink
}: WhatsAppShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowContent(true), 100);
      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  // Generate dynamic caption based on store info and categories
  const generateCaption = () => {
    const categoryList = categories.map(cat => cat.name).join(', ');
    const storeName = storeMeta.name || 'My Store';
    const businessDescription = storeMeta.businessDescription || 'amazing products';

    return `🌟 Check out ${storeName}! 🌟

I've just launched my online store with ${businessDescription}. 

🛍️ Categories: ${categoryList}
📱 Shop now: ${storeLink}

Support local business! 🛒✨ #MyStore #ShopLocal`;
  };

  const caption = generateCaption();
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(caption)}`;

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy caption:', err);
    }
  };

  const handleWhatsAppShare = () => {
    // Open WhatsApp with the caption
    window.open(whatsappUrl, '_blank');

    // After a delay, mark as completed (user can share with multiple contacts)
    setTimeout(() => {
      onComplete();
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div
        className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full transform transition-all duration-300 ${
          showContent ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors z-10"
        >
          <X size={24} />
        </button>

        {/* Content */}
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
              <MessageCircle size={32} className="text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Share Your Store! 📱
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              Share your store link with friends and family to get more views
            </p>
          </div>

          {/* Caption Preview */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Your Message:</h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {caption}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleWhatsAppShare}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              Share on WhatsApp
              <ExternalLink size={16} />
            </button>

            <button
              onClick={handleCopyCaption}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center gap-2"
            >
              {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy Caption'}
            </button>

            <button
              onClick={onClose}
              className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              I'll Share Later
            </button>
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
            <h4 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💡 Sharing Tips:</h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Share with family and friends first</li>
              <li>• Post in community groups</li>
              <li>• Share on social media</li>
              <li>• Ask friends to share with their contacts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppShareModal;