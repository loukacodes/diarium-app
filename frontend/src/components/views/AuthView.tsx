import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SunIcon, MoonIcon } from '@/components/ui/nav-icons';
import API_URL from '@/config/api';
import type { User } from '@/types';

interface AuthViewProps {
  onAuthSuccess: (user: User, token: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function AuthView({ onAuthSuccess, isDarkMode, onToggleDarkMode }: AuthViewProps) {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body =
        authMode === 'login'
          ? { email: authForm.email, password: authForm.password }
          : { name: authForm.name, email: authForm.email, password: authForm.password };

      const response = await fetch(`${API_URL}${endpoint}`, {
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
      onAuthSuccess(data.user, data.token);

      // Clear form
      setAuthForm({ name: '', email: '', password: '' });
    } catch (error) {
      console.error('Auth error:', error);
      alert(`Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleAuthFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthForm({
      ...authForm,
      [e.target.name]: e.target.value,
    });
  };

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
              onClick={onToggleDarkMode}
              className="flex items-center gap-2 order-3 sm:order-3"
            >
              {isDarkMode ? <SunIcon size={18} /> : <MoonIcon size={18} />}
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

