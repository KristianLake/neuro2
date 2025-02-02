import { MonthlyOption } from './payments';

export type PlanType = 'standard' | 'premium';

export interface Plan {
  name: string;
  price: number;
  monthlyOptions: MonthlyOption[];
  features: string[];
}

export interface Module {
  name: string;
  price: number;
  description: string;
}

export interface PurchaseCheck {
  allowed: boolean;
  reason?: string;
  originalPrice: number;
  finalPrice: number;
  discount: number;
  ownedModules: string[];
}

export interface PricingConfig {
  fullProgram: {
    standard: Plan;
    premium: Plan;
  };
  modules: Record<string, Module>;
}