import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import BottomNav from '@/components/ui/bottom-nav';
import DesktopNav from '@/components/ui/desktop-nav';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Entry {
  id: string;
  content: string;
  mood: string | null;
  moodScore: number | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

function App() {
  const [diaryEntry, setDiaryEntry] = useState<string>('');
  const [mood, setMood] = useState<string>('');

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  } | null>(null);
  const [token, setToken] = useState<string>('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [date, setDate] = useState<Date | undefined>(new Date());

  // Navigation state
  const [currentView, setCurrentView] = useState<'home' | 'entries' | 'mood' | 'profile'>('home');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  // Entries state
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
  };

  // Auth form state
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Authentication functions
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        authMode === 'login'
          ? { email: authForm.email, password: authForm.password }
          : { name: authForm.name, email: authForm.email, password: authForm.password };

      const response = await fetch(`http://localhost:3000${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();
      setUser(data.user);
      setToken(data.token);
      setIsAuthenticated(true);

      // Save to localStorage for persistence
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      // Clear form
      setAuthForm({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Auth error:', error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setToken('');
    setDiaryEntry('');
    setMood('');

    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleAuthFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    });
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', newDarkMode.toString());
  };

  // Initialize dark mode and auth state from localStorage
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }

    // Restore and verify authentication state from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      // Verify token is still valid
      const verifyToken = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/auth/me', {
            headers: {
              Authorization: `Bearer ${savedToken}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            // Update user data in case it changed
            const user = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              createdAt: userData.createdAt,
            };
            setToken(savedToken);
            setUser(user);
            setIsAuthenticated(true);
            // Update localStorage with fresh user data
            localStorage.setItem('user', JSON.stringify(user));
          } else {
            // Token is invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
            setToken('');
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          // Clear invalid data on error
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          setUser(null);
          setToken('');
        }
      };

      verifyToken();
    }
  }, []);

  const analyzeMood = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/analyze-mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: diaryEntry }),
      });

      if (!response.ok) {
        throw new Error('Mood analysis failed');
      }

      const data = await response.json();
      setMood(data.mood);
    } catch (error) {
      console.error('Mood analysis error:', error);
      // Fallback to random mood if API fails
      const moods = ['Happy', 'Sad', 'Excited', 'Calm', 'Stressed', 'Grateful'];
      const randomMood = moods[Math.floor(Math.random() * moods.length)];
      setMood(randomMood);
    }
  };

  const saveEntry = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          content: diaryEntry,
          mood: mood,
          moodScore: Math.random(), // Mock score for now
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save entry');
      }

      await response.json();
      alert('Entry saved successfully!');

      // Clear the form
      setDiaryEntry('');
      setMood('');

      // Refresh entries if on entries view
      if (currentView === 'entries') {
        fetchEntries();
      }
    } catch (error) {
      console.error('Save entry error:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  // Fetch entries
  const fetchEntries = useCallback(async () => {
    if (!token) return;

    setIsLoadingEntries(true);
    try {
      const response = await fetch('http://localhost:3000/api/entries', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const data = await response.json();
      setEntries(data);
    } catch (error) {
      console.error('Fetch entries error:', error);
      alert('Failed to load entries. Please try again.');
    } finally {
      setIsLoadingEntries(false);
    }
  }, [token]);

  // Fetch entries when switching to entries view or home view (for calendar indicators)
  useEffect(() => {
    if ((currentView === 'entries' || currentView === 'home' || currentView === 'mood') && isAuthenticated && token) {
      fetchEntries();
    }
  }, [currentView, fetchEntries, isAuthenticated, token]);

  // Fetch entry detail when selectedEntryId changes
  useEffect(() => {
    const fetchEntryDetail = async () => {
      if (!selectedEntryId || !token) return;

      try {
        const response = await fetch(`http://localhost:3000/api/entries/${selectedEntryId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch entry');
        }

        const data = await response.json();
        setSelectedEntry(data);
      } catch (error) {
        console.error('Fetch entry detail error:', error);
        alert('Failed to load entry. Please try again.');
        setSelectedEntryId(null);
      }
    };

    fetchEntryDetail();
  }, [selectedEntryId, token]);

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
    [getEntryDates]
  );

  // Delete entry (without confirmation - confirmation should be done by caller)
  const deleteEntry = async (entryId: string) => {
    try {
      const response = await fetch(`http://localhost:3000/api/entries/${entryId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete entry');
      }

      // Remove entry from local state using functional update
      setEntries((prevEntries) => prevEntries.filter((entry) => entry.id !== entryId));
    } catch (error) {
      console.error('Delete entry error:', error);
      alert('Failed to delete entry. Please try again.');
      throw error;
    }
  };

  // Delete entry with confirmation (for use in list view)
  const deleteEntryWithConfirmation = async (entryId: string) => {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }
    await deleteEntry(entryId);
  };

  // Helper function to calculate word count
  const getWordCount = (text: string): number => {
    return text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  };

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Authentication form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-2 sm:p-4">
        <Card className="w-full max-w-sm sm:max-w-md">
          <CardHeader className="text-center">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
              <div className="order-2 sm:order-1 sm:flex-1"></div>
              <div className="order-1 sm:order-2">
                <CardTitle className="text-2xl sm:text-4xl font-bold">Diarium</CardTitle>
                <CardDescription className="text-lg sm:text-xl">
                  Write – Track – Grow
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
                className="flex items-center gap-2 order-3 sm:order-3"
              >
                {isDarkMode ? '☀️' : '🌙'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={authMode}
              onValueChange={(value) => setAuthMode(value as 'login' | 'register')}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleAuth} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      name="email"
                      value={authForm.email}
                      onChange={handleAuthFormChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="password"
                      name="password"
                      value={authForm.password}
                      onChange={handleAuthFormChange}
                      required
                      placeholder="Enter your password"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Login
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleAuth} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      name="name"
                      value={authForm.name}
                      onChange={handleAuthFormChange}
                      required
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="email"
                      name="email"
                      value={authForm.email}
                      onChange={handleAuthFormChange}
                      required
                      placeholder="Enter your email"
                    />
                  </div>

                  <div className="space-y-2">
                    <Input
                      type="password"
                      name="password"
                      value={authForm.password}
                      onChange={handleAuthFormChange}
                      required
                      placeholder="Enter your password"
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main app (authenticated)
  return (
    <div className="min-h-screen bg-background p-2 sm:p-4 pb-20 sm:pb-4">
      <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                <CardTitle className="text-2xl sm:text-4xl font-bold">Diarium</CardTitle>
                <CardDescription className="text-lg sm:text-xl">
                  Write – Track – Grow
                </CardDescription>
                <p className="text-muted-foreground mt-2 text-sm sm:text-base">
                  Your personal diary with AI-powered mood analysis
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                <span className="text-sm">Welcome, {user?.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleDarkMode}
                    className="flex items-center gap-2"
                  >
                    {isDarkMode ? '☀️' : '🌙'}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                </div>
              </div>
            </div>
            {/* Desktop Navigation */}
            <DesktopNav currentView={currentView} onViewChange={setCurrentView} />
          </CardHeader>
        </Card>

        {/* Conditional Views */}
        {currentView === 'home' && (
          <>
            {/* Diary Entry Section */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Write Your Diary Entry</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Express your thoughts and feelings. Our AI will analyze your mood.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="How was your day? What are you thinking about?"
                  value={diaryEntry}
                  onChange={(e) => setDiaryEntry(e.target.value)}
                  className="min-h-[120px] w-full"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={analyzeMood}
                    disabled={!diaryEntry.trim()}
                    variant="secondary"
                    className="w-full sm:w-auto"
                  >
                    Analyze Mood
                  </Button>
                  <Button
                    onClick={saveEntry}
                    disabled={!diaryEntry.trim()}
                    className="w-full sm:w-auto"
                  >
                    Save Entry
                  </Button>
                </div>
                {mood && (
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Detected Mood:</strong>
                      <span className="ml-2 bg-primary text-primary-foreground px-2 py-1 rounded text-sm">
                        {mood}
                      </span>
                    </p>
                  </div>
                )}
              </CardContent>
              <CardContent className="space-y-4">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md border shadow-sm"
                  modifiers={{
                    hasEntry: (date) => hasEntry(date),
                  }}
                  modifiersClassNames={{
                    hasEntry: 'has-entry',
                  }}
                />
              </CardContent>
            </Card>
          </>
        )}

        {currentView === 'entries' && !selectedEntryId && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Your Diary Entries</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                All your thoughts and memories in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEntries ? (
                <div className="text-center py-8 text-muted-foreground">Loading entries...</div>
              ) : entries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-lg mb-2">No entries yet</p>
                  <p className="text-sm">Start writing your first diary entry!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => {
                    const preview = entry.content.length > 200 
                      ? entry.content.substring(0, 200) + '...' 
                      : entry.content;
                    
                    return (
                      <Card 
                        key={entry.id} 
                        className="hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setSelectedEntryId(entry.id)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <CardTitle className="text-base sm:text-lg">
                              {formatDate(entry.createdAt)}
                            </CardTitle>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <span>{getWordCount(entry.content)} words</span>
                              {entry.mood && (
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                                  {entry.mood}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words mb-4">
                            {preview}
                          </p>
                          <div className="flex justify-between items-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEntryId(entry.id);
                              }}
                              className="w-full sm:w-auto"
                            >
                              Read More
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteEntryWithConfirmation(entry.id);
                              }}
                              className="w-full sm:w-auto"
                            >
                              Delete Entry
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentView === 'entries' && selectedEntryId && selectedEntry && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedEntryId(null);
                    setSelectedEntry(null);
                  }}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Entries
                </Button>
              </div>
              <CardTitle className="text-lg sm:text-xl">
                {formatDate(selectedEntry.createdAt)}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base">
                <div className="flex items-center gap-3 mt-2">
                  <span>{getWordCount(selectedEntry.content)} words</span>
                  {selectedEntry.mood && (
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                      {selectedEntry.mood}
                    </span>
                  )}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words">
                  {selectedEntry.content}
                </p>
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
                        await deleteEntry(selectedEntry.id);
                        setSelectedEntryId(null);
                        setSelectedEntry(null);
                      }
                    }}
                    className="w-full sm:w-auto"
                  >
                    Delete Entry
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {currentView === 'mood' && (
          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Mood Analytics</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Track your emotional journey over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                {entries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No entries yet. Start writing to see your mood trends!</p>
                  </div>
                ) : (
                  <MoodAnalytics entries={entries} />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === 'profile' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Profile</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-base font-medium">{user?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-base font-medium">{user?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p className="text-base font-medium">
                    {user?.createdAt ? formatDate(user.createdAt) : 'N/A'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Bottom Navigation - Mobile Only */}
      <BottomNav currentView={currentView} onViewChange={setCurrentView} />
    </div>
  );
}

// Mood Analytics Component
function MoodAnalytics({ entries }: { entries: Entry[] }) {
  // Process entries for charts
  const moodCounts = entries.reduce((acc, entry) => {
    const mood = entry.mood || 'Unknown';
    acc[mood] = (acc[mood] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(moodCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  // Time series data (last 30 days or all entries)
  const timeSeriesData = entries
    .slice()
    .reverse()
    .slice(0, 30)
    .map((entry) => {
      const date = new Date(entry.createdAt);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        mood: entry.mood || 'Unknown',
        moodScore: entry.moodScore || 0,
        fullDate: date,
      };
    })
    .sort((a, b) => a.fullDate.getTime() - b.fullDate.getTime());

  // Mood distribution over time (weekly)
  const weeklyData = entries.reduce((acc, entry) => {
    const date = new Date(entry.createdAt);
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
    const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    if (!acc[weekKey]) {
      acc[weekKey] = {};
    }
    const mood = entry.mood || 'Unknown';
    acc[weekKey][mood] = (acc[weekKey][mood] || 0) + 1;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  const weeklyChartData = Object.entries(weeklyData)
    .map(([week, moods]) => ({
      week,
      ...moods,
    }))
    .slice(-8); // Last 8 weeks

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Total Entries</p>
          <p className="text-2xl font-bold">{entries.length}</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Unique Moods</p>
          <p className="text-2xl font-bold">{Object.keys(moodCounts).length}</p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Most Common</p>
          <p className="text-lg font-semibold">
            {Object.entries(moodCounts).sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A'}
          </p>
        </div>
        <div className="bg-muted p-4 rounded-lg">
          <p className="text-sm text-muted-foreground">Avg Words</p>
          <p className="text-2xl font-bold">
            {Math.round(
              entries.reduce((sum, e) => sum + e.content.split(/\s+/).filter((w) => w.length > 0).length, 0) /
                entries.length || 0
            )}
          </p>
        </div>
      </div>

      {/* Mood Distribution Pie Chart */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Mood Over Time Line Chart */}
      {timeSeriesData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Mood Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="moodScore"
                stroke="#3b82f6"
                name="Mood Score"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weekly Mood Distribution */}
      {weeklyChartData.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Weekly Mood Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(moodCounts).map((mood, index) => (
                <Bar
                  key={mood}
                  dataKey={mood}
                  stackId="a"
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}

export default App;
