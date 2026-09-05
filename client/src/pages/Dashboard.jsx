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
  Sparkles
} from 'lucide-react';

export default function Dashboard() {
  const [bidders, setBidders] = useState([]);
  const [complianceMap, setComplianceMap] = useState({});
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
          } catch (e) {
            console.error(`Failed to fetch compliance for ${b.bidder_id}`, e);
          }
        })
      );

      setComplianceMap(scoreResults);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header & Live Metrics Strip */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 rounded-full">
              Procurement Officer Console
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-xs text-slate-500 font-mono">CPCL / MoPNG Vigilance Verified</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bidder Statutory Compliance Directory
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Autonomous multi-portal credential auditing across Udyam (MSME), GSTN (Taxes), Income Tax (PAN), and Central Debarment databases.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/vendor"
            className="text-xs font-semibold px-3.5 py-2 rounded-xl bg-white border border-slate-200/80 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 shadow-sm transition flex items-center space-x-1.5"
          >
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Open Vendor Workspace</span>
          </Link>
          <button
            onClick={fetchBiddersAndScores}
            disabled={loading}
            className="p-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl shadow-sm transition disabled:opacity-50"
            title="Refresh Scores"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Stat Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-medium text-slate-500">Total Enrolled Bidders</span>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">{counts.total}</span>
            <span className="text-[11px] font-medium text-slate-400">Verified Vendors</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-emerald-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-800">Compliant (Low Risk)</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-700 font-mono">{counts.low}</span>
            <span className="text-[11px] font-medium text-emerald-600">Pre-Qualified</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-800">Needs Clarification</span>
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-700 font-mono">{counts.med}</span>
            <span className="text-[11px] font-medium text-amber-600">Discrepancies</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-rose-200/70 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-rose-800">High Risk / Blacklisted</span>
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          </div>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-rose-700 font-mono">{counts.high}</span>
            <span className="text-[11px] font-medium text-rose-600">Disqualified</span>
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company, GSTIN, PAN..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Risk Pills Filter */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
          {['All', 'Low', 'Medium', 'High'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedRisk(tier)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedRisk === tier
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
              }`}
            >
              {tier === 'All' ? 'All Tiers' : `${tier} Risk`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Bidders Directory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-medium">Verifying real-time registry credentials across government databanks...</p>
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
              <thead className="bg-slate-50/80 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Company Name</th>
                  <th className="px-5 py-3.5">GSTIN</th>
                  <th className="px-5 py-3.5">PAN Number</th>
                  <th className="px-5 py-3.5">Udyam Registration</th>
                  <th className="px-6 py-3.5 text-center">Statutory Score & Risk</th>
                  <th className="px-5 py-3.5 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBidders.map((b) => {
                  const comp = complianceMap[b.bidder_id];
                  const isLow = comp?.risk === 'Low';
                  const isMed = comp?.risk === 'Medium';
                  const isHigh = comp?.risk === 'High';

                  return (
                    <tr
                      key={b.bidder_id}
                      onClick={() => navigate(`/bidder/${b.bidder_id}`)}
                      className="hover:bg-slate-50/80 cursor-pointer transition group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0 transition">
                            {b.company_name.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                              {b.company_name}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center space-x-2 mt-0.5">
                              <span>{b.email}</span>
                              <span>&bull;</span>
                              <span>{b.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                          {b.gstin}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                          {b.pan_number}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-[11px] text-slate-600">
                        <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                          {b.udyam_number}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {comp ? (
                          <div className="inline-flex flex-col items-center">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                                isLow
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : isMed
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                  isLow ? 'bg-emerald-500' : isMed ? 'bg-amber-500' : 'bg-rose-500'
                                }`}
                              ></span>
                              {comp.score}/100 &bull; {comp.risk} Risk
                            </span>
                            <span className="text-[10px] text-slate-500 mt-0.5 font-medium">
                              {comp.recommendation}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-mono text-xs">Evaluating...</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center text-xs font-semibold text-slate-400 group-hover:text-indigo-600 transition">
                          <span>Inspect</span>
                          <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Click any row to open the complete 6-pillar verification ledger and officer decision console.</span>
          <span className="font-mono">Showing {filteredBidders.length} of {bidders.length} bidders</span>
        </div>
      </div>
    </div>
  );
}
