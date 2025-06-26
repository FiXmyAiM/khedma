import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from './ui/navigation-menu';
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  ShoppingCart,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  User,
  Brain,
  Menu,
  Bell
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Layout: React.FC = () => {
  const { user, admin, logout } = useAuth();
  const { t, language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = !!admin;
  const currentUser = isAdmin ? admin : user;

  // Rebuild navigation when language changes
  const navigation = [
    {
      name: isAdmin ? t('adminDashboard') : t('dashboard'),
      href: isAdmin ? '/admin' : '/dashboard',
      icon: LayoutDashboard,
      current: location.pathname === (isAdmin ? '/admin' : '/dashboard'),
    },
    ...(!isAdmin ? [
      {
        name: t('clients'),
        href: '/clients',
        icon: Users,
        current: location.pathname.startsWith('/clients'),
      },
      {
        name: t('products'),
        href: '/products',
        icon: Package,
        current: location.pathname.startsWith('/products'),
      },
      {
        name: t('invoices'),
        href: '/invoices',
        icon: FileText,
        current: location.pathname.startsWith('/invoices'),
      },
      {
        name: t('quotes'),
        href: '/quotes',
        icon: ShoppingCart,
        current: location.pathname.startsWith('/quotes'),
      },
      {
        name: t('expenses'),
        href: '/expenses',
        icon: CreditCard,
        current: location.pathname.startsWith('/expenses'),
      },
      {
        name: t('reports'),
        href: '/reports',
        icon: BarChart3,
        current: location.pathname.startsWith('/reports'),
      },
      {
        name: t('aiAssistant'),
        href: '/ai',
        icon: Brain,
        current: location.pathname.startsWith('/ai'),
      },
    ] : []),
    ...(isAdmin ? [
      {
        name: t('users'),
        href: '/admin/users',
        icon: Users,
        current: location.pathname.startsWith('/admin/users'),
      },
      {
        name: t('analytics'),
        href: '/admin/analytics',
        icon: BarChart3,
        current: location.pathname.startsWith('/admin/analytics'),
      },
    ] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">SC</span>
              </div>
              <span className="font-bold text-xl">Swiver Clone</span>
            </Link>
            {!isAdmin && user && (
              <Badge variant="secondary" className="ml-4">
                {user.plan || 'Free'} Plan
              </Badge>
            )}
          </div>

          <div className="ml-auto flex items-center space-x-4">
            {/* Language Switcher */}
            <LanguageSwitcher />
            
            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="h-4 w-4" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">
                      {isAdmin ? admin?.email : user?.name || user?.email}
                    </p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {currentUser?.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <nav className="flex flex-col gap-2 p-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors ${
                    item.current
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
