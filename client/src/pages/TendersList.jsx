import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Calendar, DollarSign, Users, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';

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
      {/* Tender Header Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <Layers className="w-5 h-5 text-cpcl-orange" />
            <span>Public e-Procurement Tenders</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            GeM / CPCL Active Bidding & Integrated Statutory Compliance Evaluation
          </p>
        </div>

        <button
          onClick={fetchTenders}
          className="inline-flex items-center space-x-1.5 text-xs bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm transition"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>Refresh Tenders</span>
        </button>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Loading open tenders from database...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center text-rose-600 bg-rose-50 border border-rose-200 rounded-lg">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-500" />
          <p className="text-sm font-semibold">{error}</p>
          <button onClick={fetchTenders} className="mt-3 text-xs bg-rose-600 text-white px-3 py-1.5 rounded">
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
                className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 hover:border-blue-500 hover:shadow-md cursor-pointer transition flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      REF: {tender.tender_id.substring(0, 8).toUpperCase()}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${
                        isAwarded
                          ? 'bg-purple-50 text-purple-700 border-purple-300'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      }`}
                    >
                      {tender.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition leading-snug">
                    {tender.title}
                  </h3>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {tender.description}
                  </p>

                  <div className="text-[11px] text-slate-500 font-medium mt-3">
                    Department: <strong className="text-slate-700">{tender.department}</strong>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="text-slate-500 flex items-center space-x-1 font-medium">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Estimated Value:</span>
                      <strong className="text-slate-900 font-mono">{formatCurrency(tender.estimated_value)}</strong>
                    </div>

                    <div className="text-slate-500 flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {new Date(tender.submission_deadline).toLocaleDateString('en-GB')}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-800 text-xs font-bold px-2.5 py-1 rounded border border-blue-200">
                      <Users className="w-3.5 h-3.5" />
                      <span>{tender.bid_count} Bids</span>
                    </span>

                    <div className="inline-flex items-center text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition">
                      <span>Evaluate</span>
                      <ChevronRight className="w-4 h-4 ml-0.5" />
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
