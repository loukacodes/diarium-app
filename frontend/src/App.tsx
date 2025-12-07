import { useState, useEffect, useCallback } from 'react';
import './App.css';
import BottomNav from '@/components/ui/bottom-nav';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useAuth } from '@/hooks/useAuth';
import { useEntries } from '@/hooks/useEntries';
import AuthView from '@/components/views/AuthView';
import AppHeader from '@/components/views/AppHeader';
import HomeView from '@/components/views/HomeView';
import EntriesView from '@/components/views/EntriesView';
import EntryDetailView from '@/components/views/EntryDetailView';
import MoodView from '@/components/views/MoodView';
import ProfileView from '@/components/views/ProfileView';

function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { isAuthenticated, user, token, login, logout } = useAuth();
  const {
    entries,
    isLoadingEntries,
    selectedEntry,
    setSelectedEntry,
    fetchEntries,
    fetchEntryDetail,
    deleteEntry,
  } = useEntries(token);

  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'entries' | 'mood' | 'profile'>('home');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Fetch entries when switching to entries view or home view (for calendar indicators)
  useEffect(() => {
    if (
      (currentView === 'entries' || currentView === 'home' || currentView === 'mood') &&
      isAuthenticated &&
      token
    ) {
      fetchEntries();
    }
  }, [currentView, fetchEntries, isAuthenticated, token]);

  // Fetch entry detail when selectedEntryId changes
  useEffect(() => {
    if (selectedEntryId && token) {
      fetchEntryDetail(selectedEntryId);
    } else {
      setSelectedEntry(null);
    }
  }, [selectedEntryId, fetchEntryDetail, token, setSelectedEntry]);

  // Get dates that have entries for calendar indicators
  const getEntryDates = useCallback(() => {
    return entries.map((entry) => {
      const date = new Date(entry.createdAt);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    });
  }, [entries]);

  // Check if a date has an entry
  const hasEntry = useCallback(
    (date: Date) => {
      const entryDates = getEntryDates();
      return entryDates.some((entryDate) => {
        return (
          entryDate.getFullYear() === date.getFullYear() &&
          entryDate.getMonth() === date.getMonth() &&
          entryDate.getDate() === date.getDate()
        );
      });
    },
    [getEntryDates],
  );

  const handleEntrySaved = (entryId: string) => {
    fetchEntries();
    setSelectedEntryId(entryId);
  };

  const handleEntryClick = (entryId: string) => {
    setSelectedEntryId(entryId);
  };

  const handleBackToEntries = () => {
    setSelectedEntryId(null);
    setSelectedEntry(null);
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    setSelectedEntryId(null);
    setSelectedEntry(null);
  };

  const handleViewChange = (view: 'home' | 'entries' | 'mood' | 'profile') => {
    setCurrentView(view);
    // Clear selected entry when navigating away from entries view
    if (view !== 'entries') {
      setSelectedEntryId(null);
      setSelectedEntry(null);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    await deleteEntry(entryId);
    setSelectedEntryId(null);
    setSelectedEntry(null);
  };

  // Authentication view
  if (!isAuthenticated) {
    return (
      <AuthView
        onAuthSuccess={(user, token) => login(user, token)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
      />
    );
  }

  // Main app (authenticated)
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 pb-20 sm:pb-4 mt-16 sm:mt-24">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        <AppHeader
          isDarkMode={isDarkMode}
          onToggleDarkMode={toggleDarkMode}
          onNavigateHome={handleNavigateHome}
          currentView={currentView}
          onViewChange={handleViewChange}
        />

        {/* Conditional Views */}
        {currentView === 'home' && (
          <HomeView
            token={token}
            onEntrySaved={handleEntrySaved}
            onViewChange={handleViewChange}
            hasEntry={hasEntry}
          />
        )}

        {currentView === 'entries' && !selectedEntryId && (
          <EntriesView
            entries={entries}
            isLoadingEntries={isLoadingEntries}
            onEntryClick={handleEntryClick}
          />
        )}

        {currentView === 'entries' && selectedEntryId && selectedEntry && (
          <EntryDetailView
            entry={selectedEntry}
            onBack={handleBackToEntries}
            onDelete={handleDeleteEntry}
          />
        )}

        {currentView === 'mood' && <MoodView entries={entries} />}

        {currentView === 'profile' && <ProfileView user={user} onLogout={logout} />}
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav currentView={currentView} onViewChange={handleViewChange} />
    </div>
  );
}

export default App;
