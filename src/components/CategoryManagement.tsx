'use client';

import { useState, useEffect } from 'react';
import { getCategories, addCategory, updateCategory, deleteCategory } from '../lib/db';

const CategoryManagement = () => {
  const [categories, setCategories] = useState<{ id: string, name: string }[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ id: string, name: string } | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    };
    fetchCategories();
  }, []);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      await addCategory(newCategory.trim());
      setNewCategory('');
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    }
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && editingCategory.name.trim()) {
      await updateCategory(editingCategory.id, editingCategory.name.trim());
      setEditingCategory(null);
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    await deleteCategory(id);
    const fetchedCategories = await getCategories();
    setCategories(fetchedCategories);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Manage Categories</h2>
      <div className="space-y-4">
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="New Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="flex-grow border p-2 rounded"
          />
          <button onClick={handleAddCategory} className="p-2 bg-blue-500 text-white rounded">
            Add
          </button>
        </div>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.id} className="border p-4 rounded-lg flex justify-between items-center">
              {editingCategory && editingCategory.id === category.id ? (
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="flex-grow border p-2 rounded"
                />
              ) : (
                <span>{category.name}</span>
              )}
              <div className="flex space-x-2">
                {editingCategory && editingCategory.id === category.id ? (
                  <button onClick={handleUpdateCategory} className="p-2 bg-green-500 text-white rounded">
                    Save
                  </button>
                ) : (
                  <button onClick={() => setEditingCategory(category)} className="p-2 bg-yellow-500 text-white rounded">
                    Edit
                  </button>
                )}
                <button onClick={() => handleDeleteCategory(category.id)} className="p-2 bg-red-500 text-white rounded">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryManagement;