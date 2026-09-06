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
  const [bidders, setBidders] = useState(() => {
    try {
      const cached = sessionStorage.getItem('bidshield_bidders_cache');
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      return [];
    }
  });
  const [complianceMap, setComplianceMap] = useState(() => {
    try {
      const cached = sessionStorage.getItem('bidshield_compliance_cache');
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  });
  const [documentsMap, setDocumentsMap] = useState(() => {
    try {
      const cached = sessionStorage.getItem('bidshield_docs_cache');
      return cached ? JSON.parse(cached) : {};
    } catch (e) {
      return {};
    }
  });
  const [loading, setLoading] = useState(() => {
    try {
      return !sessionStorage.getItem('bidshield_bidders_cache');
    } catch (e) {
      return true;
    }
  });
  const [error, setError] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchBiddersAndScores = async (forceRefresh = false) => {
    if (!bidders.length || forceRefresh) {
      if (!bidders.length) setLoading(true);
    }
    setError(null);
    try {
      const response = await fetch('/api/bidders');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load bidders');
      }

      const biddersList = data.bidders || [];
      setBidders(biddersList);
      try { sessionStorage.setItem('bidshield_bidders_cache', JSON.stringify(biddersList)); } catch (e) {}

      // Unblock table immediately - officer can see all registered enterprises and records right away!
      setLoading(false);

      const scoreResults = { ...complianceMap };
      const docResults = { ...documentsMap };

      await Promise.all(
        biddersList.map(async (b) => {
          try {
            const [compRes, docRes] = await Promise.all([
              fetch(`/api/bidders/${b.bidder_id}/compliance`),
              fetch(`/api/bidders/${b.bidder_id}/documents`)
            ]);

            let compData = null;
            if (compRes.ok) {
              compData = await compRes.json();
            } else if (compRes.status === 404) {
              const vRes = await fetch(`/api/bidders/${b.bidder_id}/verify`, { method: 'POST' });
              compData = await vRes.json();
            }

            if (compData && compData.success) {
              scoreResults[b.bidder_id] = compData;
              setComplianceMap({ ...scoreResults });
            }

            if (docRes.ok) {
              const docData = await docRes.json();
              if (docData.success) {
                docResults[b.bidder_id] = docData.documents || [];
                setDocumentsMap({ ...docResults });
              }
            }
          } catch (e) {
            console.error(`Failed to fetch data for ${b.bidder_id}`, e);
          }
        })
      );

      try {
        sessionStorage.setItem('bidshield_compliance_cache', JSON.stringify(scoreResults));
        sessionStorage.setItem('bidshield_docs_cache', JSON.stringify(docResults));
      } catch (e) {}
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 font-sans">
      {/* 1. Official CPCL Directorate Masthead Banner */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        <div className="bg-[#07182D] text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-amber-500">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2 text-[10px] font-mono text-amber-300 font-bold uppercase tracking-wider">
              <span>चेन्नई पेट्रोलियम कॉर्पोरेशन लिमिटेड (CPCL)</span>
              <span>&bull;</span>
              <span>सतर्कता एवं अनुबंध विभाग (Contracts &amp; Materials)</span>
            </div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              <span>पंजीकृत निविदाकार वैधानिक अनुपालन निर्देशिका</span>
              <span className="text-xs font-normal text-slate-300 font-sans hidden md:inline">
                (Registered Bidders Statutory Compliance Directory)
              </span>
            </h1>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              type="button"
              onClick={handleExportCSV}
              disabled={bidders.length === 0}
              className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded border border-white/20 transition cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-amber-300" />
              <span>Export Dossier (CSV)</span>
            </button>

            <button
              type="button"
              onClick={() => fetchBiddersAndScores(true)}
              disabled={loading}
              className="p-1.5 bg-white/10 hover:bg-white/20 text-white rounded border border-white/20 transition disabled:opacity-50 cursor-pointer"
              title="Refresh Registry Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        <div className="bg-slate-50 px-5 py-2 text-[11px] text-slate-600 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200">
          <div className="flex items-center space-x-2 font-mono">
            <span className="font-bold text-[#0B2546]">वैधानिक ढांचा:</span>
            <span>GFR 2017 Rule 144(xi) Land Border Security</span>
            <span className="text-slate-300">|</span>
            <span>CVC Vigilance Directives</span>
            <span className="text-slate-300">|</span>
            <span>Udyam MSME Exemption Status</span>
          </div>
          <div className="text-[10px] font-mono text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded font-bold">
            Real-time CBDT / GSTN / Debarment Cross-Verification
          </div>
        </div>
      </div>

      {/* 2. Search & Filter Bar */}
      <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor legal name, GSTIN, PAN, Udyam..."
            className="w-full bg-slate-50 border border-slate-300 rounded pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2546]"
          />
        </div>

        {/* Risk Filter Tabs */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All Registered Bidders', value: 'All', count: counts.total },
            { label: 'Pre-Qualified', value: 'Low', count: counts.low },
            { label: 'Clarification Required', value: 'Medium', count: counts.med },
            { label: 'Disqualified', value: 'High', count: counts.high }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedRisk(tab.value)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border ${
                selectedRisk === tab.value
                  ? 'bg-[#0B2546] text-white border-[#0B2546] shadow-xs'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-300'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold ${
                  selectedRisk === tab.value
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-slate-700 border border-slate-300'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3. Main Bidders Directory Table */}
      <div className="bg-white rounded-lg border border-slate-300 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-[#0B2546] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold">Verifying real-time credentials across government registries...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50">
            <p className="text-xs font-semibold">{error}</p>
            <button
              onClick={fetchBiddersAndScores}
              className="mt-3 text-xs bg-rose-600 text-white px-3.5 py-1.5 rounded hover:bg-rose-700"
            >
              Retry
            </button>
          </div>
        ) : filteredBidders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No registered vendors found matching your filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-[#0B2546] text-white text-[11px] font-bold uppercase tracking-wider border-b-2 border-amber-500">
                <tr>
                  <th className="px-4 py-3 text-center w-12">Sl. No.</th>
                  <th className="px-5 py-3">Vendor / Company Legal Entity</th>
                  <th className="px-4 py-3">GSTIN (GSTN)</th>
                  <th className="px-4 py-3">PAN (CBDT)</th>
                  <th className="px-4 py-3">Udyam Registration</th>
                  <th className="px-4 py-3 text-center">Docs Vault</th>
                  <th className="px-6 py-3 text-center">Statutory Compliance Status</th>
                  <th className="px-4 py-3 text-right">Official Dossier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs bg-white">
                {filteredBidders.map((b, idx) => {
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
                      className="even:bg-slate-50/60 hover:bg-amber-50/40 cursor-pointer transition group"
                    >
                      {/* Sl. No. */}
                      <td className="px-4 py-3.5 text-center font-mono font-bold text-slate-500">
                        {String(idx + 1).padStart(2, '0')}
                      </td>

                      {/* Company Name & Details */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-7 h-7 rounded bg-[#0B2546] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {b.company_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-[#0B2546] transition">
                              {b.company_name}
                            </div>
                            <div className="text-[10px] text-slate-500 flex items-center space-x-2 mt-0.5">
                              <span>{b.email}</span>
                              <span>&bull;</span>
                              <span className="font-mono">ID: {b.bidder_id.substring(0, 8)}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* GSTIN */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-800">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-semibold inline-block">
                          {b.gstin}
                        </span>
                      </td>

                      {/* PAN */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-800">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-semibold inline-block">
                          {b.pan_number}
                        </span>
                      </td>

                      {/* Udyam */}
                      <td className="px-4 py-3.5 font-mono text-[11px] text-slate-800">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-300 font-semibold inline-block">
                          {b.udyam_number}
                        </span>
                      </td>

                      {/* Vault Docs Count */}
                      <td className="px-4 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-bold font-mono border ${
                            flaggedDocs.length > 0
                              ? 'bg-rose-50 text-rose-800 border-rose-300'
                              : docs.length > 0
                              ? 'bg-slate-100 text-slate-700 border-slate-300'
                              : 'bg-slate-50 text-slate-400 border-slate-200'
                          }`}
                        >
                          <FileCheck2 className="w-3 h-3" />
                          <span>{docs.length} Docs</span>
                          {flaggedDocs.length > 0 && <span className="text-rose-600 font-black">(!{flaggedDocs.length})</span>}
                        </span>
                      </td>

                      {/* Score & Risk */}
                      <td className="px-6 py-3.5 text-center">
                        {comp ? (
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold border ${
                                isLow
                                  ? 'bg-emerald-50 text-emerald-950 border-emerald-300'
                                  : isMed
                                  ? 'bg-amber-50 text-amber-950 border-amber-300'
                                  : 'bg-rose-50 text-rose-950 border-rose-300'
                              }`}
                            >
                              <span className="mr-1">{comp.score}/100</span>
                              <span className="opacity-90 font-sans font-semibold">({comp.risk})</span>
                            </span>
                            <span className="text-[10px] text-slate-600 font-medium mt-1 font-mono">
                              {comp.recommendation}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs font-mono">Evaluating...</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-white bg-[#0B2546] hover:bg-[#07182D] px-2.5 py-1 rounded transition shadow-2xs">
                          <span>Inspect</span>
                          <ChevronRight className="w-3.5 h-3.5" />
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
