import React, { useState, useEffect } from 'react';
import { 
  PlusCircle, 
  Search, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  FileText,
  Download,
  Send,
  Clock,
  CheckCircle,
  XCircle
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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Client {
  id: string;
  name: string;
}

interface Quote {
  id: string;
  quoteNumber: string;
  client: Client;
  issueDate: string;
  validUntil: string;
  status: string;
  totalAmount: number;
  currency: string;
}

// API client
const quotesApi = {
  getAll: async (): Promise<Quote[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/quotes`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      // For demo purposes, return mock data if API fails
      return getMockQuotes();
    }
  },
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/quotes/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  }
};

// Mock data for development
const getMockQuotes = (): Quote[] => {
  return [
    {
      id: '1',
      quoteNumber: 'Q-2023-001',
      client: {
        id: '1',
        name: 'Acme Corporation'
      },
      issueDate: '2023-06-15',
      validUntil: '2023-07-15',
      status: 'PENDING',
      totalAmount: 2500.00,
      currency: 'USD'
    },
    {
      id: '2',
      quoteNumber: 'Q-2023-002',
      client: {
        id: '2',
        name: 'Globex Industries'
      },
      issueDate: '2023-06-20',
      validUntil: '2023-07-20',
      status: 'ACCEPTED',
      totalAmount: 4750.50,
      currency: 'USD'
    },
    {
      id: '3',
      quoteNumber: 'Q-2023-003',
      client: {
        id: '3',
        name: 'Stark Enterprises'
      },
      issueDate: '2023-06-25',
      validUntil: '2023-07-25',
      status: 'REJECTED',
      totalAmount: 1850.75,
      currency: 'USD'
    },
    {
      id: '4',
      quoteNumber: 'Q-2023-004',
      client: {
        id: '4',
        name: 'Wayne Industries'
      },
      issueDate: '2023-07-01',
      validUntil: '2023-08-01',
      status: 'DRAFT',
      totalAmount: 3200.25,
      currency: 'USD'
    },
    {
      id: '5',
      quoteNumber: 'Q-2023-005',
      client: {
        id: '5',
        name: 'LexCorp'
      },
      issueDate: '2023-07-05',
      validUntil: '2023-08-05',
      status: 'EXPIRED',
      totalAmount: 6500.00,
      currency: 'USD'
    }
  ];
};

const Quotes: React.FC = () => {
  const { t } = useLanguage();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [filteredQuotes, setFilteredQuotes] = useState<Quote[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  // Fetch quotes on component mount
  useEffect(() => {
    fetchQuotes();
  }, []);

  // Filter quotes when search term or status changes
  useEffect(() => {
    let filtered = quotes;

    if (searchTerm) {
      filtered = filtered.filter(quote => 
        quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        quote.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(quote => quote.status === statusFilter);
    }

    setFilteredQuotes(filtered);
  }, [searchTerm, statusFilter, quotes]);

  const fetchQuotes = async () => {
    setIsLoading(true);
    try {
      const data = await quotesApi.getAll();
      setQuotes(data);
      setFilteredQuotes(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToFetchQuotes'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentQuote) return;
    
    try {
      await quotesApi.delete(currentQuote.id);
      toast({
        title: t('success'),
        description: t('quoteDeletedSuccessfully'),
      });
      setIsDeleteDialogOpen(false);
      // For demo, just remove from state
      setQuotes(quotes.filter(quote => quote.id !== currentQuote.id));
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToDeleteQuote'),
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (quote: Quote) => {
    setCurrentQuote(quote);
    setIsDeleteDialogOpen(true);
  };

  // Format currency
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(value);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return (
          <Badge variant="outline" className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {t('draft')}
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge variant="secondary" className="flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {t('pending')}
          </Badge>
        );
      case 'ACCEPTED':
        return (
          <Badge variant="default" className="bg-green-600 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('accepted')}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge variant="destructive" className="flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            {t('rejected')}
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500 flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            {t('expired')}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Generate PDF for quote
  const generatePDF = (quote: Quote) => {
    try {
      const doc = new jsPDF();
      
      // Add company logo/name
      doc.setFontSize(20);
      doc.text('Your Company', 20, 20);
      
      // Add quote details
      doc.setFontSize(16);
      doc.text(`${t('quoteNumber')}: ${quote.quoteNumber}`, 20, 40);
      
      // Add client info
      doc.setFontSize(12);
      doc.text(`${t('client')}: ${quote.client.name}`, 20, 50);
      doc.text(`${t('date')}: ${format(new Date(quote.issueDate), 'MMM d, yyyy')}`, 20, 60);
      doc.text(`${t('validUntil')}: ${format(new Date(quote.validUntil), 'MMM d, yyyy')}`, 20, 70);
      
      // Add status
      doc.text(`${t('status')}: ${quote.status}`, 20, 80);
      
      // Add total
      doc.text(`${t('total')}: ${formatCurrency(quote.totalAmount, quote.currency)}`, 20, 90);
      
      // Add notes section
      doc.text(`${t('notes')}:`, 20, 110);
      doc.text('Thank you for your business!', 20, 120);
      
      // Save the PDF
      doc.save(`quote-${quote.quoteNumber}.pdf`);
      
      toast({
        title: t('success'),
        description: t('quoteDownloaded'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToGenerateQuotePDF'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('quotes')}</h1>
          <p className="text-muted-foreground">
            {t('manageQuotes')}
          </p>
        </div>
        <Button onClick={() => window.location.href = "/quotes/new"}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('createQuote')}
        </Button>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`${t('search')} ${t('quotes')}...`}
            className="w-full pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={`${t('status')}: ${t('all')}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('all')}</SelectItem>
              <SelectItem value="DRAFT">{t('draft')}</SelectItem>
              <SelectItem value="PENDING">{t('pending')}</SelectItem>
              <SelectItem value="ACCEPTED">{t('accepted')}</SelectItem>
              <SelectItem value="REJECTED">{t('rejected')}</SelectItem>
              <SelectItem value="EXPIRED">{t('expired')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('quotes')}</CardTitle>
          <CardDescription>
            {quotes.length} {t('totalQuotes')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredQuotes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('quoteNumber')}</TableHead>
                  <TableHead>{t('name')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('validUntil')}</TableHead>
                  <TableHead>{t('amount')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredQuotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-medium">{quote.quoteNumber}</TableCell>
                    <TableCell>{quote.client.name}</TableCell>
                    <TableCell>{format(new Date(quote.issueDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(quote.validUntil), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{formatCurrency(quote.totalAmount, quote.currency)}</TableCell>
                    <TableCell>{getStatusBadge(quote.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('openMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.location.href = `/quotes/${quote.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t('view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.location.href = `/quotes/${quote.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => generatePDF(quote)}>
                            <Download className="mr-2 h-4 w-4" />
                            {t('download')} PDF
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(quote)}>
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
              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground mb-2">{t('noResults')}</p>
              <Button variant="outline" onClick={() => window.location.href = "/quotes/new"}>
                {t('createQuote')}
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
              {t('areYouSureDeleteQuote')} {currentQuote?.quoteNumber}? {t('actionCannotBeUndone')}
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
    </div>
  );
};

export default Quotes; 