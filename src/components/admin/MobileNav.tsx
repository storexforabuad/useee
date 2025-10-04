import React from 'react';
import { 
  HomeIcon as HomeIconOutline, 
  CubeIcon as CubeIconOutline, 
  TagIcon as TagIconOutline, 
  EyeIcon as EyeIconOutline, 
  PlusIcon
} from '@heroicons/react/24/outline';
import { 
  HomeIcon as HomeIconSolid, 
  CubeIcon as CubeIconSolid, 
  TagIcon as TagIconSolid, 
  EyeIcon as EyeIconSolid 
} from '@heroicons/react/24/solid';
import { useSpotlightContext } from '@/context/SpotlightContext';

interface MobileNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onAddProductClick: () => void; // New prop
  isModalOpen?: boolean;
}

const navItems = [
  { id: 'home', iconOutline: HomeIconOutline, iconSolid: HomeIconSolid, label: 'Home' },
  { id: 'preview', iconOutline: EyeIconOutline, iconSolid: EyeIconSolid, label: 'Store' },
  { id: 'add', iconOutline: PlusIcon, label: 'Upload' },
  { id: 'manage', iconOutline: CubeIconOutline, iconSolid: CubeIconSolid, label: 'Products' },
  { id: 'categories', iconOutline: TagIconOutline, iconSolid: TagIconSolid, label: 'Categories' },
];

const MobileNav = ({ activeSection, setActiveSection, onAddProductClick, isModalOpen }: MobileNavProps) => {
  const { spotlightStep, setSpotlightStep } = useSpotlightContext();

  const handleNavClick = (sectionId: string) => {
    setActiveSection(sectionId);
    setSpotlightStep('inactive');
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden transition-all duration-300 ${isModalOpen ? 'opacity-0 transform-gpu translate-y-4 pointer-events-none' : 'opacity-100'} ${spotlightStep === 'nav' ? 'z-50' : ''}`}
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0))' }}
    >
      <div className="relative w-full max-w-md mx-auto h-16">
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-white/70 dark:bg-zinc-800/70 backdrop-blur-xl border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-md" />

        <div className="absolute bottom-0 left-0 right-0 h-16 flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            
            if (item.id === 'add') {
              const IconComponent = item.iconOutline;
              return (
                <div key={item.id} className="relative w-16 h-16">
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-24 h-24 bg-white/70 dark:bg-zinc-800/70 rounded-full border-t border-t-gray-200 dark:border-t-zinc-700" style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }} />
                  
                  <button
                    onClick={onAddProductClick} // Use the new prop here
                    className="absolute -top-7 left-1/2 -translate-x-1/2 w-16 h-16 bg-neutral-800 dark:bg-neutral-100 rounded-full shadow-lg flex items-center justify-center text-white dark:text-black focus:outline-none focus:ring-2 focus:ring-offset-4 focus:ring-offset-background dark:focus:ring-offset-zinc-800 focus:ring-neutral-500 transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
                    aria-label={item.label}
                  >
                    <IconComponent className="h-7 w-7" strokeWidth={2.2} />
                  </button>
                </div>
              );
            }
            
            const IconComponent = isActive ? item.iconOutline : item.iconSolid;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex flex-col items-center justify-center h-14 w-16 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-1 focus:ring-offset-0 focus:ring-blue-400/50 ${
                  isActive ? 'text-neutral-800 dark:text-gray-500' : 'text-gray-600 dark:text-neutral-100'
                }`}
                style={{ WebkitTapHighlightColor: 'transparent' }}
              >
                <IconComponent className="h-6 w-6" {...(isActive ? { strokeWidth: 2 } : {})} />
                <span className="text-xs font-medium mt-1 tracking-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MobileNav;
