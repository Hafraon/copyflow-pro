'use client';

import { motion } from 'framer-motion';
import { Crown, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { type Language } from '@/lib/translations';
import { useRouter } from 'next/navigation';

interface PremiumFeatureCardProps {
  title: string;
  description: string;
  features: string[];
  language: Language;
}

export function PremiumFeatureCard({
  title,
  description,
  features,
  language
}: PremiumFeatureCardProps) {
  const router = useRouter();

  return (
    <Card className="border-2 border-dashed border-yellow-300 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
      <CardHeader className="text-center pb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Crown className="w-8 h-8 text-white" />
        </motion.div>
        
        <CardTitle className="text-xl font-bold text-yellow-800 dark:text-yellow-200">
          {title}
        </CardTitle>
        
        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
          {description}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
            {language === 'en' ? 'Premium Features:' : 'Преміум функції:'}
          </h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-2"
              >
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">{feature}</span>
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="bg-white/50 dark:bg-black/20 rounded-lg p-4">
          <p className="text-xs text-yellow-600 dark:text-yellow-400 mb-3">
            {language === 'en' 
              ? 'Upgrade to Pro to unlock this powerful feature and generate unlimited content.'
              : 'Оновіться до Pro, щоб розблокувати цю потужну функцію та створювати необмежений контент.'
            }
          </p>
          
          <Button
            onClick={() => router.push('/pricing')}
            className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-medium"
          >
            {language === 'en' ? 'Upgrade to Pro' : 'Оновити до Pro'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}