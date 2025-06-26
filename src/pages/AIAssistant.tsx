import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Send, 
  Clock,
  FileText,
  Mail,
  BarChart3,
  History
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
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
import { AIGeneratedContent } from '../types';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// API client
const aiApi = {
  generate: async (data: { type: string, prompt: string, context?: string }): Promise<{ content: string, id: string }> => {
    const response = await axios.post(`${API_BASE_URL}/ai/generate`, data, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  },
  getHistory: async (): Promise<AIGeneratedContent[]> => {
    const response = await axios.get(`${API_BASE_URL}/ai/history`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  }
};

const AIAssistant: React.FC = () => {
  const { t } = useLanguage();
  const [type, setType] = useState<string>('email_template');
  const [prompt, setPrompt] = useState<string>('');
  const [context, setContext] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [history, setHistory] = useState<AIGeneratedContent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const data = await aiApi.getHistory();
      setHistory(data);
    } catch (error) {
      toast({
        title: t('error'),
        description: "Failed to fetch AI history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: t('error'),
        description: "Please enter a prompt",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const data = await aiApi.generate({ type, prompt, context });
      setContent(data.content);
      await fetchHistory();
      toast({
        title: t('success'),
        description: "Content generated successfully",
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: "Failed to generate content",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email_template':
        return <Mail className="h-4 w-4" />;
      case 'invoice_template':
        return <FileText className="h-4 w-4" />;
      case 'blog_post':
        return <FileText className="h-4 w-4" />;
      case 'financial_insights':
        return <BarChart3 className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'email_template':
        return t('emailTemplate');
      case 'invoice_template':
        return 'Invoice Template';
      case 'blog_post':
        return t('blogPost');
      case 'financial_insights':
        return 'Financial Insights';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('aiAssistant')}</h1>
          <p className="text-muted-foreground">
            Generate professional content for your business
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t('generateContent')}</CardTitle>
              <CardDescription>
                Select content type and enter your prompt
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('contentType')}</label>
                <Select
                  value={type}
                  onValueChange={(value) => setType(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email_template">{t('emailTemplate')}</SelectItem>
                    <SelectItem value="marketing_copy">{t('marketingCopy')}</SelectItem>
                    <SelectItem value="product_description">{t('productDescription')}</SelectItem>
                    <SelectItem value="social_media_post">{t('socialMediaPost')}</SelectItem>
                    <SelectItem value="blog_post">{t('blogPost')}</SelectItem>
                    <SelectItem value="custom">{t('customContent')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('prompt')}</label>
                <Textarea
                  placeholder="Enter your prompt here..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">{t('context')} ({t('optional')})</label>
                <Textarea
                  placeholder="Add any additional context..."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating}
                className="w-full"
              >
                <Brain className="mr-2 h-4 w-4" />
                {isGenerating ? t('generatingContent') : t('generate')}
              </Button>
            </CardFooter>
          </Card>

          {content && (
            <Card>
              <CardHeader>
                <CardTitle>{t('generateContent')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md whitespace-pre-wrap">
                  {content}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(content);
                    toast({
                      title: t('copied'),
                      description: "Content copied to clipboard",
                    });
                  }}
                >
                  {t('copyToClipboard')}
                </Button>
              </CardFooter>
            </Card>
          )}
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-4 w-4" />
                {t('recentGenerations')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : history.length > 0 ? (
                <div className="space-y-4">
                  {history.map((item) => (
                    <div key={item.id} className="border rounded-md p-3 cursor-pointer hover:bg-accent" onClick={() => setContent(item.content)}>
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline" className="flex items-center">
                          {getTypeIcon(item.type)}
                          <span className="ml-1">{getTypeLabel(item.type)}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          <Clock className="inline h-3 w-3 mr-1" />
                          {new Date(item.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm line-clamp-2">{item.prompt}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No generations yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant; 