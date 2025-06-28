'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="text-center">
          <CardHeader className="pb-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle className="w-8 h-8 text-green-600" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-green-600">
              Платіж успішний!
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Ваша підписка була успішно активована. Тепер ви можете користуватися всіма функціями CopyFlow.
              </p>
              
              {orderId && (
                <p className="text-xs text-muted-foreground">
                  Номер замовлення: {orderId}
                </p>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-4">
              <h3 className="font-medium mb-2">Що далі?</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ Необмежені генерації контенту</li>
                <li>✅ Доступ до всіх функцій</li>
                <li>✅ Пріоритетна підтримка</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Перейти до панелі
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                На головну
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Автоматичне перенаправлення через {countdown} секунд
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}