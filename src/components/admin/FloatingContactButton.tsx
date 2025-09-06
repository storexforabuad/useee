'use client';

import { useState } from 'react';
import { PhoneIcon, ChatBubbleLeftIcon, XMarkIcon } from '@heroicons/react/24/solid';

const FloatingContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '+2349099933360';

  const handleCall = () => {
    window.location.href = `tel:${phoneNumber}`;
  };

  const handleWhatsApp = () => {
    window.location.href = `https://wa.me/${phoneNumber}`;
  };

  return (
    <div className="fixed bottom-20 right-4 md:bottom-8 md:right-8 z-50">
      {isOpen && (
        <div className="flex flex-col gap-3 mb-4 animate-fade-in">
          <button
            onClick={handleCall}
            className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors duration-200"
            aria-label="Call support"
          >
            <PhoneIcon className="h-6 w-6" />
          </button>
          <button
            onClick={handleWhatsApp}
            className="bg-[#25D366] text-white p-3 rounded-full shadow-lg hover:bg-[#128C7E] transition-colors duration-200"
            aria-label="Contact on WhatsApp"
          >
            <ChatBubbleLeftIcon className="h-6 w-6" />
          </button>
        </div>
      )}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors duration-200"
        aria-label="Toggle contact options"
      >
        {isOpen ? (
          <XMarkIcon className="h-6 w-6" />
        ) : (
          <ChatBubbleLeftIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  );
};

export default FloatingContactButton;