import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  BarChart, 
  DollarSign, 
  Users, 
  FileText, 
  Clock,
  AlertCircle,
  PlusCircle,
  UserPlus,
  Package,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { useToast } from '../components/ui/use-toast';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API client for dashboard data
const dashboardApi = {
  getDashboardData: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/dashboard`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

// API client for AI insights
const aiApi = {
  generateInsights: async (data: any): Promise<any> => {
    const response = await axios.post(`${API_BASE_URL}/ai/insights`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useUser();
  const { t } = useLanguage();
  
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await dashboardApi.getDashboardData();
      setDashboardData(data);
      
      // Auto-generate AI insights if user is on a premium plan
      if (user?.plan === 'premium' || user?.plan === 'business') {
        generateAIInsights(data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(t('failedToLoadDashboard'));
      toast({
        title: t('error'),
        description: t('failedToLoadDashboard'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateAIInsights = async (data: any) => {
    setIsGeneratingInsights(true);
    try {
      const response = await aiApi.generateInsights({
        dashboardData: data,
        userContext: {
          plan: user?.plan,
          industry: user?.industry || 'general',
          businessSize: user?.businessSize || 'small'
        }
      });
      
      setAiInsights(response.insights || []);
    } catch (err) {
      console.error('Error generating AI insights:', err);
      toast({
        title: t('error'),
        description: t('failedToGenerateInsights'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">{t('error')}</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={loadDashboardData}>{t('tryAgain')}</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('welcomeBack')}, {user?.name}
          </h1>
          <p className="text-muted-foreground">
            {t('hereIsWhatsHappening')}
          </p>
        </div>
        <div>
          <Badge variant="outline" className="text-sm font-medium">
            {user?.plan === 'premium' ? t('premiumPlan') : 
             user?.plan === 'business' ? t('businessPlan') : t('freePlan')}
          </Badge>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalRevenue')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.totalRevenue || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.revenueChange > 0 ? '+' : ''}
              {dashboardData?.revenueChange}% {t('fromLastMonth')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalClients')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalClients || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.newClientsThisMonth || 0} {t('newThisMonth')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('totalInvoices')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalInvoices || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.invoicesThisMonth || 0} {t('createdThisMonth')}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('pendingPayments')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(dashboardData?.pendingAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.overdueInvoices || 0} {t('overdueInvoices')}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Invoices */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>{t('recentInvoices')}</CardTitle>
            <CardDescription>
              {t('youHave')} {dashboardData?.recentInvoices?.length || 0} {t('recentInvoices')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recentInvoices?.length > 0 ? (
                dashboardData.recentInvoices.map((invoice: any) => (
                  <div key={invoice.id} className="flex items-center">
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {invoice.client}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {t('invoiceNumber')}: {invoice.invoiceNumber}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {formatCurrency(invoice.amount)}
                    </div>
                    <div className="ml-4">
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(invoice.status)} text-white`}
                      >
                        {t(invoice.status.toLowerCase())}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">{t('noRecentInvoices')}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => navigate('/invoices')}>
              {t('viewAllInvoices')}
            </Button>
          </CardFooter>
        </Card>

        {/* AI Insights */}
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>{t('aiInsights')}</CardTitle>
            <CardDescription>
              {t('personalizedBusinessRecommendations')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isGeneratingInsights ? (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                  <p className="text-sm text-muted-foreground">{t('generatingInsights')}</p>
                </div>
              ) : aiInsights.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {aiInsights.map((insight, index) => (
                    <li key={index} className="flex items-start">
                      <div className="mr-2 mt-0.5 rounded-full bg-primary/10 p-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                      <p>{insight}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {t('noInsightsYet')}
                  </p>
                  <Button size="sm" onClick={() => generateAIInsights(dashboardData)}>
                    {t('generateInsights')}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold mb-4">{t('quickActions')}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-auto flex-col py-4 px-5" onClick={() => navigate('/invoices/new')}>
            <FileText className="h-6 w-6 mb-2" />
            <span>{t('createInvoice')}</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4 px-5" onClick={() => navigate('/clients/new')}>
            <UserPlus className="h-6 w-6 mb-2" />
            <span>{t('addClient')}</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4 px-5" onClick={() => navigate('/products/new')}>
            <Package className="h-6 w-6 mb-2" />
            <span>{t('addProduct')}</span>
          </Button>
          <Button variant="outline" className="h-auto flex-col py-4 px-5" onClick={() => navigate('/reports')}>
            <BarChart3 className="h-6 w-6 mb-2" />
            <span>{t('viewReports')}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
