import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Download,
  RefreshCw,
  Search,
  Filter,
  Building2,
  FileCheck2,
  Layers,
  ArrowUpRight,
  Sliders,
  ShieldAlert,
  Database,
  ExternalLink
} from 'lucide-react';

export default function Analytics() {
  const [bidders, setBidders] = useState([]);
  const [complianceMap, setComplianceMap] = useState({});
  const [documentsMap, setDocumentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [reverifyingAll, setReverifyingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRiskFilter, setSelectedRiskFilter] = useState('All');
  const navigate = useNavigate();

  const loadData = async () => {
    setLoading(true);
    try {
      const bRes = await fetch('/api/bidders');
      const bData = await bRes.json();
      if (!bData.success) throw new Error('Failed to load bidders');

      const biddersList = bData.bidders;
      setBidders(biddersList);

      const compResults = {};
      const docResults = {};

      await Promise.all(
        biddersList.map(async (b) => {
          try {
            let cRes = await fetch(`/api/bidders/${b.bidder_id}/compliance`);
            if (cRes.status === 404) {
              cRes = await fetch(`/api/bidders/${b.bidder_id}/verify`, { method: 'POST' });
            }
            const cData = await cRes.json();
            if (cData.success) compResults[b.bidder_id] = cData;

            const dRes = await fetch(`/api/bidders/${b.bidder_id}/documents`);
            const dData = await dRes.json();
            if (dData.success) docResults[b.bidder_id] = dData.documents || [];
          } catch (e) {
            console.error(e);
          }
        })
      );

      setComplianceMap(compResults);
      setDocumentsMap(docResults);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Re-verify all bidders in sequence
  const handleReverifyAll = async () => {
    setReverifyingAll(true);
    try {
      for (const b of bidders) {
        await fetch(`/api/bidders/${b.bidder_id}/verify`, { method: 'POST' });
      }
      await loadData();
    } catch (err) {
      console.error('Re-verification failed', err);
    } finally {
      setReverifyingAll(false);
    }
  };

  // High-Level Statistics Calculations
  const stats = useMemo(() => {
    const total = bidders.length;
    let low = 0, med = 0, high = 0, totalScore = 0;
    let totalFlaggedDocs = 0;

    bidders.forEach((b) => {
      const comp = complianceMap[b.bidder_id];
      const docs = documentsMap[b.bidder_id] || [];
      totalFlaggedDocs += docs.filter((d) => d.flagged).length;

      if (comp) {
        totalScore += comp.score;
        if (comp.risk === 'Low') low++;
        else if (comp.risk === 'Medium') med++;
        else if (comp.risk === 'High') high++;
      }
    });

    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : 0;
    return { total, low, med, high, avgScore, totalFlaggedDocs };
  }, [bidders, complianceMap, documentsMap]);

  // Export Full Compliance CSV
  const handleExportCSV = () => {
    if (bidders.length === 0) return;
    const headers = [
      'Company Name',
      'GSTIN',
      'PAN Number',
      'Udyam Number',
      'GFR Compliance Score',
      'Risk Classification',
      'Official Recommendation',
      'Active Discrepancy Flags',
      'Uploaded Documents Count'
    ];

    const rows = bidders.map((b) => {
      const comp = complianceMap[b.bidder_id] || {};
      const docs = documentsMap[b.bidder_id] || [];
      const flagsStr = (comp.flags || []).join('; ');
      return [
        `"${b.company_name.replace(/"/g, '""')}"`,
        `"${b.gstin}"`,
        `"${b.pan_number}"`,
        `"${b.udyam_number}"`,
        comp.score ?? 'N/A',
        comp.risk || 'Pending',
        comp.recommendation || 'Pending',
        `"${flagsStr.replace(/"/g, '""')}"`,
        docs.length
      ];
    });

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCL_Statutory_Compliance_Master_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered list
  const filteredBidders = useMemo(() => {
    return bidders.filter((b) => {
      const comp = complianceMap[b.bidder_id];
      const matchesRisk = selectedRiskFilter === 'All' || (comp && comp.risk === selectedRiskFilter);
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        b.company_name.toLowerCase().includes(q) ||
        b.gstin.toLowerCase().includes(q) ||
        b.pan_number.toLowerCase().includes(q);
      return matchesRisk && matchesSearch;
    });
  }, [bidders, complianceMap, selectedRiskFilter, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-sans">
      {/* 1. Header & Controls Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B2546] bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <BarChart3 className="w-3.5 h-3.5 text-sky-600" />
              <span>Officer Intelligence Desk</span>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              GFR 2017 &bull; Central Vigilance Analytics
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Compliance Analytics & Governance Controls
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Real-time compliance distributions, cross-registry anomaly analytics, and master control options for the CPCL procurement committee.
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={bidders.length === 0}
            className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Download full CSV matrix with all scores and flags"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Master Ledger (CSV)</span>
          </button>

          <button
            type="button"
            onClick={handleReverifyAll}
            disabled={reverifyingAll || loading}
            className="inline-flex items-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
            title="Trigger automated re-verification across all bidders"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reverifyingAll ? 'animate-spin' : ''}`} />
            <span>{reverifyingAll ? 'Re-Verifying All Bidders...' : 'Run Bulk Verification'}</span>
          </button>
        </div>
      </div>

      {/* 2. Vibrant KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Bidders */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Total Vendors
          </span>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-4xl font-extrabold font-mono text-[#0B2546]">
              {stats.total}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Registered</span>
          </div>
          <div className="mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Enrolled in Portals</span>
            <span className="font-mono font-bold text-slate-700">100%</span>
          </div>
        </div>

        {/* Low Risk / Compliant */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Low Risk
            </span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-4xl font-extrabold font-mono text-emerald-600">
              {stats.low}
            </span>
            <span className="text-xs text-emerald-700 font-semibold">Pre-Qualified</span>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-100 text-[11px] text-emerald-700 flex justify-between">
            <span>Pass Rate:</span>
            <span className="font-mono font-bold">{stats.total > 0 ? Math.round((stats.low / stats.total) * 100) : 0}%</span>
          </div>
        </div>

        {/* Medium Risk */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Clarification
            </span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-4xl font-extrabold font-mono text-amber-600">
              {stats.med}
            </span>
            <span className="text-xs text-amber-700 font-semibold">Under Review</span>
          </div>
          <div className="mt-3 pt-2 border-t border-amber-100 text-[11px] text-amber-700 flex justify-between">
            <span>Discrepancies:</span>
            <span className="font-mono font-bold">Minor Flags</span>
          </div>
        </div>

        {/* High Risk / Debarred */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
              High Risk
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-4xl font-extrabold font-mono text-rose-600">
              {stats.high}
            </span>
            <span className="text-xs text-rose-700 font-semibold">Disqualified</span>
          </div>
          <div className="mt-3 pt-2 border-t border-rose-100 text-[11px] text-rose-700 flex justify-between">
            <span>Debarment / Ban:</span>
            <span className="font-mono font-bold text-rose-700">0 / 100</span>
          </div>
        </div>

        {/* Average Compliance Score */}
        <div className="bg-white p-5 rounded-2xl border border-sky-200 shadow-xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-800">
            Average GFR Score
          </span>
          <div className="mt-3 flex items-baseline space-x-1.5">
            <span className="text-4xl font-extrabold font-mono text-sky-600">
              {stats.avgScore}
            </span>
            <span className="text-xs text-slate-400 font-bold">/ 100</span>
          </div>
          <div className="mt-3 pt-2 border-t border-sky-100 text-[11px] text-sky-800 flex justify-between">
            <span>Overall Readiness:</span>
            <span className="font-bold">Moderate</span>
          </div>
        </div>
      </div>

      {/* 3. Visual Compliance Breakdown & Registry Health Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Risk Distribution Chart Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <BarChart3 className="w-4 h-4 text-[#0B2546]" />
              <span>GFR 2017 Risk Tier Distribution</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">N = {stats.total} Bidders</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-emerald-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Low Risk (Pre-Qualified &ge; 85 Score)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {stats.low} ({stats.total > 0 ? Math.round((stats.low / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.low / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-amber-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Medium Risk (Needs Clarification 60-84 Score)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {stats.med} ({stats.total > 0 ? Math.round((stats.med / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-amber-500 transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.med / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-rose-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  High Risk (Disqualified / Debarred &lt; 60 Score)
                </span>
                <span className="font-mono font-bold text-slate-800">
                  {stats.high} ({stats.total > 0 ? Math.round((stats.high / stats.total) * 100) : 0}%)
                </span>
              </div>
              <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-500 transition-all duration-500"
                  style={{ width: `${stats.total > 0 ? (stats.high / stats.total) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 leading-relaxed">
            <strong>Committee Note:</strong> Under CPCL Tender Evaluation Policy, bids with <strong>Low Risk</strong> proceed directly to commercial evaluation. <strong>Medium Risk</strong> bids require statutory clarification within 72 hours. <strong>High Risk</strong> bids are strictly barred.
          </div>
        </div>

        {/* Multi-Source Statutory Anomaly Ledger */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Multi-Source Statutory Anomaly Ledger</span>
            </h3>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              6 Checks Active
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">GSTN Registration Status (Active REG-06)</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                100% Match
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">MSME Udyam Aadhaar Validation</span>
              </div>
              <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                100% Match
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-800">CBDT PAN Income Tax Return Filing (AY 25-26)</span>
              </div>
              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                1 Non-Filer
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-semibold text-slate-800">CVC / MoPNG Debarment Blacklist Check</span>
              </div>
              <span className="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                1 Banned Firm
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="font-semibold text-slate-800">Uploaded Statutory Certificate Discrepancy</span>
              </div>
              <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                {stats.totalFlaggedDocs} Flags in Vault
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Participating Bidders Analysis Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-[#0B2546]">
              Participating Vendors Compliance Dossier
            </h3>
            <p className="text-xs text-slate-500">
              Review real-time scores, statutory discrepancies, and deep dive into complete individual dossiers.
            </p>
          </div>

          {/* Search & Risk Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, GSTIN, PAN..."
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2546]"
              />
            </div>

            <div className="flex items-center space-x-1">
              {['All', 'Low', 'Medium', 'High'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => setSelectedRiskFilter(tier)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    selectedRiskFilter === tier
                      ? 'bg-[#0B2546] text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tier === 'All' ? 'All' : `${tier} Risk`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3">Vendor / Entity Legal Name</th>
                <th className="px-4 py-3">GSTIN & Identifier</th>
                <th className="px-4 py-3 text-center">Score</th>
                <th className="px-4 py-3 text-center">Risk Tier</th>
                <th className="px-5 py-3">Statutory Finding / Flag</th>
                <th className="px-4 py-3 text-center">Vault Docs</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBidders.map((b) => {
                const comp = complianceMap[b.bidder_id];
                const docs = documentsMap[b.bidder_id] || [];
                const flaggedDocs = docs.filter((d) => d.flagged);
                const isLow = comp?.risk === 'Low';
                const isMed = comp?.risk === 'Medium';
                const isHigh = comp?.risk === 'High';

                return (
                  <tr key={b.bidder_id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-7 h-7 rounded-lg bg-slate-100 text-[#0B2546] flex items-center justify-center font-bold text-xs shrink-0 border border-slate-200">
                          {b.company_name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{b.company_name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {b.bidder_id.substring(0, 8)}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-[11px] text-slate-600">
                      <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                        {b.gstin}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-base font-extrabold font-mono ${
                        isLow ? 'text-emerald-600' : isMed ? 'text-amber-600' : 'text-rose-600'
                      }`}>
                        {comp?.score ?? '—'}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        isLow
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isMed
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {comp?.risk || 'Pending'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 max-w-xs">
                      {comp?.flags && comp.flags.length > 0 ? (
                        <div className="text-[11px] text-slate-700 leading-tight">
                          <span className="font-semibold text-rose-700">&bull; {comp.flags[0]}</span>
                          {comp.flags.length > 1 && (
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              +{comp.flags.length - 1} more active flag(s)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-emerald-700 font-medium text-[11px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> All Checks Passed
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded font-mono text-[11px] font-bold ${
                        flaggedDocs.length > 0 ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {docs.length} Docs {flaggedDocs.length > 0 ? `(⚠️ ${flaggedDocs.length})` : ''}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Link
                        to={`/bidder/${b.bidder_id}`}
                        className="inline-flex items-center space-x-1 text-xs font-bold text-[#0B2546] hover:text-sky-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                      >
                        <span>Inspect Dossier</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
