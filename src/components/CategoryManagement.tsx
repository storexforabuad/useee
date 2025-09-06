import { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../lib/db';
import { CategoryCache } from '../lib/categoryCache';
import { toast } from 'react-hot-toast';

const CategoryManagement = () => {
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories.');
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      toast.error('Category name cannot be empty.');
      return;
    }

    try {
      setIsAdding(true);
      await addCategory(newCategory.trim());
      setNewCategory('');
      await fetchCategories();
      CategoryCache.clear(); // Clear cache when adding
      toast.success('Category added successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error('Category name cannot be empty.');
      return;
    }

    try {
      await updateCategory(editingCategory.id, editingCategory.name.trim());
      setEditingCategory(null);
      await fetchCategories();
      CategoryCache.clear(); // Clear cache when updating
      toast.success('Category updated successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('Failed to update category.');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteCategory(id);
      await fetchCategories();
      CategoryCache.clear(); // Clear cache when deleting
      toast.success('Category deleted successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category.');
    }
  };

  const startEditing = (category: { id: string; name: string }) => {
    setEditingCategory(category);
  };

  const cancelEditing = () => {
    setEditingCategory(null);
  };

  return (
    <div className="bg-card-background p-6 rounded-xl shadow-md border border-border-color">
      <h2 className="text-xl font-semibold mb-4 text-text-primary">Manage Categories</h2>

      {/* Add Category Section */}
      <div className="mb-6">
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            className="flex-grow block w-full min-w-0 rounded-none rounded-l-md border border-border-color focus:ring-blue-500 focus:border-blue-500 text-sm text-text-primary bg-input-background p-2"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />
          <button
            type="button"
            className="relative inline-flex items-center space-x-2 rounded-r-md border border-border-color bg-button-primary px-4 py-2 text-sm font-medium text-text-primary hover:bg-button-primary-hover focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            onClick={handleAddCategory}
            disabled={isAdding}
          >
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Category List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((category) => (
          <div key={category.id} className="flex flex-col justify-between p-4 rounded-lg border border-border-color bg-input-background">
            {editingCategory?.id === category.id ? (
              <div>
                <input
                  type="text"
                  className="w-full rounded-md border border-border-color focus:ring-blue-500 focus:border-blue-500 text-sm text-text-primary bg-input-background p-2 mb-2"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                />
                <div className="flex justify-end">
                  <button
                    className="bg-button-success hover:bg-button-success-hover text-text-primary font-semibold py-2 px-4 rounded-md mr-2 transition-colors"
                    onClick={handleUpdateCategory}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md transition-colors"
                    onClick={cancelEditing}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-medium text-sm">{category.name}</span>
                <div className="flex">
                  <button
                    className="bg-button-primary hover:bg-button-primary-hover text-text-primary font-semibold py-2 px-4 rounded-md mr-2 transition-colors"
                    onClick={() => startEditing(category)}
                  >
                    Edit
                  </button>
                  <button
                    className="bg-button-danger hover:bg-button-danger-hover text-text-primary font-semibold py-2 px-4 rounded-md transition-colors"
                    onClick={() => handleDeleteCategory(category.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryManagement;