import React, { useState, useMemo } from 'react';
import type { View, Product, ProductCategory } from '../types';
import { useLedger } from '../context/LedgerContext';
import { ArrowLeftIcon, TrashIcon, PlusIcon, EditIcon } from '../components/Icons';

const ProductListItem: React.FC<{
  product: Product;
  categoryName: string;
  onEdit: (product: Product) => void;
  onToggleVisibility: (id: string, isVisible: boolean) => void;
  onDelete: (id: string) => void;
}> = ({ product, categoryName, onEdit, onToggleVisibility, onDelete }) => {
  return (
    <div className="bg-white/60 p-3 rounded-lg shadow-sm flex items-center justify-between">
      <div>
        <p className="font-bold">{product.name}</p>
        <div className='flex items-center gap-2'>
          <p className="font-mono text-sm text-text-main/70">S/ {product.price.toFixed(2)}</p>
          {categoryName && <p className="text-xs bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-full">{categoryName}</p>}
        </div>
      </div>
      <div className="flex items-center space-x-2">
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
            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${product.isVisible ? 'translate-x-6 bg-text-main' : ''}`}></div>
          </div>
        </label>
        <button onClick={() => onEdit(product)} className="p-2 text-text-main/50 hover:text-accent transition-colors">
          <EditIcon className="w-5 h-5" />
        </button>
        <button onClick={() => onDelete(product.id)} className="p-2 text-text-main/50 hover:text-red-500 transition-colors">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

const ProductForm: React.FC<{
    product?: Product | null;
    categories: ProductCategory[];
    onSave: (productData: Omit<Product, 'id'> | Product) => void;
    onCancel: () => void;
}> = ({ product, categories, onSave, onCancel }) => {
    const [name, setName] = useState(product?.name || '');
    const [price, setPrice] = useState(product?.price.toString() || '');
    const [category_id, setCategoryId] = useState(product?.category_id || '');

    const canSave = name.trim() !== '' && parseFloat(price) > 0 && category_id !== '';

    const handleSave = () => {
        if(canSave) {
            const productData = {
                name: name.trim(),
                price: parseFloat(price),
                category_id: category_id,
                // Retain other properties if editing
                ...(product ? { id: product.id, isVisible: product.isVisible, sortOrder: product.sortOrder } : {}),
            };
            onSave(productData as Omit<Product, 'id'> | Product);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center p-4">
            <div className="bg-background rounded-lg p-6 w-full max-w-sm space-y-4">
                <h2 className="font-heading text-xl">{product ? 'Editar' : 'Nuevo'} Producto</h2>
                <div>
                    <label htmlFor="prod-name" className="block text-sm font-medium mb-1">Nombre</label>
                    <input id="prod-name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-secondary/30 rounded-md" />
                </div>
                <div>
                    <label htmlFor="prod-price" className="block text-sm font-medium mb-1">Precio (S/)</label>
                    <input id="prod-price" type="number" value={price} onChange={e => setPrice(e.target.value)} inputMode="decimal" className="w-full px-3 py-2 border border-secondary/30 rounded-md" />
                </div>
                <div>
                    <label htmlFor="prod-cat" className="block text-sm font-medium mb-1">Categoría</label>
                    <select id="prod-cat" value={category_id} onChange={e => setCategoryId(e.target.value)} className="w-full px-3 py-2 border border-secondary/30 rounded-md bg-white">
                        <option value="" disabled>Selecciona una categoría</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <button onClick={onCancel} className="px-4 py-2 rounded-md bg-gray-200 text-text-main">Cancelar</button>
                    <button onClick={handleSave} disabled={!canSave} className="px-4 py-2 rounded-md bg-text-main text-white disabled:bg-gray-300">Guardar</button>
                </div>
            </div>
        </div>
    );
};

const ProductsScreen: React.FC<{ navigate: (view: View) => void }> = ({ navigate }) => {
  const { products, productCategories, updateProducts, addProduct, deleteProduct } = useLedger();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const categoryMap = useMemo(() => 
    new Map(productCategories.map(cat => [cat.id, cat.name])), 
  [productCategories]);

  const handleToggleVisibility = (id: string, isVisible: boolean) => {
    const product = products.find(p => p.id === id);
    if (product) {
        updateProducts([{ ...product, isVisible }]);
    }
  };

  const handleDelete = (id: string) => {
    if(window.confirm('¿Seguro que quieres eliminar este producto?')) {
        deleteProduct(id);
    }
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id'> | Product) => {
    if ('id' in productData) {
      // Update existing product
      await updateProducts([productData]);
    } else {
      // Add new product
      const newProduct: Omit<Product, 'id'> = {
          name: productData.name,
          price: productData.price,
          category_id: productData.category_id,
          isVisible: true,
          sortOrder: (products.length > 0 ? Math.max(...products.map(p => p.sortOrder)) : 0) + 1
      };
      await addProduct(newProduct);
    }
    setEditingProduct(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex items-center justify-between border-b border-secondary/20">
        <div className='flex items-center space-x-4'>
            <button onClick={() => navigate('dashboard')} className="p-2 -ml-2">
              <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="font-heading text-xl font-medium">Gestionar Productos</h1>
        </div>
        <button onClick={() => navigate('productCategories')} className="text-sm bg-accent/20 text-accent font-semibold px-3 py-1.5 rounded-md">
            Categorías
        </button>
      </header>

      <div className="p-4 space-y-3 pb-24">
        <p className="text-sm text-text-main/70">
            Aquí puedes editar tus productos. Solo los productos "Visibles" aparecerán en la pantalla de ventas.
        </p>
        {products.sort((a,b) => a.sortOrder - b.sortOrder).map(product => (
          <ProductListItem
            key={product.id}
            product={product}
            categoryName={product.category_id ? categoryMap.get(product.category_id) || '' : ''}
            onEdit={setEditingProduct}
            onToggleVisibility={handleToggleVisibility}
            onDelete={handleDelete}
          />
        ))}
      </div>

        <div className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-background p-4 border-t border-secondary/20">
             <button
                onClick={() => setEditingProduct({} as Product)} // Open form for new product
                className="w-full bg-text-main text-white font-bold py-4 rounded-lg shadow-md flex items-center justify-center space-x-2"
                style={{ minHeight: '48px' }}
            >
                <PlusIcon />
                <span>Agregar Producto</span>
            </button>
        </div>

      {editingProduct && <ProductForm product={editingProduct.id ? editingProduct : null} categories={productCategories} onSave={handleSaveProduct} onCancel={() => setEditingProduct(null)} />}
    </div>
  );
};

export default ProductsScreen;

