'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateFormSchema, type GenerateFormData, type GenerateResponse } from '@/lib/validations';
import { translations, type Language } from '@/lib/translations';
import { toast } from 'sonner';

interface GenerationFormProps {
  language: Language;
  onGenerate: (data: GenerateResponse) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
}

export function GenerationForm({ 
  language, 
  onGenerate, 
  isGenerating, 
  setIsGenerating 
}: GenerationFormProps) {
  const t = translations[language];
  
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

  const onSubmit = async (data: GenerateFormData) => {
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
        throw new Error('Failed to generate content');
      }

      const result: GenerateResponse = await response.json();
      onGenerate(result);
      toast.success(language === 'en' ? 'Content generated successfully!' : 'Контент успішно створено!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error(language === 'en' ? 'Failed to generate content' : 'Помилка створення контенту');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="h-full"
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
                disabled={isGenerating}
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
                disabled={isGenerating}
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

            {/* Generate Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={!isValid || isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t.generating}
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {t.generateButton}
                  </>
                )}
              </Button>
            </motion.div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}