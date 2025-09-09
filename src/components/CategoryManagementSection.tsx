import React from 'react';
import dynamic from 'next/dynamic';
import { TagIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const CategoryManagement = dynamic(
  () => import('../components/CategoryManagement'),
  {
    loading: () => (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-200 rounded w-full"></div>
        <div className="h-32 bg-gray-200 rounded w-full"></div>
      </div>
    ),
    ssr: false
  }
);

interface CategoryManagementSectionProps {
  isCategoryManagementOpen: boolean;
  setIsCategoryManagementOpen: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: string;
}

const CategoryManagementSection: React.FC<CategoryManagementSectionProps> = ({
  isCategoryManagementOpen,
  setIsCategoryManagementOpen,
  storeId,
}) => {
  return (
    <section className="bg-card-background p-4 sm:p-6 rounded-xl shadow-sm transition-all">
      <div
        className="flex justify-between items-center cursor-pointer bg-card-background hover:bg-card-hover p-4 rounded-xl border border-gray-300 dark:border-gray-700 transition-colors"
        onClick={() => setIsCategoryManagementOpen(!isCategoryManagementOpen)}
      >
        <div className="flex items-center gap-3">
          <TagIcon className="w-6 h-6 text-text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">
            Business Categories
          </h2>
        </div>
        <div className="text-text-primary">
          {isCategoryManagementOpen ? (
            <ChevronUpIcon className="w-6 h-6" />
          ) : (
            <ChevronDownIcon className="w-6 h-6" />
          )}
        </div>
      </div>

      {isCategoryManagementOpen && (
        <div className="mt-4">
          <CategoryManagement storeId={storeId} />
        </div>
      )}

      <div className="mt-6 px-2 sm:px-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-orange-500/10 via-pink-500/10 to-transparent p-4 rounded-xl border border-border-color">
            <h3 className="font-semibold text-orange-400 text-base mb-2 flex items-center gap-2">
              <span>🏷️</span> Quick Listing Tips
            </h3>
            <ul className="space-y-1 text-xs sm:text-sm text-text-secondary list-disc list-inside">
              <li>Use clear, descriptive product names.</li>
              <li>Upload bright, high-quality images.</li>
              <li>Set a fair, competitive price.</li>
            </ul>
          </div>
          <div className="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-transparent p-4 rounded-xl border border-border-color">
            <h3 className="font-semibold text-cyan-400 text-base mb-2 flex items-center gap-2">
              <span>💡</span> Pro Tips
            </h3>
            <ul className="space-y-1 text-xs sm:text-sm text-text-secondary list-disc list-inside">
            <li>Use &ldquo;Limited Stock&rdquo; to create urgency.</li>
<li>For batches, fill out one product and use it as a template.</li>
<li>Update info anytime from the &quot;Manage&quot; section.</li>

            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryManagementSection;
