'use client';

import { useState } from 'react';
import { Check, ChevronDown, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SUPPORTED_LANGUAGES, getAvailableLanguages, type LanguageCode } from '@/lib/languages';
import { Badge } from '@/components/ui/badge';

interface LanguageSelectorProps {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
  subscriptionStatus?: string;
  className?: string;
}

export function LanguageSelector({ 
  language, 
  setLanguage, 
  subscriptionStatus = 'free',
  className = '' 
}: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const availableLanguages = getAvailableLanguages(subscriptionStatus);
  const currentLang = SUPPORTED_LANGUAGES[language];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={`justify-between min-w-[140px] ${currentLang.rtl ? 'flex-row-reverse' : ''} ${className}`}
        >
          <div className="flex items-center space-x-2">
            <span className="text-lg">{currentLang.flag}</span>
            <span className="text-sm font-medium">{currentLang.nativeName}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 max-h-80 overflow-y-auto"
        side="bottom"
      >
        {Object.entries(SUPPORTED_LANGUAGES).map(([code, langData]) => {
          const isAvailable = availableLanguages.includes(code as LanguageCode);
          const isSelected = language === code;
          
          return (
            <DropdownMenuItem
              key={code}
              onClick={() => {
                if (isAvailable) {
                  setLanguage(code as LanguageCode);
                  setIsOpen(false);
                }
              }}
              disabled={!isAvailable}
              className={`flex items-center justify-between cursor-pointer ${
                langData.rtl ? 'flex-row-reverse' : ''
              } ${!isAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-lg">{langData.flag}</span>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{langData.nativeName}</span>
                  <span className="text-xs text-muted-foreground">{langData.name}</span>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {!isAvailable && (
                  <Badge variant="secondary" className="text-xs">
                    Pro+
                  </Badge>
                )}
                {isSelected && isAvailable && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          );
        })}
        
        {subscriptionStatus === 'free' && (
          <div className="border-t mt-2 pt-2">
            <div className="px-2 py-1">
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Globe className="h-3 w-3" />
                <span>Upgrade to Pro+ for all languages</span>
              </div>
            </div>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}