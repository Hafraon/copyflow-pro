'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CreditCard, Loader2, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { type Language } from '@/lib/translations';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

const paymentFormSchema = z.object({
  firstName: z.string().min(1, 'Імʼя обовʼязкове'),
  lastName: z.string().min(1, 'Прізвище обовʼязкове'),
  email: z.string().email('Невірний email'),
  phone: z.string().optional()
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: 'pro' | 'business';
  language: Language;
}

export function PaymentModal({ isOpen, onClose, plan, language }: PaymentModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const planData = SUBSCRIPTION_PLANS[plan];

  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          clientData: data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment');
      }

      const result = await response.json();
      
      // Create a temporary div to hold the form
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = result.paymentForm;
      document.body.appendChild(tempDiv);
      
      // The form will auto-submit and redirect to WayForPay
      
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(language === 'ua' ? 'Помилка створення платежу' : 'Payment creation failed');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="w-full max-w-md"
          onClick={(e) => e.stopPropagation()}
        >
          <Card className="border-border/50 bg-background/95 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">
                  {language === 'ua' ? 'Оформлення підписки' : 'Subscription Checkout'}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4 mt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">
                    {language === 'ua' ? planData.name : planData.nameEn}
                  </span>
                  <span className="text-2xl font-bold">₴{planData.priceUAH}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {language === 'ua' ? 'Щомісячна підписка' : 'Monthly subscription'}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">
                      {language === 'ua' ? 'Імʼя' : 'First Name'} *
                    </Label>
                    <Input
                      id="firstName"
                      {...register('firstName')}
                      placeholder={language === 'ua' ? 'Введіть імʼя' : 'Enter first name'}
                      disabled={isProcessing}
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-500">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">
                      {language === 'ua' ? 'Прізвище' : 'Last Name'} *
                    </Label>
                    <Input
                      id="lastName"
                      {...register('lastName')}
                      placeholder={language === 'ua' ? 'Введіть прізвище' : 'Enter last name'}
                      disabled={isProcessing}
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-500">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder={language === 'ua' ? 'Введіть email' : 'Enter email'}
                    disabled={isProcessing}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {language === 'ua' ? 'Телефон (опціонально)' : 'Phone (optional)'}
                  </Label>
                  <Input
                    id="phone"
                    {...register('phone')}
                    placeholder="+380..."
                    disabled={isProcessing}
                  />
                </div>

                <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-700 dark:text-green-400 mb-2">
                    <Shield className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      {language === 'ua' ? 'Безпечний платіж' : 'Secure Payment'}
                    </span>
                  </div>
                  <div className="text-xs text-green-600 dark:text-green-500 space-y-1">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>SSL шифрування</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>PCI DSS сертифікація</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3" />
                      <span>Підтримка Visa, Mastercard, Privat24, monobank</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={!isValid || isProcessing}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {language === 'ua' ? 'Обробка...' : 'Processing...'}
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      {language === 'ua' ? 'Перейти до оплати' : 'Proceed to Payment'}
                    </>
                  )}
                </Button>
              </form>

              <div className="text-xs text-muted-foreground text-center">
                {language === 'ua' 
                  ? 'Натискаючи "Перейти до оплати", ви погоджуєтесь з умовами використання та політикою конфіденційності.'
                  : 'By clicking "Proceed to Payment", you agree to our terms of service and privacy policy.'
                }
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}