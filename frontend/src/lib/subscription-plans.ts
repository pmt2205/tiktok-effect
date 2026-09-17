export type SubscriptionTier = 'free' | 'pro' | 'promax';

export const SUBSCRIPTION_PLANS = {
  free: { name: 'Thường', price: 0, renewalPrice: 0, giftLimit: 5, menuGiftLimit: 5, customEffects: false, jarStyles: false, fullJar: false, treeAccess: false, fullTree: false, premiumFeatures: false },
  pro: { name: 'Pro', price: 99000, renewalPrice: 49000, giftLimit: 10, menuGiftLimit: 10, customEffects: true, jarStyles: true, fullJar: false, treeAccess: true, fullTree: false, premiumFeatures: false },
  promax: { name: 'Pro Max', price: 299000, renewalPrice: 149000, giftLimit: Infinity, menuGiftLimit: Infinity, customEffects: true, jarStyles: true, fullJar: true, treeAccess: true, fullTree: true, premiumFeatures: true },
} as const;

export function getSubscriptionPlan(tier?: string) {
  return SUBSCRIPTION_PLANS[(tier === 'pro' || tier === 'promax' ? tier : 'free')];
}
