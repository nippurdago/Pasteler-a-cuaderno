import React, { useState, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LedgerProvider } from './context/LedgerContext';
import DashboardScreen from './screens/DashboardScreen';
import AddSaleScreen from './screens/AddSaleScreen';
import AddExpenseScreen from './screens/AddExpenseScreen';
import ProductsScreen from './screens/ProductsScreen';
import SummaryScreen from './screens/SummaryScreen';
import LoginScreen from './screens/LoginScreen';
import BottomNav from './components/BottomNav';
import type { View, Transaction } from './types';
import ExpenseDetailScreen from './screens/ExpenseDetailScreen';
import ProductCategoryScreen from './screens/ProductCategoryScreen';
import IncomeDetailScreen from './screens/IncomeDetailScreen';
import EditExpenseScreen from './screens/EditExpenseScreen';
import EditSaleScreen from './screens/EditSaleScreen';

const App: React.FC = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

const LoadingSpinner: React.FC = () => (
    <div className="min-h-screen w-full flex justify-center items-center bg-background">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
    </div>
);

const AppContent: React.FC = () => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }

  if (!session) {
    return <LoginScreen />;
  }
  
  return <AuthenticatedApp />;
};

const AuthenticatedApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const navigate = useCallback((view: View, transaction?: Transaction, date?: Date) => {
    if (transaction) {
      setEditingTransaction(transaction);
    }
    if (date) {
      setSelectedDate(date);
    }
    setCurrentView(view);
    window.scrollTo(0, 0);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'addSale':
        return <AddSaleScreen navigate={navigate} selectedDate={selectedDate} />;
      case 'addExpense':
        return <AddExpenseScreen navigate={navigate} selectedDate={selectedDate} />;
      case 'editSale':
        return <EditSaleScreen navigate={navigate} transaction={editingTransaction!} selectedDate={selectedDate} />;
      case 'editExpense':
        return <EditExpenseScreen navigate={navigate} transaction={editingTransaction!} selectedDate={selectedDate} />;
      case 'products':
        return <ProductsScreen navigate={navigate} />;
      case 'summary':
        return <SummaryScreen navigate={navigate} />;
      case 'expenseDetail':
        return <ExpenseDetailScreen navigate={navigate} />;
      case 'productCategories':
        return <ProductCategoryScreen navigate={navigate} />;
      case 'incomeDetail':
        return <IncomeDetailScreen navigate={navigate} />;
      case 'dashboard':
      default:
        return (
          <DashboardScreen
            navigate={navigate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
          />
        );
    }
  };

  return (
    <LedgerProvider>
      <div className="min-h-screen w-full max-w-md mx-auto flex flex-col relative overflow-x-hidden">
        <main className="flex-grow pb-24">
            {renderView()}
        </main>
        <BottomNav currentView={currentView} navigate={navigate} />
      </div>
    </LedgerProvider>
  );
};

export default App;
