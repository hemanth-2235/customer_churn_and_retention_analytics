import React, { useState } from 'react';
import {
  Sliders,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  ArrowRight,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { predictChurnRisk, PredictorInput } from '../../utils/predictiveEngine';

export const WhatIfPredictor: React.FC = () => {
  const defaultInput: PredictorInput = {
    tenureMonths: 4,
    monthlyCharges: 2199,
    contractType: 'Month-to-month',
    complaints: 2,
    paymentFailures: 1,
    usageTrendPercent: -35,
    loginFrequency: 'Monthly',
    paymentMethod: 'Debit Card',
  };

  const [input, setInput] = useState<PredictorInput>(defaultInput);

  // Compute prediction live
  const prediction = predictChurnRisk(input);

  const resetToPreset = (presetType: 'high' | 'medium' | 'low') => {
    if (presetType === 'high') {
      setInput({
        tenureMonths: 3,
        monthlyCharges: 2499,
        contractType: 'Month-to-month',
        complaints: 3,
        paymentFailures: 2,
        usageTrendPercent: -50,
        loginFrequency: 'Dormant',
        paymentMethod: 'Debit Card',
      });
    } else if (presetType === 'medium') {
      setInput({
        tenureMonths: 11,
        monthlyCharges: 1499,
        contractType: '1-Year',
        complaints: 1,
        paymentFailures: 0,
        usageTrendPercent: -15,
        loginFrequency: 'Weekly',
        paymentMethod: 'UPI',
      });
    } else {
      setInput({
        tenureMonths: 32,
        monthlyCharges: 1299,
        contractType: '2-Year',
        complaints: 0,
        paymentFailures: 0,
        usageTrendPercent: 12,
        loginFrequency: 'Daily',
        paymentMethod: 'Auto-Debit (NACH)',
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
                Live Simulation Engine
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Real-Time Multi-Model Churn Scoring
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Interactive What-If Customer Risk Predictor
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
              Simulate any customer profile or prospective scenario. Observe how adjusting tenure, complaints,
              pricing, and billing terms alters predicted churn risk across Logistic Regression, Random Forest, and Decision Tree.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500 mr-1">Load Presets:</span>
            <button
              onClick={() => resetToPreset('high')}
              className="px-2.5 py-1 rounded text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 cursor-pointer"
            >
              High Risk
            </button>
            <button
              onClick={() => resetToPreset('medium')}
              className="px-2.5 py-1 rounded text-xs font-bold bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 cursor-pointer"
            >
              Medium Risk
            </button>
            <button
              onClick={() => resetToPreset('low')}
              className="px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 cursor-pointer"
            >
              Low Risk
            </button>
            <button
              onClick={() => setInput(defaultInput)}
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Reset"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Sliders & Controls (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-5">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Sliders className="w-4 h-4 text-indigo-600" />
            <span>Customer Attributes &amp; Behavioral Inputs</span>
          </h3>

          {/* Grid of Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Tenure */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center font-semibold mb-1.5">
                <span className="text-slate-700">Tenure (Months)</span>
                <span className="text-indigo-600 font-bold">{input.tenureMonths} mo</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={input.tenureMonths}
                onChange={(e) => setInput({ ...input, tenureMonths: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Lifecycle subscription age</span>
            </div>

            {/* Monthly Charges */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center font-semibold mb-1.5">
                <span className="text-slate-700">Monthly Charges (₹)</span>
                <span className="text-indigo-600 font-bold">₹{input.monthlyCharges}</span>
              </div>
              <input
                type="range"
                min="499"
                max="4999"
                step="100"
                value={input.monthlyCharges}
                onChange={(e) => setInput({ ...input, monthlyCharges: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Plan fee: ₹499 to ₹4,999</span>
            </div>

            {/* Contract Type */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-700 block mb-1.5">Contract Term</span>
              <div className="grid grid-cols-3 gap-1">
                {(['Month-to-month', '1-Year', '2-Year'] as const).map((term) => (
                  <button
                    key={term}
                    onClick={() => setInput({ ...input, contractType: term })}
                    className={`py-1 px-1.5 rounded text-[11px] font-bold text-center transition-colors cursor-pointer ${
                      input.contractType === term
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {term === 'Month-to-month' ? 'Mo-to-Mo' : term}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Exit friction factor</span>
            </div>

            {/* Complaints Count */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center font-semibold mb-1.5">
                <span className="text-slate-700">Support Complaints</span>
                <span className={`font-bold ${input.complaints >= 2 ? 'text-rose-600' : 'text-slate-800'}`}>
                  {input.complaints} Tickets
                </span>
              </div>
              <div className="flex space-x-1">
                {[0, 1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setInput({ ...input, complaints: num })}
                    className={`flex-1 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      input.complaints === num
                        ? 'bg-rose-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num}{num === 4 ? '+' : ''}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">&ge; 2 triggers acute cliff</span>
            </div>

            {/* Payment Failures */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center font-semibold mb-1.5">
                <span className="text-slate-700">Payment Failures</span>
                <span className={`font-bold ${input.paymentFailures >= 1 ? 'text-amber-600' : 'text-slate-800'}`}>
                  {input.paymentFailures} Involuntary
                </span>
              </div>
              <div className="flex space-x-1">
                {[0, 1, 2, 3].map((num) => (
                  <button
                    key={num}
                    onClick={() => setInput({ ...input, paymentFailures: num })}
                    className={`flex-1 py-1 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                      input.paymentFailures === num
                        ? 'bg-amber-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {num}{num === 3 ? '+' : ''}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-400 block mt-1">Failed mandate transactions</span>
            </div>

            {/* Usage Trend % */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center font-semibold mb-1.5">
                <span className="text-slate-700">Usage Trend (60d)</span>
                <span className={`font-bold ${input.usageTrendPercent < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {input.usageTrendPercent > 0 ? `+${input.usageTrendPercent}` : input.usageTrendPercent}%
                </span>
              </div>
              <input
                type="range"
                min="-75"
                max="50"
                step="5"
                value={input.usageTrendPercent}
                onChange={(e) => setInput({ ...input, usageTrendPercent: Number(e.target.value) })}
                className="w-full accent-indigo-600 cursor-pointer"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Negative = Platform disengagement</span>
            </div>

            {/* Login Frequency */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 sm:col-span-2">
              <span className="font-semibold text-slate-700 block mb-1.5">Login Frequency</span>
              <div className="grid grid-cols-4 gap-1">
                {(['Daily', 'Weekly', 'Monthly', 'Dormant'] as const).map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setInput({ ...input, loginFrequency: freq })}
                    className={`py-1 px-1.5 rounded text-[11px] font-bold text-center transition-colors cursor-pointer ${
                      input.loginFrequency === freq
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {freq}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Prediction Output & Model Comparison (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Risk Score Card */}
          <div className={`rounded-2xl p-6 border shadow-sm transition-all ${
            prediction.riskTier === 'HIGH'
              ? 'bg-rose-50 border-rose-300'
              : prediction.riskTier === 'MEDIUM'
              ? 'bg-amber-50 border-amber-300'
              : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-black tracking-wider uppercase text-slate-600">
                Consensus Risk Prediction
              </span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-black ${
                  prediction.riskTier === 'HIGH'
                    ? 'bg-rose-600 text-white animate-pulse'
                    : prediction.riskTier === 'MEDIUM'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-600 text-white'
                }`}
              >
                {prediction.riskTier === 'HIGH' && '🔴 HIGH RISK'}
                {prediction.riskTier === 'MEDIUM' && '🟡 MEDIUM RISK'}
                {prediction.riskTier === 'LOW' && '🟢 LOW RISK'}
              </span>
            </div>

            <div className="mt-4 flex items-baseline space-x-3">
              <span
                className={`text-5xl font-black tracking-tight ${
                  prediction.riskTier === 'HIGH'
                    ? 'text-rose-700'
                    : prediction.riskTier === 'MEDIUM'
                    ? 'text-amber-700'
                    : 'text-emerald-700'
                }`}
              >
                {prediction.consensusScore}%
              </span>
              <span className="text-xs font-bold text-slate-600">
                Churn Probability
              </span>
            </div>

            {/* Model Breakdown Pill Bar */}
            <div className="mt-4 pt-3 border-t border-slate-200/60 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block font-semibold">Logistic Reg</span>
                <strong className="text-slate-900 font-black">{prediction.logisticProb}%</strong>
              </div>
              <div className="bg-white/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block font-semibold">Random Forest</span>
                <strong className="text-slate-900 font-black">{prediction.randomForestProb}%</strong>
              </div>
              <div className="bg-white/80 p-2 rounded-lg">
                <span className="text-[10px] text-slate-500 block font-semibold">Decision Tree</span>
                <strong className="text-slate-900 font-black">{prediction.decisionTreeProb}%</strong>
              </div>
            </div>

            {/* Root Cause Signals Detected */}
            <div className="mt-4">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Key Contributing Risk Drivers:
              </span>
              <div className="space-y-1">
                {prediction.keyRiskDrivers.map((driver, idx) => (
                  <div key={idx} className="flex items-center text-xs text-slate-800 bg-white/70 px-2 py-1.5 rounded">
                    <AlertTriangle className="w-3 h-3 text-rose-500 mr-1.5 shrink-0" />
                    <span>{driver}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Retention Action */}
            <div className="mt-4 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
              <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 uppercase mb-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Recommended Retention Action</span>
              </span>
              <p className="text-xs text-slate-800 font-medium">
                {prediction.recommendedAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
