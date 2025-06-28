'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PaymentFailedPage() {
  const router = useRouter();

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
              className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <XCircle className="w-8 h-8 text-red-600" />
            </motion.div>
            
            <CardTitle className="text-2xl font-bold text-red-600">
              Платіж не вдався
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground">
                На жаль, ваш платіж не був оброблений. Це могло статися з різних причин.
              </p>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-4">
              <h3 className="font-medium mb-2">Можливі причини:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Недостатньо коштів на картці</li>
                <li>• Картка заблокована банком</li>
                <li>• Технічна помилка</li>
                <li>• Скасування платежу</li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => router.push('/pricing')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Спробувати знову
              </Button>
              
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Повернутися назад
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Потрібна допомога? Зв'яжіться з нашою підтримкою:</p>
              <p className="text-blue-600">support@copyflow.com</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}