import React from 'react';
import { Filter, Search, RotateCcw } from 'lucide-react';
import { FilterState } from '../types';

interface FilterBarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  setFilters,
  onReset,
  filteredCount,
  totalCount,
}) => {
  const isFiltered =
    filters.plan !== 'All' ||
    filters.region !== 'All' ||
    filters.contract !== 'All' ||
    filters.riskTier !== 'All' ||
    filters.search !== '';

  return (
    <div className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Side: Slicers */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span>Slicers:</span>
          </div>

          {/* Plan Slicer */}
          <select
            value={filters.plan}
            onChange={(e) => setFilters((prev) => ({ ...prev, plan: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium hover:bg-slate-100 transition-colors focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Plans</option>
            <option value="Basic">Basic (₹699)</option>
            <option value="Standard">Standard (₹1,299)</option>
            <option value="Premium">Premium (₹2,199)</option>
            <option value="Enterprise">Enterprise (₹4,499)</option>
          </select>

          {/* Region Slicer */}
          <select
            value={filters.region}
            onChange={(e) => setFilters((prev) => ({ ...prev, region: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium hover:bg-slate-100 transition-colors focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Regions</option>
            <option value="North">North India</option>
            <option value="South">South India</option>
            <option value="West">West India</option>
            <option value="East">East India</option>
            <option value="Central">Central India</option>
          </select>

          {/* Contract Slicer */}
          <select
            value={filters.contract}
            onChange={(e) => setFilters((prev) => ({ ...prev, contract: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium hover:bg-slate-100 transition-colors focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Contracts</option>
            <option value="Month-to-month">Month-to-month</option>
            <option value="1-Year">1-Year Term</option>
            <option value="2-Year">2-Year Term</option>
          </select>

          {/* Risk Level Slicer */}
          <select
            value={filters.riskTier}
            onChange={(e) => setFilters((prev) => ({ ...prev, riskTier: e.target.value }))}
            className="bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1 text-slate-700 font-medium hover:bg-slate-100 transition-colors focus:ring-1 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="All">All Risk Tiers</option>
            <option value="HIGH">🔴 High Risk (&gt;70%)</option>
            <option value="MEDIUM">🟡 Medium Risk (40-70%)</option>
            <option value="LOW">🟢 Low Risk (&lt;40%)</option>
          </select>

          {isFiltered && (
            <button
              onClick={onReset}
              className="inline-flex items-center text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 bg-rose-50 hover:bg-rose-100 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset Slicers
            </button>
          )}
        </div>

        {/* Right Side: Customer Search and Active Filter Indicator */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Customer ID, Name, City..."
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-md pl-8 pr-3 py-1 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:ring-1 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          <span className="text-[11px] text-slate-500 whitespace-nowrap bg-slate-100 px-2.5 py-1 rounded-md font-medium">
            Showing <strong className="text-slate-800">{filteredCount}</strong> of {totalCount} records
          </span>
        </div>
      </div>
    </div>
  );
};
