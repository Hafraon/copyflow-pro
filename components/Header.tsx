'use client';

import { useState } from 'react';
import { Moon, Sun, Sparkles } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { translations, type Language } from '@/lib/translations';
import { motion } from 'framer-motion';
import { AuthModal } from './AuthModal';
import { UserMenu } from './UserMenu';
import { LanguageSelector } from './LanguageSelector';
import { SUPPORTED_LANGUAGES } from '@/lib/languages';
import type { LanguageCode } from '@/lib/languages';

interface HeaderProps {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => void;
}

export function Header({ language, setLanguage }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { data: session, status } = useSession();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const t = translations[language as Language] || translations.en;
  const currentLang = SUPPORTED_LANGUAGES[language];

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <>
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${
          currentLang.rtl ? 'rtl' : 'ltr'
        }`}
        dir={currentLang.rtl ? 'rtl' : 'ltr'}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <motion.div 
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {t.title}
              </h1>
            </div>
          </motion.div>

          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector
              language={language}
              setLanguage={setLanguage}
              subscriptionStatus={session?.user ? 'pro' : 'free'} // Simplified for demo
            />

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="h-9 w-9 p-0"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Auth Section */}
            {status === 'loading' ? (
              <div className="h-9 w-20 bg-muted rounded animate-pulse" />
            ) : session ? (
              <UserMenu />
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleAuthClick('login')}
                >
                  Sign In
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAuthClick('register')}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </>
  );
}