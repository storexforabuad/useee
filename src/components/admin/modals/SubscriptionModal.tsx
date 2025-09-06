import Modal from '../../Modal';
import { ShieldCheck, X } from 'lucide-react';

interface SubscriptionModalProps {
  handleClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ handleClose }) => {
  const subscriptionStatus = "Active"; // This could be dynamic in the future

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
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-500/10 mb-4 border border-teal-500/20">
          <ShieldCheck className="w-7 h-7 text-teal-500" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Subscription</h2>
        <p 
          className={`text-4xl font-bold my-1 ${
            subscriptionStatus === 'Active' ? 'text-teal-500' : 'text-destructive'
          }`}
        >
          {subscriptionStatus}
        </p>
        <p className="text-sm text-text-secondary mb-6 text-center">Your current plan status.</p>
        {/* Content */}
        <div className="w-full text-left p-4 rounded-lg bg-background-alt border border-border-color space-y-2">
           <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Current Plan:</span>
              <span className="font-semibold text-text-primary">Free Trial</span>
           </div>
           <div className="flex justify-between items-center text-sm">
              <span className="text-text-secondary">Renewal Date:</span>
              <span className="font-semibold text-text-primary">To Be Determined</span>
           </div>
           <div className="pt-2 text-center text-xs text-teal-600 dark:text-teal-400">
              Enjoying the trial? Stick around for more features!
           </div>
        </div>
        {/* Footer Button */}
        <button
          disabled
          className="mt-6 w-full px-4 py-2.5 rounded-lg bg-muted text-muted-foreground/50 font-semibold transition-all duration-200 cursor-not-allowed"
        >
          Manage Subscription
        </button>
      </div>
    </Modal>
  );
};

export default SubscriptionModal;
