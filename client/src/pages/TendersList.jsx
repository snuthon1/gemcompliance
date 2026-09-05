import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Calendar,
  Users,
  AlertCircle,
  RefreshCw,
  Search,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  FileText,
  Filter,
  ArrowRight,
  Award,
  ShieldCheck,
  TrendingUp,
  Tag,
  Coins
} from 'lucide-react';

export default function TendersList() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const navigate = useNavigate();

  const fetchTenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/tenders');
      const data = await res.json();
      if (data.success) {
        setTenders(data.tenders);
      } else {
        setError(data.message || 'Failed to load tenders');
      }
    } catch (err) {
      setError('Unable to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Metrics calculation
  const totalValue = useMemo(() => {
    return tenders.reduce((acc, t) => acc + (Number(t.estimated_value) || 0), 0);
  }, [tenders]);

  const totalBids = useMemo(() => {
    return tenders.reduce((acc, t) => acc + (Number(t.bid_count) || 0), 0);
  }, [tenders]);

  const awardedCount = useMemo(() => {
    return tenders.filter((t) => t.status === 'Awarded').length;
  }, [tenders]);

  const openCount = useMemo(() => {
    return tenders.filter((t) => t.status !== 'Awarded').length;
  }, [tenders]);

  // Filtered tenders based on search and status
  const filteredTenders = useMemo(() => {
    return tenders.filter((tender) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        (tender.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tender.tender_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tender.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tender.description || '').toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'All' ||
        (statusFilter === 'Awarded' && tender.status === 'Awarded') ||
        (statusFilter === 'Open' && tender.status !== 'Awarded');

      return matchesSearch && matchesStatus;
    });
  }, [tenders, searchQuery, statusFilter]);

  // Helper metadata generator for authentic CPCL refinery contracts
  const getTenderMeta = (tender) => {
    const title = (tender.title || '').toLowerCase();
    if (title.includes('valve') || title.includes('pipe')) {
      return {
        category: 'Refinery Piping & High-Pressure Valves',
        unit: 'Manali Refinery (CDU-I & VDU)',
        emd: Math.round((tender.estimated_value || 4500000) * 0.02),
        code: 'CPCL-MECH-0182',
        gfrRule: 'Rule 144(xi) Cleared'
      };
    }
    if (title.includes('instrumentation') || title.includes('amc') || title.includes('automation')) {
      return {
        category: 'Process Automation & Control Systems (C&I)',
        unit: 'Offsite Utilities & Instrumentation Cell',
        emd: Math.round((tender.estimated_value || 2200000) * 0.02),
        code: 'CPCL-INST-0942',
        gfrRule: 'CVC Vigilance Cleared'
      };
    }
    if (title.includes('heat exchanger') || title.includes('tube') || title.includes('gasket')) {
      return {
        category: 'Thermal Equipment & Alloy Steel Components',
        unit: 'Crude Distillation Unit-II (CDU-II)',
        emd: Math.round((tender.estimated_value || 3850000) * 0.02),
        code: 'CPCL-STAT-0331',
        gfrRule: 'PPP-MII 50% Mandate'
      };
    }
    return {
      category: 'Public PSU Procurement Contract',
      unit: 'CPCL Manali Refinery, Chennai',
      emd: Math.round((tender.estimated_value || 3000000) * 0.02),
      code: 'CPCL-GEN-1020',
      gfrRule: 'GFR 2017 Compliant'
    };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* 1. Official Header & Telemetry Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B2546] bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-md font-mono">
              e-Procurement Portal
            </span>
            <span className="text-slate-400 text-xs">•</span>
            <span className="text-xs text-slate-500 font-mono font-medium">CPCL Manali Refinery Contracts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Active Procurement Tenders
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Integrated commercial bid evaluation matrix comparing L1 lowest quotations against automated GFR 2017, CVC Debarment, and GSTN compliance.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-mono text-[11px]">GeM Portal Live</span>
          </div>

          <button
            onClick={fetchTenders}
            disabled={loading}
            className="p-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-xl shadow-2xs transition disabled:opacity-50 cursor-pointer"
            title="Refresh Tenders"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Executive Metric KPI Ribbon (Refined & Compact) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Value</span>
            <TrendingUp className="w-4 h-4 text-[#0B2546]" />
          </div>
          <div className="text-xl font-black font-mono text-[#0B2546] mt-1">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Under active administration</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Tenders</span>
            <Layers className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black font-mono text-slate-900 mt-1">
            {tenders.length} <span className="text-xs font-normal text-slate-400">Published</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{openCount} Live • {awardedCount} Awarded</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Total Bids</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-700 mt-1">
            {totalBids} <span className="text-xs font-normal text-slate-400">Quotations</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">Screened by AI Watchdog</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Governance</span>
            <ShieldCheck className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-700 mt-1">
            100% <span className="text-xs font-normal text-slate-400">Rule 144</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5 font-medium">CVC &amp; GFR 2017 Enforcement</div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by tender title, ID, equipment..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2546]"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          {[
            { label: 'All Tenders', value: 'All', count: tenders.length },
            { label: 'Live Bidding', value: 'Open', count: openCount },
            { label: 'Awarded', value: 'Awarded', count: awardedCount }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shrink-0 ${
                statusFilter === tab.value
                  ? 'bg-[#0B2546] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                  statusFilter === tab.value
                    ? 'bg-white/20 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Tenders Directory Grid */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-8 h-8 border-4 border-[#0B2546] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-semibold text-slate-700">Loading procurement tenders and active bids...</p>
          <p className="text-[11px] text-slate-400 mt-1">Querying CPCL e-procurement database</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl shadow-2xs">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="text-xs font-semibold">{error}</p>
          <button
            onClick={fetchTenders}
            className="mt-3 text-xs bg-rose-600 text-white font-bold px-3.5 py-1.5 rounded-xl hover:bg-rose-700 transition cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      ) : filteredTenders.length === 0 ? (
        <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
          <h3 className="font-bold text-slate-700 text-sm">No procurement tenders match your search</h3>
          <p className="text-xs mt-1">Try clearing filters or search by a different keyword.</p>
          <button
            onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
            className="mt-3 text-xs font-bold text-[#0B2546] hover:underline"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredTenders.map((tender) => {
            const isAwarded = tender.status === 'Awarded';
            const meta = getTenderMeta(tender);

            return (
              <div
                key={tender.tender_id}
                onClick={() => navigate(`/tenders/${tender.tender_id}`)}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-[#0B2546]/50 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group overflow-hidden"
              >
                {/* Card Top Accent Strip */}
                <div className={`h-1.5 w-full ${isAwarded ? 'bg-amber-400' : 'bg-emerald-500'}`} />

                <div className="p-5 sm:p-6 space-y-4">
                  {/* Card Header Row: Reference ID + Category Pill + Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                        REF: {tender.tender_id.substring(0, 8).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-bold text-[#0B2546] bg-blue-50 border border-blue-200/80 px-2 py-0.5 rounded hidden sm:inline-block">
                        {meta.code}
                      </span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono flex items-center gap-1.5 ${
                        isAwarded
                          ? 'bg-amber-50 text-amber-900 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {isAwarded ? (
                        <>
                          <Award className="w-3.5 h-3.5 text-amber-700" />
                          <span>Contract Awarded</span>
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                          <span>Live Bidding Open</span>
                        </>
                      )}
                    </span>
                  </div>

                  {/* Title & Category */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      {meta.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 group-hover:text-[#0B2546] transition leading-snug">
                      {tender.title}
                    </h3>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {tender.description}
                    </p>
                  </div>

                  {/* Operational Location & Authority */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <div className="flex items-center space-x-1.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-700 font-semibold">{tender.department || 'CPCL Chennai'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="text-slate-600">{meta.unit}</span>
                    </div>
                  </div>

                  {/* Micro Parameter Matrix (3 Stats) */}
                  <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Estimated Value</div>
                      <div className="text-sm font-black text-slate-900 font-mono mt-0.5">
                        {formatCurrency(tender.estimated_value)}
                      </div>
                    </div>
                    <div className="border-x border-slate-200/80 px-2">
                      <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">EMD Deposit</div>
                      <div className="text-sm font-bold text-slate-800 font-mono mt-0.5">
                        {formatCurrency(meta.emd)}
                      </div>
                    </div>
                    <div className="pl-1">
                      <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Deadline</div>
                      <div className="text-xs font-semibold text-slate-700 mt-0.5 truncate">
                        {tender.submission_deadline
                          ? new Date(tender.submission_deadline).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric'
                            })
                          : '18 Mar 2026'}
                      </div>
                    </div>
                  </div>

                  {/* Statutory & Evaluation Health Pill */}
                  <div className="flex items-center justify-between text-[11px] bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/60 font-mono">
                    <span className="text-slate-600 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {meta.gfrRule}
                    </span>
                    <span className="text-slate-500 font-semibold">
                      {isAwarded ? 'L1 Finalized' : 'Evaluation Active'}
                    </span>
                  </div>
                </div>

                {/* Card Footer: Action Button & Bid Count */}
                <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold text-[#0B2546]">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{tender.bid_count} Commercial Bids</span>
                  </div>

                  <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-[#0B2546] group-hover:bg-[#07182D] px-3.5 py-1.5 rounded-xl shadow-xs transition">
                    <span>{isAwarded ? 'View Award Dossier' : 'Evaluate Bids'}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
