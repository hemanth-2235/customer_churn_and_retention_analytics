import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ShieldAlert,
  Target,
  Cpu,
  Sliders,
  FileText,
  Sparkles,
  Database,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenBriefing: () => void;
  totalCustomers: number;
  churnRate: number;
  datasetName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenBriefing,
  totalCustomers,
  churnRate,
  datasetName = 'Telecom Subscription Benchmark',
}) => {
  const navTabs = [
    { id: 'page1', label: 'Page 1 — Executive Dashboard', short: '1. Executive', icon: LayoutDashboard },
    { id: 'page2', label: 'Page 2 — Customer Behavior', short: '2. Behavior', icon: Activity },
    { id: 'page3', label: 'Page 3 — Customer Risk', short: '3. Customer Risk', icon: ShieldAlert, badge: 'Wow Factor' },
    { id: 'page4', label: 'Page 4 — Retention Strategy', short: '4. Strategy', icon: Target },
    { id: 'ml-models', label: 'Machine Learning Models', short: 'ML Evaluation', icon: Cpu },
    { id: 'simulator', label: 'What-If Churn Simulator', short: 'Risk Simulator', icon: Sliders },
    { id: 'dataset', label: 'Dataset & Ingestion', short: 'Data Hub', icon: Database, badge: 'CSV Upload' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Top Bar with System Branding and Executive KPIs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                  Customer Churn &amp; Retention Analytics System
                </h1>
                <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Power BI Suite
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate max-w-xl">
                Active Source: <strong className="text-indigo-600">{datasetName}</strong> &bull; {totalCustomers.toLocaleString('en-IN')} rows analyzed dynamically
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Cohort Base</span>
                <span className="font-bold text-slate-800">{totalCustomers.toLocaleString('en-IN')} Users</span>
              </div>
              <div className="h-6 w-px bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Churn Rate</span>
                <span className="font-bold text-rose-600">{churnRate.toFixed(2)}%</span>
              </div>
            </div>

            <button
              onClick={onOpenBriefing}
              className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-300" />
              <span>Executive Briefing</span>
              <Sparkles className="w-3 h-3 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Page Tabs (Power BI Style tabs) */}
      <div className="bg-slate-50/80 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-white text-indigo-700 shadow-xs border border-slate-200 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.short}</span>
                  {tab.badge && (
                    <span className={`ml-1.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full border ${
                      tab.id === 'dataset' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
