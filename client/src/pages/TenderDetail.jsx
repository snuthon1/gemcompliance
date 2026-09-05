import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Layers,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Award,
  ArrowUpDown,
  ExternalLink,
  ShieldAlert,
  Info,
  RefreshCw
} from 'lucide-react';

export default function TenderDetail() {
  const { tender_id } = useParams();
  const [tender, setTender] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('compliance'); // 'compliance' | 'price'
  const [awardingId, setAwardingId] = useState(null);
  const [awardResponse, setAwardResponse] = useState(null);

  const loadTenderAndBids = async () => {
    setLoading(true);
    try {
      const [tRes, bRes] = await Promise.all([
        fetch(`/api/tenders/${tender_id}`),
        fetch(`/api/tenders/${tender_id}/bids`)
      ]);

      const tData = await tRes.json();
      const bData = await bRes.json();

      if (tData.success) setTender(tData.tender);
      if (bData.success) setBids(bData.bids);
    } catch (err) {
      console.error('Error loading tender evaluation:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenderAndBids();
  }, [tender_id]);

  // Sorting logic: default compliance score descending, or bid_amount ascending
  const sortedBids = useMemo(() => {
    return [...bids].sort((a, b) => {
      if (sortBy === 'compliance') {
        const scoreA = a.compliance ? a.compliance.score : 0;
        const scoreB = b.compliance ? b.compliance.score : 0;
        return scoreB - scoreA; // Descending score (best compliance first)
      } else {
        return a.bid_amount - b.bid_amount; // Ascending price (L1 lowest price first)
      }
    });
  }, [bids, sortBy]);

  // Handle Tender Award
  const handleAward = async (bidder_id, company_name) => {
    if (!confirm(`Are you sure you want to award this tender to ${company_name}?`)) {
      return;
    }

    setAwardingId(bidder_id);
    setAwardResponse(null);

    try {
      const res = await fetch(`/api/tenders/${tender_id}/award`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bidder_id })
      });

      const data = await res.json();
      if (data.success) {
        setAwardResponse(data);
        // Refresh tender and bids view
        await loadTenderAndBids();
      } else {
        alert(data.message || 'Award failed');
      }
    } catch (err) {
      console.error('Failed to execute tender award:', err);
    } finally {
      setAwardingId(null);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Loading tender bids and compliance matrix...</p>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-rose-800">
        <p className="font-semibold">Tender not found</p>
        <Link to="/tenders" className="mt-3 inline-block text-xs bg-rose-600 text-white px-3 py-1.5 rounded">
          Back to Tenders
        </Link>
      </div>
    );
  }

  const isTenderAwarded = tender.status === 'Awarded';
  const awardedBid = bids.find(b => b.status === 'Awarded');
  const isAwardedNonCompliant = awardedBid && awardedBid.compliance?.recommendation === 'Non-Compliant';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Link */}
      <Link
        to="/tenders"
        className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        <span>Back to All Tenders</span>
      </Link>

      {/* Prominent Warning Banner when Awarded to Non-Compliant Bidder */}
      {(awardResponse?.warning || isAwardedNonCompliant) && (
        <div className="bg-rose-50 border-2 border-rose-600 rounded-xl p-5 shadow-md animate-in fade-in duration-300">
          <div className="flex items-start space-x-3">
            <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-900 uppercase tracking-wide">
                Statutory Warning: Award Overrode AI Compliance Recommendation
              </h4>
              <p className="text-xs text-rose-800 font-semibold leading-relaxed">
                {awardResponse?.warning || "This tender was awarded to a bidder whose statutory compliance recommendation is Non-Compliant. Award was executed despite AI advisory deficit flags."}
              </p>
              <p className="text-[11px] text-rose-700 leading-relaxed pt-1">
                Notice: The Procurement Officer retains ultimate commercial award authority under GFR 2017. This decision has been permanently stamped into the immutable audit trail along with the vendor's compliance deficit flags.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tender Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                TENDER REF: {tender.tender_id.substring(0, 8).toUpperCase()}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-mono border ${
                  isTenderAwarded
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                }`}
              >
                Status: {tender.status}
              </span>
            </div>

            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              {tender.title}
            </h1>

            <p className="text-xs text-slate-600 leading-relaxed max-w-4xl pt-1">
              {tender.description}
            </p>

            <div className="text-xs text-slate-500 pt-1">
              Department: <strong className="text-slate-700">{tender.department}</strong>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shrink-0 text-right space-y-1">
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Estimated Tender Value</div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {formatCurrency(tender.estimated_value)}
            </div>
            <div className="text-xs text-slate-500 flex items-center justify-end space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Closes: {new Date(tender.submission_deadline).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Evaluation Card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header with Sort Toggle */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
              <Award className="w-4 h-4 text-cpcl-orange" />
              <span>Bidder Comparison & Integrated Compliance Matrix</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Compare commercial price quotation against automated statutory portal verification score
            </p>
          </div>

          {/* Sort Control */}
          <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs shadow-sm">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Sort By:</span>
            <button
              onClick={() => setSortBy('compliance')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                sortBy === 'compliance' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Compliance Score &darr;
            </button>
            <button
              onClick={() => setSortBy('price')}
              className={`px-2 py-0.5 rounded font-semibold transition ${
                sortBy === 'price' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lowest Price (L1) &uarr;
            </button>
          </div>
        </div>

        {/* Bids Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left">
            <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th scope="col" className="px-6 py-3.5">Company Name</th>
                <th scope="col" className="px-5 py-3.5 text-right">Quoted Bid Amount</th>
                <th scope="col" className="px-5 py-3.5 text-center">Compliance Score</th>
                <th scope="col" className="px-5 py-3.5 text-center">Risk Badge</th>
                <th scope="col" className="px-5 py-3.5 text-center">AI Recommendation</th>
                <th scope="col" className="px-5 py-3.5 text-center">Bid Status</th>
                <th scope="col" className="px-5 py-3.5 text-right">Officer Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {sortedBids.map((bid, index) => {
                const comp = bid.compliance;
                const isAwarded = bid.status === 'Awarded';
                const isRejected = bid.status === 'Rejected';

                const isLow = comp?.risk === 'Low';
                const isMed = comp?.risk === 'Medium';
                const isHigh = comp?.risk === 'High';

                const riskBadge = isLow
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : isMed
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300';

                const scoreColor = isLow
                  ? 'text-emerald-600'
                  : isMed
                  ? 'text-amber-600'
                  : 'text-rose-600';

                return (
                  <tr
                    key={bid.bid_id}
                    className={`transition ${
                      isAwarded
                        ? 'bg-purple-50/50 font-medium'
                        : isRejected
                        ? 'opacity-60 bg-slate-50/70'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Company Name & Link */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <Link
                          to={`/bidder/${bid.bidder_id}`}
                          className="font-bold text-slate-900 hover:text-blue-600 text-sm transition flex items-center space-x-1"
                        >
                          <span>{bid.company_name}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          GSTIN: {bid.gstin}
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="px-5 py-4 text-right font-mono font-bold text-sm text-slate-900">
                      {formatCurrency(bid.bid_amount)}
                      {index === 0 && sortBy === 'price' && (
                        <span className="block text-[10px] text-blue-600 font-sans font-semibold">L1 Lowest Price</span>
                      )}
                    </td>

                    {/* Compliance Score */}
                    <td className="px-5 py-4 text-center font-mono">
                      <span className={`text-base font-extrabold ${scoreColor}`}>
                        {comp ? comp.score : '--'}
                      </span>
                      <span className="text-[11px] text-slate-400 font-normal">/100</span>
                    </td>

                    {/* Risk Badge */}
                    <td className="px-5 py-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold font-mono border ${riskBadge}`}>
                        {comp?.risk} Risk
                      </span>
                    </td>

                    {/* AI Recommendation */}
                    <td className="px-5 py-4 text-center font-semibold text-slate-700">
                      {comp?.recommendation}
                    </td>

                    {/* Bid Status */}
                    <td className="px-5 py-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono font-semibold ${
                          isAwarded
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : isRejected
                            ? 'bg-slate-200 text-slate-600'
                            : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}
                      >
                        {bid.status}
                      </span>
                    </td>

                    {/* Award Action */}
                    <td className="px-5 py-4 text-right">
                      {isTenderAwarded ? (
                        <span className="text-xs text-slate-400 font-mono">
                          {isAwarded ? '🏆 Contract Awarded' : '—'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          disabled={awardingId === bid.bidder_id}
                          onClick={() => handleAward(bid.bidder_id, bid.company_name)}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cpcl-navy hover:bg-slate-800 text-white shadow transition disabled:opacity-50"
                        >
                          {awardingId === bid.bidder_id ? 'Awarding...' : 'Award to this bidder'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            Current View: <strong>{sortBy === 'compliance' ? 'Best Compliance Score First' : 'Lowest Price (L1) First'}</strong>
          </span>
          <span className="font-mono text-[11px]">Total Submitted Bids: {bids.length}</span>
        </div>
      </div>
    </div>
  );
}
