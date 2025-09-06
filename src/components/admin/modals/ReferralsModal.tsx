import Modal from '../../Modal';
import { Gift, X } from 'lucide-react';
import AnimatedViewCount from '../../AnimatedViewCount';

interface ReferralsModalProps {
  referrals: number;
  handleClose: () => void;
}

const ReferralsModal: React.FC<ReferralsModalProps> = ({ referrals, handleClose }) => {
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
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-500/10 mb-4 border border-orange-500/20">
          <Gift className="w-7 h-7 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Referrals</h2>
        <p className="text-4xl font-bold text-orange-500 my-1">
          <AnimatedViewCount value={referrals} />
        </p>
        <p className="text-sm text-text-secondary mb-6 text-center">Businesses you&apos;ve referred for this service.</p>
        {/* Content */}
        <div className="w-full text-center p-4 rounded-lg bg-background-alt border border-border-color">
          <p className="text-sm font-semibold text-text-primary">Earn Cash Rewards!</p>
          <p className="text-xs text-text-secondary mt-1">Refer other business owners and earn rewards for each successful sign-up.</p>
        </div>
        {/* Footer Button */}
        <button
          disabled
          className="mt-6 w-full px-4 py-2.5 rounded-lg bg-muted text-muted-foreground font-semibold transition-all duration-200 opacity-50 cursor-not-allowed"
        >
          View Referral Program
        </button>
      </div>
    </Modal>
  );
};

export default ReferralsModal;
