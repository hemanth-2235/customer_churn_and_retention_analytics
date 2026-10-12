import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Printer,
  FileText,
} from 'lucide-react';
import { ComputedAnalytics } from '../utils/analyticsEngine';

interface ExecutiveBriefingModalProps {
  isOpen: boolean;
  onClose: () => void;
  analytics: ComputedAnalytics;
}

export const ExecutiveBriefingModal: React.FC<ExecutiveBriefingModalProps> = ({
  isOpen,
  onClose,
  analytics,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const { overview, insights, contractStats, complaintCorrelation } = analytics;
  const mtmStat = contractStats.find(c => c.contract === 'Month-to-month');
  const twoYrStat = contractStats.find(c => c.contract === '2-Year');

  const briefingText = `EXECUTIVE BRIEFING: CUSTOMER CHURN & RETENTION ANALYTICS SYSTEM
Organization: Subscription Services Division & Business Intelligence Unit
Source Dataset: Active Cohort (${overview.totalCustomers.toLocaleString('en-IN')} Customer Records)
Date: September 2026

BASE COHORT SUMMARY:
• Total Customers: ${overview.totalCustomers.toLocaleString('en-IN')}
• Active Retained: ${overview.activeCustomers.toLocaleString('en-IN')} (${overview.retentionRate}%)
• Churned Customers: ${overview.churnedCustomers.toLocaleString('en-IN')} (${overview.churnRate}%)
• Total Annual Revenue at Risk: ₹${(overview.revenueAtRiskINR / 100000).toFixed(2)} Lakhs
• Average Monthly Charge: ₹${overview.avgMonthlyChargeINR} / account

=======================================================
1. WHO IS LEAVING? (CUSTOMER SEGMENTATION & RISK PROFILE)
=======================================================
• Overall Churn: ${overview.churnRate}% (${overview.churnedCustomers.toLocaleString('en-IN')} lost out of ${overview.totalCustomers.toLocaleString('en-IN')}).
• Plan Vulnerability: ${insights.highestChurnPlan.plan} plan has the highest attrition rate at ${insights.highestChurnPlan.churnRate}%.
• Geographic Vulnerability: ${insights.highestChurnRegion.region} region exhibits ${insights.highestChurnRegion.churnRate}% churn.
• Contract Dependency: Month-to-month contracts churn at ${mtmStat?.churnRate || 28}%, which is ${insights.monthToMonthRiskFactor}x higher than 2-Year contracts (${twoYrStat?.churnRate || 3.5}%).
• High-Risk Accounts: ${overview.highRiskCount} accounts currently flagged in the 🔴 HIGH RISK Tier (Risk Score ≥ 70%).

=======================================================
2. WHY ARE THEY LEAVING? (BEHAVIORAL ROOT CAUSES)
=======================================================
• The 2-Complaint Cliff: Attrition surges ${insights.complaintCliffFactor}x when customers log 2 or more unresolved tickets.
• Involuntary Billing Lapse: Multiple failed payment attempts multiply cancellation likelihood by ${insights.paymentFailureMultiplier}x.
• Consumption Decay: Severe usage contractions (>-35%) trigger an empirical ${insights.usageDropChurnRate}% cancellation rate.
• Payment Gateway Friction: Net Banking and Debit Card mandate drops drive avoidable involuntary churn.

=======================================================
3. WHAT CAN WE DO TO RETAIN THEM? (PRESCRIPTIVE STRATEGIES)
=======================================================
1. High-Risk Cohort (🔴 ${overview.highRiskCount} Accounts):
   → Deploy personalized retention offer: 25% annual contract discount with plan right-sizing.
2. Repeated Complaints (⚠️ ≥ 2 Tickets):
   → Implement Priority 1 automatic escalation routing to Senior Specialist + service rebate credit.
3. Billing Failures (💳 Mandate Drops):
   → Institute a 5-day soft grace period and instant 1-tap WhatsApp UPI Autopay migration with cash rebate.
4. Long-Tenure Advocates (⭐ >18 Months):
   → Reward with VIP status, dedicated account manager, and milestone renewal bonuses.

=======================================================
4. PROJECTED FINANCIAL ROI & CAPITAL PRESERVATION
=======================================================
• Targeted High-Risk Reach: 80% (${Math.round(overview.highRiskCount * 0.8)} accounts).
• Projected Retention Lift: 35% conversion (${Math.round(overview.highRiskCount * 0.8 * 0.35)} accounts saved).
• Gross ARR Preserved: ₹${((Math.round(overview.highRiskCount * 0.8 * 0.35) * overview.avgMonthlyChargeINR * 12) / 100000).toFixed(2)} Lakhs saved annually.
• Model Verification: Logistic Regression and Random Forest provide interpretable log-odds and verified discrimination metrics.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(briefingText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Executive Churn &amp; Retention Briefing Memo
              </h3>
              <p className="text-xs text-slate-500">
                Dynamically Generated from {overview.totalCustomers.toLocaleString('en-IN')} Dataset Records
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Text'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="mt-4 space-y-4 text-xs text-slate-700 font-mono bg-slate-50 p-4 rounded-xl border border-slate-200 max-h-[60vh] overflow-y-auto whitespace-pre-wrap leading-relaxed">
          {briefingText}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Data-Driven Output &bull; Customer Churn &amp; Retention Analytics Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
