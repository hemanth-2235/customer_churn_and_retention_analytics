import React, { useState } from 'react';
import {
  Sparkles,
  Gift,
  PhoneCall,
  CreditCard,
  Percent,
  CheckCircle2,
  Calculator,
  ArrowRight,
  Database,
} from 'lucide-react';
import { ComputedAnalytics } from '../../utils/analyticsEngine';

interface RetentionStrategyProps {
  analytics: ComputedAnalytics;
  onOpenBriefing: () => void;
  onNavigateToRisk: () => void;
}

export const RetentionStrategy: React.FC<RetentionStrategyProps> = ({
  analytics,
  onOpenBriefing,
  onNavigateToRisk,
}) => {
  const { overview, insights } = analytics;

  // Campaign ROI Simulation parameters
  const [targetHighRiskReach, setTargetHighRiskReach] = useState<number>(80); // % of high risk accounts targeted
  const [projectedSuccessRate, setProjectedSuccessRate] = useState<number>(35); // % retained through offers
  const [avgDiscountPercent, setAvgDiscountPercent] = useState<number>(20); // discount given

  // Dynamic calculations from active dataset
  const highRiskCohort = overview.highRiskCount || 1;
  const targetedCount = Math.round((highRiskCohort * targetHighRiskReach) / 100);
  const customersSaved = Math.round((targetedCount * projectedSuccessRate) / 100);

  const avgMonthlyCharge = overview.avgMonthlyChargeINR || 1480;
  const grossAnnualRevenueSaved = customersSaved * avgMonthlyCharge * 12; // ₹ ARR preserved
  const campaignDiscountCost = Math.round(grossAnnualRevenueSaved * (avgDiscountPercent / 100));
  const outreachCost = targetedCount * 75; // ₹75 per targeted omnichannel outreach (SMS, WhatsApp, Agent call)
  const totalCampaignInvestment = campaignDiscountCost + outreachCost;
  const netRevenuePreserved = grossAnnualRevenueSaved - totalCampaignInvestment;
  const roiMultiplier = totalCampaignInvestment > 0 ? (netRevenuePreserved / totalCampaignInvestment).toFixed(1) : '0';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                <Database className="w-3 h-3 mr-1" />
                <span>Actionable Prescriptive Playbook &bull; {overview.totalCustomers} Records</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Prescriptive Retention Framework
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Data-Driven Retention Playbooks &amp; ROI Simulator
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Translating predictive analytics into concrete executive actions: personalized pricing, proactive service SLAs,
              billing grace workflows, and loyalty rewards to maximize customer lifetime value.
            </p>
          </div>

          <button
            onClick={onOpenBriefing}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Generate Executive Briefing</span>
          </button>
        </div>
      </div>

      {/* The 4 Core Business Playbooks as requested by prompt:
          1. High-risk customers -> Personalized retention offer
          2. Long-tenure + high-value customers -> Loyalty benefits
          3. Customers with repeated complaints -> Priority support
          4. Customers with payment failures -> Payment reminders / alternate payment methods */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Playbook 1: High-Risk Customers */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-rose-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">1. High-Risk Customer Cohort</h3>
                  <span className="text-[11px] font-semibold text-rose-600">Risk Score &ge; 70% &bull; {highRiskCohort} Accounts Identified</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 uppercase">
                Critical Priority
              </span>
            </div>

            <div className="bg-rose-50/50 rounded-lg p-3 text-xs text-rose-950 font-medium mb-3 border border-rose-100">
              <strong>Strategy: Personalized Retention Offer &amp; Plan Right-Sizing</strong>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-rose-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Annual Commitment Discount:</strong> Offer 25% discount if the customer locks in for 12 months, counteracting the {insights.monthToMonthRiskFactor}x month-to-month volatility.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-rose-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Plan Right-Sizing:</strong> Allow down-tiering rather than complete cancellation, keeping the user in the revenue ecosystem.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-rose-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Concierge Check-in:</strong> Automated WhatsApp message offering a free 1-on-1 account optimization consultation.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Projected Retention Lift: <strong>+35%</strong></span>
            <button
              onClick={onNavigateToRisk}
              className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center cursor-pointer"
            >
              Inspect High-Risk Accounts <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

        {/* Playbook 2: Long-Tenure + High-Value Customers */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-indigo-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">2. Long-Tenure + High-Value Subscribers</h3>
                  <span className="text-[11px] font-semibold text-indigo-600">Tenure &gt; 18m &bull; Active Customer Base</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase">
                Loyalty Growth
              </span>
            </div>

            <div className="bg-indigo-50/50 rounded-lg p-3 text-xs text-indigo-950 font-medium mb-3 border border-indigo-100">
              <strong>Strategy: VIP Loyalty Benefits &amp; Renewal Bonuses</strong>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>VIP Status &amp; Priority SLA:</strong> Bypass standard ticket queues with guaranteed sub-1-hour executive response.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Anniversary Milestone Perks:</strong> 15% renewal rebate + complimentary speed booster or cloud storage add-on.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Exclusive Beta Access:</strong> Early access to new platform features and VIP community forum.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Expands LTV by: <strong>+42%</strong></span>
            <span className="text-xs font-semibold text-emerald-600">Revenue Defense Engine</span>
          </div>
        </div>

        {/* Playbook 3: Customers with Repeated Complaints */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">3. Customers with Repeated Complaints</h3>
                  <span className="text-[11px] font-semibold text-amber-600">&ge; 2 Unresolved Support Tickets</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase">
                Service Escalation
              </span>
            </div>

            <div className="bg-amber-50/50 rounded-lg p-3 text-xs text-amber-950 font-medium mb-3 border border-amber-100">
              <strong>Strategy: Priority Support Routing &amp; Proactive Outreach</strong>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Automatic Senior Care Escalation:</strong> Routing 2nd tickets to Senior Specialists halts the {insights.complaintCliffFactor}x complaint cliff.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Apology Billing Credit:</strong> Instant ₹500 credit or 1-month streaming voucher applied on resolved tickets.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-amber-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Post-Resolution Call:</strong> 48-hour follow-up call from support supervisor to confirm complete satisfaction.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Defuses <strong>{insights.complaintCliffFactor}x</strong> Complaint Cliff</span>
            <span className="text-xs font-semibold text-amber-600">SLA Recovery SLA &lt; 2h</span>
          </div>
        </div>

        {/* Playbook 4: Customers with Payment Failures */}
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">4. Payment Failures &amp; Involuntary Churn</h3>
                  <span className="text-[11px] font-semibold text-blue-600">Failed Mandates &bull; Gateway Drops</span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                Billing Recovery
              </span>
            </div>

            <div className="bg-blue-50/50 rounded-lg p-3 text-xs text-blue-950 font-medium mb-3 border border-blue-100">
              <strong>Strategy: Payment Reminders &amp; UPI Autopay Migration</strong>
            </div>

            <ul className="space-y-2 text-xs text-slate-600">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Frictionless WhatsApp/SMS Payment Link:</strong> Immediate 1-tap UPI mandate re-authorization link.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>5-Day Grace Period:</strong> Avoid abrupt service suspension; grant 5-day soft grace window with subtle in-app reminder.</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 text-blue-500 mr-2 shrink-0 mt-0.5" />
                <span><strong>Payment Switch Incentive:</strong> ₹100 instant cashback on switching from failing Debit Cards to UPI Autopay.</span>
              </li>
            </ul>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Halts <strong>{insights.paymentFailureMultiplier}x</strong> Failure Surge</span>
            <span className="text-xs font-semibold text-blue-600">Zero-Friction Ingestion</span>
          </div>
        </div>
      </div>

      {/* Interactive Campaign ROI Simulator */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-1">
              <Calculator className="w-3 h-3" />
              <span>Financial Forecasting Model</span>
            </div>
            <h3 className="text-lg font-bold text-white">
              Retention Campaign Investment &amp; ROI Simulator
            </h3>
            <p className="text-xs text-slate-400">
              Empirically calculated using the {highRiskCohort} active high-risk accounts and ₹{avgMonthlyCharge}/mo average charge from the loaded dataset.
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Net Campaign ROI</span>
            <span className="text-3xl font-black text-emerald-400 tracking-tight">
              {roiMultiplier}x Net Return
            </span>
          </div>
        </div>

        {/* Sliders Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Slider 1: Reach */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-300">Target Cohort Reach</span>
              <span className="text-indigo-400 font-bold text-sm">{targetHighRiskReach}% ({targetedCount} accounts)</span>
            </div>
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              value={targetHighRiskReach}
              onChange={(e) => setTargetHighRiskReach(Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Targeting {targetedCount} of the {highRiskCohort} High-Risk accounts
            </span>
          </div>

          {/* Slider 2: Conversion Rate */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-300">Projected Retention Lift</span>
              <span className="text-emerald-400 font-bold text-sm">{projectedSuccessRate}% ({customersSaved} saved)</span>
            </div>
            <input
              type="range"
              min="10"
              max="70"
              step="5"
              value={projectedSuccessRate}
              onChange={(e) => setProjectedSuccessRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Percentage of targeted customers persuaded to renew
            </span>
          </div>

          {/* Slider 3: Discount / Incentive Cost */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-center text-xs font-semibold mb-2">
              <span className="text-slate-300">Retention Offer Discount</span>
              <span className="text-amber-400 font-bold text-sm">{avgDiscountPercent}% Annual Off</span>
            </div>
            <input
              type="range"
              min="10"
              max="40"
              step="5"
              value={avgDiscountPercent}
              onChange={(e) => setAvgDiscountPercent(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-400 block mt-1">
              Average incentive discount given to secure 1-year contract
            </span>
          </div>
        </div>

        {/* Financial Outcome Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Subscribers Saved</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">{customersSaved}</span>
            <span className="text-[10px] text-slate-400">Accounts Preserved</span>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Gross ARR Preserved</span>
            <span className="text-2xl font-black text-white mt-1 block">
              ₹{(grossAnnualRevenueSaved / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[10px] text-slate-400">₹{grossAnnualRevenueSaved.toLocaleString('en-IN')} / yr</span>
          </div>

          <div className="bg-white/5 p-3.5 rounded-xl border border-white/10">
            <span className="text-[11px] uppercase font-bold text-slate-400 block">Campaign Cost</span>
            <span className="text-2xl font-black text-rose-400 mt-1 block">
              ₹{(totalCampaignInvestment / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[10px] text-slate-400">Discounts + Outreach</span>
          </div>

          <div className="bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/30">
            <span className="text-[11px] uppercase font-bold text-emerald-300 block">Net Profit Preserved</span>
            <span className="text-2xl font-black text-emerald-400 mt-1 block">
              ₹{(netRevenuePreserved / 100000).toFixed(2)} Lakhs
            </span>
            <span className="text-[10px] text-emerald-300/80">Net Bottomline Impact</span>
          </div>
        </div>
      </div>
    </div>
  );
};
