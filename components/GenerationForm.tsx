'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Loader2, Wand2, Lock, Zap, Upload, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateFormSchema, type GenerateFormData, type GenerateResponse, type ViralContentResponse } from '@/lib/validations';
import { translations, type Language } from '@/lib/translations';
import { getAvailableLanguages, SUPPORTED_LANGUAGES } from '@/lib/languages';
import type { LanguageCode } from '@/lib/languages';
import { toast } from 'sonner';
import { UsageProgress } from './UsageProgress';
import { PhotoUpload } from './PhotoUpload';
import { UrlAnalysis } from './UrlAnalysis';
import { PremiumFeatureCard } from './PremiumFeatureCard';

interface GenerationFormProps {
  language: LanguageCode;
  onGenerate: (data: GenerateResponse) => void;
  onGenerateViral: (data: ViralContentResponse) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  isGeneratingViral: boolean;
  setIsGeneratingViral: (isGenerating: boolean) => void;
}

export function GenerationForm({ 
  language, 
  onGenerate, 
  onGenerateViral,
  isGenerating, 
  setIsGenerating,
  isGeneratingViral,
  setIsGeneratingViral
}: GenerationFormProps) {
  const { data: session, status } = useSession();
  const [usage, setUsage] = useState<{ generationsUsed: number; generationsLimit: number; subscription: string } | null>(null);
  const [activeTab, setActiveTab] = useState('manual');
  const t = translations[language as Language] || translations.en;
  const availableLanguages = getAvailableLanguages(session?.user ? 'pro' : 'free');
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<GenerateFormData>({
    resolver: zodResolver(generateFormSchema),
    mode: 'onChange',
    defaultValues: {
      language: language,
    },
  });

  const watchedCategory = watch('category');
  const watchedWritingStyle = watch('writingStyle');

  // Update form language when prop changes
  useEffect(() => {
    setValue('language', language);
  }, [language, setValue]);

  // Fetch usage data
  useEffect(() => {
    const fetchUsage = async () => {
      if (session) {
        try {
          const response = await fetch('/api/user/usage');
          if (response.ok) {
            const data = await response.json();
            setUsage(data);
          }
        } catch (error) {
          console.error('Failed to fetch usage:', error);
        }
      }
    };

    fetchUsage();
  }, [session]);

  const onSubmit = async (data: GenerateFormData) => {
    if (!session) {
      toast.error(language === 'en' ? 'Please sign in to generate content' : language === 'ua' ? 'Увійдіть, щоб створити контент' : 'Veuillez vous connecter pour générer du contenu');
      return;
    }

    if (usage && usage.generationsUsed >= usage.generationsLimit && usage.generationsLimit !== -1) {
      toast.error(language === 'en' ? 'Generation limit reached. Please upgrade your plan.' : language === 'ua' ? 'Досягнуто ліміт генерацій. Оновіть свій план.' : 'Limite de génération atteinte. Veuillez mettre à niveau votre plan.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate content');
      }

      const result: GenerateResponse = await response.json();
      onGenerate(result);
      toast.success(language === 'en' ? 'Content generated successfully!' : language === 'ua' ? 'Контент успішно створено!' : 'Contenu généré avec succès !');
      
      // Update usage count
      if (usage) {
        setUsage(prev => prev ? { ...prev, generationsUsed: prev.generationsUsed + 1 } : null);
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(error instanceof Error ? error.message : (language === 'en' ? 'Failed to generate content' : language === 'ua' ? 'Помилка створення контенту' : 'Échec de la génération de contenu'));
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmitViral = async (data: GenerateFormData) => {
    if (!session) {
      toast.error(language === 'en' ? 'Please sign in to generate viral content' : language === 'ua' ? 'Увійдіть, щоб створити вірусний контент' : 'Veuillez vous connecter pour générer du contenu viral');
      return;
    }

    if (usage?.subscription !== 'business') {
      toast.error(language === 'en' ? 'Business subscription required for viral content' : language === 'ua' ? 'Для вірусного контенту потрібна Business підписка' : 'Abonnement Business requis pour le contenu viral');
      return;
    }

    setIsGeneratingViral(true);
    
    try {
      const response = await fetch('/api/generate-viral', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate viral content');
      }

      const result: ViralContentResponse = await response.json();
      onGenerateViral(result);
      toast.success(language === 'en' ? 'Viral content generated successfully!' : language === 'ua' ? 'Вірусний контент успішно створено!' : 'Contenu viral généré avec succès !');
      
      // Update usage count
      if (usage) {
        setUsage(prev => prev ? { ...prev, generationsUsed: prev.generationsUsed + 1 } : null);
      }
    } catch (error) {
      console.error('Viral generation error:', error);
      toast.error(error instanceof Error ? error.message : (language === 'en' ? 'Failed to generate viral content' : language === 'ua' ? 'Помилка створення вірусного контенту' : 'Échec de la génération de contenu viral'));
    } finally {
      setIsGeneratingViral(false);
    }
  };

  const isAtLimit = usage && usage.generationsUsed >= usage.generationsLimit && usage.generationsLimit !== -1;
  const canGenerate = session && !isAtLimit && isValid;
  const canGenerateViral = session && usage?.subscription === 'business' && !isAtLimit && isValid;

  const currentLang = SUPPORTED_LANGUAGES[language];

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full"
      dir={currentLang.rtl ? 'rtl' : 'ltr'}
    >
      <div className="relative h-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm p-6">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-indigo-500/5" />
        
        <div className="relative z-10">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {t.subtitle}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t.description}
            </p>
          </div>

          {/* Usage Progress - Only show for authenticated users */}
          {session && (
            <div className="mb-6">
              <UsageProgress />
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual" className="flex items-center space-x-2">
                <Wand2 className="w-4 h-4" />
                <span>{t.manualInput}</span>
              </TabsTrigger>
              <TabsTrigger value="photo" className="flex items-center space-x-2">
                <Upload className="w-4 h-4" />
                <span>{t.photoAnalysis}</span>
              </TabsTrigger>
              <TabsTrigger value="url" className="flex items-center space-x-2">
                <Link className="w-4 h-4" />
                <span>{t.urlAnalysis}</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="productName" className="text-sm font-medium text-foreground">
                    {t.productName} *
                  </Label>
                  <Input
                    id="productName"
                    {...register('productName')}
                    placeholder={t.productNamePlaceholder}
                    className="w-full"
                    disabled={isGenerating || isGeneratingViral || !session}
                  />
                  {errors.productName && (
                    <p className="text-sm text-red-500">{errors.productName.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    {t.category} *
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('category', value as any)}
                    disabled={isGenerating || isGeneratingViral || !session}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.categoryPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(t.categories).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>

                {/* Writing Style */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    {t.writingStyle} *
                  </Label>
                  <Select
                    onValueChange={(value) => setValue('writingStyle', value as any)}
                    disabled={isGenerating || isGeneratingViral || !session}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t.writingStylePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(t.writingStyles).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.writingStyle && (
                    <p className="text-sm text-red-500">{errors.writingStyle.message}</p>
                  )}
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">
                    {t.language} *
                  </Label>
                  <Select
                    value={language}
                    onValueChange={(value) => setValue('language', value as any)}
                    disabled={isGenerating || isGeneratingViral || !session}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                
                    <SelectContent>
                      {availableLanguages.map((langCode) => {
                        const langData = SUPPORTED_LANGUAGES[langCode];
                        return (
                          <SelectItem key={langCode} value={langCode}>
                            <div className="flex items-center space-x-2">
                              <span>{langData.flag}</span>
                              <span>{langData.nativeName}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.language && (
                    <p className="text-sm text-red-500">{errors.language.message}</p>
                  )}
                </div>

                {/* Generate Buttons */}
                <div className="space-y-3">
                  {/* Standard Content Button */}
                  <motion.div
                    whileHover={{ scale: canGenerate ? 1.02 : 1 }}
                    whileTap={{ scale: canGenerate ? 0.98 : 1 }}
                  >
                    <Button
                      type="submit"
                      disabled={!canGenerate || isGenerating || isGeneratingViral}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!session ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {language === 'en' ? 'Sign in to Generate' : language === 'ua' ? 'Увійдіть для створення' : 'Connectez-vous pour générer'}
                        </>
                      ) : isGenerating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.generating}
                        </>
                      ) : isAtLimit ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {language === 'en' ? 'Limit Reached' : language === 'ua' ? 'Ліміт досягнуто' : 'Limite atteinte'}
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-2 h-4 w-4" />
                          {t.generateButton}
                        </>
                      )}
                    </Button>
                  </motion.div>

                  {/* Viral Content Button */}
                  <motion.div
                    whileHover={{ scale: canGenerateViral ? 1.02 : 1 }}
                    whileTap={{ scale: canGenerateViral ? 0.98 : 1 }}
                  >
                    <Button
                      type="button"
                      onClick={handleSubmit(onSubmitViral)}
                      disabled={!canGenerateViral || isGenerating || isGeneratingViral}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {!session ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {language === 'en' ? 'Sign in for Viral Content' : language === 'ua' ? 'Увійдіть для вірусного контенту' : 'Connectez-vous pour le contenu viral'}
                        </>
                      ) : usage?.subscription !== 'business' ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {language === 'en' ? 'Business Plan Required' : language === 'ua' ? 'Потрібен Business план' : 'Plan Business requis'}
                        </>
                      ) : isGeneratingViral ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {language === 'en' ? 'Creating Viral Content...' : language === 'ua' ? 'Створюємо вірусний контент...' : 'Création de contenu viral...'}
                        </>
                      ) : isAtLimit ? (
                        <>
                          <Lock className="mr-2 h-4 w-4" />
                          {language === 'en' ? 'Limit Reached' : language === 'ua' ? 'Ліміт досягнуто' : 'Limite atteinte'}
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          {language === 'en' ? 'Generate Viral Content' : language === 'ua' ? 'Створити вірусний контент' : 'Générer du contenu viral'}
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>

                {!session && (
                  <p className="text-xs text-muted-foreground text-center">
                    {language === 'en' 
                      ? 'Sign in to start generating amazing product content with AI' 
                      : language === 'ua' 
                      ? 'Увійдіть, щоб почати створювати чудовий контент товарів за допомогою ШІ'
                      : 'Connectez-vous pour commencer à générer un contenu produit incroyable avec l\'IA'
                    }
                  </p>
                )}
              </form>
            </TabsContent>

            <TabsContent value="photo">
              {session && usage?.subscription !== 'free' ? (
                <PhotoUpload 
                  language={language} 
                  onGenerate={onGenerate}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                />
              ) : (
                <PremiumFeatureCard
                  title={language === 'en' ? 'Photo Analysis' : language === 'ua' ? 'Фото аналіз' : 'Analyse photo'}
                  description={language === 'en' 
                    ? 'Upload product photos and let AI analyze them to generate perfect descriptions'
                    : language === 'ua'
                    ? 'Завантажте фото товарів і дозвольте ШІ проаналізувати їх для створення ідеальних описів'
                    : 'Téléchargez des photos de produits et laissez l\'IA les analyser pour générer des descriptions parfaites'
                  }
                  features={[
                    language === 'en' ? 'GPT-4 Vision analysis' : language === 'ua' ? 'Аналіз GPT-4 Vision' : 'Analyse GPT-4 Vision',
                    language === 'en' ? 'Automatic feature detection' : language === 'ua' ? 'Автоматичне виявлення особливостей' : 'Détection automatique des fonctionnalités',
                    language === 'en' ? 'Color and material recognition' : language === 'ua' ? 'Розпізнавання кольорів та матеріалів' : 'Reconnaissance des couleurs et matériaux'
                  ]}
                  requiredPlan="Pro+"
                  language={language}
                />
              )}
            </TabsContent>

            <TabsContent value="url">
              {session && usage?.subscription !== 'free' ? (
                <UrlAnalysis 
                  language={language} 
                  onGenerate={onGenerate}
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                />
              ) : (
                <PremiumFeatureCard
                  title={language === 'en' ? 'Competitor Analysis' : language === 'ua' ? 'Аналіз конкурентів' : 'Analyse concurrentielle'}
                  description={language === 'en' 
                    ? 'Analyze competitor product pages and generate superior content that outperforms them'
                    : language === 'ua'
                    ? 'Аналізуйте сторінки товарів конкурентів і створюйте кращий контент, який їх перевершує'
                    : 'Analysez les pages produits des concurrents et générez un contenu supérieur qui les surpasse'
                  }
                  features={[
                    language === 'en' ? 'Multi-platform scraping' : language === 'ua' ? 'Багатоплатформний скрапінг' : 'Scraping multi-plateforme',
                    language === 'en' ? 'Competitive intelligence' : language === 'ua' ? 'Конкурентна розвідка' : 'Intelligence concurrentielle',
                    language === 'en' ? 'Improvement suggestions' : language === 'ua' ? 'Пропозиції покращень' : 'Suggestions d\'amélioration'
                  ]}
                  requiredPlan="Pro+"
                  language={language}
                />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </motion.div>
  );
}