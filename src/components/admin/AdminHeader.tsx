import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';
import { SpinnerCircle } from '../Spinner';

interface AdminHeaderProps {
  onLogout: () => Promise<void>;
  isRefreshing: boolean;
}

const AdminHeader = ({ onLogout, isRefreshing }: AdminHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 bg-card-background shadow-sm px-4 sm:px-6 lg:px-8 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Dashboard</h1>
          {isRefreshing && <SpinnerCircle className="w-5 h-5 text-blue-600" />}
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AdminHeader;