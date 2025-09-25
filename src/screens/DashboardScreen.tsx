import React, { useState, useMemo } from 'react';
import type { View, Transaction } from '../types';
import { useLedger } from '../context/LedgerContext';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, CurrencyIcon, CartIcon, ChevronDownIcon, TrashIcon, CupcakeIcon, ChevronUpIcon, LogOutIcon, PencilIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/Icons';
import StatCard from '../components/StatCard';

// Header Component
interface HeaderProps {
  onProductsClick: () => void;
  onLogoutClick: () => void;
  currentDate: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onDateChange: (date: Date) => void;
  onTodayClick: () => void;
}
const Header: React.FC<HeaderProps> = ({ onProductsClick, onLogoutClick, currentDate, onPrevDay, onNextDay, onDateChange, onTodayClick }) => {
  const date = currentDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Format date for input (YYYY-MM-DD) in local time to avoid UTC shift
  const inputDate = (() => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Parse as local date (YYYY-MM-DD) to avoid timezone issues
    const [y, m, d] = e.target.value.split('-').map(Number);
    const newDate = new Date(y, (m || 1) - 1, d || 1);
    onDateChange(newDate);
  };

  const isToday = () => {
    const today = new Date();
    return currentDate.toDateString() === today.toDateString();
  };

  return (
    <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 border-b border-accent/20">
      <div className="flex justify-between items-center mb-3">
        <h1 className="font-heading text-xl font-medium capitalize">Mi Pastelería</h1>
        <div className="flex items-center space-x-2">
          <button onClick={onProductsClick} className="p-2 rounded-full hover:bg-accent/20 transition-colors" aria-label="Gestionar productos">
            <CupcakeIcon className="w-6 h-6 text-accent" />
          </button>
          <button onClick={onLogoutClick} className="p-2 rounded-full hover:bg-accent/20 transition-colors" aria-label="Cerrar sesión">
              <LogOutIcon className="w-6 h-6 text-accent" />
          </button>
        </div>
      </div>
      
      {/* Date Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button onClick={onPrevDay} className="p-1 rounded-full hover:bg-accent/20 transition-colors">
              <ChevronLeftIcon className="w-5 h-5 text-accent" />
            </button>
            <p className="text-sm text-text-main/70 min-w-0 flex-1 text-center">{date}</p>
            <button onClick={onNextDay} className="p-1 rounded-full hover:bg-accent/20 transition-colors">
              <ChevronRightIcon className="w-5 h-5 text-accent" />
            </button>
          </div>
          {!isToday() && (
            <button 
              onClick={onTodayClick} 
              className="ml-2 px-3 py-1 text-xs bg-accent/20 text-accent rounded-full hover:bg-accent/30 transition-colors"
            >
              Hoy
            </button>
          )}
        </div>
        
        {/* Date Input */}
        <div className="flex items-center space-x-2">
          <label htmlFor="datePicker" className="text-xs text-text-main/60 whitespace-nowrap">Seleccionar fecha:</label>
          <input 
            type="date" 
            id="datePicker"
            value={inputDate}
            onChange={handleDateInputChange}
            className="flex-1 text-xs p-2 border border-accent/30 rounded-md bg-white/60 focus:ring-2 focus:ring-accent/50 focus:border-accent transition-colors"
          />
        </div>
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
    <div className="fixed bottom-24 right-6 z-20 pointer-events-none">
      <div className={`flex flex-col items-center space-y-3 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 -translate-y-2'} pointer-events-auto`}>
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
        className="bg-income text-white w-16 h-16 rounded-full shadow-lg flex items-center justify-center mt-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-income/50 pointer-events-auto"
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
  onEdit: (transaction: Transaction) => void;
  currentDate: Date;
}
const HistoryPanel: React.FC<HistoryPanelProps> = ({ onClose, onEdit, currentDate }) => {
    const { transactions, deleteTransaction } = useLedger();
    
    const filteredTransactions = useMemo(() => {
        const dayStart = new Date(currentDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(currentDate);
        dayEnd.setHours(23, 59, 59, 999);

        return transactions.filter(t => {
            const transactionDate = new Date(t.date);
            return transactionDate >= dayStart && transactionDate <= dayEnd;
        });
    }, [transactions, currentDate]);

    return (
        <div className="p-4 pt-2 pb-28">
            <button onClick={onClose} className="w-full flex justify-center items-center text-text-main/60 py-2" aria-label="Cerrar historial">
                <ChevronUpIcon className="w-6 h-6" />
            </button>
            <h2 className="font-heading text-lg text-center mb-4">Historial del Día</h2>
            <div className="space-y-3">
                {filteredTransactions.length === 0 ? (
                    <p className="text-center text-text-main/60">No hay registros para este día.</p>
                ) : (
                    filteredTransactions.map(t => (
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
                                <button onClick={() => onEdit(t)} className="text-text-main/50 hover:text-blue-500" aria-label={`Editar transacción ${t.id}`}>
                                    <PencilIcon className="w-5 h-5" />
                                </button>
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
  navigate: (view: View, transaction?: Transaction, date?: Date) => void;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigate, selectedDate, setSelectedDate }) => {
  const { transactions } = useLedger();
  const { signOut } = useAuth();
  const [isHistoryVisible, setHistoryVisible] = useState(false);

  const handlePrevDay = () => {
    setSelectedDate((prevDate: Date) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });
  };

  const handleNextDay = () => {
    setSelectedDate((prevDate: Date) => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + 1);
      return newDate;
    });
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const handleTodayClick = () => {
    setSelectedDate(new Date());
  };

  const handleEdit = (transaction: Transaction) => {
    const view = transaction.type === 'sale' ? 'editSale' : 'editExpense';
    navigate(view, transaction, selectedDate);
  };

  const dailyTotals = useMemo(() => {
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    let sales = 0;
    let expenses = 0;

    transactions
      .filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate >= dayStart && transactionDate <= dayEnd;
      })
      .forEach(t => {
        if (t.type === 'sale') {
          sales += t.amount;
        } else {
          expenses += t.amount;
        }
      });
    
    return { sales, expenses, balance: sales - expenses };
  }, [transactions, selectedDate]);
  
  const balanceColor = dailyTotals.balance >= 0 ? 'bg-background' : 'bg-expense/20';

  return (
    <div className="flex flex-col h-full">
      <Header 
        onProductsClick={() => navigate('products')} 
        onLogoutClick={signOut} 
        currentDate={selectedDate}
        onPrevDay={handlePrevDay}
        onNextDay={handleNextDay}
        onDateChange={handleDateChange}
        onTodayClick={handleTodayClick}
      />
      
      <div className="p-4 space-y-4 flex-grow">
        <StatCard title="Ventas del Día" amount={dailyTotals.sales} colorClass="bg-income/20" />
        <StatCard title="Gastos del Día" amount={dailyTotals.expenses} colorClass="bg-expense/20" />
        <StatCard title="Balance del Día" amount={dailyTotals.balance} colorClass={balanceColor} />
      </div>

      {!isHistoryVisible && (
        <div className="w-full flex justify-center py-2">
            <button onClick={() => setHistoryVisible(true)} className="flex flex-col items-center text-text-main/60 animate-bounce" aria-label="Abrir historial">
                <span>Historial del Día</span>
                <ChevronDownIcon className="w-6 h-6" />
            </button>
        </div>
      )}
      
      {isHistoryVisible && <HistoryPanel onClose={() => setHistoryVisible(false)} onEdit={handleEdit} currentDate={selectedDate} />}
      
      <FloatingActionButton 
        onAddSale={() => navigate('addSale', undefined, selectedDate)}
        onAddExpense={() => navigate('addExpense', undefined, selectedDate)}
      />
    </div>
  );
};

export default DashboardScreen;
