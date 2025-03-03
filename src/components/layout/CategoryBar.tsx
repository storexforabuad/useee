'use client';

import { useState, useEffect, useCallback } from 'react';
import { getCategories } from '../../lib/db';

type Category = {
  id: string;
  name: string;
  icon?: string;
};

export default function CategoryBar({ onCategorySelect }: { onCategorySelect: (category: string) => void }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('');
  const [isSticky, setIsSticky] = useState(false);

  // Debounced scroll handler
  const handleScroll = useCallback(() => {
    const navbar = document.querySelector('nav');
    const navHeight = navbar?.getBoundingClientRect().height || 64;
    const offset = window.pageYOffset || document.documentElement.scrollTop;
    
    setIsSticky(offset > navHeight / 2);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    };
    fetchCategories();

    // Add passive scroll listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const handleCategoryClick = (category: string) => {
    if (activeCategory === category) {
      setActiveCategory('');
      onCategorySelect('');
    } else {
      setActiveCategory(category);
      onCategorySelect(category);
    }
  };

  const getIconForCategory = (categoryName: string) => {
    const iconMap: { [key: string]: string } = {
      'Electronics': '📱',
      'Men': '👔',
      'Baby': '👶🏻',
      'Watches': '⌚',
      'Home': '🏠',
    };
    return iconMap[categoryName] || '❓';
  };

  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Electronics': 'bg-orange-500',
      'Men': 'bg-red-500',
      'Baby': 'bg-yellow-500',
      'Watches': 'bg-blue-500',
      'Home': 'bg-green-500',
    };
    return colorMap[categoryName] || 'bg-gray-500';
  };

  return (
    <div 
      className={`category-bar-container ${
        isSticky 
          ? 'is-sticky fixed top-16 left-0 right-0 z-40 bg-card-background/95 backdrop-blur-sm shadow-md' 
          : 'relative'
      }`}
    >
      {/* Gradient Fade Effect */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10" />
      
      {/* Scrollable Container */}
      <div className="overflow-x-auto scrollbar-hide mx-4">
        <div className="flex space-x-4 sm:space-x-6 py-3 px-2 sm:px-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.name)}
              className="group flex flex-col items-center flex-shrink-0 transition-all duration-200"
            >
              <div 
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-1 sm:mb-2
                  ${getCategoryColor(category.name)}
                  ${activeCategory === category.name 
                    ? 'ring-4 ring-black/20 ring-offset-2 scale-110 shadow-lg' 
                    : 'hover:ring-2 hover:ring-black/10 hover:ring-offset-1 hover:scale-105'
                  }
                  transform transition-all duration-200 ease-in-out`}
              >
                <span className="text-xl sm:text-2xl">
                  {getIconForCategory(category.name)}
                </span>
              </div>
              <span 
                className={`text-[10px] sm:text-xs font-medium
                  ${activeCategory === category.name 
                    ? 'text-black font-semibold scale-105' 
                    : 'text-text-secondary group-hover:text-text-primary'
                  }
                  transform transition-all duration-200`}
              >
                {category.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}