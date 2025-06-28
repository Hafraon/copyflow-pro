'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Loader2, Wand2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type UrlAnalysisData } from '@/lib/validations';
import { translations, type Language } from '@/lib/translations';
import { UseFormRegister, UseFormSetValue, FieldErrors } from 'react-hook-form';

interface UrlAnalysisProps {
  language: Language;
  onSubmit: (data: UrlAnalysisData) => void;
  isGenerating: boolean;
  register: UseFormRegister<UrlAnalysisData>;
  setValue: UseFormSetValue<UrlAnalysisData>;
  errors: FieldErrors<UrlAnalysisData>;
  isValid: boolean;
}

export function UrlAnalysis({
  language,
  onSubmit,
  isGenerating,
  register,
  setValue,
  errors,
  isValid
}: UrlAnalysisProps) {
  const [url, setUrl] = useState('');
  const [writingStyle, setWritingStyle] = useState('');
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && writingStyle && isValid) {
      onSubmit({
        url,
        writingStyle: writingStyle as any,
        language: language
      });
    }
  };

  const supportedSites = [
    { name: 'Amazon', domain: 'amazon.com', example: 'https://amazon.com/product/...' },
    { name: 'eBay', domain: 'ebay.com', example: 'https://ebay.com/itm/...' },
    { name: 'AliExpress', domain: 'aliexpress.com', example: 'https://aliexpress.com/item/...' },
    { name: 'Rozetka', domain: 'rozetka.com.ua', example: 'https://rozetka.com.ua/product/...' },
    { name: 'Prom.ua', domain: 'prom.ua', example: 'https://prom.ua/product/...' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* URL Input */}
      <div className="space-y-2">
        <Label htmlFor="url" className="text-sm font-medium text-foreground">
          {t.competitorUrl} *
        </Label>
        <div className="relative">
          <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            id="url"
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              setValue('url', e.target.value);
            }}
            placeholder={t.urlPlaceholder}
            className="pl-10"
            disabled={isGenerating}
          />
        </div>
        {errors.url && (
          <p className="text-sm text-red-500">{errors.url.message}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {t.supportedSites}
        </p>
      </div>

      {/* Supported Sites */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {language === 'en' ? 'Supported Platforms' : 'Підтримувані платформи'}
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {supportedSites.map((site) => (
            <div
              key={site.domain}
              className="flex items-center justify-between p-3 border border-border rounded-lg bg-background/50"
            >
              <div>
                <p className="text-sm font-medium">{site.name}</p>
                <p className="text-xs text-muted-foreground">{site.domain}</p>
              </div>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>

      {/* Writing Style */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {t.writingStyle} *
        </Label>
        <Select
          onValueChange={(value) => {
            setWritingStyle(value);
            setValue('writingStyle', value as any);
          }}
          disabled={isGenerating}
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

      {/* Analyze Button */}
      <motion.div
        whileHover={{ scale: url && writingStyle ? 1.02 : 1 }}
        whileTap={{ scale: url && writingStyle ? 0.98 : 1 }}
      >
        <Button
          type="submit"
          disabled={!url || !writingStyle || isGenerating}
          className="w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.scraping}
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Analyze Competitor' : 'Аналізувати конкурента'}
            </>
          )}
        </Button>
      </motion.div>

      {/* Tips */}
      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
        <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
          {language === 'en' ? 'Tips for best results:' : 'Поради для кращих результатів:'}
        </h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <li>• {language === 'en' ? 'Use direct product page URLs' : 'Використовуйте прямі URL сторінок товарів'}</li>
          <li>• {language === 'en' ? 'Ensure the page is publicly accessible' : 'Переконайтеся, що сторінка публічно доступна'}</li>
          <li>• {language === 'en' ? 'Choose products in the same category' : 'Обирайте товари з тієї ж категорії'}</li>
        </ul>
      </div>
    </form>
  );
}