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
}

const DesktopNav: React.FC<DesktopNavProps> = ({ className, currentView, onViewChange }) => {
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
    },
    {
      id: 'entries',
      label: 'Entries',
    },
    {
      id: 'mood',
      label: 'Mood',
    },
    {
      id: 'profile',
      label: 'Profile',
    },
  ];

  return (
    <nav className={cn('flex items-center gap-2', className)}>
      {navItems.map((item) => {
        const isActive = currentView === item.id;
        return (
          <Button
            key={item.id}
            variant={isActive ? 'default' : 'ghost'}
            onClick={() => onViewChange(item.id)}
            className={cn('flex items-center gap-2')}
          >
            <span>{item.label}</span>
          </Button>
        );
      })}
    </nav>
  );
};

export default DesktopNav;
