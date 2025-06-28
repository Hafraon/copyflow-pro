'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { BarChart3, FileText, Settings, CreditCard, Download, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Header } from '@/components/Header';
import { SubscriptionStatus } from '@/components/SubscriptionStatus';
import { translations, type Language } from '@/lib/translations';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';
import { toast } from 'sonner';

interface Generation {
  id: string;
  productName: string;
  content: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('ua');
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);
  const t = translations[language];

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      fetchGenerations();
    }
  }, [session]);

  const fetchGenerations = async () => {
    try {
      const response = await fetch('/api/user/generations');
      if (response.ok) {
        const data = await response.json();
        setGenerations(data);
      }
    } catch (error) {
      console.error('Failed to fetch generations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const exportGeneration = (generation: Generation) => {
    try {
      const content = JSON.parse(generation.content);
      const exportData = {
        productName: generation.productName,
        createdAt: generation.createdAt,
        ...content
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generation.productName}_${format(new Date(generation.createdAt), 'yyyy-MM-dd')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(language === 'ua' ? 'Експорт завершено' : 'Export completed');
    } catch (error) {
      toast.error(language === 'ua' ? 'Помилка експорту' : 'Export failed');
    }
  };

  const deleteGeneration = async (id: string) => {
    if (!confirm(language === 'ua' ? 'Видалити цю генерацію?' : 'Delete this generation?')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/generations/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setGenerations(prev => prev.filter(g => g.id !== id));
        toast.success(language === 'ua' ? 'Генерацію видалено' : 'Generation deleted');
      }
    } catch (error) {
      toast.error(language === 'ua' ? 'Помилка видалення' : 'Delete failed');
    }
  };

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ua' ? 'Панель управління' : 'Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'ua' 
              ? `Вітаємо, ${session.user?.name || session.user?.email}!`
              : `Welcome, ${session.user?.name || session.user?.email}!`
            }
          </p>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>{language === 'ua' ? 'Огляд' : 'Overview'}</span>
            </TabsTrigger>
            <TabsTrigger value="generations" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>{language === 'ua' ? 'Генерації' : 'Generations'}</span>
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center space-x-2">
              <CreditCard className="w-4 h-4" />
              <span>{language === 'ua' ? 'Підписка' : 'Billing'}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>{language === 'ua' ? 'Налаштування' : 'Settings'}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language === 'ua' ? 'Всього генерацій' : 'Total Generations'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{generations.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language === 'ua' ? 'Цього місяця' : 'This Month'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {generations.filter(g => {
                      const genDate = new Date(g.createdAt);
                      const now = new Date();
                      return genDate.getMonth() === now.getMonth() && genDate.getFullYear() === now.getFullYear();
                    }).length}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {language === 'ua' ? 'Останні 7 днів' : 'Last 7 Days'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {generations.filter(g => {
                      const genDate = new Date(g.createdAt);
                      const weekAgo = new Date();
                      weekAgo.setDate(weekAgo.getDate() - 7);
                      return genDate >= weekAgo;
                    }).length}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>{language === 'ua' ? 'Швидкі дії' : 'Quick Actions'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button 
                    onClick={() => router.push('/')}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                  >
                    {language === 'ua' ? 'Створити новий контент' : 'Create New Content'}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/pricing')}
                  >
                    {language === 'ua' ? 'Переглянути плани' : 'View Plans'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ua' ? 'Історія генерацій' : 'Generation History'}</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : generations.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ua' ? 'Поки що немає генерацій' : 'No generations yet'}
                    </p>
                    <Button 
                      onClick={() => router.push('/')}
                      className="mt-4"
                    >
                      {language === 'ua' ? 'Створити першу генерацію' : 'Create First Generation'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generations.map((generation) => (
                      <div key={generation.id} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium">{generation.productName}</h3>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => exportGeneration(generation)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteGeneration(generation.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(generation.createdAt), 'dd MMMM yyyy, HH:mm', {
                            locale: language === 'ua' ? uk : undefined
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <SubscriptionStatus language={language} onUpgrade={handleUpgrade} />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ua' ? 'Налаштування профілю' : 'Profile Settings'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <p className="text-sm text-muted-foreground">{session.user?.email}</p>
                </div>
                {session.user?.name && (
                  <div>
                    <label className="text-sm font-medium">
                      {language === 'ua' ? 'Імʼя' : 'Name'}
                    </label>
                    <p className="text-sm text-muted-foreground">{session.user.name}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium">
                    {language === 'ua' ? 'Мова інтерфейсу' : 'Interface Language'}
                  </label>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ua' ? 'Українська' : 'English'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}