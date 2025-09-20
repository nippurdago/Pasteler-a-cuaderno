import React, { useState } from 'react';
import type { View, Product } from '../types';
import { useLedger } from '../context/LedgerContext';
import { ArrowLeftIcon, TrashIcon, PlusIcon } from '../components/Icons';

const ProductListItem: React.FC<{
  product: Product;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  onDelete: (id: string) => void;
}> = ({ product, onToggleVisibility, onDelete }) => {
  return (
    <div className="bg-white/60 p-3 rounded-lg shadow-sm flex items-center justify-between">
      <div>
        <p className="font-bold">{product.name}</p>
        <p className="font-mono text-sm text-text-main/70">S/ {product.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center space-x-3">
        <label htmlFor={`vis-${product.id}`} className="flex items-center cursor-pointer">
          <span className="mr-2 text-sm">Visible</span>
          <div className="relative">
            <input
              type="checkbox"
              id={`vis-${product.id}`}
              className="sr-only"
              checked={product.isVisible}
              onChange={(e) => onToggleVisibility(product.id, e.target.checked)}
            />
            <div className="block bg-gray-300 w-12 h-6 rounded-full"></div>
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${product.isVisible ? 'translate-x-6 bg-primary' : ''}`}></div>
          </div>
        </label>
        <button onClick={() => onDelete(product.id)} className="p-2 text-text-main/50 hover:text-red-500 transition-colors">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ProductForm: React.FC<{
    onSave: (name: string, price: number) => void;
    onCancel: () => void;
}> = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const canSave = name.trim() !== '' && parseFloat(price) > 0;

    const handleSave = () => {
        if(canSave) {
            onSave(name, parseFloat(price));
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-sm space-y-4">
                <h2 className="font-heading text-xl">Nuevo Producto</h2>
                <div>
                    <label htmlFor="prod-name" className="block text-sm font-medium mb-1">Nombre</label>
                    <input id="prod-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-secondary/30 rounded-md" />
                </div>
                <div>
                    <label htmlFor="prod-price" className="block text-sm font-medium mb-1">Precio (S/)</label>
                    <input id="prod-price" type="number" value={price} onChange={e => setPrice(e.target.value)} inputMode="decimal" className="w-full px-3 py-2 border border-secondary/30 rounded-md" />
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200">Cancelar</button>
                    <button onClick={handleSave} disabled={!canSave} className="px-4 py-2 rounded-md bg-primary text-white disabled:bg-gray-300">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const ProductsScreen: React.FC<{ navigate: (view: View) => void }> = ({ navigate }) => {
  const { products, updateProducts, addProduct } = useLedger();
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    const updated = products.map(p => (p.id === id ? { ...p, isVisible } : p));
    updateProducts(updated);
  };

  const handleDelete = (id: string) => {
    if(window.confirm('¿Seguro que quieres eliminar este producto?')) {
        const updated = products.filter(p => p.id !== id);
        updateProducts(updated);
    }
  };

  const handleAddProduct = async (name: string, price: number) => {
    const newProduct: Omit<Product, 'id'> = {
        name,
        price,
        isVisible: true,
        sortOrder: (products.length > 0 ? Math.max(...products.map(p => p.sortOrder)) : 0) + 1
    };
    await addProduct(newProduct);
    setIsFormVisible(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex items-center space-x-4 border-b border-secondary/20">
        <button onClick={() => navigate('dashboard')} className="p-2 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="font-heading text-xl font-medium">Gestionar Productos</h1>
      </header>

      <div className="p-4 space-y-3 pb-24">
        <p className="text-sm text-text-main/70">
            Aquí puedes editar tus productos. Solo los productos "Visibles" aparecerán en la pantalla de ventas.
        </p>
        {products.sort((a,b) => a.sortOrder - b.sortOrder).map(product => (
          <ProductListItem
            key={product.id}
            product={product}
            onToggleVisibility={handleToggleVisibility}
            onDelete={handleDelete}
          />
        ))}
      </div>

        <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-background p-4 border-t border-secondary/20">
             <button
                onClick={() => setIsFormVisible(true)}
                className="w-full bg-secondary text-white font-bold py-4 rounded-lg shadow-md flex items-center justify-center space-x-2"
                style={{ minHeight: '48px' }}
            >
                <PlusIcon />
                <span>Agregar Producto</span>
            </button>
        </div>

      {isFormVisible && <ProductForm onSave={handleAddProduct} onCancel={() => setIsFormVisible(false)} />}
    </div>
  );
};

export default ProductsScreen;
