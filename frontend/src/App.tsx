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

  // Entries state
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoadingEntries, setIsLoadingEntries] = useState<boolean>(false);

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

  // Fetch entries when switching to entries view
  useEffect(() => {
    if (currentView === 'entries' && isAuthenticated && token) {
      fetchEntries();
    }
  }, [currentView, fetchEntries, isAuthenticated, token]);

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
                />
              </CardContent>
            </Card>
          </>
        )}

        {currentView === 'entries' && (
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
                  {entries.map((entry) => (
                    <Card key={entry.id} className="hover:shadow-md transition-shadow">
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
                        <p className="text-sm sm:text-base text-foreground whitespace-pre-wrap break-words">
                          {entry.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {currentView === 'mood' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">Mood Analytics</CardTitle>
              <CardDescription className="text-sm sm:text-base">
                Track your emotional journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>Mood analytics coming soon...</p>
              </div>
            </CardContent>
          </Card>
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

export default App;
