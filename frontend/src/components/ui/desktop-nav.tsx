import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface DesktopNavProps {
  className?: string;
  currentView: 'home' | 'entries' | 'mood' | 'profile';
  onViewChange: (view: 'home' | 'entries' | 'mood' | 'profile') => void;
}

interface NavItem {
  id: 'home' | 'entries' | 'mood' | 'profile';
  label: string;
  icon: string;
}

const DesktopNav: React.FC<DesktopNavProps> = ({ className, currentView, onViewChange }) => {
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
        'hidden sm:flex items-center gap-2',
        'border-b border-border pb-4 mb-4',
        className,
      )}
    >
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <Button
            key={item.id}
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onViewChange(item.id)}
            className={cn(
              'flex items-center gap-2',
              isActive && 'bg-primary text-primary-foreground',
            )}
          >
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
};

export default DesktopNav;

