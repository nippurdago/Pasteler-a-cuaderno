import React, { useMemo, useState } from 'react';
import { useLedger } from '../context/LedgerContext';
import { ChartBarIcon } from '../components/Icons';
import BalanceChart from '../components/BalanceChart';
import type { ChartDataPoint } from '../types';
import StatCard from '../components/StatCard'; // Import StatCard

const SummaryScreen: React.FC = () => {
  const { transactions } = useLedger();

  // State for date range
  const [startDate, setStartDate] = useState<string>(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  const filteredTransactions = useMemo(() => {
    // Fix for date parsing: treat date strings as local time, not UTC
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const start = new Date(startYear, startMonth - 1, startDay);
    start.setHours(0, 0, 0, 0);

    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const end = new Date(endYear, endMonth - 1, endDay);
    end.setHours(23, 59, 59, 999); // Set to the end of the selected day

    return transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= start && transactionDate <= end;
    });
  }, [transactions, startDate, endDate]);

  const chartData = useMemo<ChartDataPoint[]>(() => {
    const dailyData: { [date: string]: { income: number; expense: number } } = {};

    filteredTransactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      if (!dailyData[date]) {
        dailyData[date] = { income: 0, expense: 0 };
      }
      if (t.type === 'sale') {
        dailyData[date].income += t.amount;
      } else {
        dailyData[date].expense += t.amount;
      }
    });
    
    let cumulativeBalance = 0;
    return Object.entries(dailyData).map(([date, data]) => {
        cumulativeBalance += data.income - data.expense;
        return {
            date,
            Ingresos: data.income,
            Gastos: data.expense,
            Balance: cumulativeBalance,
        }
    });
  }, [filteredTransactions]);

  const summary = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === 'sale') {
        acc.sales += t.amount;
      } else if (t.type === 'expense') {
        acc.expenses += t.amount;
      }
      return acc;
    }, { sales: 0, expenses: 0 });
  }, [filteredTransactions]);

  const balance = summary.sales - summary.expenses;
  const balanceColor = balance >= 0 ? 'bg-background' : 'bg-expense/20';


  const topProducts = useMemo(() => {
    const productSales: { [key: string]: number } = {};
    filteredTransactions
      .filter(t => t.type === 'sale' && t.items)
      .forEach(t => {
        t.items?.forEach(item => {
          productSales[item.productName] = (productSales[item.productName] || 0) + item.quantity;
        });
      });

    return Object.entries(productSales)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 3);
  }, [filteredTransactions]);

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex items-center space-x-3 border-b border-accent/20">
        <ChartBarIcon className="w-6 h-6 text-accent" />
        <h1 className="font-heading text-xl font-medium">Resumen por Período</h1>
      </header>
      
      <div className="p-4 space-y-6 pb-24">
        {/* Date Range Pickers */}
        <div className="bg-white/60 p-4 rounded-xl shadow-sm">
          <h3 className="font-heading text-lg mb-3">Seleccionar Período</h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-text-main/80 mb-1">Desde</label>
              <input 
                type="date" 
                id="startDate"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-income focus:border-income"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-text-main/80 mb-1">Hasta</label>
              <input 
                type="date" 
                id="endDate"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-income focus:border-income"
              />
            </div>
          </div>
        </div>

        {/* Chart */}
        <BalanceChart data={chartData} />

        {/* Balance Summary */}
        <div className="space-y-4">
            <StatCard title="Ingresos del Período" amount={summary.sales} colorClass="bg-income/20" />
            <StatCard title="Gastos del Período" amount={summary.expenses} colorClass="bg-expense/20" />
            <StatCard title="Balance del Período" amount={balance} colorClass={balanceColor} />
        </div>
        
        {/* Top Products */}
        <div className="bg-white/60 p-4 rounded-xl shadow-sm">
            <h3 className="font-heading text-lg mb-3">Top 3 Productos Vendidos</h3>
            {topProducts.length > 0 ? (
                <ul className="space-y-2">
                    {topProducts.map((p, index) => (
                        <li key={p.name} className="flex justify-between items-center text-sm">
                            <span className="font-semibold">{index + 1}. {p.name}</span>
                            <span className="bg-accent/20 text-accent font-mono font-semibold px-2 py-1 rounded-md">{p.quantity} unidades</span>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-text-main/60 text-center">No hay ventas de productos en este período.</p>}
        </div>
      </div>
    </div>
  );
};

export default SummaryScreen;