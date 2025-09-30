'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

type Category = {
  id: string;
  name: string;
  icon?: string;
};

interface CategoryBarProps {
  onCategorySelect: (category: string) => void;
  activeCategory: string;
  categories: Category[];
  onActiveCategoryClick?: () => void;
}

export default function CategoryBar({ onCategorySelect, activeCategory, categories, onActiveCategoryClick }: CategoryBarProps) {
  const [isSticky, setIsSticky] = useState(false);

  const handleScroll = useCallback(() => {
    const navbar = document.querySelector('nav');
    const navHeight = navbar?.getBoundingClientRect().height || 64;
    const offset = window.pageYOffset || document.documentElement.scrollTop;
    setIsSticky(offset > navHeight / 2);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleCategoryClick = (category: string, event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const container = button.parentElement?.parentElement;
    if (container) {
      const containerWidth = container.offsetWidth;
      const buttonLeft = button.offsetLeft;
      const buttonWidth = button.offsetWidth;
      const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
      container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
    }

    if (activeCategory === category) {
      if (onActiveCategoryClick) onActiveCategoryClick();
    } else {
      onCategorySelect(category);
    }
  };

  const getIconForCategory = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Promo': '🔥',
      'Popular': '💖',
      'New Arrivals': '⭐',
    };
    return iconMap[categoryName] || '🛍️';
  };

  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Promo': 'bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]',
      'Popular': 'bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)]',
      'New Arrivals': 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]',
    };
    return colorMap[categoryName] || 'bg-card-hover text-text-primary';
  };

  const CategoryButton = ({ name, onClick, isActive }: { 
    name: string; 
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void; 
    isActive: boolean;
  }) => (
    <motion.button
      onClick={onClick}
      className="flex flex-col items-center w-[72px] sm:w-[80px] flex-shrink-0"
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <motion.div 
        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-1 sm:mb-2
          ${getCategoryColor(name)}
          ${isActive 
            ? 'ring-[4px] ring-[var(--button-primary)] ring-offset-2 ring-offset-[var(--background)] shadow-[var(--shadow-lg)]' 
            : 'hover:ring-3 hover:ring-[var(--button-primary)] hover:ring-offset-1 hover:ring-offset-[var(--background)]'
          }
          transform transition-all duration-200 ease-out`}
        animate={isActive ? { scale: [1, 1.1, 1.05] } : { scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
      >
        <span className="text-2xl sm:text-2xl">{getIconForCategory(name)}</span>
      </motion.div>
      <motion.span 
        className="text-xs font-medium truncate max-w-[80px] text-center"
        animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        {name}
      </motion.span>
    </motion.button>
  );

  // Define system categories that appear first
  const systemCategories = [
    { id: 'promo', name: 'Promo' },
    { id: 'popular', name: 'Popular' },
    { id: 'new-arrivals', name: 'New Arrivals' },
  ];

  // Filter out any vendor-created categories that have the same name as system ones
  const vendorCategories = categories.filter(c => !systemCategories.some(sc => sc.name === c.name));

  return (
    <div className={`category-bar-container card-glass ${isSticky ? 'is-sticky' : ''} relative`}>
      <div className="overflow-x-auto scrollbar-hide px-4">
        <div className="flex gap-3 py-3 min-w-min justify-center items-center">
          {/* System Categories */}
          {systemCategories.map(category => (
            <CategoryButton 
              key={category.id}
              name={category.name} 
              onClick={(e) => handleCategoryClick(category.name, e)} 
              isActive={activeCategory === category.name}
            />
          ))}

          {/* Separator */}
          {vendorCategories.length > 0 && (
            <div className="w-px h-10 bg-[var(--border-color)] opacity-60 mx-2" />
          )}

          {/* Vendor-generated categories */}
          {vendorCategories.map((category) => (
            <CategoryButton
              key={category.id}
              name={category.name}
              onClick={(e) => handleCategoryClick(category.name, e)}
              isActive={activeCategory === category.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
