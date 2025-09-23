import React, { useState, useEffect } from 'react';
import type { View, ExpenseCategory, Transaction } from '../types';
import { useLedger } from '../context/LedgerContext';
import { EXPENSE_CATEGORIES } from '../constants';
import { ArrowLeftIcon } from '../components/Icons';

interface EditExpenseScreenProps {
  navigate: (view: View, transaction?: Transaction, date?: Date) => void;
  transaction: Transaction;
  selectedDate: Date;
}

const EditExpenseScreen: React.FC<EditExpenseScreenProps> = ({ navigate, transaction, selectedDate }) => {
  const { updateTransaction } = useLedger();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (transaction) {
      setSelectedCategory(transaction.category || null);
      setAmount(transaction.amount.toString());
      setDescription(transaction.description || '');
    }
  }, [transaction]);
  
  const handleUpdateExpense = async () => {
    const numericAmount = parseFloat(amount);
    if (!selectedCategory || isNaN(numericAmount) || numericAmount <= 0 || isSaving) {
      return;
    }
    setIsSaving(true);
    try {
      await updateTransaction(transaction.id, { 
        amount: numericAmount, 
        category: selectedCategory, 
        description 
      });
      navigate('dashboard', undefined, selectedDate);
    } catch (error) {
      console.error('Error updating expense:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex items-center space-x-4 border-b border-accent/20">
        <button onClick={() => navigate('dashboard', undefined, selectedDate)} className="p-2 -ml-2">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="font-heading text-xl font-medium">Editar Gasto</h1>
      </header>
      
      <div className="p-4 space-y-6 flex-grow">
        <div>
          <label className="block font-heading text-lg mb-2">Categoría</label>
          <div className="grid grid-cols-2 gap-3">
            {EXPENSE_CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`p-3 rounded-lg text-center font-semibold transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-expense text-white shadow-md'
                    : 'bg-expense/20 hover:bg-expense/40'
                }`}
                style={{minHeight: '48px'}}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {selectedCategory && (
            <div className="space-y-4 animate-fade-in">
                <h2 className="font-heading text-lg">Detalles para <span className="text-accent font-bold">{selectedCategory}</span></h2>
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-text-main/80 mb-1">Monto (S/)</label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-mono text-text-main/50">S/</span>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                            className="w-full pl-10 pr-4 py-3 font-mono text-xl rounded-lg border border-accent/30 focus:ring-accent focus:border-accent bg-white text-text-main placeholder:text-text-main/50"
                            inputMode="decimal"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-text-main/80 mb-1">Descripción (opcional)</label>
                    <input
                        type="text"
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ej: Harina y azúcar"
                        className="w-full px-4 py-3 rounded-lg border border-accent/30 focus:ring-accent focus:border-accent bg-white text-text-main placeholder:text-text-main/50"
                    />
                </div>
            </div>
        )}
      </div>

        <div className="p-4 mt-auto">
            <button
                onClick={handleUpdateExpense}
                disabled={!selectedCategory || !amount || parseFloat(amount) <= 0 || isSaving}
                className="w-full bg-expense text-white font-bold py-4 rounded-lg shadow-md disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                style={{ minHeight: '48px' }}
            >
                {isSaving ? 'Guardando...' : 'Actualizar Gasto'}
            </button>
        </div>
    </div>
  );
};

export default EditExpenseScreen;
