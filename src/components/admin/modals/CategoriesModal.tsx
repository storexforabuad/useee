import { LayoutGrid, Tag, X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from '../../Modal';

interface CategoriesModalProps {
  totalCategories: number;
  categories: { id: string; name: string }[];
  setActiveSection: (section: string) => void;
  handleClose: () => void;
}

const CategoriesModal: React.FC<CategoriesModalProps> = ({
  totalCategories,
  categories,
  setActiveSection,
  handleClose,
}) => {
  const categoriesArr = Array.isArray(categories) ? categories : [];
  const isEmpty = categoriesArr.length === 0;

  useEffect(() => {
    window.history.pushState({ modalOpen: true }, '');
    const handlePopState = () => {
      handleClose();
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleClose]);

  return (
    <Modal open={true} onClose={handleClose}>
      <button
        onClick={handleClose}
        className="absolute top-3 right-3 z-10 text-text-secondary hover:text-text-primary bg-white/80 dark:bg-slate-700/80 rounded-full p-1.5 shadow"
        aria-label="Close"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="w-full flex flex-col items-center">
        {/* Header */}
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4 border border-primary/20">
          <LayoutGrid className="w-7 h-7 text-primary" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Categories</h2>
        <p className="text-4xl font-bold text-primary my-1">{totalCategories}</p>
        <p className="text-sm text-text-secondary mb-6">All product categories in your store.</p>

        {/* Content */}
        <div className="w-full">
          {isEmpty ? (
            <div className="w-full mt-2 flex flex-col items-center text-center">
              <p className="text-sm text-text-secondary mb-4">No categories have been added yet.</p>
              <p className="text-xs text-text-tertiary mb-4">Get started by adding your first one.</p>
            </div>
          ) : (
            <div className="w-full max-h-40 overflow-y-auto pr-2">
              <ul className="space-y-2">
                {categoriesArr.map((cat) => (
                  <li 
                    key={cat.id} 
                    className="flex items-center gap-3 p-3 rounded-lg bg-background-alt transition-colors border-b border-border-color last:border-b-0"
                  >
                    <Tag className="w-4 h-4 text-text-secondary flex-shrink-0" />
                    <span className="font-medium text-text-primary truncate">{cat.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer Button */}
        <button
          className="mt-6 w-full px-4 py-2.5 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => {
            setActiveSection('categories');
            handleClose();
          }}
        >
          {isEmpty ? 'Add Categories' : 'Manage Categories'}
        </button>
      </div>
    </Modal>
  );
};

export default CategoriesModal;
