export type RiskTier = 'HIGH' | 'MEDIUM' | 'LOW';

export type SubscriptionPlan = 'Basic' | 'Standard' | 'Premium' | 'Enterprise';

export type ContractType = 'Month-to-month' | '1-Year' | '2-Year';

export type PaymentMethod = 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Auto-Debit (NACH)';

export type Region = 'North' | 'South' | 'East' | 'West' | 'Central';

export type LoginFrequency = 'Daily' | 'Weekly' | 'Monthly' | 'Dormant';

export interface Customer {
  id: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  age: number;
  region: Region;
  city: string;
  subscriptionPlan: SubscriptionPlan;
  tenureMonths: number;
  monthlyCharges: number; // in INR (₹)
  totalCharges: number;
  paymentMethod: PaymentMethod;
  contractType: ContractType;
  usageGB: number; // monthly data / storage usage
  supportTickets: number;
  complaints: number;
  loginFrequency: LoginFrequency;
  serviceUsageTrend: number; // percentage change in last 60 days
  paymentFailures: number; // count in last 6 months
  contractRenewalStatus: 'Auto-Renew' | 'Expiring in 30d' | 'Renewed' | 'Overdue';
  churnStatus: 'Active' | 'Churned';
  riskScore: number; // 0 to 100%
  riskLevel: RiskTier;
  keyDrivers: string[];
  recommendedStrategy: string;
  retentionCampaignStatus?: 'Pending' | 'Offer Sent' | 'VIP Outreach' | 'Retained';
}

export interface ChurnTrendPoint {
  month: string;
  totalCustomers: number;
  churned: number;
  retained: number;
  churnRate: number;
  retentionRate: number;
  revenueLostINR: number;
}

export interface PlanChurnStat {
  plan: SubscriptionPlan;
  total: number;
  churned: number;
  churnRate: number;
  avgMonthlyCharge: number;
  revenueAtRisk: number;
}

export interface RegionChurnStat {
  region: Region;
  total: number;
  churned: number;
  churnRate: number;
  topCity: string;
  revenueAtRisk: number;
}

export interface TenureChurnStat {
  tenureBand: string;
  total: number;
  churned: number;
  churnRate: number;
  description: string;
}

export interface BehavioralStat {
  category: string;
  metricLabel: string;
  churnRate: number;
  customerShare: number;
}

export interface MLModelMetrics {
  name: string;
  type: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    truePositive: number;
    falsePositive: number;
    trueNegative: number;
    falseNegative: number;
  };
  strengths: string;
  interpretability: string;
}

export interface FeatureImportance {
  feature: string;
  category: 'Contract' | 'Behavior' | 'Demographic' | 'Billing';
  importance: number; // 0 to 1 or standardized weight
  oddsRatio: number; // >1 increases churn, <1 reduces churn
  effect: 'Increases Churn' | 'Reduces Churn';
  description: string;
}

export interface FilterState {
  search: string;
  plan: string;
  region: string;
  contract: string;
  riskTier: string;
  tenureBand: string;
}
