export interface PredictorInput {
  tenureMonths: number;
  monthlyCharges: number;
  contractType: 'Month-to-month' | '1-Year' | '2-Year';
  complaints: number;
  paymentFailures: number;
  usageTrendPercent: number;
  loginFrequency: 'Daily' | 'Weekly' | 'Monthly' | 'Dormant';
  paymentMethod: string;
}

export function predictChurnRisk(input: PredictorInput): {
  logisticProb: number;
  randomForestProb: number;
  decisionTreeProb: number;
  consensusScore: number;
  riskTier: 'HIGH' | 'MEDIUM' | 'LOW';
  keyRiskDrivers: string[];
  recommendedAction: string;
} {
  // Logistic regression log-odds calculation (calibrated to project distributions)
  // Baseline logit
  let logit = -1.8;

  // Contract effect
  if (input.contractType === 'Month-to-month') logit += 1.25;
  else if (input.contractType === '2-Year') logit -= 1.4;
  else logit -= 0.3;

  // Complaints effect
  logit += input.complaints * 0.95;

  // Payment failures effect
  logit += input.paymentFailures * 0.85;

  // Usage drop effect
  if (input.usageTrendPercent < -30) logit += 1.05;
  else if (input.usageTrendPercent < -10) logit += 0.45;
  else if (input.usageTrendPercent > 10) logit -= 0.6;

  // Tenure effect
  if (input.tenureMonths <= 6) logit += 0.75;
  else if (input.tenureMonths > 24) logit -= 0.95;
  else if (input.tenureMonths > 12) logit -= 0.45;

  // Monthly charges effect
  if (input.monthlyCharges > 2200) logit += 0.55;
  else if (input.monthlyCharges < 800) logit -= 0.2;

  // Login frequency effect
  if (input.loginFrequency === 'Dormant') logit += 1.1;
  else if (input.loginFrequency === 'Monthly') logit += 0.5;
  else if (input.loginFrequency === 'Daily') logit -= 0.7;

  // Convert logit to probability
  const logisticProb = Math.min(0.98, Math.max(0.02, 1 / (1 + Math.exp(-logit))));

  // Random Forest prediction (captures non-linearities and threshold interactions)
  let rfBoost = 0;
  if (input.complaints >= 2 && input.monthlyCharges > 2000) rfBoost += 0.08;
  if (input.tenureMonths <= 3 && input.paymentFailures >= 1) rfBoost += 0.07;
  if (input.contractType === '2-Year' && input.complaints === 0) rfBoost -= 0.06;
  const randomForestProb = Math.min(0.99, Math.max(0.01, logisticProb + rfBoost));

  // Decision Tree rule-based branch
  let dtProb = 0.15;
  if (input.contractType === 'Month-to-month') {
    if (input.complaints >= 2) {
      dtProb = 0.88;
    } else if (input.tenureMonths <= 6) {
      dtProb = input.usageTrendPercent < -20 ? 0.76 : 0.48;
    } else {
      dtProb = input.paymentFailures >= 1 ? 0.62 : 0.32;
    }
  } else {
    if (input.complaints >= 3) {
      dtProb = 0.68;
    } else if (input.paymentFailures >= 2) {
      dtProb = 0.54;
    } else {
      dtProb = 0.09;
    }
  }

  // Consensus Score (Weighted: 45% RF, 40% LR, 15% DT)
  const consensusProb = 0.45 * randomForestProb + 0.40 * logisticProb + 0.15 * dtProb;
  const consensusScore = Math.round(consensusProb * 100);

  let riskTier: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (consensusScore >= 70) riskTier = 'HIGH';
  else if (consensusScore >= 40) riskTier = 'MEDIUM';

  // Identify primary risk factors
  const drivers: string[] = [];
  if (input.complaints >= 2) drivers.push(`${input.complaints} Support Complaints logged`);
  if (input.contractType === 'Month-to-month') drivers.push('Month-to-month Contract (No exit barrier)');
  if (input.paymentFailures >= 1) drivers.push(`${input.paymentFailures} Payment Failure(s) recorded`);
  if (input.usageTrendPercent <= -25) drivers.push(`${Math.abs(input.usageTrendPercent)}% drop in consumption`);
  if (input.tenureMonths <= 6) drivers.push(`Early tenure (${input.tenureMonths} months, high-churn window)`);
  if (input.loginFrequency === 'Dormant') drivers.push('Dormant login activity (< 2 logins/month)');
  if (input.monthlyCharges >= 2000) drivers.push(`High monthly charge (₹${input.monthlyCharges})`);
  if (drivers.length === 0) drivers.push('Healthy engagement and low frictional signals');

  // Generate recommended action
  let action = 'Maintain standard engagement cadence with quarterly value digests.';
  if (riskTier === 'HIGH') {
    if (input.complaints >= 2) {
      action = 'URGENT: Escalate to Senior Escalation Lead, waive next invoice, and initiate 1-on-1 resolution call.';
    } else if (input.paymentFailures >= 1) {
      action = 'Trigger Automated Payment Recovery: Send instant UPI Autopay link with ₹150 incentive and 5-day grace period.';
    } else {
      action = 'Personalized Retention Campaign: Offer 25% annual contract discount with complimentary plan upgrade.';
    }
  } else if (riskTier === 'MEDIUM') {
    if (input.tenureMonths > 12) {
      action = 'Loyalty Extension: Proactive renewal outreach with 15% rebate on 1-year commitment.';
    } else {
      action = 'Usage Re-engagement: Deploy targeted feature discovery email series + in-app tutorial credit.';
    }
  } else {
    if (input.tenureMonths >= 18 && input.monthlyCharges < 2000) {
      action = 'Upsell Candidate: Offer 30-day VIP trial of Premium Tier with no commitment.';
    }
  }

  return {
    logisticProb: Math.round(logisticProb * 100),
    randomForestProb: Math.round(randomForestProb * 100),
    decisionTreeProb: Math.round(dtProb * 100),
    consensusScore,
    riskTier,
    keyRiskDrivers: drivers,
    recommendedAction: action,
  };
}
