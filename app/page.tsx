'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { GenerationForm } from '@/components/GenerationForm';
import { ResultsDisplay } from '@/components/ResultsDisplay';
import { type GenerateResponse, type ViralContentResponse } from '@/lib/validations';
import type { LanguageCode } from '@/lib/languages';

export default function Home() {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [generatedData, setGeneratedData] = useState<GenerateResponse | null>(null);
  const [viralData, setViralData] = useState<ViralContentResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingViral, setIsGeneratingViral] = useState(false);

  const handleGenerate = (data: GenerateResponse) => {
    setGeneratedData(data);
  };

  const handleGenerateViral = (data: ViralContentResponse) => {
    setViralData(data);
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
              onGenerateViral={handleGenerateViral}
              isGenerating={isGenerating}
              setIsGenerating={setIsGenerating}
              isGeneratingViral={isGeneratingViral}
              setIsGeneratingViral={setIsGeneratingViral}
            />
          </div>
          
          {/* Results Section - 60% on desktop */}
          <div className="lg:col-span-3">
            <ResultsDisplay
              data={generatedData}
              viralData={viralData}
              language={language}
              isGenerating={isGenerating}
              isGeneratingViral={isGeneratingViral}
            />
          </div>
        </div>
      </main>
    </div>
  );
}