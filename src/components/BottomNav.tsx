import React from 'react';
import type { View } from '../types';
import { HomeIcon, ChartBarIcon } from './Icons';

interface BottomNavProps {
  currentView: View;
  navigate: (view: View) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, navigate }) => {
  const navItems = [
    { view: 'dashboard' as View, label: 'Inicio', icon: HomeIcon },
    { view: 'summary' as View, label: 'Resumen', icon: ChartBarIcon },
  ];

  const isMainView = navItems.some(item => item.view === currentView);
  if (!isMainView) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-background/90 backdrop-blur-sm border-t border-secondary/20 z-20">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ view, label, icon: Icon }) => (
          <button
            key={view}
            onClick={() => navigate(view)}
            className={`flex flex-col items-center justify-center w-full h-full transition-colors duration-200 ${
              currentView === view ? 'text-primary' : 'text-text-main/60'
            }`}
            aria-current={currentView === view ? 'page' : undefined}
            style={{ minHeight: '48px'}}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
