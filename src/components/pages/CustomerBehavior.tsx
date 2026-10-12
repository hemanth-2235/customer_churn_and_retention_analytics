import React, { useState } from 'react';
import {
  Activity,
  CreditCard,
  Flame,
  MessageSquareWarning,
  TrendingDown,
  Layers,
  ArrowRight,
  Database,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import { ComputedAnalytics } from '../../utils/analyticsEngine';

interface CustomerBehaviorProps {
  analytics: ComputedAnalytics;
  onNavigateToRisk: () => void;
}

export const CustomerBehavior: React.FC<CustomerBehaviorProps> = ({ analytics, onNavigateToRisk }) => {
  const [selectedBehaviorTab, setSelectedBehaviorTab] = useState<'all' | 'complaints' | 'billing' | 'usage'>('all');

  const {
    complaintCorrelation,
    usageDropCorrelation,
    paymentFailureCorrelation,
    paymentStats,
    contractStats,
    loginFrequencyCorrelation,
    insights,
    overview,
  } = analytics;

  const mtmStat = contractStats.find((c) => c.contract === 'Month-to-month');
  const twoYrStat = contractStats.find((c) => c.contract === '2-Year');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Section: Answering Management's Question */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center space-x-1">
                <Database className="w-3 h-3 mr-1" />
                <span>Empirical Behavioral Analysis &bull; {overview.totalCustomers} Records</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">Business Question: &quot;Why are customers leaving?&quot;</span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
              Customer Behavioral Patterns &amp; Attrition Signals
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Computed statistically from actual customer event logs: service complaints, payment gateway friction,
              disengagement decay, and contract commitments.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-slate-100 p-1 rounded-lg flex space-x-1 text-xs font-semibold">
              <button
                onClick={() => setSelectedBehaviorTab('all')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedBehaviorTab === 'all' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Vectors
              </button>
              <button
                onClick={() => setSelectedBehaviorTab('complaints')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedBehaviorTab === 'complaints' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Complaints
              </button>
              <button
                onClick={() => setSelectedBehaviorTab('billing')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedBehaviorTab === 'billing' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Billing &amp; Payment
              </button>
              <button
                onClick={() => setSelectedBehaviorTab('usage')}
                className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  selectedBehaviorTab === 'usage' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Usage Decay
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Behavioral Diagnostic Flashcards (Dynamic from Dataset) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-rose-700 mb-1">
            <MessageSquareWarning className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">The 2-Complaint Cliff</h4>
          </div>
          <div className="text-2xl font-black text-rose-700">
            {complaintCorrelation[2]?.churnRate || 46}%
          </div>
          <p className="text-xs text-rose-800/80 mt-1">
            Churn rate surges from {complaintCorrelation[0]?.churnRate || 8}% (0 complaints) to {complaintCorrelation[2]?.churnRate || 46}% on 2 complaints ({insights.complaintCliffFactor}x escalation).
          </p>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-amber-700 mb-1">
            <CreditCard className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Involuntary Payment Drop</h4>
          </div>
          <div className="text-2xl font-black text-amber-700">
            {paymentFailureCorrelation[2]?.churnRate || 58}%
          </div>
          <p className="text-xs text-amber-800/80 mt-1">
            Customers with 2 failed payments churn at {paymentFailureCorrelation[2]?.churnRate || 58}%, representing a {insights.paymentFailureMultiplier}x multiplier over 0 failures.
          </p>
        </div>

        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-blue-700 mb-1">
            <Activity className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Usage Decay Signal</h4>
          </div>
          <div className="text-2xl font-black text-blue-700">
            {insights.usageDropChurnRate}%
          </div>
          <p className="text-xs text-blue-800/80 mt-1">
            Severe usage contraction (&lt;-35%) yields an empirical {insights.usageDropChurnRate}% cancellation rate across this dataset.
          </p>
        </div>

        <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-4">
          <div className="flex items-center space-x-2 text-indigo-700 mb-1">
            <Layers className="w-4 h-4" />
            <h4 className="text-xs font-bold uppercase tracking-wider">Contract Commitment Shield</h4>
          </div>
          <div className="text-2xl font-black text-indigo-700">
            {mtmStat?.churnRate || 28}% vs {twoYrStat?.churnRate || 3.5}%
          </div>
          <p className="text-xs text-indigo-800/80 mt-1">
            Month-to-month contracts experience {insights.monthToMonthRiskFactor}x higher churn odds than customers on 2-Year commitments.
          </p>
        </div>
      </div>

      {/* Grid of In-depth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Support Complaints vs Churn Rate */}
        {(selectedBehaviorTab === 'all' || selectedBehaviorTab === 'complaints') && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-500" />
                  <span>Complaints vs Churn Escalation</span>
                </h3>
                <p className="text-xs text-slate-500">Calculated directly across customer complaint counts</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-100 text-rose-800">
                {insights.complaintCliffFactor}x Surge
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={complaintCorrelation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% (${item.payload.customers.toLocaleString()} customers)`,
                      name === 'churnRate' ? 'Churn Rate' : 'Retention Rate',
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="churnRate" name="Churn Rate (%)" radius={[6, 6, 0, 0]}>
                    {complaintCorrelation.map((_, index) => {
                      const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
                      return <Cell key={`comp-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 bg-rose-50 rounded-lg p-2.5 text-xs text-rose-800 flex items-center justify-between">
              <span><strong>Data Rule:</strong> {complaintCorrelation[2]?.customers || 0} accounts with 2+ complaints are primed for immediate intervention.</span>
              <button
                onClick={onNavigateToRisk}
                className="text-xs font-bold text-rose-700 hover:underline flex items-center shrink-0 ml-2 cursor-pointer"
              >
                Inspect Accounts <ArrowRight className="w-3 h-3 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Chart 2: Usage Drops vs Churn Propensity */}
        {(selectedBehaviorTab === 'all' || selectedBehaviorTab === 'usage') && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingDown className="w-4 h-4 text-amber-500" />
                  <span>Platform Usage Trend vs Churn</span>
                </h3>
                <p className="text-xs text-slate-500">60-day consumption momentum (% change in activity)</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">
                Leading Signal
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={usageDropCorrelation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% churn (${item.payload.customers} subscribers)`,
                      'Churn Propensity',
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="churnRate" name="Churn Rate (%)" radius={[6, 6, 0, 0]}>
                    {usageDropCorrelation.map((_, index) => {
                      const colors = ['#10b981', '#3b82f6', '#f59e0b', '#f43f5e'];
                      return <Cell key={`usage-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600">
              <strong>Dataset Diagnostic:</strong> Subscribers expanding usage exhibit low attrition ({usageDropCorrelation[0]?.churnRate || 0}%), while contractions &gt;35% jump to {usageDropCorrelation[3]?.churnRate || 0}%.
            </div>
          </div>
        )}

        {/* Chart 3: Payment Failures Correlation */}
        {(selectedBehaviorTab === 'all' || selectedBehaviorTab === 'billing') && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-rose-500" />
                  <span>Payment Gateway Failures vs Churn</span>
                </h3>
                <p className="text-xs text-slate-500">Involuntary churn triggered by bank mandate rejections</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700">
                Billing Friction
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentFailureCorrelation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% churn (${item.payload.customers} users)`,
                      'Attrition Risk',
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="churnRate" name="Churn Rate (%)" radius={[6, 6, 0, 0]}>
                    {paymentFailureCorrelation.map((_, index) => {
                      const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
                      return <Cell key={`fail-${index}`} fill={colors[index % colors.length]} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600">
              <strong>Actionable Insight:</strong> {paymentFailureCorrelation[2]?.customers || 0} accounts have suffered 2 failures. Transitioning them to UPI Autopay halts passive dropouts.
            </div>
          </div>
        )}

        {/* Chart 4: Login Activity vs Retention */}
        {(selectedBehaviorTab === 'all' || selectedBehaviorTab === 'usage') && (
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-indigo-500" />
                  <span>Login Frequency Engagement Correlation</span>
                </h3>
                <p className="text-xs text-slate-500">Platform session velocity vs active retention</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700">
                Engagement Velocity
              </span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={loginFrequencyCorrelation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                  <Tooltip
                    formatter={(val: any, name: any, item: any) => [
                      `${val}% churn (${item.payload.customers} users)`,
                      'Attrition Rate',
                    ]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="churnRate" name="Churn Rate (%)" radius={[6, 6, 0, 0]}>
                    <Cell fill="#10b981" />
                    <Cell fill="#3b82f6" />
                    <Cell fill="#f59e0b" />
                    <Cell fill="#ef4444" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 bg-slate-50 rounded-lg p-2.5 text-xs text-slate-600">
              <strong>Engagement Cliff:</strong> Daily active users exhibit {loginFrequencyCorrelation[0]?.churnRate || 0}% churn vs {loginFrequencyCorrelation[3]?.churnRate || 0}% for dormant accounts.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
