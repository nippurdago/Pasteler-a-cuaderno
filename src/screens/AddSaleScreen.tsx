import React, { useState, useMemo } from 'react';
import type { View, SaleItem } from '../types';
import { useLedger } from '../context/LedgerContext';
import { ArrowLeftIcon } from '../components/Icons';

interface QuantityControlProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
}
const QuantityControl: React.FC<QuantityControlProps> = ({ quantity, onIncrease, onDecrease }) => (
    <div className="flex items-center space-x-3">
        <button onClick={onDecrease} className="bg-accent/30 text-text-main w-8 h-8 rounded-full font-bold text-lg" style={{minWidth: '32px', minHeight: '32px'}}>-</button>
        <span className="font-mono text-xl w-10 text-center">{quantity}</span>
        <button onClick={onIncrease} className="bg-income text-white w-8 h-8 rounded-full font-bold text-lg" style={{minWidth: '32px', minHeight: '32px'}}>+</button>
    </div>
);

interface AddSaleScreenProps {
  navigate: (view: View) => void;
}

const AddSaleScreen: React.FC<AddSaleScreenProps> = ({ navigate }) => {
  const { products, addSale } = useLedger();
  const visibleProducts = useMemo(() => 
    products.filter(p => p.isVisible).sort((a, b) => a.sortOrder - b.sortOrder).slice(0, 10),
    [products]
  );
  
  const [saleItems, setSaleItems] = useState<Record<string, number>>({});

  const handleQuantityChange = (productId: string, delta: number) => {
    setSaleItems(prev => {
      const currentQty = prev[productId] || 0;
      const newQty = Math.max(0, currentQty + delta);
      return { ...prev, [productId]: newQty };
    });
  };

  const total = useMemo(() => {
    return visibleProducts.reduce((sum, product) => {
      const quantity = saleItems[product.id] || 0;
      return sum + (quantity * product.price);
    }, 0);
  }, [saleItems, visibleProducts]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSale = async () => {
    if (total === 0 || isSaving) return;

    setIsSaving(true);
    const itemsForTransaction: SaleItem[] = visibleProducts.map(p => ({
        productId: p.id,
        productName: p.name,
        quantity: saleItems[p.id] || 0,
        unitPrice: p.price
    })).filter(item => item.quantity > 0);

    await addSale(itemsForTransaction, total);
    setIsSaving(false);
    navigate('dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen">
        <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex items-center space-x-4 border-b border-accent/20">
            <button onClick={() => navigate('dashboard')} className="p-2 -ml-2">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="font-heading text-xl font-medium">Anotar Venta</h1>
        </header>

        <div className="p-4 space-y-3 pb-28">
            {visibleProducts.map(product => {
                const quantity = saleItems[product.id] || 0;
                const subtotal = quantity * product.price;

                return (
                    <div key={product.id} className="bg-white/60 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-3 sm:space-y-0">
                        <div>
                            <p className="font-bold text-lg">{product.name}</p>
                            <p className="font-mono text-text-main/70">S/ {product.price.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center space-x-4 w-full sm:w-auto justify-between">
                            <QuantityControl 
                                quantity={quantity}
                                onIncrease={() => handleQuantityChange(product.id, 1)}
                                onDecrease={() => handleQuantityChange(product.id, -1)}
                            />
                            <p className="font-mono text-lg font-bold w-20 text-right">S/ {subtotal.toFixed(2)}</p>
                        </div>
                    </div>
                );
            })}
        </div>

        <footer className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-background border-t border-accent/20 p-4">
            <div className="flex justify-between items-center mb-4">
                <span className="font-heading text-lg">Total General:</span>
                <span className="font-mono text-2xl font-bold">S/ {total.toFixed(2)}</span>
            </div>
            <button
                onClick={handleSaveSale}
                disabled={total === 0}
                className="w-full bg-income text-white font-bold py-4 rounded-lg shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                style={{ minHeight: '48px' }}
            >
                Guardar Venta
            </button>
        </footer>
    </div>
  );
};

export default AddSaleScreen;
