'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, X, Loader2, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { translations, type Language } from '@/lib/translations';
import { toast } from 'sonner';

interface PhotoUploadProps {
  language: Language;
  onGenerate: (data: any) => void;
  isGenerating: boolean;
  setIsGenerating: (loading: boolean) => void;
}

export function PhotoUpload({
  language,
  onGenerate,
  isGenerating,
  setIsGenerating
}: PhotoUploadProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [writingStyle, setWritingStyle] = useState<string>('');
  const t = translations[language];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(language === 'en' ? 'File size must be less than 10MB' : 'Розмір файлу має бути менше 10МБ');
        return;
      }

      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast.error(language === 'en' ? 'Only JPG, PNG, and WebP images are supported' : 'Підтримуються лише JPG, PNG та WebP зображення');
        return;
      }

      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [language]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    multiple: false,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !writingStyle) {
      toast.error(language === 'en' ? 'Please select an image and writing style' : 'Оберіть зображення та стиль написання');
      return;
    }

    setIsGenerating(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('writingStyle', writingStyle);
      formData.append('language', language);

      const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to analyze image');
      }

      const result = await response.json();
      onGenerate(result);
      toast.success(language === 'en' ? 'Image analyzed successfully!' : 'Зображення успішно проаналізовано!');
      
    } catch (error) {
      console.error('Image analysis error:', error);
      toast.error(error instanceof Error ? error.message : (language === 'en' ? 'Failed to analyze image' : 'Помилка аналізу зображення'));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Area */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {language === 'en' ? 'Upload Product Photo' : 'Завантажити фото товару'} *
        </Label>
        
        {!selectedImage ? (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20' 
                : 'border-border hover:border-blue-400 hover:bg-accent/50'
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: isDragActive ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center">
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground mb-1">
                  {language === 'en' ? 'Drag & drop your product photo here' : 'Перетягніть фото товару сюди'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'en' ? 'JPG, PNG, WebP up to 10MB' : 'JPG, PNG, WebP до 10МБ'}
                </p>
              </div>
            </motion.div>
          </div>
        ) : (
          <div className="relative">
            <div className="border border-border rounded-lg p-4 bg-background">
              <div className="flex items-start space-x-4">
                <div className="relative">
                  <img
                    src={imagePreview!}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full"
                    onClick={removeImage}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {selectedImage.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedImage.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <ImageIcon className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-green-600">
                      {language === 'en' ? 'Ready for analysis' : 'Готово до аналізу'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Writing Style */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          {t.writingStyle} *
        </Label>
        <Select
          onValueChange={setWritingStyle}
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
      </div>

      {/* Analyze Button */}
      <motion.div
        whileHover={{ scale: selectedImage && writingStyle ? 1.02 : 1 }}
        whileTap={{ scale: selectedImage && writingStyle ? 0.98 : 1 }}
      >
        <Button
          type="submit"
          disabled={!selectedImage || !writingStyle || isGenerating}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {language === 'en' ? 'Analyzing...' : 'Аналізуємо...'}
            </>
          ) : (
            <>
              <Wand2 className="mr-2 h-4 w-4" />
              {language === 'en' ? 'Analyze Photo' : 'Аналізувати фото'}
            </>
          )}
        </Button>
      </motion.div>
    </form>
  );
}