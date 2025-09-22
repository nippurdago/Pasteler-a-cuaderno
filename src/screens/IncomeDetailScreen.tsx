import React from 'react';
import type { View } from '../types';
import { useLedger } from '../context/LedgerContext';
import { ArrowLeftIcon } from '../components/Icons';

const IncomeDetailScreen: React.FC<{ navigate: (view: View) => void }> = ({ navigate }) => {
  const { transactions, period, products, productCategories } = useLedger();

  const categoryMap = new Map(productCategories.map(cat => [cat.id, cat.name]));
  const productToCategoryMap = new Map(products.map(p => [p.id, p.category_id]));

  const categoryTotals = new Map<string, number>();
  productCategories.forEach(cat => categoryTotals.set(cat.name, 0));
  categoryTotals.set('Sin Categoría', 0); // Add uncategorized group

  const [startYear, startMonth, startDay] = period.startDate.split('-').map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);
  startDate.setHours(0, 0, 0, 0);

  const [endYear, endMonth, endDay] = period.endDate.split('-').map(Number);
  const endDate = new Date(endYear, endMonth - 1, endDay);
  endDate.setHours(23, 59, 59, 999);

  transactions
    .filter(t => {
      const tDate = new Date(t.date);
      return t.type === 'sale' && tDate >= startDate && tDate <= endDate;
    })
    .forEach(sale => {
      sale.items?.forEach(item => {
        const category_id = productToCategoryMap.get(item.productId);
        let categoryName = category_id ? categoryMap.get(category_id) : 'Sin Categoría';
        
        if (!categoryName) {
            categoryName = 'Sin Categoría';
        }

        const currentTotal = categoryTotals.get(categoryName) || 0;
        categoryTotals.set(categoryName, currentTotal + (item.quantity * item.unitPrice));
      });
    });

    const finalTotals = Array.from(categoryTotals.entries()).filter(([, total]) => total > 0);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex items-center space-x-4 border-b border-secondary/20">
        <button onClick={() => navigate('summary')} className="p-2 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="font-heading text-xl font-medium">Desglose de Ingresos</h1>
      </header>

      <div className="p-4 space-y-3">
        <p className="text-sm text-text-main/70">
          Total de ingresos por categoría de producto para el período del {startDate.toLocaleDateString()} al {endDate.toLocaleDateString()}.
        </p>
        
        <div className="bg-white/60 rounded-lg shadow-sm">
          <ul className="divide-y divide-gray-200">
            {finalTotals.map(([categoryName, total]) => (
              <li key={categoryName} className="px-4 py-3 flex justify-between items-center">
                <span className="text-text-main">{categoryName}</span>
                <span className="font-mono font-semibold text-income">
                  S/ {total.toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default IncomeDetailScreen;
