import React, { useState, useMemo } from 'react';
import type { View } from '../types';
import { useLedger } from '../context/LedgerContext';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, CurrencyIcon, CartIcon, ChevronDownIcon, TrashIcon, CupcakeIcon, ChevronUpIcon, LogOutIcon } from '../components/Icons';
import StatCard from '../components/StatCard';

// Header Component
interface HeaderProps {
  onProductsClick: () => void;
  onLogoutClick: () => void;
}
const Header: React.FC<HeaderProps> = ({ onProductsClick, onLogoutClick }) => {
  const date = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex justify-between items-center border-b border-accent/20">
      <div>
        <h1 className="font-heading text-xl font-medium capitalize">Mi Pastelería</h1>
        <p className="text-sm text-text-main/70">{date}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button onClick={onProductsClick} className="p-2 rounded-full hover:bg-accent/20 transition-colors" aria-label="Gestionar productos">
          <CupcakeIcon className="w-6 h-6 text-accent" />
        </button>
        <button onClick={onLogoutClick} className="p-2 rounded-full hover:bg-accent/20 transition-colors" aria-label="Cerrar sesión">
            <LogOutIcon className="w-6 h-6 text-accent" />
        </button>
      </div>
    </header>
  );
};

// FAB Component
interface FABProps {
  onAddSale: () => void;
  onAddExpense: () => void;
}
const FloatingActionButton: React.FC<FABProps> = ({ onAddSale, onAddExpense }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleFabClick = () => setIsOpen(!isOpen);

  return (
    <div className="fixed bottom-20 right-6 z-20">
      <div className={`flex flex-col items-center space-y-3 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
        <button onClick={onAddSale} className="bg-white p-3 rounded-full shadow-lg flex items-center space-x-2 text-sm text-text-main hover:bg-gray-100 transition-colors">
            <span className="font-medium">Anotar Venta</span>
            <CurrencyIcon className="w-6 h-6 text-income" />
        </button>
        <button onClick={onAddExpense} className="bg-white p-3 rounded-full shadow-lg flex items-center space-x-2 text-sm text-text-main hover:bg-gray-100 transition-colors">
            <span className="font-medium">Anotar Gasto</span>
            <CartIcon className="w-6 h-6 text-expense" />
        </button>
      </div>
      <button
        onClick={handleFabClick}
        className="bg-income text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center mt-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-income/50"
        style={{ minHeight: '48px', minWidth: '48px' }}
        aria-expanded={isOpen}
      >
        <PlusIcon className={`w-8 h-8 transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`} />
      </button>
    </div>
  );
};

// History Panel
interface HistoryPanelProps {
  onClose: () => void;
}
const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose }) => {
    const { transactions, deleteTransaction } = useLedger();
    const today = new Date().toISOString().split('T')[0];
    const todaysTransactions = transactions.filter(t => t.date.startsWith(today));

    return (
        <div className="p-4 pt-2">
            <button onClick={onClose} className="w-full flex justify-center items-center text-text-main/60 py-2" aria-label="Cerrar historial">
                <ChevronUpIcon className="w-6 h-6" />
            </button>
            <h2 className="font-heading text-lg text-center mb-4">Registros de Hoy</h2>
            <div className="space-y-3">
                {todaysTransactions.length === 0 ? (
                    <p className="text-center text-text-main/60">No hay registros para hoy.</p>
                ) : (
                    todaysTransactions.map(t => (
                        <div key={t.id} className="bg-white/50 p-3 rounded-lg flex items-center justify-between shadow-sm">
                            <div className="flex items-center space-x-3">
                                <div className={`w-2 h-10 rounded-full ${t.type === 'sale' ? 'bg-income' : 'bg-expense'}`}></div>
                                <div>
                                    <p className="font-bold capitalize">{t.category || t.items?.map(i => i.productName).join(', ')}</p>
                                    <p className="text-xs text-text-main/60">{new Date(t.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <p className={`font-mono font-bold ${t.type === 'sale' ? 'text-income' : 'text-expense'}`}>
                                    {t.type === 'sale' ? '+' : '-'}S/ {t.amount.toFixed(2)}
                                </p>
                                <button onClick={async () => await deleteTransaction(t.id)} className="text-text-main/50 hover:text-red-500" aria-label={`Eliminar transacción ${t.id}`}>
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

interface DashboardScreenProps {
  navigate: (view: View) => void;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigate }) => {
  const { transactions } = useLedger();
  const { signOut } = useAuth();
  const [isHistoryVisible, setHistoryVisible] = useState(false);

  const dailyTotals = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let sales = 0;
    let expenses = 0;

    transactions
      .filter(t => t.date.startsWith(today))
      .forEach(t => {
        if (t.type === 'sale') {
          sales += t.amount;
        } else {
          expenses += t.amount;
        }
      });
    
    return { sales, expenses, balance: sales - expenses };
  }, [transactions]);
  
  const balanceColor = dailyTotals.balance >= 0 ? 'bg-background' : 'bg-expense/20';

  return (
    <div className="flex flex-col h-full">
      <Header onProductsClick={() => navigate('products')} onLogoutClick={signOut} />
      
      <div className="p-4 space-y-4 flex-grow">
        <StatCard title="Vendí Hoy" amount={dailyTotals.sales} colorClass="bg-income/20" />
        <StatCard title="Gasté Hoy" amount={dailyTotals.expenses} colorClass="bg-expense/20" />
        <StatCard title="Balance" amount={dailyTotals.balance} colorClass={balanceColor} />
      </div>

      {!isHistoryVisible && (
        <div className="w-full flex justify-center py-2">
            <button onClick={() => setHistoryVisible(true)} className="flex flex-col items-center text-text-main/60 animate-bounce" aria-label="Abrir historial">
                <span>Historial de Hoy</span>
                <ChevronDownIcon className="w-6 h-6" />
            </button>
        </div>
      )}
      
      {isHistoryVisible && <HistoryPanel onClose={() => setHistoryVisible(false)} />}
      
      <FloatingActionButton 
        onAddSale={() => navigate('addSale')}
        onAddExpense={() => navigate('addExpense')}
      />
    </div>
  );
};

export default DashboardScreen;
