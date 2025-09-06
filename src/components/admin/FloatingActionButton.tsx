'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, MessageSquare, Phone, X } from 'lucide-react';
import { businessConfig } from '@/config/business';

const FloatingActionButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Mount the component after a short delay to prevent it from being distracting on load
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const toggleMenu = () => {
    // Provide haptic feedback on mobile devices
    if (typeof window.navigator.vibrate === 'function') {
      window.navigator.vibrate(10);
    }
    setIsOpen(!isOpen);
  };

  const whatsAppNumber = businessConfig.contact.whatsapp.replace('+', '');
  const contactLink = `https://wa.me/${whatsAppNumber}?text=${encodeURIComponent("Hello, I need help with my store.")}`;
  const callLink = `tel:${businessConfig.contact.support}`;

  const menuItems = [
    {
      label: 'Chat',
      icon: MessageSquare,
      action: () => window.open(contactLink, '_blank'),
      bg: 'bg-green-500/20',
      iconColor: 'text-green-500'
    },
    {
      label: 'Call',
      icon: Phone,
      action: () => window.open(callLink, '_self'),
      bg: 'bg-blue-500/20',
      iconColor: 'text-blue-500'
    }
  ];

  if (!isMounted) {
    return null;
  }

  return (
    <div 
      className={`fixed bottom-24 right-6  transition-transform duration-500 ease-in-out z-50 ${
        isMounted ? 'scale-100' : 'scale-0'
      }`}
      aria-live="polite"
    >
      <div className="relative flex flex-col items-center gap-3">
        {/* Sub-buttons revealed when menu is open */}
        {isOpen &&
          menuItems.map((item, index) => (
            <div
              key={item.label}
              className="flex items-center gap-3 animate-spring-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="card-glass text-sm font-semibold py-2 px-4 rounded-lg shadow-md">
                {item.label}
              </span>
              <button
                onClick={item.action}
                aria-label={item.label}
                className={`card-glass w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-100 transition-transform ${item.bg}`}
              >
                <item.icon className={`w-6 h-6 ${item.iconColor}`} />
              </button>
            </div>
          ))}

        {/* Main Floating Action Button */}
        <button
          onClick={toggleMenu}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="Help and Support Menu"
          className="card-glass w-16 h-16 rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-300"
        >
          {isOpen ? (
            <X className="w-8 h-8 text-text-primary transition-transform duration-300 rotate-90" />
          ) : (
            <HelpCircle className="w-8 h-8 text-text-primary transition-transform duration-300" />
          )}
        </button>
      </div>
    </div>
  );
};

export default FloatingActionButton;
