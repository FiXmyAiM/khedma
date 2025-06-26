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
  AlertTriangle,
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
import { Invoice } from '../types';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API client
const invoicesApi = {
  getAll: async (): Promise<Invoice[]> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoices:", error);
      // Return mock data for demo purposes
      return getMockInvoices();
    }
  },
  delete: async (id: string): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/invoices/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
  },
  getById: async (id: string): Promise<Invoice> => {
    try {
      const response = await axios.get(`${API_BASE_URL}/invoices/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching invoice:", error);
      // Return a mock invoice for demo purposes
      return getMockInvoices().find(inv => inv.id === id) || getMockInvoices()[0];
    }
  }
};

// Mock data for development
const getMockInvoices = (): Invoice[] => {
  return [
    {
      id: '1',
      invoiceNumber: 'INV-2023-001',
      client: {
        id: '1',
        name: 'Acme Corporation',
        email: 'billing@acme.com',
        createdAt: '2023-01-01'
      },
      issueDate: '2023-06-01',
      dueDate: '2023-06-15',
      status: 'PAID',
      items: [
        {
          id: '1',
          description: 'Web Development Services',
          quantity: 1,
          unitPrice: 2000,
          totalPrice: 2000
        }
      ],
      totalAmount: 2000,
      currency: 'USD',
      notes: 'Thank you for your business!',
      createdAt: '2023-06-01'
    },
    {
      id: '2',
      invoiceNumber: 'INV-2023-002',
      client: {
        id: '2',
        name: 'Globex Industries',
        email: 'accounts@globex.com',
        createdAt: '2023-01-02'
      },
      issueDate: '2023-06-05',
      dueDate: '2023-06-19',
      status: 'SENT',
      items: [
        {
          id: '2',
          description: 'UI/UX Design',
          quantity: 1,
          unitPrice: 1500,
          totalPrice: 1500
        }
      ],
      totalAmount: 1500,
      currency: 'USD',
      createdAt: '2023-06-05'
    },
    {
      id: '3',
      invoiceNumber: 'INV-2023-003',
      client: {
        id: '3',
        name: 'Wayne Enterprises',
        email: 'finance@wayne.com',
        createdAt: '2023-01-03'
      },
      issueDate: '2023-06-10',
      dueDate: '2023-06-24',
      status: 'OVERDUE',
      items: [
        {
          id: '3',
          description: 'Consulting Services',
          quantity: 5,
          unitPrice: 200,
          totalPrice: 1000
        }
      ],
      totalAmount: 1000,
      currency: 'USD',
      createdAt: '2023-06-10'
    }
  ];
};

const Invoices: React.FC = () => {
  const { t } = useLanguage();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  // Fetch invoices on component mount
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Filter invoices when search term or status changes
  useEffect(() => {
    let filtered = invoices;

    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter);
    }

    setFilteredInvoices(filtered);
  }, [searchTerm, statusFilter, invoices]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const data = await invoicesApi.getAll();
      setInvoices(data);
      setFilteredInvoices(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToFetchInvoices'),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentInvoice) return;
    
    try {
      await invoicesApi.delete(currentInvoice.id);
      toast({
        title: t('success'),
        description: t('invoiceDeletedSuccessfully'),
      });
      setIsDeleteDialogOpen(false);
      fetchInvoices();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('failedToDeleteInvoice'),
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (invoice: Invoice) => {
    setCurrentInvoice(invoice);
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
      case 'SENT':
        return (
          <Badge variant="secondary" className="flex items-center">
            <Send className="h-3 w-3 mr-1" />
            {t('sent')}
          </Badge>
        );
      case 'PAID':
        return (
          <Badge variant="default" className="bg-green-600 flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            {t('paid')}
          </Badge>
        );
      case 'OVERDUE':
        return (
          <Badge variant="destructive" className="flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {t('overdue')}
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            {t('cancelled')}
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Generate PDF invoice
  const generatePDF = async (invoiceId: string) => {
    try {
      const invoice = await invoicesApi.getById(invoiceId);
      
      const doc = new jsPDF();
      
      // Add company logo/header
      doc.setFontSize(20);
      doc.text('Swiver Clone', 20, 20);
      
      // Invoice details
      doc.setFontSize(12);
      doc.text(`${t('invoiceNumber')}: ${invoice.invoiceNumber}`, 20, 40);
      doc.text(`${t('date')}: ${format(new Date(invoice.issueDate), 'MMM d, yyyy')}`, 20, 50);
      doc.text(`${t('dueDate')}: ${format(new Date(invoice.dueDate), 'MMM d, yyyy')}`, 20, 60);
      
      // Client details
      doc.text(`${t('billTo')}:`, 120, 40);
      doc.text(`${invoice.client.name}`, 120, 50);
      doc.text(`${invoice.client.email || ''}`, 120, 60);
      
      // Invoice items
      const tableColumn = [t('description'), t('quantity'), t('unitPrice'), t('amount')];
      const tableRows = [];
      
      for (const item of invoice.items) {
        const itemData = [
          item.description,
          item.quantity.toString(),
          formatCurrency(item.unitPrice, invoice.currency).replace(invoice.currency, '').trim(),
          formatCurrency(item.totalPrice, invoice.currency).replace(invoice.currency, '').trim()
        ];
        tableRows.push(itemData);
      }
      
      // @ts-ignore
      doc.autoTable({
        startY: 80,
        head: [tableColumn],
        body: tableRows,
        theme: 'striped',
        headStyles: { fillColor: [41, 128, 185] }
      });
      
      // Total
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      doc.text(`${t('total')}: ${formatCurrency(invoice.totalAmount, invoice.currency)}`, 150, finalY + 20);
      
      // Notes
      if (invoice.notes) {
        doc.text(`${t('notes')}:`, 20, finalY + 40);
        doc.text(invoice.notes, 20, finalY + 50);
      }
      
      // Save the PDF
      doc.save(`${invoice.invoiceNumber}.pdf`);
      
      toast({
        title: t('success'),
        description: t('invoiceDownloaded'),
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: t('error'),
        description: t('failedToGeneratePDF'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('invoices')}</h1>
          <p className="text-muted-foreground">
            {t('manageInvoicesAndTrackPayments')}
          </p>
        </div>
        <Button onClick={() => window.location.href = "/invoices/new"}>
          <PlusCircle className="mr-2 h-4 w-4" />
          {t('createInvoice')}
        </Button>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`${t('search')} ${t('invoices')}...`}
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
              <SelectValue placeholder={`${t('filterByStatus')}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStatuses')}</SelectItem>
              <SelectItem value="DRAFT">{t('draft')}</SelectItem>
              <SelectItem value="SENT">{t('sent')}</SelectItem>
              <SelectItem value="PAID">{t('paid')}</SelectItem>
              <SelectItem value="OVERDUE">{t('overdue')}</SelectItem>
              <SelectItem value="CANCELLED">{t('cancelled')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('allInvoices')}</CardTitle>
          <CardDescription>
            {t('youHave')} {invoices.length} {t('totalInvoices')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('invoiceNumber')}</TableHead>
                  <TableHead>{t('client')}</TableHead>
                  <TableHead>{t('date')}</TableHead>
                  <TableHead>{t('dueDate')}</TableHead>
                  <TableHead>{t('amount')}</TableHead>
                  <TableHead>{t('status')}</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{invoice.client.name}</TableCell>
                    <TableCell>{format(new Date(invoice.issueDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), 'MMM d, yyyy')}</TableCell>
                    <TableCell>{formatCurrency(invoice.totalAmount, invoice.currency)}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">{t('openMenu')}</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => window.location.href = `/invoices/${invoice.id}`}>
                            <FileText className="mr-2 h-4 w-4" />
                            {t('view')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.location.href = `/invoices/${invoice.id}/edit`}>
                            <Edit className="mr-2 h-4 w-4" />
                            {t('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => generatePDF(invoice.id)}>
                            <Download className="mr-2 h-4 w-4" />
                            {t('downloadPDF')}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openDeleteDialog(invoice)}>
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
              <p className="text-muted-foreground mb-2">{t('noInvoicesFound')}</p>
              <Button variant="outline" onClick={() => window.location.href = "/invoices/new"}>
                {t('createInvoice')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('confirmDeletion')}</DialogTitle>
            <DialogDescription>
              {t('areYouSureDelete')} {currentInvoice?.invoiceNumber}? {t('actionCannotBeUndone')}
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

export default Invoices; 