import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Building2,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Layers,
  Download,
  Users,
  FileCheck2,
  Eye,
  ShieldAlert
} from 'lucide-react';

export default function Dashboard() {
  const [bidders, setBidders] = useState([]);
  const [complianceMap, setComplianceMap] = useState({});
  const [documentsMap, setDocumentsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchBiddersAndScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bidders');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load bidders');
      }

      const biddersList = data.bidders;
      setBidders(biddersList);

      const scoreResults = {};
      const docResults = {};

      await Promise.all(
        biddersList.map(async (b) => {
          try {
            let compRes = await fetch(`/api/bidders/${b.bidder_id}/compliance`);
            if (compRes.status === 404) {
              compRes = await fetch(`/api/bidders/${b.bidder_id}/verify`, { method: 'POST' });
            }
            const compData = await compRes.json();
            if (compData.success) {
              scoreResults[b.bidder_id] = compData;
            }

            const docRes = await fetch(`/api/bidders/${b.bidder_id}/documents`);
            const docData = await docRes.json();
            if (docData.success) {
              docResults[b.bidder_id] = docData.documents || [];
            }
          } catch (e) {
            console.error(`Failed to fetch data for ${b.bidder_id}`, e);
          }
        })
      );

      setComplianceMap(scoreResults);
      setDocumentsMap(docResults);
    } catch (err) {
      setError('Unable to connect to verification backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiddersAndScores();
  }, []);

  // Filter bidders
  const filteredBidders = useMemo(() => {
    return bidders.filter((b) => {
      const comp = complianceMap[b.bidder_id];
      const matchesRisk = selectedRisk === 'All' || (comp && comp.risk === selectedRisk);
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        b.company_name.toLowerCase().includes(query) ||
        b.gstin.toLowerCase().includes(query) ||
        b.pan_number.toLowerCase().includes(query) ||
        b.udyam_number.toLowerCase().includes(query);
      return matchesRisk && matchesSearch;
    });
  }, [bidders, complianceMap, selectedRisk, searchQuery]);

  // Counts for summary metrics
  const counts = useMemo(() => {
    let low = 0, med = 0, high = 0;
    Object.values(complianceMap).forEach(c => {
      if (c.risk === 'Low') low++;
      else if (c.risk === 'Medium') med++;
      else if (c.risk === 'High') high++;
    });
    return { total: bidders.length, low, med, high };
  }, [bidders, complianceMap]);

  // Export Bidders CSV
  const handleExportCSV = () => {
    if (bidders.length === 0) return;
    const headers = ['Company Name', 'GSTIN', 'PAN Number', 'Udyam Registration', 'GFR Score', 'Risk Level', 'Recommendation', 'Flags'];
    const rows = bidders.map((b) => {
      const comp = complianceMap[b.bidder_id] || {};
      const flags = (comp.flags || []).join('; ');
      return [
        `"${b.company_name.replace(/"/g, '""')}"`,
        `"${b.gstin}"`,
        `"${b.pan_number}"`,
        `"${b.udyam_number}"`,
        comp.score ?? 'N/A',
        comp.risk || 'Pending',
        comp.recommendation || 'Pending',
        `"${flags.replace(/"/g, '""')}"`
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCL_Participating_Bidders_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-sans">
      {/* 1. Header & Live Metrics Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B2546] bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <Users className="w-3.5 h-3.5 text-sky-600" />
              <span>Participating Bidders Directory</span>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500 font-mono font-semibold">
              GFR 2017 &bull; Real-Time Statutory Dossiers
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">
            Registered Vendor Compliance Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Autonomous multi-portal credential auditing across Udyam (MSME), GSTN (Taxes), Income Tax (CBDT), and Central Debarment databases.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={bidders.length === 0}
            className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer disabled:opacity-50"
            title="Download CSV report of participating bidders"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Directory (CSV)</span>
          </button>

          <button
            type="button"
            onClick={fetchBiddersAndScores}
            disabled={loading}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="Refresh Scores"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Compact Interactive Metric KPI Ribbon */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Segment 1: Total Enrolled */}
          <button
            type="button"
            onClick={() => setSelectedRisk('All')}
            className={`p-3 sm:px-5 sm:py-3 text-left transition-all flex items-center justify-between group cursor-pointer ${
              selectedRisk === 'All'
                ? 'bg-slate-50 ring-2 ring-inset ring-[#0B2546]/20'
                : 'hover:bg-slate-50/70'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0B2546]"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Enrolled
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black font-mono text-[#0B2546]">
                  {counts.total}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Bidders</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md hidden sm:inline-block">
              100% Sync
            </span>
          </button>

          {/* Segment 2: Compliant / Low Risk */}
          <button
            type="button"
            onClick={() => setSelectedRisk('Low')}
            className={`p-3 sm:px-5 sm:py-3 text-left transition-all flex items-center justify-between group cursor-pointer ${
              selectedRisk === 'Low'
                ? 'bg-emerald-50/50 ring-2 ring-inset ring-emerald-500/30'
                : 'hover:bg-slate-50/70'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  Compliant (Low)
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black font-mono text-emerald-600">
                  {counts.low}
                </span>
                <span className="text-[11px] text-emerald-700 font-medium">Pre-Qualified</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-emerald-800 bg-emerald-100/60 border border-emerald-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
              &ge; 85
            </span>
          </button>

          {/* Segment 3: Needs Clarification / Medium Risk */}
          <button
            type="button"
            onClick={() => setSelectedRisk('Medium')}
            className={`p-3 sm:px-5 sm:py-3 text-left transition-all flex items-center justify-between group cursor-pointer ${
              selectedRisk === 'Medium'
                ? 'bg-amber-50/50 ring-2 ring-inset ring-amber-500/30'
                : 'hover:bg-slate-50/70'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                  Clarification
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black font-mono text-amber-600">
                  {counts.med}
                </span>
                <span className="text-[11px] text-amber-700 font-medium">Discrepancies</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-amber-800 bg-amber-100/60 border border-amber-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
              60&ndash;84
            </span>
          </button>

          {/* Segment 4: High Risk / Debarred */}
          <button
            type="button"
            onClick={() => setSelectedRisk('High')}
            className={`p-3 sm:px-5 sm:py-3 text-left transition-all flex items-center justify-between group cursor-pointer ${
              selectedRisk === 'High'
                ? 'bg-rose-50/50 ring-2 ring-inset ring-rose-500/30'
                : 'hover:bg-slate-50/70'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">
                  High Risk
                </span>
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black font-mono text-rose-600">
                  {counts.high}
                </span>
                <span className="text-[11px] text-rose-700 font-medium">Disqualified</span>
              </div>
            </div>
            <span className="text-[10px] font-mono font-semibold text-rose-800 bg-rose-100/60 border border-rose-200 px-2 py-0.5 rounded-md hidden sm:inline-block">
              &lt; 60
            </span>
          </button>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, GSTIN, PAN, Udyam..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2546]"
          />
        </div>

        {/* Risk Filter Tabs */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All Bidders', value: 'All', count: counts.total },
            { label: 'Pre-Qualified', value: 'Low', count: counts.low },
            { label: 'Clarification', value: 'Medium', count: counts.med },
            { label: 'Disqualified', value: 'High', count: counts.high }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedRisk(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                selectedRisk === tab.value
                  ? 'bg-[#0B2546] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                selectedRisk === tab.value ? 'bg-white/20 text-white' : 'bg-white text-slate-600 border border-slate-200'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Bidders Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-[#0B2546] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-medium">Verifying real-time credentials across government registries...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50">
            <p className="text-xs font-semibold">{error}</p>
            <button
              onClick={fetchBiddersAndScores}
              className="mt-3 text-xs bg-rose-600 text-white px-3.5 py-1.5 rounded-lg hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : filteredBidders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No bidders found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-left">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Company Legal Name</th>
                  <th className="px-5 py-3.5">GSTIN</th>
                  <th className="px-5 py-3.5">PAN Number</th>
                  <th className="px-5 py-3.5">Udyam Registration</th>
                  <th className="px-5 py-3.5 text-center">Vault Docs</th>
                  <th className="px-6 py-3.5 text-center">Statutory Score & Risk</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBidders.map((b) => {
                  const comp = complianceMap[b.bidder_id];
                  const docs = documentsMap[b.bidder_id] || [];
                  const flaggedDocs = docs.filter((d) => d.flagged);
                  const isLow = comp?.risk === 'Low';
                  const isMed = comp?.risk === 'Medium';
                  const isHigh = comp?.risk === 'High';

                  return (
                    <tr
                      key={b.bidder_id}
                      onClick={() => navigate(`/bidder/${b.bidder_id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition group"
                    >
                      {/* Company Name & Avatar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-[#0B2546] group-hover:bg-[#0B2546] group-hover:text-white flex items-center justify-center font-bold text-xs shrink-0 transition border border-slate-200">
                            {b.company_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-sky-700 transition">
                              {b.company_name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                              <span>{b.email}</span>
                              <span>&bull;</span>
                              <span className="font-mono text-[10px]">ID: {b.bidder_id.substring(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* GSTIN */}
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                          {b.gstin}
                        </span>
                      </td>

                      {/* PAN */}
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                          {b.pan_number}
                        </span>
                      </td>

                      {/* Udyam */}
                      <td className="px-5 py-4 font-mono text-[11px] text-slate-700">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                          {b.udyam_number}
                        </span>
                      </td>

                      {/* Vault Docs Count */}
                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono border ${
                          flaggedDocs.length > 0
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : docs.length > 0
                            ? 'bg-slate-100 text-slate-700 border-slate-200'
                            : 'bg-slate-50 text-slate-400 border-slate-200'
                        }`}>
                          <FileCheck2 className="w-3 h-3" />
                          <span>{docs.length}</span>
                          {flaggedDocs.length > 0 && <span className="text-rose-600">(!{flaggedDocs.length})</span>}
                        </span>
                      </td>

                      {/* Score & Risk */}
                      <td className="px-6 py-4 text-center">
                        {comp ? (
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                                isLow
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : isMed
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-rose-50 text-rose-800 border-rose-300'
                              }`}
                            >
                              <span className="mr-1">{comp.score}/100</span>
                              <span className="opacity-75 font-sans font-semibold">({comp.risk})</span>
                            </span>
                            <span className="text-[10px] text-slate-500 font-medium mt-1">
                              {comp.recommendation}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">Evaluating...</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-5 py-4 text-right whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-[#0B2546] bg-slate-100 group-hover:bg-[#0B2546] group-hover:text-white px-3 py-1.5 rounded-lg transition">
                          <span>Inspect</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
