'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Crown, Zap, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { translations, type Language } from '@/lib/translations';
import { useSession } from 'next-auth/react';
import { PaymentModal } from '@/components/PaymentModal';
import { Header } from '@/components/Header';

const planIcons = {
  free: Zap,
  pro: Crown,
  business: Building2
};

const planColors = {
  free: 'from-gray-500 to-gray-600',
  pro: 'from-blue-500 to-indigo-600',
  business: 'from-purple-500 to-pink-600'
};

export default function PricingPage() {
  const [language, setLanguage] = useState<Language>('ua');
  const [selectedPlan, setSelectedPlan] = useState<'pro' | 'business' | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { data: session } = useSession();
  const t = translations[language];

  const handleSelectPlan = (planId: 'pro' | 'business') => {
    if (!session) {
      // Redirect to login
      window.location.href = '/?auth=login';
      return;
    }
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header language={language} setLanguage={setLanguage} />
      
      <main className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            {language === 'ua' ? 'Оберіть свій план' : 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'ua' 
              ? 'Розпочніть безкоштовно або оберіть план для розширених можливостей'
              : 'Start free or choose a plan for advanced features'
            }
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {Object.entries(SUBSCRIPTION_PLANS).map(([planId, plan], index) => {
            const IconComponent = planIcons[planId as keyof typeof planIcons];
            const isPopular = planId === 'pro';
            
            return (
              <motion.div
                key={planId}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-1">
                      {language === 'ua' ? 'Популярний' : 'Popular'}
                    </Badge>
                  </div>
                )}
                
                <Card className={`relative h-full ${isPopular ? 'border-blue-500 shadow-lg scale-105' : 'border-border'} transition-all duration-300 hover:shadow-xl`}>
                  <CardHeader className="text-center pb-8">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${planColors[planId as keyof typeof planColors]} flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <CardTitle className="text-2xl font-bold">
                      {language === 'ua' ? plan.name : plan.nameEn}
                    </CardTitle>
                    
                    <div className="mt-4">
                      <div className="text-4xl font-bold">
                        {plan.priceUAH === 0 ? (
                          language === 'ua' ? 'Безкоштовно' : 'Free'
                        ) : (
                          <>
                            ₴{plan.priceUAH}
                            <span className="text-lg font-normal text-muted-foreground">
                              /{language === 'ua' ? 'міс' : 'mo'}
                            </span>
                          </>
                        )}
                      </div>
                      {plan.price > 0 && (
                        <div className="text-sm text-muted-foreground mt-1">
                          ${plan.price} USD
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {(language === 'ua' ? plan.features : plan.featuresEn).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-3">
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-4">
                      {planId === 'free' ? (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.location.href = '/'}
                        >
                          {language === 'ua' ? 'Розпочати безкоштовно' : 'Start Free'}
                        </Button>
                      ) : (
                        <Button
                          className={`w-full bg-gradient-to-r ${planColors[planId as keyof typeof planColors]} hover:opacity-90 text-white`}
                          onClick={() => handleSelectPlan(planId as 'pro' | 'business')}
                        >
                          {language === 'ua' ? 'Обрати план' : 'Choose Plan'}
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">
              {language === 'ua' ? 'Безпечні платежі через WayForPay' : 'Secure Payments via WayForPay'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {language === 'ua' 
                ? 'Підтримуємо всі популярні способи оплати в Україні: Visa, Mastercard, Privat24, monobank, Apple Pay, Google Pay'
                : 'We support all popular payment methods in Ukraine: Visa, Mastercard, Privat24, monobank, Apple Pay, Google Pay'
              }
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span>🔒 SSL шифрування</span>
              <span>🛡️ PCI DSS сертифікація</span>
              <span>💳 Миттєва активація</span>
              <span>📞 24/7 підтримка</span>
            </div>
          </div>
        </motion.div>
      </main>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          language={language}
        />
      )}
    </div>
  );
}