import { PlusIcon, StarIcon, CubeIcon, TagIcon } from '@heroicons/react/24/outline';

interface MobileNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const MobileNav = ({ activeSection, setActiveSection }: MobileNavProps) => {
  const navItems = [
    { id: 'add', icon: PlusIcon, label: 'Add' },
    { id: 'popular', icon: StarIcon, label: 'Popular' },
    { id: 'manage', icon: CubeIcon, label: 'Manage' },
    { id: 'categories', icon: TagIcon, label: 'Categories' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card-background border-t border-border-color shadow-[var(--shadow-lg)] md:hidden z-50">
      <div className="grid grid-cols-4 gap-1 p-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
              activeSection === id 
                ? 'text-[var(--button-primary)] bg-[var(--badge-blue-bg)]' 
                : 'text-text-secondary hover:bg-card-hover'
            }`}
          >
            <Icon className="h-6 w-6" />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNav;