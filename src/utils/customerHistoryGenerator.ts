import { Customer } from '../types';

export interface CustomerHistoryPoint {
  month: string;
  monthIndex: number;
  supportTickets: number;
  loginCount: number;
  paymentEvents: number; // 1 = Successful, 0 = Failed, 0.5 = Retried/Late
  paymentStatus: 'Success' | 'Failed' | 'Late' | 'Retried';
  paymentAmount: number;
  usageGB: number;
  riskScore: number;
  notes?: string;
}

export interface SupportTicketDetail {
  id: string;
  date: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Resolved' | 'Escalated' | 'Open';
  resolutionDays: number;
  summary: string;
}

export interface PaymentTransactionDetail {
  transactionId: string;
  date: string;
  amountINR: number;
  method: string;
  status: 'Success' | 'Failed' | 'Retried';
  failureReason?: string;
}

// Simple seeded hash to make the historical curve completely deterministic per customer ID
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const MONTHS_12 = [
  'Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026',
  'Feb 2026', 'Mar 2026', 'Apr 2026', 'May 2026',
  'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026',
];

/**
 * Synthesizes a deterministic, authentic historical time-series for an individual customer
 * faithfully mirroring their tenure, support tickets, complaints, payment failures,
 * login frequency, and risk tier.
 */
export function generateCustomerHistory(customer: Customer, monthsCount: 6 | 12 = 6): CustomerHistoryPoint[] {
  const seed = hashString(customer.id);
  const months = monthsCount === 6 ? MONTHS_12.slice(6) : MONTHS_12;
  const history: CustomerHistoryPoint[] = [];

  // Baseline login frequency targets
  const targetLogins =
    customer.loginFrequency === 'Daily' ? 28 :
    customer.loginFrequency === 'Weekly' ? 14 :
    customer.loginFrequency === 'Monthly' ? 4 : 1;

  // Base monthly usage
  const baseUsage = customer.usageGB;
  const usageTrendFraction = customer.serviceUsageTrend / 100;

  // Total failures to distribute across recent months
  const totalFailures = customer.paymentFailures;
  const totalTickets = customer.supportTickets;

  for (let i = 0; i < months.length; i++) {
    const month = months[i];
    const progress = i / (months.length - 1); // 0 (oldest) to 1 (current)
    const monthSeed = (seed + i * 17) % 100;

    // 1. Support tickets over time:
    // Churning/High-risk customers see tickets escalate towards the recent months
    let ticketsInMonth = 0;
    if (customer.riskLevel === 'HIGH') {
      if (progress > 0.6) {
        ticketsInMonth = Math.round((totalTickets * (progress - 0.4) * 1.5) + (monthSeed % 2));
      } else if (progress > 0.3) {
        ticketsInMonth = monthSeed % 3 === 0 ? 1 : 0;
      }
    } else if (customer.riskLevel === 'MEDIUM') {
      if (progress > 0.5 && monthSeed % 2 === 0) {
        ticketsInMonth = 1;
      }
    } else {
      // Low risk: rarely 1 ticket, mostly 0
      ticketsInMonth = (monthSeed < 15 && i === 2) ? 1 : 0;
    }
    ticketsInMonth = Math.max(0, Math.min(5, ticketsInMonth));

    // 2. Login frequency over time:
    // If usage trend is negative and risk is high, logins drop steeply towards current month
    let logins = targetLogins;
    if (customer.riskLevel === 'HIGH') {
      // Degrades from healthy baseline down to current low
      const startLogins = Math.max(22, targetLogins * 3);
      logins = Math.round(startLogins - (startLogins - targetLogins) * Math.pow(progress, 0.8));
    } else if (customer.riskLevel === 'MEDIUM') {
      const startLogins = Math.max(16, targetLogins * 1.5);
      logins = Math.round(startLogins - (startLogins - targetLogins) * progress);
    } else {
      // Steady with minor random noise
      logins = Math.max(15, targetLogins + ((monthSeed % 5) - 2));
    }
    logins = Math.max(0, logins);

    // 3. Payment events:
    // 1 = Success, 0 = Failed, 0.5 = Retried
    let paymentEvents = 1;
    let paymentStatus: 'Success' | 'Failed' | 'Late' | 'Retried' = 'Success';

    if (totalFailures > 0) {
      // Place failures in the most recent 1 to 3 months
      const failureTriggerMonths = totalFailures >= 2 ? [months.length - 1, months.length - 2] : [months.length - 1];
      if (failureTriggerMonths.includes(i)) {
        paymentEvents = 0;
        paymentStatus = 'Failed';
      } else if (i === months.length - 3 && totalFailures > 1) {
        paymentEvents = 0.5;
        paymentStatus = 'Retried';
      }
    }

    // 4. Usage GB over time
    const monthUsage = Math.max(
      5,
      Math.round(baseUsage * (1 - usageTrendFraction * (1 - progress)) + ((monthSeed % 9) - 4))
    );

    // 5. Risk score trajectory
    const currentRisk = customer.riskScore;
    let monthRisk = currentRisk;
    if (customer.riskLevel === 'HIGH') {
      const initialRisk = Math.max(20, Math.round(currentRisk * 0.4));
      monthRisk = Math.round(initialRisk + (currentRisk - initialRisk) * Math.pow(progress, 1.2));
    } else if (customer.riskLevel === 'MEDIUM') {
      const initialRisk = Math.max(15, Math.round(currentRisk * 0.6));
      monthRisk = Math.round(initialRisk + (currentRisk - initialRisk) * progress);
    } else {
      monthRisk = Math.max(5, currentRisk + ((monthSeed % 7) - 3));
    }

    history.push({
      month,
      monthIndex: i,
      supportTickets: ticketsInMonth,
      loginCount: logins,
      paymentEvents,
      paymentStatus,
      paymentAmount: customer.monthlyCharges,
      usageGB: monthUsage,
      riskScore: monthRisk,
    });
  }

  return history;
}

/**
 * Generates itemized support ticket incident history for the customer
 */
export function generateCustomerTickets(customer: Customer): SupportTicketDetail[] {
  const tickets: SupportTicketDetail[] = [];
  const seed = hashString(customer.id);
  const categories = [
    'Broadband Latency & Packet Loss',
    'Billing Overcharge & Mandate Dispute',
    'Router Configuration & Hardware Failure',
    'Frequent Disconnection & Fiber Cut',
    'Plan Downgrade Inquiry',
    'Service Relocation Delay',
  ];

  const count = Math.max(1, customer.supportTickets);
  const dates = ['14 Sep 2026', '28 Aug 2026', '12 Jul 2026', '04 May 2026', '19 Feb 2026'];

  for (let i = 0; i < count; i++) {
    const catIdx = (seed + i * 3) % categories.length;
    const isEscalated = i < customer.complaints;
    tickets.push({
      id: `TK-${(4000 + (seed % 5000) + i * 11).toString()}`,
      date: dates[i % dates.length],
      category: categories[catIdx],
      priority: isEscalated ? 'Urgent' : i === 0 ? 'High' : 'Medium',
      status: isEscalated ? 'Escalated' : i === 0 ? 'Open' : 'Resolved',
      resolutionDays: isEscalated ? 6 : (seed % 3) + 1,
      summary: isEscalated
        ? `Subscriber lodged repeated grievance regarding ${categories[catIdx].toLowerCase()}. SLA breached.`
        : `Routine inquiry on ${categories[catIdx].toLowerCase()} logged and processed.`,
    });
  }

  return tickets;
}

/**
 * Generates monthly transaction history for the customer
 */
export function generateCustomerTransactions(customer: Customer): PaymentTransactionDetail[] {
  const txs: PaymentTransactionDetail[] = [];
  const seed = hashString(customer.id);
  const dates = [
    '05 Sep 2026', '05 Aug 2026', '05 Jul 2026',
    '05 Jun 2026', '05 May 2026', '05 Apr 2026'
  ];

  const failureReasons = [
    'Insufficient Account Balance (E-Mandate Rejected)',
    'Bank Server Timeout during NACH clearing',
    'Card Expired / 3D-Secure Authentication Dropped',
    'Daily UPI Transaction Limit Exceeded',
  ];

  for (let i = 0; i < dates.length; i++) {
    const isFailed = i < customer.paymentFailures;
    const isRetried = !isFailed && i === customer.paymentFailures && customer.paymentFailures > 0;

    txs.push({
      transactionId: `TXN-IN-${(80000 + (seed % 10000) + i * 23).toString()}`,
      date: dates[i],
      amountINR: customer.monthlyCharges,
      method: customer.paymentMethod,
      status: isFailed ? 'Failed' : isRetried ? 'Retried' : 'Success',
      failureReason: isFailed ? failureReasons[(seed + i) % failureReasons.length] : undefined,
    });
  }

  return txs;
}
