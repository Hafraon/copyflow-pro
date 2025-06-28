export const SUBSCRIPTION_PLANS = {
  free: {
    id: 'free',
    name: 'Безкоштовний',
    nameEn: 'Free',
    price: 0,
    priceUAH: 0,
    generationsLimit: 5,
    features: [
      '5 генерацій на місяць',
      'Базові функції',
      'Email підтримка'
    ],
    featuresEn: [
      '5 generations per month',
      'Basic features',
      'Email support'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    nameEn: 'Pro',
    price: 21,
    priceUAH: 799,
    generationsLimit: -1, // unlimited
    features: [
      'Необмежені генерації',
      'Завантаження фото',
      'Аналіз URL',
      'Пріоритетна підтримка'
    ],
    featuresEn: [
      'Unlimited generations',
      'Photo upload',
      'URL analysis',
      'Priority support'
    ]
  },
  business: {
    id: 'business',
    name: 'Business',
    nameEn: 'Business',
    price: 50,
    priceUAH: 1899,
    generationsLimit: -1,
    features: [
      'Все з Pro',
      'API доступ',
      'Командна робота',
      'Аналітика',
      'White-label'
    ],
    featuresEn: [
      'Everything in Pro',
      'API access',
      'Team collaboration',
      'Analytics',
      'White-label'
    ]
  }
} as const;

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS;

export function getPlanFeatures(planId: SubscriptionPlan, language: 'ua' | 'en' = 'ua') {
  const plan = SUBSCRIPTION_PLANS[planId];
  return language === 'ua' ? plan.features : plan.featuresEn;
}

export function getPlanName(planId: SubscriptionPlan, language: 'ua' | 'en' = 'ua') {
  const plan = SUBSCRIPTION_PLANS[planId];
  return language === 'ua' ? plan.name : plan.nameEn;
}

export function isUnlimitedPlan(planId: SubscriptionPlan): boolean {
  return SUBSCRIPTION_PLANS[planId].generationsLimit === -1;
}

export function getGenerationsLimit(planId: SubscriptionPlan): number {
  return SUBSCRIPTION_PLANS[planId].generationsLimit;
}