import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../types';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('user');

  const [userForm, setUserForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const [adminForm, setAdminForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const handleUserLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.login(userForm);
      login(response.token, response.user!, false);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await authApi.adminLogin(adminForm);
      login(response.token, response.admin!, true);
      navigate('/admin');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Admin login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestUserLogin = () => {
    setUserForm({
      email: 'test@example.com',
      password: 'test123',
    });
    // Submit the form after setting the test user credentials
    setTimeout(() => {
      document.getElementById('user-login-form')?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 100);
  };

  const handleTestAdminLogin = () => {
    setAdminForm({
      email: 'admin@swiver.com',
      password: 'admin123',
    });
    // Submit the form after setting the admin credentials
    setTimeout(() => {
      document.getElementById('admin-login-form')?.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }, 100);
  };

  const updateUserForm = (field: keyof LoginForm, value: string) => {
    setUserForm(prev => ({ ...prev, [field]: value }));
  };

  const updateAdminForm = (field: keyof LoginForm, value: string) => {
    setAdminForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-900">
            Welcome to Swiver Clone
          </CardTitle>
          <CardDescription>
            Your comprehensive business management platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="user">User Login</TabsTrigger>
              <TabsTrigger value="admin">Admin Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="user">
              <form id="user-login-form" onSubmit={handleUserLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={userForm.email}
                    onChange={(e) => updateUserForm('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={userForm.password}
                    onChange={(e) => updateUserForm('password', e.target.value)}
                    required
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full mt-2" 
                  onClick={handleTestUserLogin}
                >
                  Login as Test User
                </Button>
                
                <div className="text-center mt-4">
                  <Link 
                    to="/register" 
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Don't have an account? Start free trial
                  </Link>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="admin">
              <form id="admin-login-form" onSubmit={handleAdminLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin-email">Admin Email</Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="Enter admin email"
                    value={adminForm.email}
                    onChange={(e) => updateAdminForm('email', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Admin Password</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    placeholder="Enter admin password"
                    value={adminForm.password}
                    onChange={(e) => updateAdminForm('password', e.target.value)}
                    required
                  />
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Admin Sign In'}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline"
                  className="w-full mt-2" 
                  onClick={handleTestAdminLogin}
                >
                  Login as Admin
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
