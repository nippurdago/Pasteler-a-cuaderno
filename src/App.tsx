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
import type { View } from './types';

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

  const navigate = useCallback((view: View) => {
    setCurrentView(view);
    window.scrollTo(0, 0);
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'addSale':
        return <AddSaleScreen navigate={navigate} />;
      case 'addExpense':
        return <AddExpenseScreen navigate={navigate} />;
      case 'products':
        return <ProductsScreen navigate={navigate} />;
      case 'summary':
        return <SummaryScreen />;
      case 'dashboard':
      default:
        return (
          <DashboardScreen
            navigate={navigate}
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
