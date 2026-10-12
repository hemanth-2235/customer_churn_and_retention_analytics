import React, { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { ExecutiveDashboard } from './components/pages/ExecutiveDashboard';
import { CustomerBehavior } from './components/pages/CustomerBehavior';
import { CustomerRisk } from './components/pages/CustomerRisk';
import { RetentionStrategy } from './components/pages/RetentionStrategy';
import { MLModelEvaluation } from './components/pages/MLModelEvaluation';
import { WhatIfPredictor } from './components/pages/WhatIfPredictor';
import { DatasetExplorer } from './components/pages/DatasetExplorer';
import { ExecutiveBriefingModal } from './components/ExecutiveBriefingModal';
import {
  TELECOM_BENCHMARK,
  AVAILABLE_DATASETS,
  generateBenchmarkDataset,
} from './data/benchmarkDatasets';
import { computeDatasetAnalytics, filterCustomers } from './utils/analyticsEngine';
import { Customer, FilterState, RiskTier } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('page1');
  const [customers, setCustomers] = useState<Customer[]>(TELECOM_BENCHMARK);
  const [currentDatasetId, setCurrentDatasetId] = useState<string>('telecom_broadband');
  const [datasetName, setDatasetName] = useState<string>('Telecom & Subscription Churn Dataset');
  const [isBriefingOpen, setIsBriefingOpen] = useState<boolean>(false);

  // Global Slicer filter state
  const initialFilters: FilterState = {
    search: '',
    plan: 'All',
    region: 'All',
    contract: 'All',
    riskTier: 'All',
    tenureBand: 'All',
  };
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const handleResetFilters = () => {
    setFilters(initialFilters);
  };

  // Compute all analytics dynamically from the active dataset
  const analytics = useMemo(() => {
    return computeDatasetAnalytics(customers);
  }, [customers]);

  // Filtered customers based on global slicers
  const filteredCustomers = useMemo(() => {
    return filterCustomers(customers, filters);
  }, [customers, filters]);

  // Handle individual campaign trigger
  const handleTriggerCampaign = (customerId: string) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId ? { ...c, retentionCampaignStatus: 'Offer Sent' } : c
      )
    );
  };

  // Handle bulk campaign trigger
  const handleBulkTriggerCampaign = (tier: RiskTier) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.riskLevel === tier ? { ...c, retentionCampaignStatus: 'Offer Sent' } : c
      )
    );
  };

  // Benchmark dataset switching handler
  const handleSelectBenchmark = (datasetId: string) => {
    setCurrentDatasetId(datasetId);
    const data = generateBenchmarkDataset(datasetId);
    setCustomers(data);
    const found = AVAILABLE_DATASETS.find((d) => d.id === datasetId);
    setDatasetName(found ? found.name : 'Benchmark Dataset');
    setFilters(initialFilters);
  };

  // Custom CSV upload handler
  const handleCustomDatasetUpload = (newCustomers: Customer[], name: string) => {
    setCustomers(newCustomers);
    setDatasetName(name);
    setCurrentDatasetId('custom_upload');
    setFilters(initialFilters);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Power BI Executive Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenBriefing={() => setIsBriefingOpen(true)}
        totalCustomers={analytics.overview.totalCustomers}
        churnRate={analytics.overview.churnRate}
        datasetName={datasetName}
      />

      {/* Global Slicer Filter Bar (active across views, hidden on Dataset Explorer) */}
      {activeTab !== 'dataset' && (
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
          filteredCount={filteredCustomers.length}
          totalCount={customers.length}
        />
      )}

      {/* Main Content Area: Page Switching */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'page1' && (
          <ExecutiveDashboard
            analytics={analytics}
            onNavigateToRisk={() => setActiveTab('page3')}
            onNavigateToStrategy={() => setActiveTab('page4')}
            onNavigateToDataset={() => setActiveTab('dataset')}
          />
        )}

        {activeTab === 'page2' && (
          <CustomerBehavior
            analytics={analytics}
            onNavigateToRisk={() => setActiveTab('page3')}
          />
        )}

        {activeTab === 'page3' && (
          <CustomerRisk
            customers={filteredCustomers}
            onTriggerCampaign={handleTriggerCampaign}
            onBulkTriggerCampaign={handleBulkTriggerCampaign}
            onNavigateToStrategy={() => setActiveTab('page4')}
          />
        )}

        {activeTab === 'page4' && (
          <RetentionStrategy
            analytics={analytics}
            onOpenBriefing={() => setIsBriefingOpen(true)}
            onNavigateToRisk={() => setActiveTab('page3')}
          />
        )}

        {activeTab === 'ml-models' && (
          <MLModelEvaluation
            analytics={analytics}
            onNavigateToSimulator={() => setActiveTab('simulator')}
          />
        )}

        {activeTab === 'simulator' && (
          <WhatIfPredictor />
        )}

        {activeTab === 'dataset' && (
          <DatasetExplorer
            customers={customers}
            analytics={analytics}
            currentDatasetId={currentDatasetId}
            onSelectBenchmark={handleSelectBenchmark}
            onCustomDatasetUpload={handleCustomDatasetUpload}
            onNavigateToExecutive={() => setActiveTab('page1')}
          />
        )}
      </main>

      {/* Executive Briefing Modal */}
      <ExecutiveBriefingModal
        isOpen={isBriefingOpen}
        onClose={() => setIsBriefingOpen(false)}
        analytics={analytics}
      />
    </div>
  );
}
