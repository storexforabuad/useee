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
      const buttonRight = buttonLeft + buttonWidth;
      const scrollRight = container.scrollLeft + containerWidth;
      // If the button is near the right edge and there are more categories to the right, scroll left
      if (buttonRight > scrollRight - 24) { // 24px as a buffer
        const scrollAmount = buttonRight - scrollRight + 48; // 48px to show more categories
        container.scrollTo({
          left: container.scrollLeft + scrollAmount,
          behavior: 'smooth'
        });
      } else {
        // Center the button as before
        const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }

    // Defensive check: ensure onCategorySelect always gets a valid category string
    if (typeof category !== 'string') {
      console.warn('CategoryBar: Invalid category selected:', category);
      return;
    }
    if (activeCategory === category) {
      if (onActiveCategoryClick) onActiveCategoryClick();
    } else {
      onCategorySelect(category);
    }
  };

  // Defensive check: ensure categories passed in always have valid id and name
  const getIconForCategory = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'New Arrivals': '⭐',
      'Promo': '🔥',
      'Back in Stock': '📦',
      // 'Atamfa': '👗',
      // 'Laces': '🥻',
      // 'Caps': '🧢' // ✅ Added Caps icon
    };
    // Use 🛍️ for all user-generated categories
    return iconMap[categoryName] || '🛍️';
  };

  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      'New Arrivals': 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]',
      'Promo': 'bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]',
      'Back in Stock': 'bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]',
      // 'Atamfa': 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)]',
      // 'Laces': 'bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)]',
      // 'Caps': 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)]' // ✅ Added Caps style
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
      className="flex flex-col items-center w-[72px] sm:w-[80px]"
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
        animate={isActive ? { 
          scale: [1, 1.1, 1.05],
          transition: { duration: 0.3, ease: "easeOut" }
        } : { scale: 1 }}
        style={{
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      >
        <span className="text-2xl sm:text-2xl">{getIconForCategory(name)}</span>
      </motion.div>
      <motion.span 
        className="text-xs font-medium truncate max-w-[80px] text-center"
        animate={isActive ? { 
          scale: [1, 1.05, 1],
          transition: { duration: 0.3, delay: 0.1 }
        } : { scale: 1 }}
      >
        {name === '' ? 'New Arrivals' : name}
      </motion.span>
    </motion.button>
  );

  // Default categories
  const defaultCategories = [
    { id: 'promo', name: 'Promo' },
    { id: 'new', name: 'New Arrivals' },
    { id: 'back', name: 'Back in Stock' }
  ];
  // Only show vendor-generated categories in the vendor section
  const vendorCategories = categories.filter(c => !defaultCategories.some(dc => dc.name === c.name));

  return (
    <div className={`category-bar-container ${isSticky ? 'is-sticky' : ''} relative`}>
      <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r ${
        isSticky ? 'from-[var(--navbar-bg)]' : 'from-[var(--background)]'
      } to-transparent z-10 transition-colors duration-300`} />
      <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${
        isSticky ? 'from-[var(--navbar-bg)]' : 'from-[var(--background)]'
      } to-transparent z-10 transition-colors duration-300`} />
      <div className="absolute left-0 right-0 top-0 h-px bg-[var(--border-color)] opacity-40 z-20" />
      <div className="overflow-x-auto scrollbar-hide px-4">
        <div className="flex gap-3 py-3 min-w-min justify-center items-center">
          {/* Default categories */}
          <CategoryButton 
            name="Promo" 
            onClick={(e) => handleCategoryClick('Promo', e)} 
            isActive={activeCategory === 'Promo'}
          />
          <CategoryButton 
            name="New Arrivals" 
            onClick={(e) => handleCategoryClick('', e)} 
            isActive={activeCategory === ''}
          />
          {/* Vendor-generated categories */}
          <div className="w-px h-10 bg-[var(--border-color)] opacity-60 mx-2 " />
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
