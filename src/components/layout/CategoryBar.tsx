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

    window.addEventListener('scroll', handleScroll, { passive: true });
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
      'Automobile': '🚗',
      'Perfume': '🌸',
      'Incense': '⭐',
      'Real-Estate': '🏘️',
      'Solar': '☀️',
    };
    return iconMap[categoryName] || '❓';
  };

  const getCategoryColor = (categoryName: string): string => {
    const colorMap: { [key: string]: string } = {
      'Electronics': 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]',
      'Men': 'bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]',
      'Baby': 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)]',
      'Watches': 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]',
      'Home': 'bg-[var(--badge-green-bg)] text-[var(--badge-green-text)]',
      'Automobile': 'bg-[var(--badge-red-bg)] text-[var(--badge-red-text)]',
      'Perfume': 'bg-[var(--badge-pink-bg)] text-[var(--badge-pink-text)]',
      'Incense': 'bg-[var(--badge-purple-bg)] text-[var(--badge-purple-text)]',
      'Real-Estate': 'bg-[var(--badge-blue-bg)] text-[var(--badge-blue-text)]',
      'Solar': 'bg-[var(--badge-yellow-bg)] text-[var(--badge-yellow-text)]',
    };
    return colorMap[categoryName] || 'bg-card-hover text-text-primary';
  };

  return (
    <div className={`category-bar-container ${isSticky ? 'is-sticky' : ''}`}>
      {/* Gradient Fade Effect */}
      <div className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r ${
        isSticky ? 'from-[var(--navbar-bg)]' : 'from-[var(--background)]'
      } to-transparent z-10 transition-colors duration-300`} />
      <div className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l ${
        isSticky ? 'from-[var(--navbar-bg)]' : 'from-[var(--background)]'
      } to-transparent z-10 transition-colors duration-300`} />
      
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
                    ? 'ring-4 ring-[var(--text-primary)]/20 ring-offset-2 ring-offset-[var(--background)] scale-110 shadow-[var(--shadow-lg)]' 
                    : 'hover:ring-2 hover:ring-[var(--text-primary)]/10 hover:ring-offset-1 hover:ring-offset-[var(--background)] hover:scale-105'
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
                    ? 'text-text-primary font-semibold scale-105' 
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