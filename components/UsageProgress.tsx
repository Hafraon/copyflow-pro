'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Crown } from 'lucide-react';

interface UsageData {
  generationsUsed: number;
  generationsLimit: number;
  subscription: string;
}

export function UsageProgress() {
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const response = await fetch('/api/user/usage');
        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error('Failed to fetch usage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsage();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-2 bg-muted rounded animate-pulse" />
            <div className="h-4 bg-muted rounded animate-pulse w-24" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!usage) {
    return null;
  }

  const percentage = (usage.generationsUsed / usage.generationsLimit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = usage.generationsUsed >= usage.generationsLimit;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center">
            <Zap className="mr-2 h-4 w-4" />
            Usage
          </CardTitle>
          <Badge variant={usage.subscription === 'free' ? 'secondary' : 'default'}>
            {usage.subscription === 'free' ? (
              'Free'
            ) : (
              <>
                <Crown className="mr-1 h-3 w-3" />
                Pro
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Generations</span>
              <span className={isAtLimit ? 'text-red-500' : 'text-foreground'}>
                {usage.generationsUsed} / {usage.generationsLimit}
              </span>
            </div>
            <Progress 
              value={percentage} 
              className={`h-2 ${isAtLimit ? '[&>div]:bg-red-500' : isNearLimit ? '[&>div]:bg-orange-500' : ''}`}
            />
          </div>
          
          {isAtLimit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-red-500 bg-red-50 dark:bg-red-950/20 p-2 rounded"
            >
              You've reached your generation limit. Upgrade to continue.
            </motion.div>
          )}
          
          {isNearLimit && !isAtLimit && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-orange-500 bg-orange-50 dark:bg-orange-950/20 p-2 rounded"
            >
              You're approaching your generation limit.
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}