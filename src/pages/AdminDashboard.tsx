import React, { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Activity, 
  ArrowUpRight,
  UserPlus,
  UserCheck,
  UserX,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { toast } from '../components/ui/use-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  company?: string;
  plan: string;
  status: string;
  trialEndsAt?: string;
  paidUntil?: string;
  createdAt: string;
}

interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  trialUsers: number;
  expiredUsers: number;
  recentUsers: User[];
  revenue: {
    total: number;
    monthly: number;
  };
}

// API client
const adminApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await axios.get(`${API_BASE_URL}/admin/users`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData>({
    totalUsers: 0,
    activeUsers: 0,
    trialUsers: 0,
    expiredUsers: 0,
    recentUsers: [],
    revenue: {
      total: 0,
      monthly: 0
    }
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getUsers();
      setUsers(data);
      processData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processData = (users: User[]) => {
    const activeUsers = users.filter(user => user.status === 'ACTIVE').length;
    const trialUsers = users.filter(user => user.status === 'TRIAL').length;
    const expiredUsers = users.filter(user => user.status === 'EXPIRED' || user.status === 'SUSPENDED').length;
    
    // Calculate estimated revenue (simplified)
    let totalRevenue = 0;
    let monthlyRevenue = 0;
    
    users.forEach(user => {
      if (user.plan === 'PREMIUM') {
        totalRevenue += 29.99;
        monthlyRevenue += 29.99;
      } else if (user.plan === 'VIP') {
        totalRevenue += 99.99;
        monthlyRevenue += 99.99;
      } else if (user.plan === 'ECONOMIC') {
        totalRevenue += 9.99;
        monthlyRevenue += 9.99;
      }
    });
    
    // Sort users by creation date and get the 5 most recent
    const recentUsers = [...users].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5);
    
    setDashboardData({
      totalUsers: users.length,
      activeUsers,
      trialUsers,
      expiredUsers,
      recentUsers,
      revenue: {
        total: totalRevenue,
        monthly: monthlyRevenue
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge variant="default" className="bg-green-600">Active</Badge>
        );
      case 'TRIAL':
        return (
          <Badge variant="secondary">Trial</Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="destructive">Expired</Badge>
        );
      case 'SUSPENDED':
        return (
          <Badge variant="outline" className="text-red-500 border-red-500">Suspended</Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case 'FREE':
        return (
          <Badge variant="outline">Free</Badge>
        );
      case 'ECONOMIC':
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Economic</Badge>
        );
      case 'PREMIUM':
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Premium</Badge>
        );
      case 'VIP':
        return (
          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">VIP</Badge>
        );
      default:
        return <Badge variant="outline">{plan}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your platform's performance
          </p>
        </div>
        <Button onClick={() => window.location.href = "/admin/users"}>
          <Users className="mr-2 h-4 w-4" />
          Manage Users
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Users
            </CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((dashboardData.activeUsers / dashboardData.totalUsers) * 100) || 0}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trial Users
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.trialUsers}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((dashboardData.trialUsers / dashboardData.totalUsers) * 100) || 0}% of total users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${dashboardData.revenue.monthly.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Estimated monthly recurring
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
          <CardDescription>
            Latest user registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : dashboardData.recentUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.recentUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.firstName} {user.lastName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>{getStatusBadge(user.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Status Distribution</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="space-y-2">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <div className="flex-1">Active</div>
                <div>{dashboardData.activeUsers}</div>
                <div className="w-24 h-2 rounded-full bg-gray-100 ml-2">
                  <div 
                    className="h-full bg-green-500 rounded-full" 
                    style={{ width: `${(dashboardData.activeUsers / dashboardData.totalUsers) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
                <div className="flex-1">Trial</div>
                <div>{dashboardData.trialUsers}</div>
                <div className="w-24 h-2 rounded-full bg-gray-100 ml-2">
                  <div 
                    className="h-full bg-blue-500 rounded-full" 
                    style={{ width: `${(dashboardData.trialUsers / dashboardData.totalUsers) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                <div className="flex-1">Expired/Suspended</div>
                <div>{dashboardData.expiredUsers}</div>
                <div className="w-24 h-2 rounded-full bg-gray-100 ml-2">
                  <div 
                    className="h-full bg-red-500 rounded-full" 
                    style={{ width: `${(dashboardData.expiredUsers / dashboardData.totalUsers) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => window.location.href = "/admin/users/new"}>
                <UserPlus className="h-5 w-5 mb-1" />
                <span>Add User</span>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center" onClick={() => window.location.href = "/admin/analytics"}>
                <Activity className="h-5 w-5 mb-1" />
                <span>View Analytics</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard; 