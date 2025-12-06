import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function AppHeader({ isDarkMode, onToggleDarkMode }: AppHeaderProps) {
  return (
    <div className="flex items-center justify-between z-10 fixed top-0 left-0 right-0 bg-background border-b border-border p-4">
      <div className="text-2xl sm:text-4xl font-bold">Diarium</div>
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleDarkMode}
        className="flex items-center gap-2"
      >
        {isDarkMode ? '☀️' : '🌙'}
      </Button>
    </div>
  );
}

