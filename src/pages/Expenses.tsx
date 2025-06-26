import React, { useState, useEffect, useRef } from 'react';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  Receipt,
  Download,
  FileText,
  Calendar,
  Tag,
  Upload
} from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from '../components/ui/use-toast';
import { useLanguage } from '../contexts/LanguageContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  currency: string;
  category: string;
  receiptUrl?: string;
  notes?: string;
}

// API client
const expensesApi = {
  getAll: async (): Promise<Expense[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/expenses`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      // For demo purposes, return mock data if API fails
      return getMockExpenses();
    }
  },
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/expenses/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  },
  uploadReceipt: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('receipt', file);
    
    try {
      const response = await axios.post(`${API_BASE_URL}/expenses/${id}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data.receiptUrl;
    } catch (error) {
      // For demo purposes, return a mock URL
      return `/receipts/receipt-${id}.pdf`;
    }
  }
};

// Mock data for development
const getMockExpenses = (): Expense[] => {
  return [
    {
      id: '1',
      date: '2023-07-01',
      description: 'Office supplies',
      amount: 125.50,
      currency: 'USD',
      category: 'Office',
      receiptUrl: '/receipts/receipt-001.pdf',
      notes: 'Purchased pens, notebooks, and printer paper'
    },
    {
      id: '2',
      date: '2023-07-05',
      description: 'Client lunch',
      amount: 78.25,
      currency: 'USD',
      category: 'Meals',
      receiptUrl: '/receipts/receipt-002.pdf',
      notes: 'Lunch with Acme Corp representatives'
    },
    {
      id: '3',
      date: '2023-07-10',
      description: 'Software subscription',
      amount: 49.99,
      currency: 'USD',
      category: 'Software',
      receiptUrl: '/receipts/receipt-003.pdf'
    },
    {
      id: '4',
      date: '2023-07-15',
      description: 'Travel expenses',
      amount: 350.75,
      currency: 'USD',
      category: 'Travel',
      receiptUrl: '/receipts/receipt-004.pdf',
      notes: 'Flight to client meeting in Chicago'
    },
    {
      id: '5',
      date: '2023-07-20',
      description: 'Conference registration',
      amount: 299.00,
      currency: 'USD',
      category: 'Professional Development',
      receiptUrl: '/receipts/receipt-005.pdf',
      notes: 'Annual industry conference registration fee'
    }
  ];
};

// Category colors
const getCategoryColor = (category: string): string => {
  const categories: Record<string, string> = {
    'Office': 'bg-blue-100 text-blue-800 border-blue-200',
    'Meals': 'bg-green-100 text-green-800 border-green-200',
    'Software': 'bg-purple-100 text-purple-800 border-purple-200',
    'Travel': 'bg-amber-100 text-amber-800 border-amber-200',
    'Professional Development': 'bg-pink-100 text-pink-800 border-pink-200'
  };
  
  return categories[category] || 'bg-gray-100 text-gray-800 border-gray-200';
};

const Expenses: React.FC = () => {
  const { t } = useLanguage();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [filteredExpenses, setFilteredExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch expenses on component mount
  useEffect(() => {
    fetchExpenses();
  }, []);

  // Filter expenses when search term or category changes
  useEffect(() => {
    let filtered = expenses;

    if (searchTerm) {
      filtered = filtered.filter(expense => 
        expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(expense => expense.category === categoryFilter);
    }

    setFilteredExpenses(filtered);
  }, [searchTerm, categoryFilter, expenses]);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expensesApi.getAll();
      setExpenses(data);
      setFilteredExpenses(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToFetchExpenses'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentExpense) return;
    
    try {
      await expensesApi.delete(currentExpense.id);
      toast({
        title: t('success'),
        description: t('expenseDeletedSuccessfully'),
      });
      setIsDeleteDialogOpen(false);
      // For demo, just remove from state
      setExpenses(expenses.filter(expense => expense.id !== currentExpense.id));
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToDeleteExpense'),
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsDeleteDialogOpen(true);
  };

  const openUploadDialog = (expense: Expense) => {
    setCurrentExpense(expense);
    setIsUploadDialogOpen(true);
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentExpense || !event.target.files || event.target.files.length === 0) return;
    
    const file = event.target.files[0];
    try {
      const receiptUrl = await expensesApi.uploadReceipt(currentExpense.id, file);
      
      // Update expense in state
      const updatedExpenses = expenses.map(expense => 
        expense.id === currentExpense.id 
          ? { ...expense, receiptUrl } 
          : expense
      );
      
      setExpenses(updatedExpenses);
      setIsUploadDialogOpen(false);
      
      toast({
        title: t('success'),
        description: t('receiptUploaded'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToUploadReceipt'),
        variant: "destructive",
      });
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Format currency
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  // Get all unique categories
  const getUniqueCategories = () => {
    const categories = new Set<string>();
    expenses.forEach(expense => categories.add(expense.category));
    return Array.from(categories);
  };

  // Calculate total expenses
  const calculateTotal = () => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('expenses')}</h1>
          <p className="text-muted-foreground">
            {t('manageExpenses')}
          </p>
        </div>
        <Button onClick={() => window.location.href = "/expenses/new"}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('addExpense')}
        </Button>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`${t('search')} ${t('expenses')}...`}
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={`${t('category')}: ${t('all')}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              {getUniqueCategories().map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t('expenses')}</CardTitle>
            <CardDescription>
              {filteredExpenses.length} {t('totalExpensesCount')}
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">{t('total')}</p>
            <p className="text-2xl font-bold">{formatCurrency(calculateTotal(), 'USD')}</p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredExpenses.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('description')}</TableHead>
                  <TableHead>{t('category')}</TableHead>
                  <TableHead className="text-right">{t('amount')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {format(new Date(expense.date), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{expense.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${getCategoryColor(expense.category)} flex items-center`}>
                        <Tag className="h-3 w-3 mr-1" />
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(expense.amount, expense.currency)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('openMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.location.href = `/expenses/${expense.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t('view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.location.href = `/expenses/${expense.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('edit')}
                          </DropdownMenuItem>
                          {expense.receiptUrl ? (
                            <DropdownMenuItem onClick={() => window.open(expense.receiptUrl, '_blank')}>
                              <Receipt className="mr-2 h-4 w-4" />
                              {t('viewReceipt')}
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => openUploadDialog(expense)}>
                              <Upload className="mr-2 h-4 w-4" />
                              {t('uploadReceipt')}
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => openDeleteDialog(expense)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Receipt className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-2">{t('noResults')}</p>
              <Button variant="outline" onClick={() => window.location.href = "/expenses/new"}>
                {t('addExpense')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirm')} {t('delete')}</DialogTitle>
            <DialogDescription>
              {t('areYouSureDeleteExpense')}? {t('actionCannotBeUndone')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Receipt Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('uploadReceipt')}</DialogTitle>
            <DialogDescription>
              {t('uploadReceipt')} for {currentExpense?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*, application/pdf"
              />
              <Button onClick={triggerFileInput} variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                {t('selectFile')}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              {t('cancel')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Expenses; 