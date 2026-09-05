import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Calendar, DollarSign, Users, ChevronRight, AlertCircle, RefreshCw, ArrowUpRight } from 'lucide-react';

export default function TendersList() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0B2546] bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
              e-Procurement Portal
            </span>
            <span className="text-slate-400 text-xs">&bull;</span>
            <span className="text-xs text-slate-500 font-mono">CPCL Refinery Contracts</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Active Procurement Tenders
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl">
            Integrated commercial bid evaluation matrix comparing L1 lowest price quotations against statutory portal compliance.
          </p>
        </div>

        <button
          onClick={fetchTenders}
          disabled={loading}
          className="p-2 bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-xl shadow-sm transition disabled:opacity-50"
          title="Refresh Tenders"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-[#0B2546] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-medium">Loading procurement tenders and active bids...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600 bg-rose-50 border border-rose-200 rounded-2xl">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="text-xs font-semibold">{error}</p>
          <button onClick={fetchTenders} className="mt-3 text-xs bg-rose-600 text-white px-3.5 py-1.5 rounded-xl">
            Retry
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenders.map((tender) => {
            const isAwarded = tender.status === 'Awarded';
            return (
              <div
                key={tender.tender_id}
                onClick={() => navigate(`/tenders/${tender.tender_id}`)}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 hover:border-[#0B2546]/40 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/60">
                      REF: {tender.tender_id.substring(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold font-mono ${
                        isAwarded
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}
                    >
                      {tender.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0B2546] transition leading-snug">
                    {tender.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {tender.description}
                  </p>

                  <div className="text-[11px] text-slate-400 mt-3 font-medium">
                    Department: <span className="text-slate-700">{tender.department}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div>
                    <div className="text-[10px] uppercase font-semibold text-slate-400">Estimated Value</div>
                    <div className="text-base font-bold text-slate-900 font-mono">
                      {formatCurrency(tender.estimated_value)}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center space-x-1 bg-slate-100 text-[#0B2546] font-semibold text-xs px-2.5 py-1 rounded-full border border-slate-200 font-mono">
                      <Users className="w-3 h-3 mr-1" />
                      {tender.bid_count} Bids
                    </span>

                    <div className="inline-flex items-center text-xs font-semibold text-slate-400 group-hover:text-[#0B2546] transition">
                      <span>Evaluate</span>
                      <ArrowUpRight className="w-3.5 h-3.5 ml-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                    </div>
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
