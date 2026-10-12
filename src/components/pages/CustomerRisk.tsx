import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Search,
  ArrowRight,
  Sparkles,
  Send,
  UserCheck,
  Zap,
  Filter,
  X,
  PhoneCall,
  Percent,
  CreditCard,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { Customer, RiskTier } from '../../types';
import { CustomerDrilldownModal } from '../CustomerDrilldownModal';

interface CustomerRiskProps {
  customers: Customer[];
  onTriggerCampaign: (customerId: string) => void;
  onBulkTriggerCampaign: (tier: RiskTier) => void;
  onNavigateToStrategy: () => void;
}

export const CustomerRisk: React.FC<CustomerRiskProps> = ({
  customers,
  onTriggerCampaign,
  onBulkTriggerCampaign,
  onNavigateToStrategy,
}) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [riskFilter, setRiskFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<'riskScore' | 'monthlyCharges' | 'tenureMonths'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Compute live breakdown counts
  const highRiskCustomers = customers.filter((c) => c.riskLevel === 'HIGH');
  const mediumRiskCustomers = customers.filter((c) => c.riskLevel === 'MEDIUM');
  const lowRiskCustomers = customers.filter((c) => c.riskLevel === 'LOW');

  const highRiskRevenue = highRiskCustomers.reduce((acc, c) => acc + c.monthlyCharges, 0);
  const mediumRiskRevenue = mediumRiskCustomers.reduce((acc, c) => acc + c.monthlyCharges, 0);
  const lowRiskRevenue = lowRiskCustomers.reduce((acc, c) => acc + c.monthlyCharges, 0);

  // Filter and sort customer list
  const filteredCustomers = customers
    .filter((c) => {
      if (riskFilter !== 'ALL' && c.riskLevel !== riskFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.subscriptionPlan.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      const multiplier = sortOrder === 'desc' ? -1 : 1;
      return (a[sortField] - b[sortField]) * multiplier;
    });

  const handleAction = (c: Customer) => {
    onTriggerCampaign(c.id);
    setActionSuccessMessage(`Retention offer successfully dispatched to ${c.name} (${c.id})!`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  const handleBulkAction = (tier: RiskTier) => {
    onBulkTriggerCampaign(tier);
    setActionSuccessMessage(`Bulk Retention Campaign activated for all ${tier} Risk customers!`);
    setTimeout(() => setActionSuccessMessage(null), 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500/50 flex items-center space-x-2 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionSuccessMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                ⭐ The Wow Factor
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Predictive Risk Engine &bull; Individual Account Vulnerability
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Customer Risk Scoring &amp; Targeted Intervention
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Moving beyond reactive churn reporting. Every account is assigned a calibrated Risk Score (0-100%)
              to mobilize automated retention campaigns before the customer cancels.
            </p>
          </div>

          <button
            onClick={onNavigateToStrategy}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <span>Review Full Retention Strategy</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Business Workflow Visualization as mandated by prompt:
          HIGH RISK -> Retention Campaign -> Special Offer / Support -> Reduce Churn */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-5 shadow-sm border border-slate-800">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold tracking-wider text-indigo-300 uppercase">
            Closed-Loop Retention Architecture
          </span>
          <span className="text-[11px] text-slate-400">Automated Pipeline</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          {/* Step 1 */}
          <div className="bg-white/5 border border-rose-500/30 rounded-lg p-3 relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1 font-bold text-xs border border-rose-500/40">
              🔴
            </div>
            <span className="text-xs font-black text-rose-300">HIGH RISK</span>
            <span className="text-[11px] text-slate-300 mt-0.5">Risk Score &ge; 70%</span>
            <span className="text-[10px] text-slate-400 mt-1">Identified by ML Models</span>
          </div>

          {/* Step 2 */}
          <div className="bg-white/5 border border-indigo-500/30 rounded-lg p-3 relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1 font-bold text-xs border border-indigo-500/40">
              <Send className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-indigo-300">Retention Campaign</span>
            <span className="text-[11px] text-slate-300 mt-0.5">Automated Triggers</span>
            <span className="text-[10px] text-slate-400 mt-1">Omnichannel outreach</span>
          </div>

          {/* Step 3 */}
          <div className="bg-white/5 border border-amber-500/30 rounded-lg p-3 relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1 font-bold text-xs border border-amber-500/40">
              <Percent className="w-4 h-4" />
            </div>
            <span className="text-xs font-black text-amber-300">Special Offer / Support</span>
            <span className="text-[11px] text-slate-300 mt-0.5">Personalized Relief</span>
            <span className="text-[10px] text-slate-400 mt-1">25% off / Priority SLA</span>
          </div>

          {/* Step 4 */}
          <div className="bg-white/5 border border-emerald-500/30 rounded-lg p-3 relative flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1 font-bold text-xs border border-emerald-500/40">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs font-black text-emerald-300">Reduce Churn</span>
            <span className="text-[11px] text-slate-300 mt-0.5">Revenue Preserved</span>
            <span className="text-[10px] text-slate-400 mt-1">+81.58% Retention</span>
          </div>
        </div>
      </div>

      {/* 3 Risk Tiers Visual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* High Risk */}
        <div
          onClick={() => setRiskFilter(riskFilter === 'HIGH' ? 'ALL' : 'HIGH')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            riskFilter === 'HIGH'
              ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/30 shadow-sm'
              : 'bg-white border-rose-200 hover:border-rose-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="text-xs font-bold text-rose-700 uppercase tracking-wider">🔴 High Risk Tier (&gt; 70%)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800">
              {highRiskCustomers.length} accounts
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-700">
              ₹{(highRiskRevenue).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-rose-600 font-semibold">Monthly MRR at Risk</span>
          </div>

          <p className="text-xs text-slate-600 mt-2">
            Characteristics: Multiple complaints, &gt;30% usage drop, failed payments, month-to-month contracts.
          </p>

          <div className="mt-3 pt-3 border-t border-rose-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-rose-700">Action: Immediate Retention Offer</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBulkAction('HIGH');
              }}
              className="text-[11px] font-bold text-white bg-rose-600 hover:bg-rose-700 px-2.5 py-1 rounded transition-colors"
            >
              Bulk Trigger Outreach
            </button>
          </div>
        </div>

        {/* Medium Risk */}
        <div
          onClick={() => setRiskFilter(riskFilter === 'MEDIUM' ? 'ALL' : 'MEDIUM')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            riskFilter === 'MEDIUM'
              ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-500/30 shadow-sm'
              : 'bg-white border-amber-200 hover:border-amber-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider">🟡 Medium Risk Tier (40-70%)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
              {mediumRiskCustomers.length} accounts
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-700">
              ₹{(mediumRiskRevenue).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-amber-600 font-semibold">Monthly MRR Vulnerable</span>
          </div>

          <p className="text-xs text-slate-600 mt-2">
            Characteristics: Early disengagement, contract expiring in 30 days, single unresolved inquiry.
          </p>

          <div className="mt-3 pt-3 border-t border-amber-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-700">Action: Loyalty &amp; Re-engagement</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleBulkAction('MEDIUM');
              }}
              className="text-[11px] font-bold text-slate-800 bg-amber-200 hover:bg-amber-300 px-2.5 py-1 rounded transition-colors"
            >
              Nurture Cohort
            </button>
          </div>
        </div>

        {/* Low Risk */}
        <div
          onClick={() => setRiskFilter(riskFilter === 'LOW' ? 'ALL' : 'LOW')}
          className={`cursor-pointer rounded-xl p-4 border transition-all ${
            riskFilter === 'LOW'
              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 shadow-sm'
              : 'bg-white border-emerald-200 hover:border-emerald-300 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <h3 className="text-xs font-bold text-emerald-700 uppercase tracking-wider">🟢 Low Risk Tier (&lt; 40%)</h3>
            </div>
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
              {lowRiskCustomers.length} accounts
            </span>
          </div>

          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-emerald-700">
              ₹{(lowRiskRevenue).toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-emerald-600 font-semibold">Secure Core MRR</span>
          </div>

          <p className="text-xs text-slate-600 mt-2">
            Characteristics: Multi-year contracts, daily logins, positive consumption trends, zero complaints.
          </p>

          <div className="mt-3 pt-3 border-t border-emerald-100 flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-700">Action: Upsell &amp; Advocate</span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              High Satisfaction
            </span>
          </div>
        </div>
      </div>

      {/* Customer Risk Interactive Table with EXACT format requested by prompt:
          Customer ID | Risk Score | Risk Level | Monthly Revenue
          C1023       | 87%        | HIGH       | ₹2,499
          C1842       | 79%        | HIGH       | ₹1,999
          C2391       | 64%        | MEDIUM     | ₹1,499 */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>Customer Risk Register &amp; Retention Action Table</span>
              <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-full">
                {filteredCustomers.length} Showing
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Click any customer row to open the 360&deg; behavioral diagnostic drawer.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ID e.g. C1023..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value as any)}
              className="bg-white border border-slate-200 rounded-md px-2.5 py-1 text-xs text-slate-700 font-medium"
            >
              <option value="riskScore">Sort by: Risk Score</option>
              <option value="monthlyCharges">Sort by: Monthly Revenue</option>
              <option value="tenureMonths">Sort by: Tenure</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/70 text-slate-600 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Customer ID</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Risk Level</th>
                <th className="py-3 px-4">Monthly Revenue</th>
                <th className="py-3 px-4">Plan &amp; Contract</th>
                <th className="py-3 px-4">Key Risk Drivers</th>
                <th className="py-3 px-4 text-right">Retention Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => {
                const isSelected = selectedCustomer?.id === customer.id;
                return (
                  <tr
                    key={customer.id}
                    onClick={() => setSelectedCustomer(customer)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-indigo-50/70'
                        : customer.riskLevel === 'HIGH'
                        ? 'hover:bg-rose-50/40'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Customer ID */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-indigo-600">{customer.id}</span>
                        {customer.retentionCampaignStatus === 'Offer Sent' && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" title="Offer Sent" />
                        )}
                      </div>
                    </td>

                    {/* Name & City */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{customer.name}</div>
                      <div className="text-[11px] text-slate-500">{customer.city} &bull; {customer.age}y</div>
                    </td>

                    {/* Risk Score */}
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-sm font-black ${
                            customer.riskScore >= 70
                              ? 'text-rose-600'
                              : customer.riskScore >= 40
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {customer.riskScore}%
                        </span>
                        <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              customer.riskScore >= 70
                                ? 'bg-rose-500'
                                : customer.riskScore >= 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${customer.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Risk Level */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-extrabold ${
                          customer.riskLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : customer.riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}
                      >
                        {customer.riskLevel === 'HIGH' && '🔴 HIGH'}
                        {customer.riskLevel === 'MEDIUM' && '🟡 MEDIUM'}
                        {customer.riskLevel === 'LOW' && '🟢 LOW'}
                      </span>
                    </td>

                    {/* Monthly Revenue */}
                    <td className="py-3 px-4 font-bold text-slate-900">
                      ₹{customer.monthlyCharges.toLocaleString('en-IN')}
                    </td>

                    {/* Plan & Contract */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{customer.subscriptionPlan}</div>
                      <div className="text-[11px] text-slate-500">{customer.contractType}</div>
                    </td>

                    {/* Key Drivers */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {customer.keyDrivers.slice(0, 2).map((driver, i) => (
                          <span
                            key={i}
                            className="inline-block px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] truncate max-w-[160px]"
                          >
                            {driver}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCustomer(customer);
                          }}
                          className="px-2 py-1 rounded text-[11px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all shadow-2xs cursor-pointer flex items-center space-x-1"
                          title="Open Customer Historical Drill-Down & Line Chart"
                        >
                          <LineChartIcon className="w-3 h-3" />
                          <span className="hidden sm:inline">Drill-Down</span>
                        </button>
                        {customer.retentionCampaignStatus === 'Offer Sent' ? (
                          <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Offer Sent
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(customer);
                            }}
                            className={`px-2 py-1 rounded text-[11px] font-bold transition-all shadow-xs cursor-pointer ${
                              customer.riskLevel === 'HIGH'
                                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                                : customer.riskLevel === 'MEDIUM'
                                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                            }`}
                          >
                            Trigger
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer 360° Historical Drill-down & Timeline Modal */}
      {selectedCustomer && (
        <CustomerDrilldownModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          allCustomers={filteredCustomers}
          onSelectCustomer={(c) => setSelectedCustomer(c)}
          onTriggerCampaign={(customerId) => {
            const cust = customers.find((c) => c.id === customerId);
            if (cust) handleAction(cust);
          }}
        />
      )}
    </div>
  );
};
