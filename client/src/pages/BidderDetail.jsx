import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  ShieldAlert,
  UserCheck,
  Check,
  Ban,
  HelpCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  History,
  Send,
  Upload,
  Sparkles,
  Cpu,
  ExternalLink,
  FileCheck2,
  FileCode2,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const HUMAN_CHECK_NAMES = {
  UDYAM_STATUS: 'MSME Udyam Registration Status',
  GST_STATUS: 'GSTN Registration Validity',
  GST_RETURNS: 'GST Returns Filing Up-to-Date',
  PAN_COMPLIANCE: 'Income Tax Return (ITR) Compliance',
  BLACKLIST_CHECK: 'Central Debarment / MoPNG Vigilance Check',
  NAME_MATCH: 'Document-to-Portal Legal Entity Name Match'
};

export default function BidderDetail() {
  const { bidder_id } = useParams();
  const { user } = useAuth();
  const [bidder, setBidder] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  // Officer Decision State
  const [decisionNotes, setDecisionNotes] = useState('');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [latestDecision, setLatestDecision] = useState(null);
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState(null);

  // Documents & Extraction State
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadDocType, setUploadDocType] = useState('GST_CERT');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [expandedJsonDocId, setExpandedJsonDocId] = useState(null);
  const fileInputRef = useRef(null);

  // Collapsible Audit Trail State
  const [isAuditOpen, setIsAuditOpen] = useState(true);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // 1. Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setLoadingAudit(true);
    try {
      const res = await fetch(`/api/bidders/${bidder_id}/audit-log`);
      const data = await res.json();
      if (data.success) {
        setAuditLogs(data.auditLogs);

        // Check if there is already a recent officer decision in logs
        const lastDec = data.auditLogs.find((l) => l.action === 'OFFICER_DECISION');
        if (lastDec) {
          setLatestDecision(lastDec);
        }
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingAudit(false);
    }
  };

  // 2. Fetch Documents
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch(`/api/bidders/${bidder_id}/documents`);
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  // 3. Load all initial bidder data
  const loadBidderData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch bidder details
      const bRes = await fetch(`/api/bidders/${bidder_id}`);
      const bData = await bRes.json();
      if (!bData.success) {
        throw new Error(bData.message || 'Bidder not found');
      }
      setBidder(bData.bidder);

      // Fetch compliance data
      let cRes = await fetch(`/api/bidders/${bidder_id}/compliance`);
      if (cRes.status === 404) {
        cRes = await fetch(`/api/bidders/${bidder_id}/verify`, { method: 'POST' });
      }
      const cData = await cRes.json();
      if (cData.success) {
        setCompliance(cData);
      }

      // Fetch documents
      await fetchDocuments();

      // Fetch audit logs
      await fetchAuditLogs();
    } catch (err) {
      setError(err.message || 'Failed to load bidder data');
    } finally {
      setLoading(false);
    }
  };

  // 4. Re-run Verification
  const handleRerunVerification = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/bidders/${bidder_id}/verify`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCompliance(data);
        // Automatically refresh audit trail
        await fetchAuditLogs();
      }
    } catch (err) {
      console.error('Failed to rerun verification', err);
    } finally {
      setVerifying(false);
    }
  };

  // 5. Submit Officer Decision via real POST /api/bidders/:bidder_id/decision
  const handleOfficerDecisionSubmit = async (actionType) => {
    setSubmittingDecision(true);
    setDecisionSuccessMsg(null);
    try {
      const res = await fetch(`/api/bidders/${bidder_id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: actionType,
          remarks: decisionNotes
        })
      });

      const data = await res.json();
      if (data.success) {
        setLatestDecision(data.auditLog);
        setDecisionSuccessMsg(`Decision successfully registered and stamped into immutable audit trail.`);
        setDecisionNotes('');
        // Automatically refresh audit trail
        await fetchAuditLogs();
      } else {
        alert(data.message || 'Failed to submit decision');
      }
    } catch (err) {
      console.error('Error submitting officer decision:', err);
    } finally {
      setSubmittingDecision(false);
    }
  };

  // 6. Handle Document Upload & Extraction
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a document file to upload.');
      return;
    }

    setUploading(true);
    setUploadMsg(null);

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('doc_type', uploadDocType);

    try {
      const res = await fetch(`/api/bidders/${bidder_id}/documents`, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (data.success) {
        const method = data.document?.extracted_data?.extraction_method;
        const methodLabel = method === 'live_ai' ? 'Live Vision AI' : 'Mock Fallback Mode';
        setUploadMsg({
          type: 'success',
          text: `Document uploaded and extracted successfully via ${methodLabel}! ${data.document?.flagged ? '⚠️ Discrepancy detected and flagged.' : ''}`
        });

        // Reset file input
        setUploadFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Refresh documents and audit trail
        await fetchDocuments();
        await fetchAuditLogs();
      } else {
        setUploadMsg({
          type: 'error',
          text: data.message || 'Failed to upload document.'
        });
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadMsg({
        type: 'error',
        text: 'Network error occurred while uploading document.'
      });
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    loadBidderData();
  }, [bidder_id]);

  // Format date helper
  const formatTimestamp = (isoString) => {
    if (!isoString) return 'Just now';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-slate-500">
        <div className="w-9 h-9 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium">Loading bidder profile and portal checks...</p>
      </div>
    );
  }

  if (error || !bidder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-6 text-center text-rose-800">
          <p className="font-semibold text-sm">{error || 'Bidder not found'}</p>
          <Link to="/" className="inline-block mt-3 text-xs bg-rose-600 text-white px-3 py-1.5 rounded hover:bg-rose-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Risk Theme
  const isLow = compliance?.risk === 'Low';
  const isMed = compliance?.risk === 'Medium';
  const isHigh = compliance?.risk === 'High';

  const badgeBg = isLow
    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
    : isMed
    ? 'bg-amber-50 text-amber-800 border-amber-300'
    : 'bg-rose-50 text-rose-800 border-rose-300';

  const scoreTextColor = isLow
    ? 'text-emerald-600'
    : isMed
    ? 'text-amber-600'
    : 'text-rose-600';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Breadcrumb & Live Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-blue-600 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Participating Bidders</span>
        </Link>

        <button
          onClick={handleRerunVerification}
          disabled={verifying}
          className="inline-flex items-center space-x-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-2 rounded-lg shadow-sm transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
          <span>{verifying ? 'Re-verifying with Portals...' : 'Re-run Verification Engine'}</span>
        </button>
      </div>

      {/* SECTION 1: HEADER & SCORE HERO BADGE */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {bidder.bidder_id}
              </span>
              <span className="text-xs text-slate-400">Registered: {new Date(bidder.created_at).toLocaleDateString()}</span>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {bidder.company_name}
            </h1>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-slate-600 pt-1">
              <span>GSTIN: <strong className="text-slate-800">{bidder.gstin}</strong></span>
              <span>&bull;</span>
              <span>PAN: <strong className="text-slate-800">{bidder.pan_number}</strong></span>
              <span>&bull;</span>
              <span>Udyam: <strong className="text-slate-800">{bidder.udyam_number}</strong></span>
            </div>

            <p className="text-xs text-slate-500 pt-1">
              {bidder.registered_address} &bull; {bidder.email} &bull; {bidder.phone}
            </p>
          </div>

          {/* Compliance Dial / Score Card */}
          <div className={`flex items-center p-4 rounded-xl border ${badgeBg} shadow-sm shrink-0 min-w-[260px] justify-between`}>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-0.5">
                AI Statutory Compliance
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className={`text-4xl font-extrabold font-mono ${scoreTextColor}`}>
                  {compliance?.score ?? '—'}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ 100</span>
              </div>
              <div className="mt-1 text-xs font-semibold">
                Risk Tier: <span className="underline decoration-current">{compliance?.risk}</span>
              </div>
            </div>

            <div className="text-right pl-4 border-l border-slate-200">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Recommendation
              </span>
              <span className={`inline-block px-2.5 py-1 rounded text-xs font-bold ${
                isLow
                  ? 'bg-emerald-600 text-white'
                  : isMed
                  ? 'bg-amber-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}>
                {compliance?.recommendation || 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: PLAIN-ENGLISH VERIFICATION FINDING */}
      {compliance?.flags && compliance.flags.length > 0 ? (
        <div className={`p-4 rounded-lg border flex items-start space-x-3 ${
          isHigh ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isHigh ? 'text-rose-600' : 'text-amber-600'}`} />
          <div className="space-y-1">
            <h4 className={`text-xs font-bold uppercase tracking-wide ${isHigh ? 'text-rose-900' : 'text-amber-900'}`}>
              Statutory Discrepancy & Fraud Advisory Flags ({compliance.flags.length})
            </h4>
            <ul className="text-xs space-y-1">
              {compliance.flags.map((flag, idx) => (
                <li key={idx} className={isHigh ? 'text-rose-800' : 'text-amber-800'}>
                  &bull; {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-900">
              All 6 Statutory Cross-Checks Verified
            </h4>
            <p className="text-xs text-emerald-800">
              No registry mismatches or MoPNG vigilance debarments found. Bidder credentials align 100% across Udyam, GSTN, and Income Tax databases.
            </p>
          </div>
        </div>
      )}

      {/* SECTION 3: DETAILED 6-POINT STATUTORY COMPARISON TABLE */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4 text-slate-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Cross-Registry Verification Ledger (6 Multi-Source Checks)
            </h3>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Synced with Central Registry Databases
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="px-6 py-3">Statutory Verification Check</th>
                <th className="px-6 py-3">Check Severity</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Bidder Submission Value</th>
                <th className="px-6 py-3">Government Registry Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-700">
              {compliance?.verificationResults?.map((check) => {
                const isMatch = check.match_status === 'Match';
                const sevColor =
                  check.severity === 'Critical'
                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                    : check.severity === 'Major'
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-slate-600 bg-slate-50 border-slate-200';

                return (
                  <tr key={check.check_id} className={!isMatch ? 'bg-rose-50/30' : 'hover:bg-slate-50/50'}>
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      <div>{HUMAN_CHECK_NAMES[check.check_type] || check.check_type}</div>
                      <div className="text-[10px] font-mono text-slate-400">{check.check_type}</div>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${sevColor}`}>
                        {check.severity}
                      </span>
                    </td>

                    <td className="px-6 py-3.5">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isMatch
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {isMatch ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                        <span>{check.match_status}</span>
                      </span>
                    </td>

                    <td className="px-6 py-3.5 font-mono text-slate-700 max-w-sm break-words">
                      <div className="bg-slate-50 p-1.5 rounded border border-slate-200">
                        {check.document_value || 'None'}
                      </div>
                    </td>

                    <td className="px-6 py-3.5 font-mono text-slate-700 max-w-sm break-words">
                      <div className={`p-1.5 rounded border ${isMatch ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200 text-rose-900 font-semibold'}`}>
                        {check.portal_value || 'None'}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 4: DOCUMENTS & AI VISION EXTRACTION */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <FileCheck2 className="w-5 h-5 text-brand-600" />
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Statutory Documents & Vision AI Extraction
              </h3>
              <p className="text-[11px] text-slate-500">
                Upload certificates (GST REG-06, PAN Card, Udyam) for optical field parsing and registration verification.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-200 text-slate-700 px-2.5 py-1 rounded">
            {documents.length} Documents On Record
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload Form */}
          <form onSubmit={handleFileUpload} className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Upload Certificate for AI Extraction</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Document Type Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Type
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="GST_CERT">GST Registration Certificate (GST REG-06)</option>
                  <option value="PAN_CARD">Permanent Account Number (PAN Card)</option>
                  <option value="UDYAM_CERT">MSME Udyam Registration Certificate</option>
                </select>
              </div>

              {/* File Selector */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Document Image / PDF
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded bg-white p-1"
                  />
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="inline-flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded shadow transition disabled:opacity-50 shrink-0"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Extracting...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload & Analyze</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {uploadMsg && (
              <div
                className={`text-xs p-3 rounded border flex items-center space-x-2 ${
                  uploadMsg.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {uploadMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                )}
                <span>{uploadMsg.text}</span>
              </div>
            )}
          </form>

          {/* List of Previously Uploaded Documents */}
          {loadingDocs ? (
            <div className="text-center py-6 text-slate-500 text-xs">
              <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
              Loading verified documents...
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-500 text-xs">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold">No statutory documents uploaded yet for this bidder.</p>
              <p className="text-[11px] text-slate-400">Upload a certificate above to trigger automated vision extraction.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => {
                const extData = doc.extracted_data || {};
                const isLiveAi = extData.extraction_method === 'live_ai';
                const isLocalOcr = extData.extraction_method === 'local_ocr';
                const isExpanded = expandedJsonDocId === doc.doc_id;

                return (
                  <div
                    key={doc.doc_id}
                    className={`rounded-lg border p-4 transition ${
                      doc.flagged
                        ? 'border-rose-300 bg-rose-50/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    {/* Document Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold uppercase bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {doc.doc_type}
                        </span>
                        <span className="text-xs text-slate-500 font-mono">
                          {doc.file_url.split('/').pop()}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-400">{formatTimestamp(doc.uploaded_at)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* AI vs OCR vs Mock Method Badge */}
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            isLiveAi
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : isLocalOcr
                              ? 'bg-sky-50 text-sky-800 border-sky-300'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200'
                          }`}
                        >
                          {isLiveAi ? (
                            <>
                              <Sparkles className="w-3 h-3 text-emerald-600" />
                              <span>Live Cloud AI</span>
                            </>
                          ) : isLocalOcr ? (
                            <>
                              <Cpu className="w-3 h-3 text-sky-600" />
                              <span>Real Optical OCR (Tesseract{extData.ocr_confidence ? ` • ${extData.ocr_confidence}% Conf` : ''})</span>
                            </>
                          ) : (
                            <>
                              <Cpu className="w-3 h-3 text-indigo-600" />
                              <span>Mock Fallback Mode</span>
                            </>
                          )}
                        </span>

                        <a
                          href={doc.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                        >
                          <span>View File</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {/* Flagged Warning Banner */}
                    {doc.flagged && (
                      <div className="mt-3 p-3 rounded bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">
                            ⚠️ Discrepancy Flag: {doc.flag_reason || 'Uploaded document name does not match bidder registration'}
                          </p>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            Extracted Name: &ldquo;{extData.entity_name}&rdquo; vs Bidder Registration: &ldquo;{bidder.company_name}&rdquo;. Flagged for manual review.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Extracted Key-Value Fields */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Document Type
                        </span>
                        <span className="font-semibold text-slate-800">
                          {extData.document_type || '—'}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Entity Name
                        </span>
                        <span className={`font-semibold ${doc.flagged ? 'text-rose-700 font-bold' : 'text-slate-800'}`}>
                          {extData.entity_name || '—'}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Registration / Certificate Number
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {extData.registration_number || '—'}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Registration Date
                        </span>
                        <span className="font-medium text-slate-700">
                          {extData.registration_date || '—'}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Expiry Date
                        </span>
                        <span className="font-medium text-slate-700">
                          {extData.expiry_date || 'Permanent / No Expiry'}
                        </span>
                      </div>

                      <div className="p-2 bg-slate-50 rounded border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Issuing Statutory Authority
                        </span>
                        <span className="font-medium text-slate-700 truncate block" title={extData.issuing_authority}>
                          {extData.issuing_authority || '—'}
                        </span>
                      </div>
                    </div>

                    {/* Raw OCR Transcript if available */}
                    {extData.raw_text_snippet && (
                      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded text-xs text-slate-700">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                          Optical OCR Transcribed Snippet
                        </span>
                        <p className="font-mono text-[11px] text-slate-800 bg-white p-2 rounded border border-slate-200 line-clamp-2" title={extData.raw_text_snippet}>
                          &ldquo;{extData.raw_text_snippet}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Toggle JSON View */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => setExpandedJsonDocId(isExpanded ? null : doc.doc_id)}
                        className="inline-flex items-center space-x-1 text-[11px] text-slate-500 hover:text-slate-800 font-mono"
                      >
                        <FileCode2 className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Raw JSON' : 'View Extracted JSON'}</span>
                      </button>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Doc ID: {doc.doc_id}
                      </span>
                    </div>

                    {isExpanded && (
                      <pre className="mt-2 p-3 bg-slate-900 text-slate-100 text-[11px] font-mono rounded overflow-x-auto">
                        {JSON.stringify(extData, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* SECTION 5: OFFICER DECISION PANEL (HUMAN-IN-THE-LOOP - PERSISTED VIA POST /decision) */}
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-800 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/10 gap-2 mb-4">
          <div className="flex items-center space-x-2.5">
            <span className="bg-brand-500 text-white text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded tracking-wider">
              Human-in-the-Loop
            </span>
            <h3 className="text-base font-bold text-white tracking-wide flex items-center space-x-2">
              <UserCheck className="w-5 h-5 text-brand-400" />
              <span>Procurement Officer Final Determination</span>
            </h3>
          </div>
          <span className="text-xs text-slate-300">
            Authenticated as: <strong className="text-white">{user?.name || 'Demo Procurement Officer'}</strong>
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          <strong>Mandatory Governance Requirement:</strong> The AI score ({compliance?.score}/100) and recommendation ({compliance?.recommendation}) are strictly decision-support advisories. The binding commercial award or disqualification remains exclusively with the Tender Committee Officer.
        </p>

        {/* Existing / Saved Decision Banner */}
        {latestDecision && (
          <div className="mb-4 bg-white/10 border border-white/20 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span className="text-xs text-slate-300 font-medium">Recorded Determination:</span>
                <span className="text-xs font-bold text-white uppercase tracking-wider bg-brand-600 px-2.5 py-0.5 rounded">
                  {latestDecision.details.split('.')[0]?.replace('Decision:', '').trim()}
                </span>
              </div>
              <p className="text-xs text-slate-200">
                {latestDecision.details} &bull; <span className="text-slate-400">{formatTimestamp(latestDecision.timestamp)}</span>
              </p>
            </div>
            <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/60 px-2 py-1 rounded border border-emerald-700/60 shrink-0">
              Stamped in Audit Trail
            </span>
          </div>
        )}

        {/* Decision Submission Box */}
        <div className="space-y-4 bg-white/5 p-4 rounded-lg border border-white/10">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-200 mb-1.5">
              Officer Evaluation Justification / Committee Notes:
            </label>
            <textarea
              rows="3"
              value={decisionNotes}
              onChange={(e) => setDecisionNotes(e.target.value)}
              placeholder="Record procurement officer rationale, regulatory exceptions, or specific clarification instructions..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg p-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500 font-mono"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-400">
              {submittingDecision ? 'Signing decision into audit ledger...' : 'Execute final officer action:'}
            </span>

            <div className="flex items-center space-x-2.5">
              <button
                type="button"
                disabled={submittingDecision}
                onClick={() => handleOfficerDecisionSubmit('Approved')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Approve Bidder</span>
              </button>

              <button
                type="button"
                disabled={submittingDecision}
                onClick={() => handleOfficerDecisionSubmit('Clarification Requested')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow transition disabled:opacity-50"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Request Clarification</span>
              </button>

              <button
                type="button"
                disabled={submittingDecision}
                onClick={() => handleOfficerDecisionSubmit('Rejected')}
                className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow transition disabled:opacity-50"
              >
                <Ban className="w-4 h-4" />
                <span>Reject Bidder</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 6: IMMUTABLE AUDIT TRAIL TIMELINE (COLLAPSIBLE) */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <button
          onClick={() => setIsAuditOpen(!isAuditOpen)}
          className="w-full px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between text-left hover:bg-slate-100/70 transition"
        >
          <div className="flex items-center space-x-2.5">
            <History className="w-4 h-4 text-slate-600" />
            <span className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Audit Trail & Immutable Verification Ledger
            </span>
            <span className="text-xs font-mono font-semibold bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
              {auditLogs.length} Events
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
            <span>{isAuditOpen ? 'Collapse' : 'Expand Timeline'}</span>
            {isAuditOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {isAuditOpen && (
          <div className="p-6">
            {loadingAudit ? (
              <div className="text-center py-6 text-slate-500 text-xs">
                <RefreshCw className="w-4 h-4 animate-spin mx-auto mb-1" />
                Loading ledger events...
              </div>
            ) : auditLogs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No audit events recorded yet.</p>
            ) : (
              <div className="relative border-l-2 border-slate-200 ml-4 space-y-6">
                {auditLogs.map((log) => {
                  const isOfficer = log.performed_by === 'Officer';
                  const isDocUpload = log.action === 'DOCUMENT_UPLOADED';
                  const isScore = log.action === 'SCORE_CALCULATED';

                  return (
                    <div key={log.log_id} className="relative pl-6">
                      {/* Timeline Dot */}
                      <div
                        className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 bg-white flex items-center justify-center ${
                          isOfficer
                            ? 'border-brand-500'
                            : isDocUpload
                            ? 'border-emerald-500'
                            : isScore
                            ? 'border-blue-500'
                            : 'border-slate-400'
                        }`}
                      >
                        <div
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOfficer
                              ? 'bg-brand-500'
                              : isDocUpload
                              ? 'bg-emerald-500'
                              : isScore
                              ? 'bg-blue-500'
                              : 'bg-slate-400'
                          }`}
                        ></div>
                      </div>

                      {/* Event Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono uppercase tracking-wider ${
                              isOfficer
                                ? 'bg-orange-100 text-orange-900 border border-orange-300'
                                : isDocUpload
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            by {log.performed_by}
                          </span>
                        </div>

                        <div className="flex items-center space-x-1 text-xs text-slate-400 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{formatTimestamp(log.timestamp)}</span>
                        </div>
                      </div>

                      {/* Event Details */}
                      <div
                        className={`mt-2 text-xs p-3 rounded-lg border ${
                          isOfficer
                            ? 'bg-orange-50/50 border-orange-200/60 text-slate-800'
                            : isDocUpload
                            ? 'bg-emerald-50/50 border-emerald-200/60 text-slate-800'
                            : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <p className="leading-relaxed font-mono text-[12px]">{log.details}</p>
                        <div className="mt-1 text-[10px] text-slate-400 font-mono">
                          Log ID: {log.log_id}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
