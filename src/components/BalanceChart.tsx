import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '../types';

interface BalanceChartProps {
  data: ChartDataPoint[];
}

const BalanceChart: React.FC<BalanceChartProps> = ({ data }) => {
  // Colors from tailwind.config.js
  const colors = {
    income: '#A8D5BA',
    expense: '#fb7185',
    balance: '#2C2C2C', // Using text-main for balance
  };

  const formatCurrency = (value: number) => `S/ ${value.toFixed(0)}`;

  return (
    <div className="bg-white/60 p-4 rounded-xl shadow-sm" style={{ height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: -10,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.3} />
          <XAxis 
            dataKey="date" 
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCurrency}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`S/ ${value.toFixed(2)}`, name]}
            labelStyle={{ fontSize: 14, fontWeight: 'bold' }}
            itemStyle={{ fontSize: 12 }}
            contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
          />
          <Legend iconSize={10} wrapperStyle={{fontSize: "14px"}} />
          <Line type="monotone" dataKey="Ingresos" stroke={colors.income} strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="Gastos" stroke={colors.expense} strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="Balance" stroke={colors.balance} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BalanceChart;
