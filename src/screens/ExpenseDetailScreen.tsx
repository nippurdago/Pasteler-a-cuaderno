
import React from 'react';
import type { View } from '../types';
import { useLedger } from '../context/LedgerContext';
import { ArrowLeftIcon } from '../components/Icons';
import { EXPENSE_CATEGORIES } from '../constants';
import { ExpenseCategory } from '../types';

const ExpenseDetailScreen: React.FC<{ navigate: (view: View) => void }> = ({ navigate }) => {
  const { transactions, period } = useLedger();

  const categoryTotals = new Map<ExpenseCategory, number>();
  EXPENSE_CATEGORIES.forEach(cat => categoryTotals.set(cat, 0));

  const [startYear, startMonth, startDay] = period.startDate.split('-').map(Number);
  const startDate = new Date(startYear, startMonth - 1, startDay);
  startDate.setHours(0, 0, 0, 0);

  const [endYear, endMonth, endDay] = period.endDate.split('-').map(Number);
  const endDate = new Date(endYear, endMonth - 1, endDay);
  endDate.setHours(23, 59, 59, 999);

  const expenses = transactions.filter(t => t.type === 'expense');

  expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= startDate && expenseDate <= endDate;
    })
    .forEach(expense => {
      if (expense.category) {
        const currentTotal = categoryTotals.get(expense.category) || 0;
        categoryTotals.set(expense.category, currentTotal + expense.amount);
      }
    });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex items-center space-x-4 border-b border-secondary/20">
        <button onClick={() => navigate('summary')} className="p-2 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="font-heading text-xl font-medium">Desglose de Gastos</h1>
      </header>

      <div className="p-4 space-y-3">
        <p className="text-sm text-text-main/70">
          Total de gastos por categoría para el período del {startDate.toLocaleDateString()} al {endDate.toLocaleDateString()}.
        </p>
        
        <div className="bg-white/60 rounded-lg shadow-sm">
          <ul className="divide-y divide-gray-200">
            {EXPENSE_CATEGORIES.map(category => (
              <li key={category} className="px-4 py-3 flex justify-between items-center">
                <span className="text-text-main">{category}</span>
                <span className="font-mono font-semibold text-expense">
                  S/ {(categoryTotals.get(category) || 0).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailScreen;
