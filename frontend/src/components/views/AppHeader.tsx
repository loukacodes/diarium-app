import { Button } from '@/components/ui/button';
import DesktopNav from '@/components/ui/desktop-nav';

interface AppHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onNavigateHome: () => void;
  currentView: 'home' | 'entries' | 'mood' | 'profile';
  onViewChange: (view: 'home' | 'entries' | 'mood' | 'profile') => void;
}

export default function AppHeader({
  isDarkMode,
  onToggleDarkMode,
  onNavigateHome,
  currentView,
  onViewChange,
}: AppHeaderProps) {
  return (
    <div className="z-10 fixed top-0 left-0 right-0 bg-background border-b border-border">
      <div className="flex justify-between items-center p-4">
        {/* Left section - Logo */}
        <div className="w-1/3">
          <div
            className="text-2xl sm:text-4xl font-bold cursor-pointer hover:opacity-80 transition-opacity inline-block"
            onClick={onNavigateHome}
          >
            Diarium
          </div>
        </div>

        {/* Center section - Desktop Navigation */}
        <div className="hidden sm:flex justify-center">
          <DesktopNav currentView={currentView} onViewChange={onViewChange} />
        </div>

        {/* Right section - Dark mode toggle */}
        <div className="w-1/3 flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleDarkMode}
            className="flex items-center gap-2"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </Button>
        </div>
      </div>
    </div>
  );
}
