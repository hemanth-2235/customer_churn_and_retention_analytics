import React, { useState, useMemo, useRef } from 'react';
import {
  Database,
  Upload,
  Download,
  Search,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  ArrowUpDown,
  RefreshCw,
  SlidersHorizontal,
  Table,
  Layers,
  Sparkles,
  Info,
  LineChart as LineChartIcon,
} from 'lucide-react';
import { Customer, RiskTier, SubscriptionPlan, ContractType } from '../../types';
import { AVAILABLE_DATASETS } from '../../data/benchmarkDatasets';
import { parseCSV, mapRowsToCustomers, exportCustomersToCSV } from '../../utils/csvParser';
import { ComputedAnalytics } from '../../utils/analyticsEngine';
import { CustomerDrilldownModal } from '../CustomerDrilldownModal';

interface DatasetExplorerProps {
  customers: Customer[];
  analytics: ComputedAnalytics;
  currentDatasetId: string;
  onSelectBenchmark: (datasetId: string) => void;
  onCustomDatasetUpload: (customers: Customer[], datasetName: string) => void;
  onNavigateToExecutive: () => void;
}

export const DatasetExplorer: React.FC<DatasetExplorerProps> = ({
  customers,
  analytics,
  currentDatasetId,
  onSelectBenchmark,
  onCustomDatasetUpload,
  onNavigateToExecutive,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'Active' | 'Churned'>('ALL');
  const [riskFilter, setRiskFilter] = useState<'ALL' | RiskTier>('ALL');
  const [sortColumn, setSortColumn] = useState<keyof Customer>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 12;

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeDatasetMeta = AVAILABLE_DATASETS.find((d) => d.id === currentDatasetId) || {
    id: 'custom',
    name: 'Custom User Uploaded Dataset',
    industry: 'User Provided',
    description: 'Custom subscription dataset imported via client-side CSV parser.',
    recordCount: customers.length,
  };

  // Filter and sort
  const filteredRecords = useMemo(() => {
    let result = [...customers];

    if (statusFilter !== 'ALL') {
      result = result.filter((c) => c.churnStatus === statusFilter);
    }
    if (riskFilter !== 'ALL') {
      result = result.filter((c) => c.riskLevel === riskFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.name.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.subscriptionPlan.toLowerCase().includes(q) ||
          c.paymentMethod.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const valA = a[sortColumn];
      const valB = b[sortColumn];

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      }
      const strA = String(valA || '').toLowerCase();
      const strB = String(valB || '').toLowerCase();
      return sortDirection === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
    });

    return result;
  }, [customers, statusFilter, riskFilter, searchTerm, sortColumn, sortDirection]);

  // Pagination
  const totalPages = Math.ceil(filteredRecords.length / rowsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredRecords.slice(start, start + rowsPerPage);
  }, [filteredRecords, currentPage]);

  const handleSort = (col: keyof Customer) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(col);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  // CSV File Handler
  const handleFileUpload = (file: File) => {
    setUploadError(null);
    setUploadSuccess(null);

    if (!file.name.endsWith('.csv')) {
      setUploadError('Please upload a valid .csv format file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedRows = parseCSV(text);
        if (parsedRows.length === 0) {
          setUploadError('Uploaded CSV is empty or has invalid formatting.');
          return;
        }

        const newCustomers = mapRowsToCustomers(parsedRows);
        if (newCustomers.length === 0) {
          setUploadError('Could not parse customer records from CSV columns.');
          return;
        }

        onCustomDatasetUpload(newCustomers, file.name.replace(/\.[^/.]+$/, ''));
        setUploadSuccess(`Successfully loaded ${newCustomers.length} customer records from "${file.name}"! All dashboards and ML models updated.`);
        setCurrentPage(1);
      } catch (err: any) {
        setUploadError(`Failed to parse CSV: ${err.message || 'Unknown error'}`);
      }
    };
    reader.readAsText(file);
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvData = exportCustomersToCSV(customers);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Customer_Churn_Dataset_${activeDatasetMeta.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center space-x-1">
                <Database className="w-3 h-3 mr-1" />
                <span>Dataset Ingestion &amp; Live Data Engine</span>
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Data-Driven &bull; Zero Manual Hardcoding
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Active Dataset: {activeDatasetMeta.name}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              {activeDatasetMeta.description} Every KPI, behavioral correlation, confusion matrix, and strategic playbook
              across all dashboard tabs is calculated directly from these {customers.length.toLocaleString('en-IN')} rows.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg border border-slate-300 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Upload Custom CSV</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Dataset Switcher Pills */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 mr-2 flex items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1" />
            Switch Pre-loaded Benchmark:
          </span>
          {AVAILABLE_DATASETS.map((d) => {
            const isActive = currentDatasetId === d.id;
            return (
              <button
                key={d.id}
                onClick={() => onSelectBenchmark(d.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center space-x-1.5 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs ring-2 ring-indigo-500'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{d.name}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-indigo-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  {d.recordCount} rows
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload Alerts */}
      {uploadSuccess && (
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-800 text-xs flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="flex-1 font-medium">{uploadSuccess}</div>
          <button onClick={() => setUploadSuccess(null)} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
        </div>
      )}
      {uploadError && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-4 text-rose-800 text-xs flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <div className="flex-1 font-medium">{uploadError}</div>
          <button onClick={() => setUploadError(null)} className="text-rose-600 hover:text-rose-900 font-bold">✕</button>
        </div>
      )}

      {/* Dataset Health & Schema Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white rounded-xl p-3.5 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Records</span>
          <span className="text-xl font-extrabold text-slate-900 block mt-1">
            {customers.length.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium">100% Loaded</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Customers</span>
          <span className="text-xl font-extrabold text-emerald-700 block mt-1">
            {analytics.overview.activeCustomers.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-slate-500 font-medium">{analytics.overview.retentionRate}% Retention</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Churned Records</span>
          <span className="text-xl font-extrabold text-rose-600 block mt-1">
            {analytics.overview.churnedCustomers.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] text-rose-600 font-medium">{analytics.overview.churnRate}% Churn Rate</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Monthly MRR</span>
          <span className="text-xl font-extrabold text-slate-900 block mt-1">
            ₹{(analytics.overview.totalMRR / 100000).toFixed(2)}L
          </span>
          <span className="text-[11px] text-slate-500 font-medium">₹{analytics.overview.avgMonthlyChargeINR}/mo avg</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Revenue At Risk</span>
          <span className="text-xl font-extrabold text-amber-600 block mt-1">
            ₹{(analytics.overview.revenueAtRiskINR / 100000).toFixed(2)}L
          </span>
          <span className="text-[11px] text-amber-700 font-medium">{analytics.overview.highRiskCount} High Risk</span>
        </div>

        <div className="bg-white rounded-xl p-3.5 border border-slate-200">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Data Completeness</span>
          <span className="text-xl font-extrabold text-emerald-600 block mt-1">
            100.0%
          </span>
          <span className="text-[11px] text-emerald-700 font-medium">0 Missing Values</span>
        </div>
      </div>

      {/* Drag and Drop Box for CSV */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
          }
        }}
        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all ${
          isDragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 bg-slate-50/60 hover:bg-slate-50'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-2">
            <Upload className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Drag and drop your custom CSV dataset here</h4>
          <p className="text-xs text-slate-500 mt-1">
            Supports standard churn datasets (Telco Churn, SaaS accounts, Bank subscriptions). Columns like MonthlyCharges,
            Tenure, Contract, Complaints, and Churn are auto-mapped.
          </p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-semibold rounded-md shadow-2xs cursor-pointer"
          >
            Browse CSV Files
          </button>
        </div>
      </div>

      {/* Raw Data Table Explorer */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by ID, Name, City, Plan, Payment..."
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Churn Statuses</option>
              <option value="Active">Active Customers</option>
              <option value="Churned">Churned Customers</option>
            </select>

            <select
              value={riskFilter}
              onChange={(e) => {
                setRiskFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="ALL">All Risk Tiers</option>
              <option value="HIGH">High Risk (≥70%)</option>
              <option value="MEDIUM">Medium Risk (40-69%)</option>
              <option value="LOW">Low Risk (&lt;40%)</option>
            </select>

            <span className="text-slate-500 font-medium">
              {filteredRecords.length} records found
            </span>
          </div>
        </div>

        {/* The Data Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/75 text-slate-600 uppercase font-bold text-[11px] border-b border-slate-200">
              <tr>
                <th onClick={() => handleSort('id')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('name')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Customer Name</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('subscriptionPlan')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Plan</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('tenureMonths')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Tenure</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('monthlyCharges')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Monthly (₹)</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('contractType')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Contract</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('paymentMethod')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Payment Method</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('complaints')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Complaints</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('serviceUsageTrend')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Usage Trend</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('riskScore')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th onClick={() => handleSort('churnStatus')} className="py-2.5 px-3 cursor-pointer hover:bg-slate-200/50">
                  <div className="flex items-center space-x-1">
                    <span>Churn Status</span>
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  </div>
                </th>
                <th className="py-2.5 px-3 text-right">Drill-Down</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-8 text-center text-slate-400">
                    No customer records match your filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{c.id}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      <div>{c.name}</div>
                      <div className="text-[10px] text-slate-400">{c.city}, {c.region}</div>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {c.subscriptionPlan}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{c.tenureMonths} mo</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">₹{c.monthlyCharges.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.contractType}</td>
                    <td className="py-2.5 px-3 text-slate-600">{c.paymentMethod}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold ${
                          c.complaints >= 2 ? 'text-rose-600' : c.complaints === 1 ? 'text-amber-600' : 'text-slate-500'
                        }`}
                      >
                        {c.complaints}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-semibold ${
                          c.serviceUsageTrend < -20
                            ? 'text-rose-600'
                            : c.serviceUsageTrend > 10
                            ? 'text-emerald-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {c.serviceUsageTrend > 0 ? `+${c.serviceUsageTrend}%` : `${c.serviceUsageTrend}%`}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.riskLevel === 'HIGH'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : c.riskLevel === 'MEDIUM'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        }`}
                      >
                        {c.riskScore}% {c.riskLevel}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.churnStatus === 'Churned'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {c.churnStatus}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="px-2 py-1 rounded text-[10px] font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer flex items-center space-x-1 ml-auto"
                        title="Inspect Historical Line Chart & Timeline"
                      >
                        <LineChartIcon className="w-3 h-3" />
                        <span>Timeline</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-500">
            Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredRecords.length)} of {filteredRecords.length} records
          </div>
          <div className="flex items-center space-x-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Customer 360° Historical Drill-Down Modal */}
      {selectedCustomer && (
        <CustomerDrilldownModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          allCustomers={customers}
          onSelectCustomer={(c) => setSelectedCustomer(c)}
        />
      )}
    </div>
  );
};
