import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart,
  Calendar, 
  Download
} from 'lucide-react';
import { format, subDays, subMonths } from 'date-fns';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { toast } from '../components/ui/use-toast';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface AnalyticsData {
  userGrowth: {
    labels: string[];
    data: number[];
  };
  revenueData: {
    labels: string[];
    data: number[];
  };
  planDistribution: {
    labels: string[];
    data: number[];
  };
  statusDistribution: {
    labels: string[];
    data: number[];
  };
  conversionRate: number;
  churnRate: number;
  avgUserLifetime: number;
  monthlyRecurringRevenue: number;
}

// API client
const analyticsApi = {
  getAnalytics: async (period: string): Promise<AnalyticsData> => {
    const response = await axios.get(`${API_BASE_URL}/admin/analytics?period=${period}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

// Mock data for development
const generateMockData = (period: string): AnalyticsData => {
  const today = new Date();
  const labels = [];
  const userData = [];
  const revenueData = [];
  
  let dataPoints = 7;
  let dateFormat = 'MMM d';
  let subtractFn = subDays;
  let subtractAmount = 1;
  
  if (period === 'month') {
    dataPoints = 30;
  } else if (period === 'quarter') {
    dataPoints = 12;
    dateFormat = 'MMM d';
    subtractFn = subDays;
    subtractAmount = 7;
  } else if (period === 'year') {
    dataPoints = 12;
    dateFormat = 'MMM yyyy';
    subtractFn = subMonths;
    subtractAmount = 1;
  }
  
  for (let i = dataPoints - 1; i >= 0; i--) {
    const date = subtractFn(today, i * subtractAmount);
    labels.push(format(date, dateFormat));
    userData.push(Math.floor(Math.random() * 10) + 10 * (dataPoints - i));
    revenueData.push(Math.floor(Math.random() * 500) + 1000 + 100 * (dataPoints - i));
  }
  
  return {
    userGrowth: {
      labels,
      data: userData,
    },
    revenueData: {
      labels,
      data: revenueData,
    },
    planDistribution: {
      labels: ['Free', 'Economic', 'Premium', 'VIP'],
      data: [45, 30, 20, 5],
    },
    statusDistribution: {
      labels: ['Active', 'Trial', 'Expired', 'Suspended'],
      data: [65, 20, 10, 5],
    },
    conversionRate: 35.8,
    churnRate: 4.2,
    avgUserLifetime: 8.5,
    monthlyRecurringRevenue: 12850.75,
  };
};

const AdminAnalytics: React.FC = () => {
  const [period, setPeriod] = useState<string>('month');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // In a real app, you'd use the API call below
      // const data = await analyticsApi.getAnalytics(period);
      
      // For development, we'll use mock data
      const data = generateMockData(period);
      setAnalyticsData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportData = () => {
    toast({
      title: "Export Started",
      description: "Your analytics data is being prepared for download.",
    });
    // In a real app, this would trigger a download of analytics data
  };

  const renderUserGrowthChart = () => {
    if (!analyticsData) return null;
    
    const { labels, data } = analyticsData.userGrowth;
    const maxValue = Math.max(...data) * 1.2;
    
    return (
      <div className="w-full h-64 mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          {labels.map((label, i) => (
            <div key={i} className="text-center" style={{ width: `${100/labels.length}%` }}>
              {label}
            </div>
          ))}
        </div>
        <div className="relative w-full h-48 bg-slate-50 rounded-md">
          <div className="absolute left-0 bottom-0 w-full h-px bg-slate-200"></div>
          <div className="absolute left-0 bottom-1/4 w-full h-px bg-slate-200"></div>
          <div className="absolute left-0 bottom-2/4 w-full h-px bg-slate-200"></div>
          <div className="absolute left-0 bottom-3/4 w-full h-px bg-slate-200"></div>
          
          <div className="absolute left-0 bottom-0 w-full h-full flex items-end">
            {data.map((value, i) => (
              <div 
                key={i} 
                className="relative h-full flex items-end justify-center"
                style={{ width: `${100/data.length}%` }}
              >
                <div 
                  className="w-4/5 bg-blue-500 rounded-t-sm"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                    {value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderRevenueChart = () => {
    if (!analyticsData) return null;
    
    const { labels, data } = analyticsData.revenueData;
    const maxValue = Math.max(...data) * 1.2;
    
    return (
      <div className="w-full h-64 mt-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          {labels.map((label, i) => (
            <div key={i} className="text-center" style={{ width: `${100/labels.length}%` }}>
              {label}
            </div>
          ))}
        </div>
        <div className="relative w-full h-48 bg-slate-50 rounded-md">
          <div className="absolute left-0 bottom-0 w-full h-px bg-slate-200"></div>
          <div className="absolute left-0 bottom-1/4 w-full h-px bg-slate-200"></div>
          <div className="absolute left-0 bottom-2/4 w-full h-px bg-slate-200"></div>
          <div className="absolute left-0 bottom-3/4 w-full h-px bg-slate-200"></div>
          
          <div className="absolute left-0 bottom-0 w-full h-full flex items-end">
            {data.map((value, i) => (
              <div 
                key={i} 
                className="relative h-full flex items-end justify-center"
                style={{ width: `${100/data.length}%` }}
              >
                <div 
                  className="w-4/5 bg-green-500 rounded-t-sm"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                >
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs">
                    ${value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderPlanDistributionChart = () => {
    if (!analyticsData) return null;
    
    const { labels, data } = analyticsData.planDistribution;
    const total = data.reduce((acc, val) => acc + val, 0);
    
    const colors = ['bg-gray-300', 'bg-blue-400', 'bg-purple-500', 'bg-amber-500'];
    
    return (
      <div className="w-full mt-4">
        <div className="flex h-40 items-center justify-center">
          <div className="relative w-40 h-40">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {data.map((value, i) => {
                const startPercent = data.slice(0, i).reduce((acc, val) => acc + val, 0) / total * 100;
                const percent = value / total * 100;
                
                const x1 = 50 + 40 * Math.cos(2 * Math.PI * startPercent / 100);
                const y1 = 50 + 40 * Math.sin(2 * Math.PI * startPercent / 100);
                
                const x2 = 50 + 40 * Math.cos(2 * Math.PI * (startPercent + percent) / 100);
                const y2 = 50 + 40 * Math.sin(2 * Math.PI * (startPercent + percent) / 100);
                
                const largeArcFlag = percent > 50 ? 1 : 0;
                
                return (
                  <path 
                    key={i}
                    d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    className={`${colors[i % colors.length]} hover:opacity-80`}
                  />
                );
              })}
            </svg>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {labels.map((label, i) => (
            <div key={i} className="flex items-center">
              <div className={`w-3 h-3 rounded-full ${colors[i % colors.length]} mr-2`}></div>
              <div className="text-sm">{label}</div>
              <div className="ml-auto text-sm font-medium">{data[i]}%</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Insights and metrics for your platform
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
              <SelectItem value="quarter">Last quarter</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">%</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.conversionRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Trial to paid conversion
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Churn Rate
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">%</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.churnRate.toFixed(1)}%</div>
                <p className="text-xs text-muted-foreground">
                  Monthly customer churn
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. User Lifetime
                </CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analyticsData?.avgUserLifetime.toFixed(1)} months</div>
                <p className="text-xs text-muted-foreground">
                  Average subscription duration
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Monthly Recurring Revenue
                </CardTitle>
                <div className="h-4 w-4 text-muted-foreground">$</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analyticsData?.monthlyRecurringRevenue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Current MRR
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user signups over time</CardDescription>
                </div>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderUserGrowthChart()}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Revenue</CardTitle>
                  <CardDescription>Total revenue over time</CardDescription>
                </div>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderRevenueChart()}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Plan Distribution</CardTitle>
                  <CardDescription>Users by subscription plan</CardDescription>
                </div>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {renderPlanDistributionChart()}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Status Distribution</CardTitle>
                  <CardDescription>Users by account status</CardDescription>
                </div>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {analyticsData && (
                  <div className="space-y-4 mt-4">
                    {analyticsData.statusDistribution.labels.map((label, i) => (
                      <div key={i} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${
                          i === 0 ? 'bg-green-500' : 
                          i === 1 ? 'bg-blue-500' : 
                          i === 2 ? 'bg-red-500' : 
                          'bg-gray-500'
                        } mr-2`}></div>
                        <div className="flex-1">{label}</div>
                        <div>{analyticsData.statusDistribution.data[i]}%</div>
                        <div className="w-24 h-2 rounded-full bg-gray-100 ml-2">
                          <div 
                            className={`h-full rounded-full ${
                              i === 0 ? 'bg-green-500' : 
                              i === 1 ? 'bg-blue-500' : 
                              i === 2 ? 'bg-red-500' : 
                              'bg-gray-500'
                            }`}
                            style={{ width: `${analyticsData.statusDistribution.data[i]}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics; 