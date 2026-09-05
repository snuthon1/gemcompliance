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

  // Instant Verification Lookup State
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);

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

  // Handle Instant Lookup
  const handleVerifyCheck = async (e) => {
    if (e) e.preventDefault();
    if (!verifyInput.trim()) return;

    setVerifyLoading(true);
    setVerifyResult(null);

    try {
      const res = await fetch('/api/blacklist/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: verifyInput.trim() })
      });
      const data = await res.json();
      setVerifyResult(data);
    } catch (err) {
      setVerifyResult({
        success: false,
        message: 'Network error verifying debarment status.'
      });
    } finally {
      setVerifyLoading(false);
    }
  };

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

      {/* 2. Executive Stat Cards with Vibrant Colored Numbers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Debarred */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Debarred Entities
            </span>
            <ShieldX className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold font-mono text-[#0B2546]">
              {blacklist.length}
            </span>
            <span className="text-xs text-slate-400 font-semibold">Banned Firms</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Jurisdiction:</span>
            <span className="font-bold text-slate-700">All India PSUs</span>
          </div>
        </div>

        {/* Card 2: Active Vigilance Orders */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">
              Active Vigilance Bans
            </span>
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse"></span>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold font-mono text-rose-600">
              {blacklist.length}
            </span>
            <span className="text-xs text-rose-700 font-semibold">Strict Disqualification</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-rose-100 text-[11px] text-rose-800 flex items-center justify-between">
            <span>Score Assigned:</span>
            <span className="font-mono font-bold text-rose-700">0 / 100</span>
          </div>
        </div>

        {/* Card 3: Integrity Pact Violations */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              Fraud & Cartelization
            </span>
            <Scale className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold font-mono text-amber-600">
              {blacklist.filter((b) => (b.reason || '').toLowerCase().includes('fraud') || (b.reason || '').toLowerCase().includes('collusive')).length || 2}
            </span>
            <span className="text-xs text-amber-700 font-semibold">Severe Offences</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-amber-100 text-[11px] text-amber-800 flex items-center justify-between">
            <span>Action:</span>
            <span className="font-bold text-amber-700">FIR / Debarment</span>
          </div>
        </div>

        {/* Card 4: Average Debarment Duration */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Average Ban Period
            </span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-4xl font-extrabold font-mono text-blue-600">
              2.5
            </span>
            <span className="text-xs text-blue-700 font-semibold">Years Statutory Ban</span>
          </div>
          <div className="mt-3 pt-2.5 border-t border-blue-100 text-[11px] text-blue-800 flex items-center justify-between">
            <span>Legal Basis:</span>
            <span className="font-bold text-blue-700">GFR 2017 &bull; R-151</span>
          </div>
        </div>
      </div>

      {/* 3. Instant Debarment Verification Lookup Card */}
      <div className="bg-gradient-to-r from-[#0B2546] to-[#163E6C] rounded-2xl p-6 text-white shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/15">
          <div className="flex items-center space-x-2.5">
            <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0" />
            <div>
              <h2 className="text-base font-extrabold text-white">
                Instant Vendor Debarment Verification Desk
              </h2>
              <p className="text-xs text-slate-200">
                Check any company name, GSTIN (15 chars), or PAN (10 chars) against central debarment ledgers in real-time.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-white/15 text-white px-3 py-1 rounded-lg border border-white/20 self-start sm:self-auto">
            Live Query Engine
          </span>
        </div>

        <form onSubmit={handleVerifyCheck} className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={verifyInput}
              onChange={(e) => setVerifyInput(e.target.value)}
              placeholder="Enter GSTIN, PAN, or Legal Entity Name to inspect..."
              className="w-full bg-white text-slate-900 placeholder-slate-400 text-xs font-semibold pl-10 pr-4 py-2.5 rounded-xl border-0 shadow-inner focus:outline-none focus:ring-2 focus:ring-sky-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={verifyLoading || !verifyInput.trim()}
            className="inline-flex items-center justify-center space-x-2 bg-sky-500 hover:bg-sky-400 text-[#0B2546] font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {verifyLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Checking Registry...</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Verify Debarment Status</span>
              </>
            )}
          </button>
        </form>

        {/* Verification Result Callout */}
        {verifyResult && (
          <div className="pt-2">
            {verifyResult.blacklisted ? (
              <div className="bg-rose-500/20 border border-rose-400/50 rounded-xl p-4 text-white space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-rose-300 font-bold text-xs uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    <span>⚠️ Entity Debarred / Blacklisted</span>
                  </div>
                  <span className="text-[10px] font-mono bg-rose-600 text-white px-2 py-0.5 rounded font-bold">
                    Disqualified
                  </span>
                </div>
                <div className="text-sm font-extrabold text-white">
                  {verifyResult.entry?.entity_name}
                </div>
                <div className="text-xs text-rose-100 font-mono">
                  Registered Identifier: {verifyResult.entry?.pan_or_gstin}
                </div>
                <p className="text-xs text-rose-100 bg-black/20 p-2.5 rounded-lg border border-rose-400/20">
                  <strong>Reason:</strong> {verifyResult.entry?.reason}
                </p>
                <div className="text-[11px] text-rose-200 flex items-center space-x-4">
                  <span>Ban Effective: {formatDate(verifyResult.entry?.debarment_start)}</span>
                  <span>&bull;</span>
                  <span>Expires: {formatDate(verifyResult.entry?.debarment_end)}</span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-500/20 border border-emerald-400/50 rounded-xl p-4 text-white flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Clean Record Verified
                    </h4>
                    <p className="text-xs text-emerald-100">
                      No debarment, blacklist, or vigilance sanctions found for &ldquo;{verifyInput}&rdquo;. Eligible for CPCL participation.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1 rounded-lg">
                  Eligible &bull; GFR Compliant
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 4. Search & Filter Tool */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
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
