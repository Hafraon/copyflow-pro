'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { GenerationForm } from '@/components/GenerationForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { type GenerateResponse } from '@/lib/validations';
import { type Language } from '@/lib/translations';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [generatedData, setGeneratedData] = useState<GenerateResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (data: GenerateResponse) => {
    setGeneratedData(data);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 h-[calc(100vh-8rem)]">
          {/* Form Section - 40% on desktop */}
          <div className="lg:col-span-2">
            <GenerationForm
              language={language}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
            />
          </div>
          
          {/* Results Section - 60% on desktop */}
          <div className="lg:col-span-3">
            <ResultsDisplay
              data={generatedData}
              language={language}
              isGenerating={isGenerating}
            />
          </div>
        </div>
      </main>
    </div>
  );
}