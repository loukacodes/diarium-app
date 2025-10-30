import React from 'react';
import { cn } from '@/lib/utils';

interface BottomNavProps {
  className?: string;
}

interface NavItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ className }) => {
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: '🏠',
      active: true,
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
        className
      )}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={item.onClick}
          className={cn(
            'flex flex-col items-center justify-center py-2 px-3 rounded-lg',
            'transition-colors duration-200 min-h-[44px] min-w-[44px]',
            'hover:bg-accent/50 active:bg-accent',
            item.active
              ? 'text-primary bg-primary/10'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <span className="text-lg mb-1">{item.icon}</span>
          <span className="text-xs font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
