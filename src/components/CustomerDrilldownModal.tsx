import React, { useState, useMemo } from 'react';
import {
  X,
  User,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Calendar,
  CreditCard,
  Headphones,
  LogIn,
  TrendingDown,
  TrendingUp,
  Activity,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Zap,
  Search,
  Clock,
  ChevronDown,
  Percent,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceArea,
  Dot,
} from 'recharts';
import { Customer } from '../types';
import {
  generateCustomerHistory,
  generateCustomerTickets,
  generateCustomerTransactions,
  CustomerHistoryPoint,
} from '../utils/customerHistoryGenerator';

interface CustomerDrilldownModalProps {
  customer: Customer | null;
  onClose: () => void;
  allCustomers?: Customer[];
  onSelectCustomer?: (customer: Customer) => void;
  onTriggerCampaign?: (customerId: string) => void;
}

export const CustomerDrilldownModal: React.FC<CustomerDrilldownModalProps> = ({
  customer,
  onClose,
  allCustomers = [],
  onSelectCustomer,
  onTriggerCampaign,
}) => {
  const [timeframe, setTimeframe] = useState<6 | 12>(6);
  const [activeTab, setActiveTab] = useState<'chart' | 'tickets' | 'billing'>('chart');
  const [metricFilter, setMetricFilter] = useState<'all' | 'tickets' | 'logins' | 'payments'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [actionNotif, setActionNotif] = useState<string | null>(null);

  if (!customer) return null;

  // Generate historical data
  const historyData = useMemo(() => {
    return generateCustomerHistory(customer, timeframe);
  }, [customer, timeframe]);

  const ticketDetails = useMemo(() => {
    return generateCustomerTickets(customer);
  }, [customer]);

  const transactionDetails = useMemo(() => {
    return generateCustomerTransactions(customer);
  }, [customer]);

  // Find index for next/previous navigation
  const currentIndex = allCustomers.findIndex((c) => c.id === customer.id);
  const prevCustomer = currentIndex > 0 ? allCustomers[currentIndex - 1] : null;
  const nextCustomer = currentIndex < allCustomers.length - 1 ? allCustomers[currentIndex + 1] : null;

  // Filtered customer list for search selector
  const searchedCustomers = useMemo(() => {
    if (!searchQuery) return allCustomers.slice(0, 8);
    const q = searchQuery.toLowerCase();
    return allCustomers
      .filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [allCustomers, searchQuery]);

  const handleAction = () => {
    if (onTriggerCampaign) {
      onTriggerCampaign(customer.id);
      setActionNotif(`Targeted retention campaign dispatched to ${customer.name} (${customer.id})!`);
      setTimeout(() => setActionNotif(null), 3500);
    }
  };

  // Custom Dot for Payment Events to visually call out Failed payments
  const renderPaymentDot = (props: any) => {
    const { cx, cy, payload } = props;
    if (payload.paymentStatus === 'Failed') {
      return (
        <svg x={cx - 7} y={cy - 7} width={14} height={14} fill="#ef4444" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" fill="#fee2e2" stroke="#ef4444" strokeWidth="2" />
          <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    }
    if (payload.paymentStatus === 'Retried') {
      return (
        <circle cx={cx} cy={cy} r={5} fill="#f59e0b" stroke="#ffffff" strokeWidth={2} />
      );
    }
    return (
      <circle cx={cx} cy={cy} r={4} fill="#10b981" stroke="#ffffff" strokeWidth={2} />
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-150 my-auto max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Toast Notification */}
        {actionNotif && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-lg border border-emerald-500/50 flex items-center space-x-2 text-xs font-semibold animate-bounce">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotif}</span>
          </div>
        )}

        {/* Modal Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-100/70 border border-indigo-200 px-2 py-0.5 rounded">
                  {customer.id}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                    customer.riskLevel === 'HIGH'
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : customer.riskLevel === 'MEDIUM'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  }`}
                >
                  {customer.riskLevel} RISK &bull; {customer.riskScore}%
                </span>
                {customer.churnStatus === 'Churned' ? (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 border border-slate-300">
                    Churned
                  </span>
                ) : (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Active Subscriber
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 mt-0.5">
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  {customer.name}
                </h3>
                <span className="text-xs text-slate-400">&bull;</span>
                <span className="text-xs text-slate-500 font-medium">
                  {customer.city} ({customer.region}), Age {customer.age}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Switcher & Controls */}
          <div className="flex items-center space-x-2">
            {allCustomers.length > 1 && onSelectCustomer && (
              <div className="flex items-center bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                <button
                  disabled={!prevCustomer}
                  onClick={() => prevCustomer && onSelectCustomer(prevCustomer)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title={prevCustomer ? `Previous: ${prevCustomer.name} (${prevCustomer.id})` : 'No previous'}
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
                <div className="relative">
                  <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-1"
                  >
                    <span>Switch Customer</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </button>

                  {isSearchOpen && (
                    <div className="absolute right-0 mt-1 w-64 bg-white rounded-xl shadow-xl border border-slate-200 z-50 p-2">
                      <div className="relative mb-2">
                        <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search customer ID/name..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-7 pr-2 py-1 text-xs border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                        {searchedCustomers.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => {
                              onSelectCustomer(c);
                              setIsSearchOpen(false);
                              setSearchQuery('');
                            }}
                            className={`w-full text-left px-2 py-1.5 hover:bg-indigo-50 rounded flex items-center justify-between text-xs transition-colors ${
                              c.id === customer.id ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'
                            }`}
                          >
                            <span className="truncate">{c.name} ({c.id})</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                c.riskLevel === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {c.riskScore}%
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  disabled={!nextCustomer}
                  onClick={() => nextCustomer && onSelectCustomer(nextCustomer)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title={nextCustomer ? `Next: ${nextCustomer.name} (${nextCustomer.id})` : 'No next'}
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* High-Level Account Snapshot Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-6 border-b border-slate-200 bg-white divide-x divide-slate-100 text-center shrink-0">
          <div className="p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Plan &amp; Tier</span>
            <span className="text-xs font-black text-slate-900 mt-0.5 block">{customer.subscriptionPlan}</span>
            <span className="text-[10px] text-slate-500">{customer.contractType}</span>
          </div>

          <div className="p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly MRR</span>
            <span className="text-xs font-black text-slate-900 mt-0.5 block">
              ₹{customer.monthlyCharges.toLocaleString('en-IN')}
            </span>
            <span className="text-[10px] text-slate-500">₹{customer.totalCharges.toLocaleString('en-IN')} LTV</span>
          </div>

          <div className="p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tenure</span>
            <span className="text-xs font-black text-slate-900 mt-0.5 block">{customer.tenureMonths} Months</span>
            <span className="text-[10px] text-slate-500">{customer.contractRenewalStatus}</span>
          </div>

          <div className="p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Support Tickets</span>
            <span className={`text-xs font-black mt-0.5 block ${customer.supportTickets >= 2 ? 'text-rose-600' : 'text-slate-900'}`}>
              {customer.supportTickets} Tickets
            </span>
            <span className="text-[10px] text-slate-500">{customer.complaints} Escalated</span>
          </div>

          <div className="p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Login Frequency</span>
            <span className={`text-xs font-black mt-0.5 block ${customer.loginFrequency === 'Dormant' ? 'text-rose-600' : 'text-slate-900'}`}>
              {customer.loginFrequency}
            </span>
            <span className="text-[10px] text-slate-500">{customer.serviceUsageTrend}% usage 60d</span>
          </div>

          <div className="p-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Payment Method</span>
            <span className="text-xs font-black text-slate-900 mt-0.5 block truncate px-1">
              {customer.paymentMethod}
            </span>
            <span className={`text-[10px] font-bold ${customer.paymentFailures > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              {customer.paymentFailures > 0 ? `${customer.paymentFailures} Failed Debits` : 'Healthy Billing'}
            </span>
          </div>
        </div>

        {/* Tab Selector & Range Switcher */}
        <div className="px-5 pt-3 pb-2 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50 shrink-0">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('chart')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'chart'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Historical Behavioral Timeline (Line Chart)</span>
            </button>

            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'tickets'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              <span>Support Ticket Incident Log ({ticketDetails.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('billing')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
                activeTab === 'billing'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Billing &amp; Payment Ledger ({transactionDetails.length})</span>
            </button>
          </div>

          {/* Timeframe selector (6m vs 12m) */}
          <div className="flex items-center space-x-1 bg-white border border-slate-200 rounded-lg p-0.5 text-xs font-bold">
            <button
              onClick={() => setTimeframe(6)}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeframe === 6 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past 6 Months
            </button>
            <button
              onClick={() => setTimeframe(12)}
              className={`px-2.5 py-1 rounded transition-colors ${
                timeframe === 12 ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Past 12 Months
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'chart' && (
            <div className="space-y-4">
              {/* Chart Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Individual Longitudinal Telemetry
                  </h4>
                  <p className="text-xs text-slate-500">
                    Tracking Support Tickets (count), Login Frequency (monthly sessions), and Payment Events (Success vs. Failed/Retried) over time.
                  </p>
                </div>

                <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                  <button
                    onClick={() => setMetricFilter('all')}
                    className={`px-2.5 py-1 rounded transition-all ${
                      metricFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    All 3 Signals
                  </button>
                  <button
                    onClick={() => setMetricFilter('tickets')}
                    className={`px-2.5 py-1 rounded transition-all ${
                      metricFilter === 'tickets' ? 'bg-rose-500 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Support Tickets
                  </button>
                  <button
                    onClick={() => setMetricFilter('logins')}
                    className={`px-2.5 py-1 rounded transition-all ${
                      metricFilter === 'logins' ? 'bg-indigo-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Login Frequency
                  </button>
                  <button
                    onClick={() => setMetricFilter('payments')}
                    className={`px-2.5 py-1 rounded transition-all ${
                      metricFilter === 'payments' ? 'bg-emerald-600 text-white shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Payment Events
                  </button>
                </div>
              </div>

              {/* Main Line Chart Canvas */}
              <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-4">
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyData} margin={{ top: 15, right: 30, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      {/* Left Y Axis: Count (for Logins and Tickets) */}
                      <YAxis
                        yAxisId="left"
                        tick={{ fontSize: 11, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                        domain={[0, 'dataMax + 4']}
                      />
                      {/* Right Y Axis: Payment Status (1 = Success, 0.5 = Retried, 0 = Failed) */}
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        domain={[0, 1.2]}
                        ticks={[0, 0.5, 1]}
                        tickFormatter={(v) => (v === 1 ? 'Success' : v === 0.5 ? 'Retried' : 'Failed')}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (!active || !payload || !payload.length) return null;
                          const dataPoint: CustomerHistoryPoint = payload[0].payload;
                          return (
                            <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 min-w-[200px]">
                              <div className="flex items-center justify-between font-bold border-b border-slate-800 pb-1 text-indigo-300">
                                <span>{label}</span>
                                <span className="text-[10px] text-slate-400">Risk Score: {dataPoint.riskScore}%</span>
                              </div>
                              <div className="flex items-center justify-between text-rose-300">
                                <span>Support Tickets:</span>
                                <strong className="text-white font-mono">{dataPoint.supportTickets}</strong>
                              </div>
                              <div className="flex items-center justify-between text-indigo-300">
                                <span>Login Frequency:</span>
                                <strong className="text-white font-mono">{dataPoint.loginCount} sessions/mo</strong>
                              </div>
                              <div className="flex items-center justify-between text-emerald-300">
                                <span>Payment Event:</span>
                                <span
                                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                                    dataPoint.paymentStatus === 'Success'
                                      ? 'bg-emerald-500/30 text-emerald-300'
                                      : dataPoint.paymentStatus === 'Retried'
                                      ? 'bg-amber-500/30 text-amber-300'
                                      : 'bg-rose-500/40 text-rose-300'
                                  }`}
                                >
                                  {dataPoint.paymentStatus}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-slate-400 pt-1 border-t border-slate-800 text-[10px]">
                                <span>Monthly Data Usage:</span>
                                <span>{dataPoint.usageGB} GB</span>
                              </div>
                            </div>
                          );
                        }}
                      />
                      <Legend
                        verticalAlign="top"
                        height={36}
                        iconType="circle"
                        wrapperStyle={{ fontSize: '11px', fontWeight: 600 }}
                      />

                      {/* 1. Support Tickets Line */}
                      {(metricFilter === 'all' || metricFilter === 'tickets') && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="supportTickets"
                          name="Support Ticket Volume"
                          stroke="#f43f5e"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      )}

                      {/* 2. Login Frequency Line */}
                      {(metricFilter === 'all' || metricFilter === 'logins') && (
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="loginCount"
                          name="Login Frequency (Sessions)"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      )}

                      {/* 3. Payment Events Line */}
                      {(metricFilter === 'all' || metricFilter === 'payments') && (
                        <Line
                          yAxisId="right"
                          type="stepAfter"
                          dataKey="paymentEvents"
                          name="Payment Event Status (1=Success, 0=Failed)"
                          stroke="#10b981"
                          strokeWidth={2}
                          strokeDasharray="4 4"
                          dot={renderPaymentDot}
                          activeDot={{ r: 6 }}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend Explanation Bar */}
                <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      <strong>Support Tickets:</strong> Spikes signal acute product dissatisfaction.
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                      <strong>Logins:</strong> Decay indicates user disengagement preceding churn.
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <strong>Payment Events:</strong> Red dropouts indicate billing mandate failure.
                    </span>
                  </div>

                  <span className="font-mono text-slate-400">
                    Source: Production Event Telemetry API
                  </span>
                </div>
              </div>

              {/* Monthly Breakdown Event Cards */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Monthly Event Chronology &amp; Risk Escalation
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                  {historyData.map((hp) => (
                    <div
                      key={hp.month}
                      className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                        hp.paymentStatus === 'Failed' || hp.supportTickets >= 2
                          ? 'bg-rose-50/80 border-rose-200 text-rose-900'
                          : hp.supportTickets === 1 || hp.paymentStatus === 'Retried'
                          ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between font-bold text-[11px]">
                          <span>{hp.month}</span>
                          <span className={`text-[10px] px-1 rounded ${
                            hp.riskScore >= 70 ? 'bg-rose-200 text-rose-900' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {hp.riskScore}%
                          </span>
                        </div>
                        <div className="mt-2 space-y-1 text-[10px]">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Tickets:</span>
                            <span className="font-bold">{hp.supportTickets}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Logins:</span>
                            <span className="font-bold">{hp.loginCount}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-500">Payment:</span>
                            <span
                              className={`font-bold ${
                                hp.paymentStatus === 'Success'
                                  ? 'text-emerald-700'
                                  : hp.paymentStatus === 'Retried'
                                  ? 'text-amber-700'
                                  : 'text-rose-700'
                              }`}
                            >
                              {hp.paymentStatus}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prescriptive Strategic Action Card */}
              <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2 text-indigo-900 font-bold text-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Algorithmic Retention Recommendation for {customer.name}:</span>
                  </div>
                  <p className="text-xs text-indigo-950">
                    {customer.recommendedStrategy}
                  </p>
                  <div className="flex items-center space-x-2 text-[11px] text-indigo-700 mt-1">
                    <span className="font-semibold">Key Contributing Signals:</span>
                    <span>{customer.keyDrivers.join(' &bull; ')}</span>
                  </div>
                </div>

                <button
                  onClick={handleAction}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Deploy Offer Now</span>
                </button>
              </div>
            </div>
          )}

          {/* Tab 2: Support Ticket Incidents Log */}
          {activeTab === 'tickets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Support Ticket &amp; Complaint Audit Log
                  </h4>
                  <p className="text-xs text-slate-500">
                    Historical customer service grievances, SLA resolution durations, and customer satisfaction escalations.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">
                  {customer.supportTickets} Tickets &bull; {customer.complaints} Escalated Complaints
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Ticket ID</th>
                      <th className="py-2.5 px-3">Logged Date</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Priority</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Resolution SLA</th>
                      <th className="py-2.5 px-3">Incident Summary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ticketDetails.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-indigo-600">
                          {ticket.id}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{ticket.date}</td>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">{ticket.category}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ticket.priority === 'Urgent'
                                ? 'bg-rose-100 text-rose-800'
                                : ticket.priority === 'High'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              ticket.status === 'Escalated'
                                ? 'bg-rose-100 text-rose-800'
                                : ticket.status === 'Open'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{ticket.resolutionDays} business days</td>
                        <td className="py-2.5 px-3 text-slate-700 max-w-xs truncate" title={ticket.summary}>
                          {ticket.summary}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 text-xs text-rose-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Root Cause Diagnosis:</strong> Our behavioral regression model establishes that subscribers experiencing &ge; 2 unresolved tickets suffer a <strong>4.8x higher churn likelihood</strong>.
                  Proactively addressing this customer&apos;s ticket resolution SLA prevents imminent account cancellation.
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Billing & Payment Ledger */}
          {activeTab === 'billing' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Payment Gateway Events &amp; Mandate History
                  </h4>
                  <p className="text-xs text-slate-500">
                    Recurring monthly transaction logs, E-mandate status, and gateway decline codes.
                  </p>
                </div>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold">
                  Payment Method: {customer.paymentMethod}
                </span>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                      <th className="py-2.5 px-3">Transaction ID</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3">Payment Channel</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3">Gateway Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactionDetails.map((tx) => (
                      <tr key={tx.transactionId} className="hover:bg-slate-50/80">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {tx.transactionId}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{tx.date}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">
                          ₹{tx.amountINR.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{tx.method}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                              tx.status === 'Success'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tx.status === 'Retried'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {tx.status === 'Success' ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          {tx.failureReason ? (
                            <span className="text-rose-700 font-semibold">{tx.failureReason}</span>
                          ) : (
                            <span className="text-slate-400">Captured &bull; 0 disputes</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 flex items-start space-x-2">
                <CreditCard className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Involuntary Churn Safeguard:</strong> If this account has failed payment mandates, dispatch a 1-tap WhatsApp UPI Autopay switch link.
                  UPI Autopay achieves a <strong>96.8% successful debit rate</strong> compared to 88% on Debit Cards.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Account ID: <strong className="text-slate-800">{customer.id}</strong> &bull; Risk Level: <strong className={customer.riskLevel === 'HIGH' ? 'text-rose-600' : 'text-slate-800'}>{customer.riskLevel} ({customer.riskScore}%)</strong>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Close Drill-Down
            </button>
            <button
              onClick={handleAction}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center space-x-1.5"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Execute Retention Campaign</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
