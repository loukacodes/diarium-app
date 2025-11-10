import React from 'react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  className?: string;
  currentView: 'home' | 'entries' | 'mood' | 'profile';
  onViewChange: (view: 'home' | 'entries' | 'mood' | 'profile') => void;
}

interface NavItem {
  id: 'home' | 'entries' | 'mood' | 'profile';
  label: string;
  icon: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ className, currentView, onViewChange }) => {
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
    },
    {
      id: 'entries',
      label: 'Entries',
      icon: '📝',
    },
    {
      id: 'mood',
      label: 'Mood',
      icon: '😊',
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
    },
  ];

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-background border-t border-border',
        'flex items-center justify-around py-2 px-4',
        'sm:hidden', // Only show on mobile
        className,
      )}
    >
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'flex flex-col items-center justify-center py-2 px-3 rounded-lg',
              'transition-colors duration-200 min-h-[44px] min-w-[44px]',
              'hover:bg-accent/50 active:bg-accent',
              isActive
                ? 'text-primary bg-primary/10'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <span className="text-lg mb-1">{item.icon}</span>
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
