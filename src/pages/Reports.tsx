import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart, 
  PieChart,
  Download,
  Calendar,
  Filter
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

// Mock data for charts
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API client
const reportsApi = {
  getSalesData: async (period: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/sales?period=${period}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      // For demo purposes, return mock data if API fails
      return getMockSalesData(period);
    }
  },
  getExpenseData: async (period: string): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/expenses?period=${period}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      // For demo purposes, return mock data if API fails
      return getMockExpenseData(period);
    }
  },
  getClientData: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/clients`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      // For demo purposes, return mock data if API fails
      return getMockClientData();
    }
  },
  getProductData: async (): Promise<any> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      // For demo purposes, return mock data if API fails
      return getMockProductData();
    }
  }
};

// Mock data functions
const getMockSalesData = (period: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let labels = [];
  let data = [];
  
  if (period === '6months') {
    labels = months.slice(0, 6);
    data = [12500, 17800, 15300, 21000, 18500, 24200];
  } else if (period === '1year') {
    labels = months;
    data = [12500, 17800, 15300, 21000, 18500, 24200, 22100, 19800, 23400, 25600, 22800, 27500];
  } else {
    // Default to 3 months
    labels = months.slice(0, 3);
    data = [15300, 21000, 18500];
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Sales',
        data,
        backgroundColor: 'rgba(37, 99, 235, 0.5)',
        borderColor: 'rgb(37, 99, 235)',
        borderWidth: 1,
      }
    ]
  };
};

const getMockExpenseData = (period: string) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let labels = [];
  let data = [];
  
  if (period === '6months') {
    labels = months.slice(0, 6);
    data = [5200, 6100, 4800, 7200, 6500, 8100];
  } else if (period === '1year') {
    labels = months;
    data = [5200, 6100, 4800, 7200, 6500, 8100, 7400, 6900, 8500, 9200, 8300, 9800];
  } else {
    // Default to 3 months
    labels = months.slice(0, 3);
    data = [4800, 7200, 6500];
  }
  
  return {
    labels,
    datasets: [
      {
        label: 'Expenses',
        data,
        backgroundColor: 'rgba(220, 38, 38, 0.5)',
        borderColor: 'rgb(220, 38, 38)',
        borderWidth: 1,
      }
    ]
  };
};

const getMockClientData = () => {
  return {
    labels: ['Acme Corp', 'Globex', 'Stark Industries', 'Wayne Enterprises', 'LexCorp'],
    datasets: [
      {
        label: 'Revenue by Client',
        data: [25000, 18500, 32000, 15500, 21000],
        backgroundColor: [
          'rgba(37, 99, 235, 0.7)',
          'rgba(220, 38, 38, 0.7)',
          'rgba(5, 150, 105, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(139, 92, 246, 0.7)',
        ],
        borderWidth: 1,
      }
    ]
  };
};

const getMockProductData = () => {
  return {
    labels: ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'],
    datasets: [
      {
        label: 'Sales by Product',
        data: [42, 35, 27, 18, 10],
        backgroundColor: [
          'rgba(37, 99, 235, 0.7)',
          'rgba(220, 38, 38, 0.7)',
          'rgba(5, 150, 105, 0.7)',
          'rgba(245, 158, 11, 0.7)',
          'rgba(139, 92, 246, 0.7)',
        ],
        borderWidth: 1,
      }
    ]
  };
};

// Options for charts
const barOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};

const lineOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

const pieOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top' as const,
    },
  },
};

const Reports: React.FC = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('financial');
  const [salesPeriod, setSalesPeriod] = useState('3months');
  const [expensePeriod, setExpensePeriod] = useState('3months');
  const [salesData, setSalesData] = useState<any>(null);
  const [expenseData, setExpenseData] = useState<any>(null);
  const [clientData, setClientData] = useState<any>(null);
  const [productData, setProductData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on component mount and when periods change
  useEffect(() => {
    fetchData();
  }, [salesPeriod, expensePeriod]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sales, expenses, clients, products] = await Promise.all([
        reportsApi.getSalesData(salesPeriod),
        reportsApi.getExpenseData(expensePeriod),
        reportsApi.getClientData(),
        reportsApi.getProductData()
      ]);
      
      setSalesData(sales);
      setExpenseData(expenses);
      setClientData(clients);
      setProductData(products);
    } catch (error) {
      console.error('Failed to fetch report data', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (!salesData || !expenseData) return { totalSales: 0, totalExpenses: 0, profit: 0, profitMargin: 0 };
    
    const totalSales = salesData.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0);
    const totalExpenses = expenseData.datasets[0].data.reduce((sum: number, val: number) => sum + val, 0);
    const profit = totalSales - totalExpenses;
    const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;
    
    return { totalSales, totalExpenses, profit, profitMargin };
  };

  const { totalSales, totalExpenses, profit, profitMargin } = calculateSummaryMetrics();

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Get date range text
  const getDateRangeText = (period: string) => {
    const now = new Date();
    let months = 3;
    
    if (period === '6months') {
      months = 6;
    } else if (period === '1year') {
      months = 12;
    }
    
    const startDate = startOfMonth(subMonths(now, months - 1));
    const endDate = endOfMonth(now);
    
    return `${format(startDate, 'MMM yyyy')} - ${format(endDate, 'MMM yyyy')}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('reports')}</h1>
        <p className="text-muted-foreground">
          View financial and business performance reports
        </p>
      </div>

      <Tabs defaultValue="financial" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="financial">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t('financialReports')}
          </TabsTrigger>
          <TabsTrigger value="sales">
            <LineChart className="h-4 w-4 mr-2" />
            {t('salesReports')}
          </TabsTrigger>
          <TabsTrigger value="clients">
            <PieChart className="h-4 w-4 mr-2" />
            {t('clientReports')}
          </TabsTrigger>
        </TabsList>
        
        {/* Financial Reports Tab */}
        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('totalSales')}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
                <p className="text-xs text-muted-foreground">
                  {getDateRangeText(salesPeriod)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('totalExpenses')}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(totalExpenses)}</div>
                <p className="text-xs text-muted-foreground">
                  {getDateRangeText(expensePeriod)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('profit')}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(profit)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {getDateRangeText(salesPeriod)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('profitMargin')}
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profitMargin.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {getDateRangeText(salesPeriod)}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('salesOverTime')}</CardTitle>
                  <Select
                    value={salesPeriod}
                    onValueChange={setSalesPeriod}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">3 {t('months')}</SelectItem>
                      <SelectItem value="6months">6 {t('months')}</SelectItem>
                      <SelectItem value="1year">1 {t('year')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  {t('salesTrend')} {getDateRangeText(salesPeriod)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : salesData ? (
                  <Bar data={salesData} options={barOptions} height={300} />
                ) : null}
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  {t('download')}
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('expensesOverTime')}</CardTitle>
                  <Select
                    value={expensePeriod}
                    onValueChange={setExpensePeriod}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3months">3 {t('months')}</SelectItem>
                      <SelectItem value="6months">6 {t('months')}</SelectItem>
                      <SelectItem value="1year">1 {t('year')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardDescription>
                  {t('expensesTrend')} {getDateRangeText(expensePeriod)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : expenseData ? (
                  <Line data={expenseData} options={lineOptions} height={300} />
                ) : null}
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  {t('download')}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        {/* Sales Reports Tab */}
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('monthlySales')}</CardTitle>
              <CardDescription>
                {t('salesByMonth')} {getDateRangeText(salesPeriod)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : salesData ? (
                <Bar data={salesData} options={barOptions} height={400} />
              ) : null}
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {t('download')}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('productSales')}</CardTitle>
              <CardDescription>
                {t('salesByProduct')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : productData ? (
                <div className="flex justify-center">
                  <div style={{ width: '50%', height: '400px' }}>
                    <Pie data={productData} options={pieOptions} />
                  </div>
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {t('download')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Client Reports Tab */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('clientRevenue')}</CardTitle>
              <CardDescription>
                {t('revenueByClient')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : clientData ? (
                <Bar data={clientData} options={barOptions} height={400} />
              ) : null}
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {t('download')}
              </Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{t('clientDistribution')}</CardTitle>
              <CardDescription>
                {t('revenueDistribution')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : clientData ? (
                <div className="flex justify-center">
                  <div style={{ width: '50%', height: '400px' }}>
                    <Pie data={clientData} options={pieOptions} />
                  </div>
                </div>
              ) : null}
            </CardContent>
            <CardFooter className="justify-end">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                {t('download')}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports; 