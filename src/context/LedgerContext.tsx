import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './AuthContext';
import type { Product, Transaction, SaleItem, ExpenseCategory } from '../types';

interface LedgerContextType {
  products: Product[];
  transactions: Transaction[];
  addSale: (items: SaleItem[], total: number) => Promise<void>;
  addExpense: (amount: number, category: ExpenseCategory, description?: string) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateProducts: (products: Product[]) => Promise<void>;
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  showToast: (message: string) => void;
  loading: boolean;
}

const LedgerContext = createContext<LedgerContextType | undefined>(undefined);

export const useLedger = () => {
  const context = useContext(LedgerContext);
  if (!context) {
    throw new Error('useLedger must be used within a LedgerProvider');
  }
  return context;
};

const Toast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-text-main text-white py-2 px-6 rounded-full shadow-lg text-sm z-50">
      {message}
    </div>
  );
};

export const LedgerProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
  }, []);

  const fetchInitialData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id);
      
      if (productsError) throw productsError;
      setProducts(productsData || []);

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (transactionsError) throw transactionsError;
      setTransactions(transactionsData || []);

    } catch (error: any) {
      console.error('Error fetching data:', error.message);
      showToast('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const addSale = async (items: SaleItem[], total: number) => {
    if (!user) return;
    const newSale = {
      type: 'sale',
      amount: total,
      items: items.filter(item => item.quantity > 0),
      user_id: user.id,
    };
    const { data, error } = await supabase.from('transactions').insert(newSale).select();
    if (error) {
      console.error('Error adding sale:', error.message);
      showToast('Error al guardar la venta');
    } else if (data) {
      setTransactions(prev => [data[0], ...prev]);
      showToast('Venta guardada');
    }
  };

  const addExpense = async (amount: number, category: ExpenseCategory, description?: string) => {
    if (!user) return;
    const newExpense = {
      type: 'expense',
      amount,
      category,
      description,
      user_id: user.id,
    };
    const { data, error } = await supabase.from('transactions').insert(newExpense).select();
    if (error) {
      console.error('Error adding expense:', error.message);
      showToast('Error al guardar el gasto');
    } else if (data) {
      setTransactions(prev => [data[0], ...prev]);
      showToast('Gasto guardado');
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase.from('transactions').delete().match({ id });
    if (error) {
      console.error('Error deleting transaction:', error.message);
      showToast('Error al eliminar');
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
      showToast('Registro eliminado');
    }
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!user) return;
    const productWithUserId = { ...product, user_id: user.id };
    const { data, error } = await supabase.from('products').insert(productWithUserId).select();
    if (error) {
      console.error('Error adding product:', error.message);
      showToast('Error al agregar el producto');
    } else if (data) {
      setProducts(prev => [...prev, data[0]]);
      showToast('Producto agregado');
    }
  };

  const updateProducts = async (updatedProducts: Product[]) => {
    if (!user) return;
  
    const productsToUpsert = updatedProducts.map(p => ({ ...p, user_id: user.id }));
  
    const { data, error } = await supabase.from('products').upsert(productsToUpsert).select();
  
    if (error) {
      console.error('Error updating products:', error.message);
      showToast('Error al actualizar los productos');
    } else if (data) {
      setProducts(data);
      showToast('Productos actualizados');
    }
  };
  
  const value = {
    products,
    transactions,
    addSale,
    addExpense,
    deleteTransaction,
    updateProducts,
    addProduct,
    showToast,
    loading,
  };

  return (
    <LedgerContext.Provider value={value}>
      {children}
      {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
    </LedgerContext.Provider>
  );
};