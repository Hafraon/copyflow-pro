'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SUBSCRIPTION_PLANS } from '@/lib/subscription-plans';
import { type Language } from '@/lib/translations';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface SubscriptionData {
  subscription: {
    status: string;
    start: string | null;
    end: string | null;
    isExpired: boolean;
  };
  usage: {
    used: number;
    limit: number;
  };
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    plan: string;
    createdAt: string;
  }>;
}

interface SubscriptionStatusProps {
  language: Language;
  onUpgrade: () => void;
}

export function SubscriptionStatus({ language, onUpgrade }: SubscriptionStatusProps) {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const response = await fetch('/api/user/subscription');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-8 bg-muted rounded w-1/2"></div>
            <div className="h-4 bg-muted rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) return null;

  const { subscription, usage, payments } = data;
  const planData = SUBSCRIPTION_PLANS[subscription.status as keyof typeof SUBSCRIPTION_PLANS];
  const usagePercentage = usage.limit === -1 ? 0 : (usage.used / usage.limit) * 100;
  const isNearLimit = usage.limit !== -1 && usagePercentage > 80;

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Crown className="w-5 h-5" />
            <span>{language === 'ua' ? 'Поточна підписка' : 'Current Subscription'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-semibold">
                  {language === 'ua' ? planData.name : planData.nameEn}
                </h3>
                <Badge variant={subscription.status === 'free' ? 'secondary' : 'default'}>
                  {subscription.status === 'free' 
                    ? (language === 'ua' ? 'Безкоштовний' : 'Free')
                    : (language === 'ua' ? 'Активний' : 'Active')
                  }
                </Badge>
              </div>
              {subscription.end && (
                <p className="text-sm text-muted-foreground mt-1">
                  {language === 'ua' ? 'Діє до: ' : 'Valid until: '}
                  {format(new Date(subscription.end), 'dd MMMM yyyy', { 
                    locale: language === 'ua' ? uk : undefined 
                  })}
                </p>
              )}
            </div>
            {subscription.status === 'free' && (
              <Button onClick={onUpgrade} className="bg-gradient-to-r from-blue-600 to-indigo-600">
                {language === 'ua' ? 'Покращити' : 'Upgrade'}
              </Button>
            )}
          </div>

          {subscription.isExpired && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {language === 'ua' ? 'Підписка закінчилася' : 'Subscription Expired'}
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                {language === 'ua' 
                  ? 'Ваша підписка закінчилася і була переведена на безкоштовний план.'
                  : 'Your subscription has expired and was downgraded to the free plan.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>{language === 'ua' ? 'Використання' : 'Usage'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>{language === 'ua' ? 'Генерації цього місяця' : 'Generations this month'}</span>
              <span>
                {usage.used} / {usage.limit === -1 ? '∞' : usage.limit}
              </span>
            </div>
            {usage.limit !== -1 && (
              <Progress 
                value={usagePercentage} 
                className={`h-2 ${isNearLimit ? 'bg-orange-100' : ''}`}
              />
            )}
          </div>

          {isNearLimit && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-orange-700 dark:text-orange-400">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {language === 'ua' ? 'Наближаєтесь до ліміту' : 'Approaching Limit'}
                </span>
              </div>
              <p className="text-xs text-orange-600 dark:text-orange-500 mt-1">
                {language === 'ua' 
                  ? 'Розгляньте можливість покращення плану для необмежених генерацій.'
                  : 'Consider upgrading your plan for unlimited generations.'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>{language === 'ua' ? 'Історія платежів' : 'Payment History'}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.slice(0, 5).map((payment) => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {SUBSCRIPTION_PLANS[payment.plan as keyof typeof SUBSCRIPTION_PLANS]?.name || payment.plan}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payment.createdAt), 'dd.MM.yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">₴{payment.amount / 100}</p>
                    <Badge 
                      variant={payment.status === 'Approved' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {payment.status === 'Approved' 
                        ? (language === 'ua' ? 'Оплачено' : 'Paid')
                        : payment.status
                      }
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}