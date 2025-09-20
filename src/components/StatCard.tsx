import React from 'react';

// StatCard Component
interface StatCardProps {
  title: string;
  amount: number;
  colorClass: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, amount, colorClass }) => (
  <div className={`p-4 rounded-xl shadow-sm ${colorClass}`}>
    <p className="text-sm text-text-main/80">{title}</p>
    <p className="font-mono text-3xl font-bold">
      S/ {amount.toFixed(2)}
    </p>
  </div>
);

export default StatCard;
