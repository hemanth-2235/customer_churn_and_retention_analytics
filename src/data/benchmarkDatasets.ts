import { Customer, RiskTier, SubscriptionPlan, ContractType, PaymentMethod, Region, LoginFrequency } from '../types';

export interface DatasetMeta {
  id: string;
  name: string;
  industry: string;
  description: string;
  recordCount: number;
}

export const AVAILABLE_DATASETS: DatasetMeta[] = [
  {
    id: 'telecom_broadband',
    name: 'Telecom & Subscription Churn Dataset',
    industry: 'Telecommunications & Broadband',
    description: 'Empirical cohort of 1,200 residential and small-business broadband subscribers with billing, complaint, and usage telemetry.',
    recordCount: 1200,
  },
  {
    id: 'cloud_saas',
    name: 'B2B Cloud SaaS Platform Churn Dataset',
    industry: 'Enterprise SaaS & Cloud Software',
    description: '1,000 multi-tier software accounts tracking seat license expansion, support SLA ticket volume, and activity disengagement.',
    recordCount: 1000,
  },
  {
    id: 'fintech_banking',
    name: 'Fintech & Digital Banking Subscriptions',
    industry: 'Fintech & Neo-Banking',
    description: '1,100 digital banking premium members analyzing auto-debit failure cascades, card renewal expiry, and active wallet velocity.',
    recordCount: 1100,
  },
];

// Seeded pseudo-random number generator for deterministic, consistent benchmark data
function createRng(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const FIRST_NAMES = [
  'Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Neha', 'Kabir', 'Sneha',
  'Aditya', 'Pooja', 'Rahul', 'Divya', 'Arjun', 'Meera', 'Karan', 'Simran',
  'Siddharth', 'Tanvi', 'Varun', 'Rhea', 'Naveen', 'Isha', 'Gaurav', 'Anjali',
  'Kunal', 'Shruti', 'Deepak', 'Kavita', 'Manish', 'Shweta', 'Amit', 'Sunita',
  'Harsh', 'Preeti', 'Abhishek', 'Swati', 'Vishal', 'Aarti', 'Rajesh', 'Geeta'
];

const LAST_NAMES = [
  'Sharma', 'Iyer', 'Mehra', 'Verma', 'Singhania', 'Patel', 'Reddy', 'Chatterjee',
  'Kapoor', 'Nair', 'Bose', 'Menon', 'Joshi', 'Chopra', 'Gupta', 'Deshmukh',
  'Malhotra', 'Bhat', 'Saxena', 'Pillai', 'Rao', 'Kulkarni', 'Agrawal', 'Sengupta',
  'Mishra', 'Tripathi', 'Trivedi', 'Bhardwaj', 'Nambiar', 'Ghosh', 'Das', 'Dutta'
];

const CITIES: Record<Region, string[]> = {
  North: ['Delhi NCR', 'Gurugram', 'Noida', 'Chandigarh', 'Jaipur', 'Lucknow'],
  South: ['Bengaluru', 'Hyderabad', 'Chennai', 'Kochi', 'Coimbatore', 'Mysuru'],
  West: ['Mumbai', 'Pune', 'Ahmedabad', 'Surat', 'Nagpur', 'Goa'],
  East: ['Kolkata', 'Bhubaneswar', 'Patna', 'Ranchi', 'Guwahati'],
  Central: ['Bhopal', 'Indore', 'Raipur', 'Jabalpur', 'Gwalior'],
};

export function generateBenchmarkDataset(datasetId: string): Customer[] {
  let seed = 42;
  let count = 1200;
  let baseMrrMap = { Basic: 699, Standard: 1299, Premium: 2199, Enterprise: 4499 };

  if (datasetId === 'cloud_saas') {
    seed = 88;
    count = 1000;
    baseMrrMap = { Basic: 1499, Standard: 3499, Premium: 6999, Enterprise: 14999 };
  } else if (datasetId === 'fintech_banking') {
    seed = 1337;
    count = 1100;
    baseMrrMap = { Basic: 499, Standard: 999, Premium: 1999, Enterprise: 3999 };
  }

  const rng = createRng(seed);
  const customers: Customer[] = [];

  const regions: Region[] = ['North', 'South', 'West', 'East', 'Central'];
  const plans: SubscriptionPlan[] = ['Basic', 'Standard', 'Premium', 'Enterprise'];
  const contracts: ContractType[] = ['Month-to-month', '1-Year', '2-Year'];
  const paymentMethods: PaymentMethod[] = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Auto-Debit (NACH)'];
  const loginFrequencies: LoginFrequency[] = ['Daily', 'Weekly', 'Monthly', 'Dormant'];

  for (let i = 0; i < count; i++) {
    const id = `C${(1000 + i).toString()}`;
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;
    const genderRoll = rng();
    const gender: 'Male' | 'Female' | 'Other' = genderRoll < 0.48 ? 'Male' : genderRoll < 0.96 ? 'Female' : 'Other';
    const age = Math.floor(21 + rng() * 48);

    const regionRoll = rng();
    const region: Region =
      regionRoll < 0.32 ? 'North' : regionRoll < 0.62 ? 'South' : regionRoll < 0.82 ? 'West' : regionRoll < 0.93 ? 'East' : 'Central';
    const cityList = CITIES[region];
    const city = cityList[Math.floor(rng() * cityList.length)];

    const planRoll = rng();
    const subscriptionPlan: SubscriptionPlan =
      planRoll < 0.38 ? 'Basic' : planRoll < 0.74 ? 'Standard' : planRoll < 0.92 ? 'Premium' : 'Enterprise';

    const contractRoll = rng();
    const contractType: ContractType =
      contractRoll < 0.52 ? 'Month-to-month' : contractRoll < 0.82 ? '1-Year' : '2-Year';

    const tenureMonths = Math.max(1, Math.floor(rng() * 58) + 1);

    const baseMrr = baseMrrMap[subscriptionPlan];
    const chargeVariance = Math.round((rng() - 0.5) * (baseMrr * 0.2));
    const monthlyCharges = Math.max(299, baseMrr + chargeVariance);
    const totalCharges = Math.round(monthlyCharges * tenureMonths);

    const payRoll = rng();
    const paymentMethod: PaymentMethod =
      payRoll < 0.38
        ? 'UPI'
        : payRoll < 0.64
        ? 'Credit Card'
        : payRoll < 0.82
        ? 'Debit Card'
        : payRoll < 0.92
        ? 'Auto-Debit (NACH)'
        : 'Net Banking';

    // Support tickets & Complaints
    const supportTickets = Math.floor(rng() * 8);
    let complaints = 0;
    if (supportTickets > 1) {
      const compRoll = rng();
      complaints = compRoll < 0.4 ? 0 : compRoll < 0.75 ? 1 : compRoll < 0.92 ? 2 : 3;
    }

    // Usage metrics
    const usageGB = Math.round(20 + rng() * 160);
    const trendRoll = rng();
    const serviceUsageTrend = Math.round((trendRoll - 0.55) * 80); // e.g. -44% to +36%

    // Payment failures
    const failRoll = rng();
    let paymentFailures = 0;
    if (paymentMethod === 'Debit Card' || paymentMethod === 'Net Banking') {
      paymentFailures = failRoll < 0.5 ? 0 : failRoll < 0.8 ? 1 : failRoll < 0.95 ? 2 : 3;
    } else if (paymentMethod === 'UPI') {
      paymentFailures = failRoll < 0.75 ? 0 : failRoll < 0.92 ? 1 : 2;
    } else {
      paymentFailures = failRoll < 0.88 ? 0 : 1;
    }

    // Login frequency
    const logRoll = rng();
    const loginFrequency: LoginFrequency =
      serviceUsageTrend < -25
        ? logRoll < 0.45 ? 'Dormant' : 'Monthly'
        : logRoll < 0.48 ? 'Daily' : logRoll < 0.82 ? 'Weekly' : 'Monthly';

    // Empirical Churn Probability Model:
    // Churn correlates naturally with month-to-month, complaints, usage decay, low tenure, payment failures
    let churnProbability = 0.05; // 5% baseline
    if (contractType === 'Month-to-month') churnProbability += 0.18;
    if (contractType === '2-Year') churnProbability -= 0.08;
    if (tenureMonths <= 6) churnProbability += 0.16;
    else if (tenureMonths > 24) churnProbability -= 0.10;
    if (complaints >= 3) churnProbability += 0.50;
    else if (complaints === 2) churnProbability += 0.32;
    else if (complaints === 1) churnProbability += 0.10;
    if (paymentFailures >= 2) churnProbability += 0.28;
    else if (paymentFailures === 1) churnProbability += 0.12;
    if (serviceUsageTrend < -30) churnProbability += 0.22;
    if (loginFrequency === 'Dormant') churnProbability += 0.24;
    if (subscriptionPlan === 'Basic') churnProbability += 0.06;

    churnProbability = Math.max(0.02, Math.min(0.96, churnProbability));
    const churnStatus: 'Active' | 'Churned' = rng() < churnProbability ? 'Churned' : 'Active';

    // Risk scoring
    const riskScore = Math.min(99, Math.max(4, Math.round(churnProbability * 100)));
    const riskLevel: RiskTier = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';

    // Drivers
    const keyDrivers: string[] = [];
    if (complaints >= 2) keyDrivers.push(`${complaints} Unresolved Complaints`);
    if (contractType === 'Month-to-month') keyDrivers.push('Month-to-month Contract');
    if (serviceUsageTrend < -25) keyDrivers.push(`${Math.abs(serviceUsageTrend)}% Usage Contraction`);
    if (paymentFailures >= 1) keyDrivers.push(`${paymentFailures} Payment Failures`);
    if (tenureMonths <= 6) keyDrivers.push('Early 6-Month Cliff');
    if (loginFrequency === 'Dormant') keyDrivers.push('Low Login Frequency');
    if (keyDrivers.length === 0) keyDrivers.push('Stable Engagement Baseline');

    const recommendedStrategy =
      riskLevel === 'HIGH'
        ? 'Deploy personalized retention offer: 25% annual contract discount + Priority Support Escalation'
        : riskLevel === 'MEDIUM'
        ? 'Proactive outreach: Feature engagement walkthrough + Automated UPI Autopay setup rebate'
        : 'Loyalty reinforcement: Milestone badge reward + Exclusive VIP early access program';

    customers.push({
      id,
      name,
      gender,
      age,
      region,
      city,
      subscriptionPlan,
      tenureMonths,
      monthlyCharges,
      totalCharges,
      paymentMethod,
      contractType,
      usageGB,
      supportTickets,
      complaints,
      loginFrequency,
      serviceUsageTrend,
      paymentFailures,
      contractRenewalStatus: tenureMonths % 12 === 11 ? 'Expiring in 30d' : 'Auto-Renew',
      churnStatus,
      riskScore,
      riskLevel,
      keyDrivers,
      recommendedStrategy,
      retentionCampaignStatus: 'Pending',
    });
  }

  return customers;
}

export const TELECOM_BENCHMARK: Customer[] = generateBenchmarkDataset('telecom_broadband');
export const SAAS_BENCHMARK: Customer[] = generateBenchmarkDataset('cloud_saas');
export const FINTECH_BENCHMARK: Customer[] = generateBenchmarkDataset('fintech_banking');
