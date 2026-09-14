export type SubscriptionTier = 'free' | 'pro' | 'promax';

export const SUBSCRIPTION_PLANS = {
  free: { name: 'Thường', price: 0, giftLimit: 5, menuGiftLimit: 5, customEffects: false, fullJar: false, fullTree: false, premiumFeatures: false },
  pro: { name: 'Pro', price: 99000, giftLimit: 10, menuGiftLimit: 10, customEffects: true, fullJar: false, fullTree: false, premiumFeatures: false },
  promax: { name: 'Pro Max', price: 299000, giftLimit: Infinity, menuGiftLimit: Infinity, customEffects: true, fullJar: true, fullTree: true, premiumFeatures: true },
} as const;

export function getSubscriptionPlan(tier?: string) {
  return SUBSCRIPTION_PLANS[(tier === 'pro' || tier === 'promax' ? tier : 'free')];
}
