import React, { useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import type { View, ProductCategory } from '../types';
import { ArrowLeftIcon, TrashIcon, EditIcon, CheckIcon, XIcon } from '../components/Icons';

const ProductCategoryScreen: React.FC<{ navigate: (view: View) => void }> = ({ navigate }) => {
  const { productCategories, addProductCategory, updateProductCategory, deleteProductCategory } = useLedger();
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addProductCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
  };

  const handleStartEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    setEditingName(category.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditingName('');
  };

  const handleUpdateCategory = () => {
    if (editingCategory && editingName.trim()) {
      updateProductCategory(editingCategory.id, editingName.trim());
      handleCancelEdit();
    }
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('¿Seguro que quieres eliminar esta categoría? Los productos asociados no se eliminarán, pero perderán su categoría.')) {
      deleteProductCategory(id);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex items-center space-x-4 border-b border-secondary/20">
        <button onClick={() => navigate('products')} className="p-2 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="font-heading text-xl font-medium">Gestionar Categorías</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* Add new category form */}
        <div className="bg-white/60 p-4 rounded-xl shadow-sm">
          <h3 className="font-heading text-lg mb-3">Nueva Categoría</h3>
          <div className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Nombre de la categoría"
              className="flex-grow w-full px-3 py-2 border border-secondary/30 rounded-md"
            />
            <button onClick={handleAddCategory} className="px-4 py-2 rounded-md bg-text-main text-white disabled:bg-gray-300" disabled={!newCategoryName.trim()}>
              Agregar
            </button>
          </div>
        </div>

        {/* Category List */}
        <div className="bg-white/60 rounded-lg shadow-sm">
          <ul className="divide-y divide-gray-200">
            {productCategories.map(category => (
              <li key={category.id} className="px-4 py-3 flex justify-between items-center">
                {editingCategory?.id === category.id ? (
                  <div className='flex-grow flex items-center gap-2'>
                    <input type="text" value={editingName} onChange={e => setEditingName(e.target.value)} className='flex-grow px-2 py-1 border border-secondary/30 rounded-md' />
                    <button onClick={handleUpdateCategory} className='p-2 text-green-600'><CheckIcon /></button>
                    <button onClick={handleCancelEdit} className='p-2 text-red-500'><XIcon /></button>
                  </div>
                ) : (
                  <>
                    <span className="text-text-main">{category.name}</span>
                    <div className='flex items-center gap-2'>
                      <button onClick={() => handleStartEdit(category)} className='p-2 text-text-main/60 hover:text-accent'><EditIcon /></button>
                      <button onClick={() => handleDeleteCategory(category.id)} className='p-2 text-text-main/60 hover:text-red-500'><TrashIcon /></button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ProductCategoryScreen;
