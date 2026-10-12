import { Customer, RiskTier, SubscriptionPlan, ContractType, PaymentMethod, Region, LoginFrequency } from '../types';

/**
 * Robust, client-side CSV parser with handling for quoted values and commas.
 */
export function parseCSV(csvText: string): Record<string, string>[] {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  // Helper to parse a single CSV line with quoted values
  const parseLine = (line: string): string[] => {
    const values: string[] = [];
    let curVal = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          curVal += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        values.push(curVal.trim());
        curVal = '';
      } else {
        curVal += char;
      }
    }
    values.push(curVal.trim());
    return values;
  };

  const headers = parseLine(lines[0]).map((h) => h.replace(/^["']|["']$/g, '').trim());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = parseLine(lines[i]);
    if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue;
    const row: Record<string, string> = {};
    headers.forEach((header, idx) => {
      row[header] = cells[idx] !== undefined ? cells[idx] : '';
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Normalizes raw CSV records into standard Customer type.
 */
export function mapRowsToCustomers(rows: Record<string, string>[]): Customer[] {
  return rows.map((row, index) => {
    // Find matching keys case-insensitively
    const getVal = (...possibleKeys: string[]): string => {
      for (const pk of possibleKeys) {
        const foundKey = Object.keys(row).find((k) => k.toLowerCase().replace(/[^a-z0-9]/g, '') === pk.toLowerCase().replace(/[^a-z0-9]/g, ''));
        if (foundKey && row[foundKey] !== undefined) {
          return row[foundKey];
        }
      }
      return '';
    };

    const id = getVal('customerid', 'id', 'cid', 'accountid') || `C${1000 + index}`;
    const name = getVal('customername', 'name', 'fullname') || `Subscriber #${id}`;
    const genderRaw = getVal('gender', 'sex').toLowerCase();
    const gender = genderRaw.startsWith('f') ? 'Female' : genderRaw.startsWith('m') ? 'Male' : 'Other';
    const age = parseInt(getVal('age', 'customerage'), 10) || (22 + (index * 7) % 45);

    const regionRaw = getVal('region', 'state', 'location').toLowerCase();
    const region: Region = regionRaw.includes('south')
      ? 'South'
      : regionRaw.includes('west')
      ? 'West'
      : regionRaw.includes('east')
      ? 'East'
      : regionRaw.includes('central')
      ? 'Central'
      : 'North';

    const city = getVal('city', 'town') || (region === 'North' ? 'Delhi NCR' : region === 'South' ? 'Bengaluru' : region === 'West' ? 'Mumbai' : region === 'East' ? 'Kolkata' : 'Bhopal');

    const planRaw = getVal('subscriptionplan', 'plan', 'tier', 'package').toLowerCase();
    const subscriptionPlan: SubscriptionPlan = planRaw.includes('ent')
      ? 'Enterprise'
      : planRaw.includes('prem')
      ? 'Premium'
      : planRaw.includes('stand')
      ? 'Standard'
      : 'Basic';

    const tenureMonths = Math.max(1, parseInt(getVal('tenuremonths', 'tenure', 'months'), 10) || ((index * 3) % 60 + 1));
    const monthlyCharges = Math.max(100, parseFloat(getVal('monthlycharges', 'monthlycharge', 'charges', 'mrr')) || (subscriptionPlan === 'Basic' ? 699 : subscriptionPlan === 'Standard' ? 1299 : subscriptionPlan === 'Premium' ? 2199 : 4499));
    const totalCharges = parseFloat(getVal('totalcharges', 'totalspent', 'clv')) || Math.round(monthlyCharges * tenureMonths);

    const payRaw = getVal('paymentmethod', 'payment', 'method').toLowerCase();
    const paymentMethod: PaymentMethod = payRaw.includes('upi')
      ? 'UPI'
      : payRaw.includes('credit')
      ? 'Credit Card'
      : payRaw.includes('net')
      ? 'Net Banking'
      : payRaw.includes('nach') || payRaw.includes('auto')
      ? 'Auto-Debit (NACH)'
      : 'Debit Card';

    const contractRaw = getVal('contracttype', 'contract', 'term').toLowerCase();
    const contractType: ContractType = contractRaw.includes('2') || contractRaw.includes('two')
      ? '2-Year'
      : contractRaw.includes('1') || contractRaw.includes('one') || contractRaw.includes('annual')
      ? '1-Year'
      : 'Month-to-month';

    const usageGB = Math.max(5, parseFloat(getVal('usagegb', 'usage', 'datausage')) || (30 + (index * 13) % 180));
    const supportTickets = Math.max(0, parseInt(getVal('supporttickets', 'tickets', 'cases'), 10) || ((index * 2) % 7));
    const complaints = Math.max(0, parseInt(getVal('complaints', 'escalations'), 10) || Math.min(supportTickets, (index % 4)));

    const loginRaw = getVal('loginfrequency', 'logins', 'activity').toLowerCase();
    const loginFrequency: LoginFrequency = loginRaw.includes('daily')
      ? 'Daily'
      : loginRaw.includes('week')
      ? 'Weekly'
      : loginRaw.includes('dorm') || loginRaw.includes('low') || loginRaw.includes('inact')
      ? 'Dormant'
      : 'Monthly';

    const serviceUsageTrend = parseFloat(getVal('serviceusagetrend', 'usagetrend', 'trend')) || (-50 + ((index * 17) % 90));
    const paymentFailures = Math.max(0, parseInt(getVal('paymentfailures', 'failedpayments', 'declines'), 10) || (index % 5 === 0 ? 2 : index % 3 === 0 ? 1 : 0));

    const churnRaw = getVal('churnstatus', 'churn', 'churned', 'status').toLowerCase();
    const churnStatus: 'Active' | 'Churned' =
      churnRaw === 'yes' || churnRaw === '1' || churnRaw === 'true' || churnRaw === 'churned' || churnRaw === 'churn'
        ? 'Churned'
        : 'Active';

    // Calculate dynamic risk score based on features
    let score = 25;
    if (contractType === 'Month-to-month') score += 25;
    if (contractType === '2-Year') score -= 20;
    if (complaints >= 2) score += 30;
    else if (complaints === 1) score += 12;
    if (paymentFailures >= 2) score += 20;
    else if (paymentFailures === 1) score += 10;
    if (serviceUsageTrend < -30) score += 18;
    if (loginFrequency === 'Dormant') score += 15;
    if (tenureMonths > 24) score -= 20;
    else if (tenureMonths <= 6) score += 15;
    if (paymentMethod === 'Auto-Debit (NACH)') score -= 10;

    const riskScore = Math.min(99, Math.max(5, Math.round(score)));
    const riskLevel: RiskTier = riskScore >= 70 ? 'HIGH' : riskScore >= 40 ? 'MEDIUM' : 'LOW';

    const keyDrivers: string[] = [];
    if (complaints >= 2) keyDrivers.push(`${complaints} Unresolved Complaints`);
    if (contractType === 'Month-to-month') keyDrivers.push('Month-to-month Contract');
    if (serviceUsageTrend < -25) keyDrivers.push(`${Math.abs(Math.round(serviceUsageTrend))}% Usage Contraction`);
    if (paymentFailures >= 1) keyDrivers.push(`${paymentFailures} Gateway Failures`);
    if (tenureMonths <= 6) keyDrivers.push('Early 6-Month Cliff');
    if (keyDrivers.length === 0) keyDrivers.push('Healthy Engagement Baseline');

    const recommendedStrategy =
      riskLevel === 'HIGH'
        ? 'Deploy personalized retention offer: 25% annual contract discount + Priority Support Escalation'
        : riskLevel === 'MEDIUM'
        ? 'Proactive outreach: Feature engagement walkthrough + Automated UPI Autopay setup rebate'
        : 'Loyalty reinforcement: Milestone badge reward + Exclusive VIP early access program';

    return {
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
    };
  });
}

/**
 * Exports customers to a downloadable CSV string.
 */
export function exportCustomersToCSV(customers: Customer[]): string {
  const headers = [
    'CustomerID',
    'Name',
    'Gender',
    'Age',
    'Region',
    'City',
    'SubscriptionPlan',
    'TenureMonths',
    'MonthlyChargesINR',
    'TotalChargesINR',
    'PaymentMethod',
    'ContractType',
    'UsageGB',
    'SupportTickets',
    'Complaints',
    'LoginFrequency',
    'ServiceUsageTrendPercent',
    'PaymentFailures',
    'ContractRenewalStatus',
    'ChurnStatus',
    'RiskScore',
    'RiskLevel',
  ];

  const rows = customers.map((c) => [
    c.id,
    `"${c.name.replace(/"/g, '""')}"`,
    c.gender,
    c.age,
    c.region,
    `"${c.city.replace(/"/g, '""')}"`,
    c.subscriptionPlan,
    c.tenureMonths,
    c.monthlyCharges,
    c.totalCharges,
    `"${c.paymentMethod}"`,
    `"${c.contractType}"`,
    c.usageGB,
    c.supportTickets,
    c.complaints,
    c.loginFrequency,
    c.serviceUsageTrend,
    c.paymentFailures,
    `"${c.contractRenewalStatus}"`,
    c.churnStatus,
    c.riskScore,
    c.riskLevel,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}
