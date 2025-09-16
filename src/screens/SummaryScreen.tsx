import React, { useMemo } from 'react';
import { useLedger } from '../context/LedgerContext';
import { ChartBarIcon } from '../components/Icons';

const getStartOfWeek = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

const SummaryScreen: React.FC = () => {
  const { transactions } = useLedger();

  const weeklyComparison = useMemo(() => {
    const now = new Date();
    const startOfThisWeek = getStartOfWeek(now);
    
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfThisWeek.getDate() - 7);
    
    const endOfThisWeek = new Date(startOfThisWeek);
    endOfThisWeek.setDate(startOfThisWeek.getDate() + 7);

    let thisWeekSales = 0;
    let lastWeekSales = 0;

    transactions.forEach(t => {
      if (t.type === 'sale') {
        const transactionDate = new Date(t.date);
        if (transactionDate >= startOfThisWeek && transactionDate < endOfThisWeek) {
          thisWeekSales += t.amount;
        } else if (transactionDate >= startOfLastWeek && transactionDate < startOfThisWeek) {
          lastWeekSales += t.amount;
        }
      }
    });

    let percentageChange = 0;
    if (lastWeekSales > 0) {
      percentageChange = ((thisWeekSales - lastWeekSales) / lastWeekSales) * 100;
    } else if (thisWeekSales > 0) {
      percentageChange = 100;
    }
    
    return { thisWeekSales, lastWeekSales, percentageChange };
  }, [transactions]);

  const topProducts = useMemo(() => {
    const productSales: { [key: string]: number } = {};
    transactions
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
  }, [transactions]);

  const dailyActivity = useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
        const day = new Date(now);
        day.setDate(now.getDate() - i);
        const dayString = day.toISOString().split('T')[0];
        
        const dailyTotals = transactions
            .filter(t => t.date.startsWith(dayString))
            .reduce((acc, t) => {
                if (t.type === 'sale') acc.sales += t.amount;
                if (t.type === 'expense') acc.expenses += t.amount;
                return acc;
            }, { sales: 0, expenses: 0 });

        days.push({
            label: day.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', ''),
            sales: dailyTotals.sales,
            expenses: dailyTotals.expenses,
        });
    }
    return days;
  }, [transactions]);

  const maxDailyTotal = useMemo(() => {
    const max = Math.max(...dailyActivity.map(d => d.sales + d.expenses));
    return max === 0 ? 1 : max;
  }, [dailyActivity]);

  return (
    <div className="flex flex-col">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm z-10 p-4 flex items-center space-x-3 border-b border-secondary/20">
        <ChartBarIcon className="w-6 h-6 text-secondary" />
        <h1 className="font-heading text-xl font-medium">Resumen Semanal</h1>
      </header>
      
      <div className="p-4 space-y-6 pb-24">
        <div className="bg-white/60 p-4 rounded-xl shadow-sm">
            <h3 className="font-heading text-lg mb-3">Esta Semana vs Semana Pasada</h3>
            <div className="flex justify-between items-center">
                <div>
                    <p className="text-sm text-text-main/70">Sem. Pasada</p>
                    <p className="font-mono text-xl font-bold">S/ {weeklyComparison.lastWeekSales.toFixed(2)}</p>
                </div>
                <div>
                    <p className="text-sm text-text-main/70">Esta Semana</p>
                    <p className="font-mono text-xl font-bold">S/ {weeklyComparison.thisWeekSales.toFixed(2)}</p>
                </div>
                <div className={`text-lg font-bold flex items-center ${weeklyComparison.percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <span>{weeklyComparison.percentageChange >= 0 ? '▲' : '▼'}</span>
                    <span>{Math.abs(weeklyComparison.percentageChange).toFixed(0)}%</span>
                </div>
            </div>
        </div>
        
        <div className="bg-white/60 p-4 rounded-xl shadow-sm">
            <h3 className="font-heading text-lg mb-3">Top 3 Productos Vendidos</h3>
            {topProducts.length > 0 ? (
                <ul className="space-y-2">
                    {topProducts.map((p, index) => (
                        <li key={p.name} className="flex justify-between items-center text-sm">
                            <span className="font-semibold">{index + 1}. {p.name}</span>
                            <span className="bg-secondary/20 text-secondary-dark font-mono font-semibold px-2 py-1 rounded-md">{p.quantity} unidades</span>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-sm text-text-main/60 text-center">No hay ventas de productos registradas.</p>}
        </div>
        
        <div className="bg-white/60 p-4 rounded-xl shadow-sm">
            <h3 className="font-heading text-lg mb-4">Actividad de los Últimos 7 Días</h3>
            <div className="flex justify-between items-end h-32 space-x-2 text-center">
                {dailyActivity.map((day, index) => {
                    const totalDay = day.sales + day.expenses;
                    const containerHeightRem = totalDay > 0 ? (totalDay / maxDailyTotal) * 8 : 0;
                    
                    const salesPercent = totalDay > 0 ? (day.sales / totalDay) * 100 : 0;
                    const expensesPercent = totalDay > 0 ? (day.expenses / totalDay) * 100 : 0;

                    return (
                        <div key={index} className="flex flex-col items-center flex-1 h-full justify-end">
                            <div 
                                className="w-4/5 mx-auto flex flex-col-reverse rounded-t-md overflow-hidden"
                                style={{ height: `${containerHeightRem}rem` }}
                            >
                                {day.expenses > 0 && <div className="bg-alert" style={{ height: `${expensesPercent}%` }}></div>}
                                {day.sales > 0 && <div className="bg-primary" style={{ height: `${salesPercent}%` }}></div>}
                            </div>
                             {totalDay === 0 && <div className="w-4/5 mx-auto bg-gray-200 rounded-t-md" style={{height: '2px'}}></div>}
                            <span className="text-xs mt-2 capitalize">{day.label}</span>
                        </div>
                    );
                })}
            </div>
            <div className="flex justify-center items-center space-x-4 text-xs mt-4">
                <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-sm bg-primary"></div>
                    <span>Ventas</span>
                </div>
                <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-sm bg-alert"></div>
                    <span>Gastos</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryScreen;
