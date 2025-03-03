import React from 'react';
import { TagIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import CategoryManagement from '../components/CategoryManagement';

interface CategoryManagementSectionProps {
  isCategoryManagementOpen: boolean;
  setIsCategoryManagementOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CategoryManagementSection: React.FC<CategoryManagementSectionProps> = ({ isCategoryManagementOpen, setIsCategoryManagementOpen }) => {
  return (
    <section className="mb-8 bg-card-background p-4 sm:p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center cursor-pointer bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors" onClick={() => setIsCategoryManagementOpen(!isCategoryManagementOpen)}>
        <div className="flex items-center gap-2">
          <TagIcon className="w-5 h-5 text-text-primary" />
          <h2 className="text-xl font-semibold text-text-primary">Business Category</h2>
        </div>
        {isCategoryManagementOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
      </div>
      {isCategoryManagementOpen && (
        <div className="mt-4">
          <CategoryManagement />
        </div>
      )}
    </section>
  );
};

export default CategoryManagementSection;