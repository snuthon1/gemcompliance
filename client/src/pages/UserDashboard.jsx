import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Upload,
  Send,
  ExternalLink,
  RefreshCw,
  Award,
  Layers,
  HelpCircle,
  ChevronRight,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export default function UserDashboard() {
  const [bidders, setBidders] = useState([]);
  const [selectedBidderId, setSelectedBidderId] = useState(() => {
    return localStorage.getItem('bidshield_active_vendor_id') || '';
  });
  const [currentBidder, setCurrentBidder] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [bids, setBids] = useState([]);
  const [openTenders, setOpenTenders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);

  // New Bid Form State
  const [selectedTenderForBid, setSelectedTenderForBid] = useState('');
  const [bidQuoteAmount, setBidQuoteAmount] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidFeedback, setBidFeedback] = useState(null);

  // Document Upload State
  const [uploadDocType, setUploadDocType] = useState('GST_CERT');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState(null);

  // 1. Fetch all bidders to populate the Vendor Switcher
  useEffect(() => {
    async function loadBidders() {
      try {
        const res = await fetch('/api/bidders');
        const data = await res.json();
        if (data.success && data.bidders.length > 0) {
          setBidders(data.bidders);
          if (!selectedBidderId || !data.bidders.some(b => b.bidder_id === selectedBidderId)) {
            const defaultId = data.bidders[0].bidder_id;
            setSelectedBidderId(defaultId);
            localStorage.setItem('bidshield_active_vendor_id', defaultId);
          }
        }
      } catch (err) {
        console.error('Failed to load bidders:', err);
      }
    }
    loadBidders();
  }, []);

  // 2. Fetch bidder-specific data whenever selectedBidderId changes
  const loadVendorData = async (bidderId) => {
    if (!bidderId) return;
    setLoading(true);
    setBidFeedback(null);
    setUploadFeedback(null);

    try {
      const [bidderRes, compRes, bidsRes, tendersRes, auditRes, docsRes] = await Promise.all([
        fetch(`/api/bidders/${bidderId}`),
        fetch(`/api/bidders/${bidderId}/compliance`),
        fetch(`/api/bidders/${bidderId}/bids`),
        fetch('/api/tenders'),
        fetch(`/api/bidders/${bidderId}/audit-log`),
        fetch(`/api/bidders/${bidderId}/documents`)
      ]);

      const [bData, cData, bidsData, tData, aData, dData] = await Promise.all([
        bidderRes.json(),
        compRes.json(),
        bidsRes.json(),
        tendersRes.json(),
        auditRes.json(),
        docsRes.json()
      ]);

      if (bData.success) setCurrentBidder(bData.bidder);
      if (cData.success) setCompliance(cData);
      if (bidsData.success) setBids(bidsData.bids);
      if (tData.success) setOpenTenders(tData.tenders);
      if (aData.success) setAuditLogs(aData.auditLogs);
      if (dData.success) setDocuments(dData.documents);
    } catch (err) {
      console.error('Failed loading vendor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedBidderId) {
      loadVendorData(selectedBidderId);
    }
  }, [selectedBidderId]);

  const handleVendorSwitch = (id) => {
    setSelectedBidderId(id);
    localStorage.setItem('bidshield_active_vendor_id', id);
  };

  const handleReverify = async () => {
    if (!selectedBidderId) return;
    setReverifying(true);
    try {
      const res = await fetch(`/api/bidders/${selectedBidderId}/verify`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCompliance(data);
        await loadVendorData(selectedBidderId);
      }
    } catch (err) {
      console.error('Re-verification failed:', err);
    } finally {
      setReverifying(false);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTenderForBid || !bidQuoteAmount) {
      alert('Please select an open tender and enter quotation amount.');
      return;
    }
    setSubmittingBid(true);
    setBidFeedback(null);

    try {
      const res = await fetch(`/api/tenders/${selectedTenderForBid}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bidder_id: selectedBidderId,
          bid_amount: parseFloat(bidQuoteAmount)
        })
      });
      const data = await res.json();
      if (data.success) {
        setBidFeedback({ type: 'success', text: 'Quotation submitted successfully and logged in audit ledger!' });
        setBidQuoteAmount('');
        setSelectedTenderForBid('');
        await loadVendorData(selectedBidderId);
      } else {
        setBidFeedback({ type: 'error', text: data.message || 'Failed to submit quotation.' });
      }
    } catch (err) {
      setBidFeedback({ type: 'error', text: 'Network error submitting bid.' });
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a certificate/document file to upload.');
      return;
    }
    setUploadingDoc(true);
    setUploadFeedback(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('doc_type', uploadDocType);

    try {
      const res = await fetch(`/api/bidders/${selectedBidderId}/documents`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadFeedback({
          type: 'success',
          text: `Document uploaded and verified via AI! ${data.document?.flagged ? '⚠️ Discrepancy detected.' : '✅ Validated.'}`
        });
        setUploadFile(null);
        await loadVendorData(selectedBidderId);
      } else {
        setUploadFeedback({ type: 'error', text: data.message || 'Upload failed.' });
      }
    } catch (err) {
      setUploadFeedback({ type: 'error', text: 'Failed to upload document.' });
    } finally {
      setUploadingDoc(false);
    }
  };

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const isLowRisk = compliance?.risk === 'Low';
  const isMediumRisk = compliance?.risk === 'Medium';
  const isHighRisk = compliance?.risk === 'High';

  // Latest officer decision
  const latestOfficerDecision = auditLogs.find(l => l.action === 'OFFICER_DECISION');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. Header & Vendor Switcher Bar */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-cpcl-orange text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
              Vendor Portal
            </span>
            <span className="text-xs text-slate-500 font-medium">GeM Pre-Qualification & Self-Audit Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center space-x-2">
            <span>{currentBidder ? currentBidder.company_name : 'Loading Profile...'}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {currentBidder?.registered_address} &bull; {currentBidder?.email} &bull; {currentBidder?.phone}
          </p>
        </div>

        {/* Vendor Selector Dropdown (Quick Persona Switch) */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="bg-slate-50 border border-slate-300 rounded-lg p-2 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-slate-600" />
            <label htmlFor="vendor-select" className="text-xs font-semibold text-slate-700">
              Active Vendor:
            </label>
            <select
              id="vendor-select"
              value={selectedBidderId}
              onChange={(e) => handleVendorSwitch(e.target.value)}
              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-cpcl-orange cursor-pointer"
            >
              {bidders.map((b) => (
                <option key={b.bidder_id} value={b.bidder_id}>
                  {b.company_name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleReverify}
            disabled={reverifying}
            className="inline-flex items-center justify-center space-x-1.5 bg-cpcl-navy hover:bg-slate-800 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow transition disabled:opacity-50"
            title="Re-run self compliance verification against registry databases"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reverifying ? 'animate-spin' : ''}`} />
            <span>{reverifying ? 'Verifying...' : 'Self-Audit Score'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-cpcl-orange border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm font-medium">Loading vendor credentials, compliance health, and bids...</p>
        </div>
      ) : (
        <>
          {/* 2. Statutory Compliance Scorecard Banner */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Scorecard Box */}
            <div
              className={`p-6 rounded-xl border shadow-sm flex flex-col justify-between ${
                isLowRisk
                  ? 'bg-emerald-50/70 border-emerald-300 text-emerald-900'
                  : isMediumRisk
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                  : 'bg-rose-50/70 border-rose-300 text-rose-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Pre-Qualification Score
                  </span>
                  <ShieldCheck
                    className={`w-5 h-5 ${
                      isLowRisk ? 'text-emerald-600' : isMediumRisk ? 'text-amber-600' : 'text-rose-600'
                    }`}
                  />
                </div>
                <div className="mt-3 flex items-baseline space-x-2">
                  <span className="text-4xl font-extrabold font-mono">{compliance?.score ?? '—'}</span>
                  <span className="text-sm font-semibold text-slate-500">/ 100</span>
                </div>
                <div className="mt-2 text-xs font-bold">
                  Status: <span className="underline">{compliance?.recommendation || 'Pending'}</span>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-black/10 text-[11px] text-slate-600 font-medium">
                Risk Classification: <strong className="font-bold">{compliance?.risk} Risk</strong>
              </div>
            </div>

            {/* Statutory Identifiers Summary */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Statutory Registrations
                </span>
                <div className="space-y-2 mt-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-sans">GSTIN:</span>
                    <span className="font-bold text-slate-800">{currentBidder?.gstin}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-100 pb-1">
                    <span className="text-slate-500 font-sans">PAN:</span>
                    <span className="font-bold text-slate-800">{currentBidder?.pan_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-sans">Udyam:</span>
                    <span className="font-bold text-slate-800">{currentBidder?.udyam_number}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 text-[10px] text-slate-400 font-medium">
                Verified against GSTN, Income Tax & MSME databanks.
              </div>
            </div>

            {/* Bidding Summary */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Commercial Bids Activity
                </span>
                <div className="mt-2 text-3xl font-extrabold text-slate-900 font-mono">
                  {bids.length}
                  <span className="text-xs font-semibold text-slate-400 font-sans ml-2">Total Submissions</span>
                </div>
                <div className="mt-3 flex items-center space-x-2 text-xs">
                  <span className="bg-purple-50 text-purple-700 font-bold px-2 py-0.5 rounded border border-purple-200 font-mono">
                    {bids.filter(b => b.status === 'Awarded').length} Awarded
                  </span>
                  <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200 font-mono">
                    {bids.filter(b => b.status === 'Submitted').length} Active
                  </span>
                </div>
              </div>
              <div className="mt-3 pt-2 text-[10px] text-slate-400">
                Participation in CPCL refinery tenders.
              </div>
            </div>

            {/* Officer Action / Committee Notes */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Procurement Committee Status
                </span>
                {latestOfficerDecision ? (
                  <div className="mt-2 space-y-1">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase font-mono ${
                        latestOfficerDecision.details.includes('Approved')
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : latestOfficerDecision.details.includes('Rejected')
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {latestOfficerDecision.details.split('.')[0]?.replace('Decision:', '').trim()}
                    </span>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {latestOfficerDecision.details}
                    </p>
                  </div>
                ) : (
                  <div className="mt-2 text-xs text-slate-500 italic">
                    No officer review notes recorded yet. Pre-qualification in progress.
                  </div>
                )}
              </div>
              <div className="mt-3 pt-2 text-[10px] text-slate-400 font-mono">
                CPCL Tender Evaluation Committee
              </div>
            </div>
          </div>

          {/* 3. Advisory Warnings (If Any) */}
          {compliance?.flags && compliance.flags.length > 0 && (
            <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-5 shadow-sm">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wide text-rose-900">
                    Statutory Action Required ({compliance.flags.length} Flags Detected)
                  </h4>
                  <ul className="text-xs space-y-1 text-rose-800">
                    {compliance.flags.map((flag, idx) => (
                      <li key={idx}>&bull; {flag}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-rose-700 pt-1 font-medium">
                    Resolve these discrepancies before final commercial bid opening to maintain Compliant status.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 4. The 6-Point Statutory Readiness Matrix */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-cpcl-orange" />
                  <span>Statutory Compliance 6-Pillar Health Check</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Automated portal checks against official Government of India registries
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-200 px-2.5 py-1 rounded text-slate-700">
                Weights: 100 Pts
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {compliance?.breakdown && compliance.breakdown.length > 0 ? (
                compliance.breakdown.map((item) => {
                  const isMatch = item.match_status === 'Match';
                  return (
                    <div
                      key={item.check_type}
                      className={`p-4 rounded-lg border transition ${
                        isMatch
                          ? 'bg-emerald-50/40 border-emerald-200'
                          : 'bg-rose-50/50 border-rose-200 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-800">{item.check_type.replace('_', ' ')}</span>
                        {isMatch ? (
                          <span className="inline-flex items-center text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Pass
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            <XCircle className="w-3 h-3 mr-1" />
                            Deficit
                          </span>
                        )}
                      </div>
                      <div className="text-xs space-y-1 text-slate-600 font-mono">
                        <div>
                          <span className="text-slate-400 font-sans">Doc Value:</span>{' '}
                          <span className="font-semibold text-slate-800">{item.document_value || '—'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 font-sans">Portal Record:</span>{' '}
                          <span className="font-semibold text-slate-800">{item.portal_value || '—'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-3 text-center py-6 text-xs text-slate-500">
                  No breakdown records available. Click "Self-Audit Score" to evaluate.
                </div>
              )}
            </div>
          </div>

          {/* 5. My Tender Submissions Table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-cpcl-orange" />
                  <span>My Tender Submissions & Live Status</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Bids quoted by {currentBidder?.company_name} across CPCL procurement tenders
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded border border-blue-200">
                {bids.length} Total Bids
              </span>
            </div>

            {bids.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-xs">
                You have not submitted any bids yet. Choose an open tender below to participate.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Tender Title</th>
                      <th className="px-5 py-3.5">Department</th>
                      <th className="px-5 py-3.5 text-right">My Quoted Amount</th>
                      <th className="px-5 py-3.5 text-right">Est. Value</th>
                      <th className="px-5 py-3.5 text-center">Submission Date</th>
                      <th className="px-5 py-3.5 text-center">Bid Status</th>
                      <th className="px-5 py-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {bids.map((b) => {
                      const isAwarded = b.status === 'Awarded';
                      const isRejected = b.status === 'Rejected';
                      const tender = b.tender;

                      return (
                        <tr key={b.bid_id} className="hover:bg-slate-50 transition">
                          <td className="px-6 py-4 font-semibold text-slate-900 max-w-xs">
                            <Link
                              to={`/tenders/${b.tender_id}`}
                              className="hover:text-blue-600 flex items-center space-x-1"
                            >
                              <span>{tender?.title || `Tender Ref: ${b.tender_id.substring(0, 8)}`}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-slate-500 font-medium">
                            {tender?.department || 'CPCL Procurement'}
                          </td>
                          <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 text-sm">
                            {formatINR(b.bid_amount)}
                          </td>
                          <td className="px-5 py-4 text-right font-mono text-slate-600">
                            {tender?.estimated_value ? formatINR(tender.estimated_value) : '—'}
                          </td>
                          <td className="px-5 py-4 text-center font-mono text-slate-500">
                            {formatDate(b.submitted_at)}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span
                              className={`inline-block px-2.5 py-1 rounded text-xs font-bold font-mono border ${
                                isAwarded
                                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                                  : isRejected
                                  ? 'bg-rose-100 text-rose-800 border-rose-200'
                                  : 'bg-blue-50 text-blue-700 border border-blue-200'
                              }`}
                            >
                              {isAwarded ? '🏆 Awarded' : isRejected ? '❌ Rejected' : '⏳ Submitted'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <Link
                              to={`/tenders/${b.tender_id}`}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                            >
                              View Matrix &rarr;
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 6. Two-Column Workspace: Quick Bid Submission & Document Locker */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Bid Submission Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Send className="w-5 h-5 text-cpcl-orange" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Submit / Revise Tender Quotation
                  </h3>
                  <p className="text-xs text-slate-500">Quote commercial pricing for CPCL refinery tenders</p>
                </div>
              </div>

              {bidFeedback && (
                <div
                  className={`p-3 rounded text-xs font-semibold ${
                    bidFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {bidFeedback.text}
                </div>
              )}

              <form onSubmit={handleBidSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Target Tender:
                  </label>
                  <select
                    value={selectedTenderForBid}
                    onChange={(e) => setSelectedTenderForBid(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-cpcl-orange"
                    required
                  >
                    <option value="">-- Choose an Open Tender --</option>
                    {openTenders.map((t) => (
                      <option key={t.tender_id} value={t.tender_id}>
                        {t.title} (Est: {formatINR(t.estimated_value)}) &bull; Status: {t.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Quoted Commercial Amount (₹ INR):
                  </label>
                  <input
                    type="number"
                    value={bidQuoteAmount}
                    onChange={(e) => setBidQuoteAmount(e.target.value)}
                    placeholder="e.g. 4250000"
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-cpcl-orange"
                    required
                    min="1"
                  />
                </div>

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={submittingBid}
                    className="w-full bg-cpcl-orange hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-lg shadow transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingBid ? 'Submitting Quotation...' : 'Transmit Sealed Bid'}</span>
                  </button>
                  <p className="text-[10px] text-slate-400 text-center mt-1.5 font-mono">
                    Stamped with bidder timestamp in CPCL immutable audit ledger.
                  </p>
                </div>
              </form>
            </div>

            {/* Document Locker & Upload */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                <Upload className="w-5 h-5 text-cpcl-orange" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Statutory Document Locker
                  </h3>
                  <p className="text-xs text-slate-500">Upload certificates for autonomous OCR extraction & verification</p>
                </div>
              </div>

              {uploadFeedback && (
                <div
                  className={`p-3 rounded text-xs font-semibold ${
                    uploadFeedback.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {uploadFeedback.text}
                </div>
              )}

              <form onSubmit={handleDocUpload} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Document Type:
                    </label>
                    <select
                      value={uploadDocType}
                      onChange={(e) => setUploadDocType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                    >
                      <option value="GST_CERT">GST Registration Certificate</option>
                      <option value="PAN_CARD">PAN Card Copy</option>
                      <option value="UDYAM_CERT">MSME Udyam Certificate</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                      Choose PDF / Image:
                    </label>
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      onChange={(e) => setUploadFile(e.target.files[0])}
                      className="w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 cursor-pointer"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={uploadingDoc}
                  className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2.5 rounded-lg shadow transition disabled:opacity-50 flex items-center justify-center space-x-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{uploadingDoc ? 'Extracting via AI...' : 'Upload & Verify Document'}</span>
                </button>
              </form>

              {/* Uploaded Documents List */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Stored Documents ({documents.length})
                </span>
                {documents.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No documents uploaded yet.</p>
                ) : (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {documents.map((doc) => (
                      <div
                        key={doc.doc_id}
                        className="p-2.5 rounded border border-slate-200 bg-slate-50 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-slate-500" />
                          <span className="font-bold text-slate-800">{doc.doc_type}</span>
                          <span className="text-[10px] text-slate-400">
                            {formatDate(doc.uploaded_at)}
                          </span>
                        </div>
                        {doc.flagged ? (
                          <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Flagged
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
