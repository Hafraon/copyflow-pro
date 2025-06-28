'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, FileText, Search, Tag, Lightbulb, Star, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { type GenerateResponse } from '@/lib/validations';
import { translations, type Language } from '@/lib/translations';
import { toast } from 'sonner';

interface ResultsDisplayProps {
  data: GenerateResponse | null;
  language: Language;
  isGenerating: boolean;
}

const resultSections = [
  { key: 'productTitle', icon: FileText, color: 'from-blue-500 to-blue-600' },
  { key: 'productDescription', icon: FileText, color: 'from-indigo-500 to-indigo-600' },
  { key: 'seoTitle', icon: Search, color: 'from-purple-500 to-purple-600' },
  { key: 'metaDescription', icon: Search, color: 'from-pink-500 to-pink-600' },
  { key: 'callToAction', icon: Lightbulb, color: 'from-orange-500 to-orange-600' },
  { key: 'keyFeatures', icon: Star, color: 'from-green-500 to-green-600' },
  { key: 'tagsKeywords', icon: Hash, color: 'from-teal-500 to-teal-600' },
] as const;

export function ResultsDisplay({ data, language, isGenerating }: ResultsDisplayProps) {
  const [copiedItems, setCopiedItems] = useState<Set<string>>(new Set());
  const t = translations[language];

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItems(prev => new Set(prev).add(key));
      toast.success(t.copied);
      
      setTimeout(() => {
        setCopiedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(key);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      toast.error(language === 'en' ? 'Failed to copy' : 'Помилка копіювання');
    }
  };

  const renderArrayContent = (items: string[]) => (
    <ul className="space-y-2">
      {items.map((item, index) => (
        <motion.li
          key={index}
          initial={{ x: -10, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-start space-x-2"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-current mt-2 flex-shrink-0" />
          <span className="text-sm">{item}</span>
        </motion.li>
      ))}
    </ul>
  );

  const renderContent = (content: string | string[], key: string) => {
    if (Array.isArray(content)) {
      return renderArrayContent(content);
    }
    return (
      <p className="text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </p>
    );
  };

  if (isGenerating) {
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="h-full flex items-center justify-center"
      >
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-indigo-600 rounded-full animate-spin mx-auto" 
                 style={{ animationDelay: '0.5s', animationDuration: '1.5s' }} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {t.generating}
            </h3>
            <p className="text-sm text-muted-foreground">
              {language === 'en' 
                ? 'Creating amazing content for your product...' 
                : 'Створюємо чудовий контент для вашого товару...'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="h-full flex items-center justify-center"
      >
        <div className="text-center space-y-4 max-w-md">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center mx-auto">
            <FileText className="w-10 h-10 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {language === 'en' ? 'Ready to Generate' : 'Готові до створення'}
            </h3>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Fill out the form on the left to generate compelling product content using AI.' 
                : 'Заповніть форму зліва, щоб створити переконливий контент товару за допомогою ШІ.'}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
    >
      <div className="h-full rounded-2xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/5 to-blue-500/5" />
        
        <div className="relative z-10 h-full flex flex-col">
          <div className="p-6 pb-4">
            <h3 className="text-2xl font-semibold text-foreground mb-2">
              {language === 'en' ? 'Generated Content' : 'Згенерований контент'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {language === 'en' 
                ? 'Your AI-generated product content is ready' 
                : 'Ваш згенерований ШІ контент готовий'}
            </p>
          </div>
          
          <Separator />
          
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <AnimatePresence>
              {resultSections.map((section, index) => {
                const content = data[section.key as keyof GenerateResponse];
                const title = t[section.key as keyof typeof t] as string;
                const IconComponent = section.icon;
                const isCopied = copiedItems.has(section.key);
                
                return (
                  <motion.div
                    key={section.key}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <Card className="border-border/50 bg-background/50 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2 text-base">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                              <IconComponent className="w-4 h-4 text-white" />
                            </div>
                            <span>{title}</span>
                          </CardTitle>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(
                              Array.isArray(content) ? content.join(', ') : content as string, 
                              section.key
                            )}
                            className="h-8 w-8 p-0 hover:bg-accent"
                          >
                            <AnimatePresence mode="wait">
                              {isCopied ? (
                                <motion.div
                                  key="check"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Check className="h-4 w-4 text-green-600" />
                                </motion.div>
                              ) : (
                                <motion.div
                                  key="copy"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{ duration: 0.2 }}
                                >
                                  <Copy className="h-4 w-4" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        {renderContent(content as string | string[], section.key)}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}