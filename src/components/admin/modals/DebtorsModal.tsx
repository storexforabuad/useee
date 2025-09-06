import { Layers, X } from 'lucide-react';
import { useEffect } from 'react';
import Modal from '../../Modal';

interface DebtorsModalProps {
  debtors: number;
  handleClose: () => void;
}

const DebtorsModal: React.FC<DebtorsModalProps> = ({ debtors, handleClose }) => {
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
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-fuchsia-500/10 mb-4 border border-fuchsia-500/20">
          <Layers className="w-7 h-7 text-fuchsia-500" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Debtors</h2>
        <p className="text-4xl font-bold text-fuchsia-500 my-1">
          {debtors}
        </p>
        <p className="text-sm text-text-secondary mb-6 text-center">Customers with outstanding payments.</p>
        {/* Content */}
        <div className="w-full text-center p-4 rounded-lg bg-background-alt border border-border-color">
           <p className="text-sm font-semibold text-text-primary">Feature Coming Soon</p>
           <p className="text-xs text-text-secondary mt-1">The ability to track debtors and outstanding payments will be available in a future update.</p>
        </div>
        {/* Footer Button */}
        <button
          disabled
          className="mt-6 w-full px-4 py-2.5 rounded-lg bg-muted text-muted-foreground font-semibold transition-all duration-200 opacity-50 cursor-not-allowed"
        >
          Manage Debtors
        </button>
      </div>
    </Modal>
  );
};

export default DebtorsModal;
