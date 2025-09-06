import React from 'react';
import { HomeIcon, CubeIcon, TagIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';

interface MobileNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isModalOpen?: boolean;
}

const navItems = [
  { id: 'home', icon: HomeIcon, label: 'Home' },
  { id: 'add', icon: ArrowUpTrayIcon, label: 'Upload' },
  { id: 'manage', icon: CubeIcon, label: 'Products' },
  { id: 'categories', icon: TagIcon, label: 'Categories' },
];

const MobileNav = ({ activeSection, setActiveSection, isModalOpen }: MobileNavProps) => {
  return (
    <nav 
        className={`fixed bottom-0 left-0 right-0 z-50 md:hidden transition-all duration-300 ${isModalOpen ? 'opacity-0 transform-gpu translate-y-4 pointer-events-none' : 'opacity-100'}`}
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0) + 0.5rem)' }}
    >
      <div className="w-full max-w-xs mx-auto h-16 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-lg flex items-center justify-around px-1">
        {navItems.map((item) => {
          const isActive = activeSection === item.id;
          const IconComponent = item.icon; 
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`flex flex-col items-center justify-center w-1/4 h-14 rounded-lg transition-colors duration-200 transform-gpu focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-blue-400/50 ${
                isActive 
                  ? 'bg-neutral-200 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100'
                  : 'text-gray-500 dark:text-gray-400 hover:text-neutral-800 dark:hover:text-neutral-100'
              }`}
            >
              <IconComponent className="h-6 w-6" strokeWidth={2.45} />
              <span className="text-xs font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
