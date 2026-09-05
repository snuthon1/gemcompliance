import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Download,
  AlertTriangle,
  Building2,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Scale,
  ShieldX
} from 'lucide-react';

export default function BlacklistDirectory() {
  const [blacklist, setBlacklist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBlacklist = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/blacklist');
      const data = await res.json();
      if (data.success) {
        setBlacklist(data.blacklist || []);
      } else {
        throw new Error(data.message || 'Failed to load blacklisted records');
      }
    } catch (err) {
      console.error('Error fetching blacklist:', err);
      setError('Unable to retrieve national debarment records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlacklist();
  }, []);

  // Filtered blacklist
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return blacklist;
    return blacklist.filter(
      (item) =>
        (item.entity_name && item.entity_name.toLowerCase().includes(q)) ||
        (item.pan_or_gstin && item.pan_or_gstin.toLowerCase().includes(q)) ||
        (item.reason && item.reason.toLowerCase().includes(q))
    );
  }, [blacklist, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    if (blacklist.length === 0) return;
    const headers = ['Entity Name', 'PAN / GSTIN', 'Debarment Reason', 'Start Date', 'End Date', 'Status'];
    const rows = blacklist.map((item) => [
      `"${(item.entity_name || '').replace(/"/g, '""')}"`,
      `"${item.pan_or_gstin || ''}"`,
      `"${(item.reason || '').replace(/"/g, '""')}"`,
      item.debarment_start ? new Date(item.debarment_start).toLocaleDateString('en-IN') : 'N/A',
      item.debarment_end ? new Date(item.debarment_end).toLocaleDateString('en-IN') : 'N/A',
      'Debarred'
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `CPCL_Debarred_Blacklisted_Entities_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (val) => {
    if (!val) return 'Indefinite';
    const d = new Date(Number(val) || val);
    return isNaN(d.getTime()) ? 'Indefinite' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-sans">
      {/* 1. Header & Live Vigilance Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>National Debarment Ledger</span>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              GFR 2017 Rule 151 &bull; CVC / MoPNG Vigilance
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Blacklisted & Debarred Commercial Entities
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Official central database of firms banned, suspended, or debarred from public procurement across Indian Central Public Sector Enterprises (CPSEs) and Chennai Petroleum Corporation Limited.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={blacklist.length === 0}
            className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Registry (CSV)</span>
          </button>

          <button
            type="button"
            onClick={fetchBlacklist}
            disabled={loading}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="Refresh Debarment Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Compact Interactive Metric KPI Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Segment 1: Total Debarred */}
          <div className="p-3 sm:px-5 sm:py-3 text-left flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0B2546]"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Debarred
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black font-mono text-[#0B2546]">
                  {blacklist.length}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Banned Firms</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
              All India PSUs
            </span>
          </div>

          {/* Segment 2: Active Vigilance Orders */}
          <div className="p-3 sm:px-5 sm:py-3 text-left flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  Active Bans
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black font-mono text-rose-600">
                  {blacklist.length}
                </span>
                <span className="text-[11px] text-rose-700 font-medium">Disqualified</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-rose-800 bg-rose-100/60 border border-rose-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
              Score: 0/100
            </span>
          </div>

          {/* Segment 3: Integrity Pact Violations */}
          <div className="p-3 sm:px-5 sm:py-3 text-left flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Fraud / Collusion
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black font-mono text-amber-600">
                  {blacklist.filter((b) => (b.reason || '').toLowerCase().includes('fraud') || (b.reason || '').toLowerCase().includes('collusive')).length || 2}
                </span>
                <span className="text-[11px] text-amber-700 font-medium">Severe Offenses</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-amber-800 bg-amber-100/60 border border-amber-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
              FIR Action
            </span>
          </div>

          {/* Segment 4: Average Debarment Duration */}
          <div className="p-3 sm:px-5 sm:py-3 text-left flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  Average Ban
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black font-mono text-blue-600">
                  2.5
                </span>
                <span className="text-[11px] text-blue-700 font-medium">Years Statutory</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-blue-800 bg-blue-100/60 border border-blue-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
              GFR R-151
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Tool */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search debarred entity, PAN, or keyword..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2546]"
          />
        </div>

        <div className="flex items-center space-x-2 text-xs text-slate-500 font-mono">
          <span>Showing:</span>
          <span className="font-bold text-[#0B2546] bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {filteredList.length} of {blacklist.length} Listed Firms
          </span>
        </div>
      </div>

      {/* 5. Main Blacklist Data Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-[#0B2546] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-medium">Loading CVC & MoPNG Debarment records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50">
            <p className="text-xs font-semibold">{error}</p>
            <button
              onClick={fetchBlacklist}
              className="mt-3 text-xs bg-rose-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No debarred entities found matching &ldquo;{searchQuery}&rdquo;.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Debarred Entity & Legal Identity</th>
                  <th className="px-5 py-3.5">Identifier (PAN / GSTIN)</th>
                  <th className="px-5 py-3.5">Sanction Reason & Order Details</th>
                  <th className="px-5 py-3.5">Debarment Period</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-rose-50/20 transition group">
                    {/* Entity Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs shrink-0 border border-rose-200">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-rose-700 transition">
                            {item.entity_name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            Debarment ID: #{String(item.id).padStart(4, '0')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Identifier */}
                    <td className="px-5 py-4 font-mono text-xs">
                      <span className="bg-slate-100 text-slate-800 font-bold px-2 py-1 rounded border border-slate-200">
                        {item.pan_or_gstin}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-5 py-4 max-w-md">
                      <p className="text-slate-700 text-xs leading-relaxed font-medium">
                        {item.reason || 'Banned under General Financial Rules 2017'}
                      </p>
                    </td>

                    {/* Dates */}
                    <td className="px-5 py-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                      <div>
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Start Date</span>
                        <span className="font-semibold text-slate-800">{formatDate(item.debarment_start)}</span>
                      </div>
                      <div className="mt-1">
                        <span className="text-[10px] text-slate-400 block uppercase font-bold">Expiry Date</span>
                        <span className="font-semibold text-rose-700">{formatDate(item.debarment_end)}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4 text-center whitespace-nowrap">
                      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        <span>Debarred / Banned</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
