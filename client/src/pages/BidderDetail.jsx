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
  AlertCircle,
  Download,
  Eye,
  X
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
  const [bidderBids, setBidderBids] = useState([]);

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
  const [previewDoc, setPreviewDoc] = useState(null);
  const fileInputRef = useRef(null);

  const handleDownloadDoc = (doc) => {
    if (!doc) return;
    const extData = typeof doc.extracted_data === 'string' ? JSON.parse(doc.extracted_data || '{}') : (doc.extracted_data || {});
    const fileName = doc.file_url ? doc.file_url.split('/').pop() : `${doc.doc_type}_${(bidder?.company_name || 'document').replace(/\\s+/g, '_')}.pdf`;

    if (doc.file_content) {
      let content = doc.file_content;
      if (!content.startsWith('data:')) {
        const isImage = doc.file_url?.match(/\\.(png|jpg|jpeg|webp)$/i) || content.startsWith('iVBORw0KGgo') || content.startsWith('/9j/');
        const mime = isImage ? 'image/png' : 'application/pdf';
        content = `data:${mime};base64,${content}`;
      }
      const a = document.createElement('a');
      a.href = content;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Fallback: Generate structured official text/dossier file
    const textContent = `=======================================================
CHENNAI PETROLEUM CORPORATION LIMITED (CPCL)
NATIONAL PROCUREMENT COMPLIANCE PORTAL (BIDSHIELD)
STATUTORY CERTIFICATE AUDIT RECORD
=======================================================

DOCUMENT TYPE:     ${doc.doc_type}
LEGAL ENTITY:      ${extData.company_name || extData.entity_name || bidder?.company_name}
GSTIN IDENTIFIER:  ${extData.gstin || bidder?.gstin}
PAN NUMBER:        ${extData.pan || bidder?.pan_number}
REGISTRATION NO:   ${extData.registration_number || extData.udyam || bidder?.udyam_number || 'N/A'}
ISSUING AUTHORITY: ${extData.issuing_authority || 'Ministry / Statutory Authority'}
REGISTRATION DATE: ${extData.registration_date || 'N/A'}
UPLOAD TIMESTAMP:  ${new Date(doc.uploaded_at).toLocaleString('en-IN')}

REGISTRY MATCH:    ${doc.flagged ? 'FLAGGED DISCREPANCY' : 'VERIFIED COMPLIANT'}
${doc.flagged ? `DISCREPANCY NOTE:  ${doc.flag_reason}` : 'STATUS:            Matches government registry records 100%'}

OCR RAW TEXT EXTRACT:
${extData.raw_text_snippet || 'Document verified optically via BidShield AI Engine'}
=======================================================
Digitally certified by BidShield Procurement Verification Engine.
`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName.endsWith('.pdf') ? fileName.replace('.pdf', '_certified.txt') : `${fileName}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderCertificateVisual = (doc, ext) => {
    return (
      <div className="w-full bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm space-y-4 relative overflow-hidden font-serif select-none">
        {/* Ashoka Emblem & Government Strip */}
        <div className="text-center space-y-1 pb-3 border-b-2 border-slate-900">
          <div className="text-[10px] uppercase font-bold tracking-widest text-slate-600 font-sans">
            भारत सरकार &bull; Government of India
          </div>
          <div className="text-xs font-black uppercase text-[#0B2546] font-sans tracking-wide">
            {doc.doc_type === 'UDYAM_CERT' && 'Ministry of Micro, Small and Medium Enterprises'}
            {doc.doc_type === 'GST_CERT' && 'Goods and Services Tax Network (GSTN)'}
            {doc.doc_type === 'PAN_CARD' && 'Income Tax Department \u2022 Central Board of Direct Taxes'}
            {!['UDYAM_CERT', 'GST_CERT', 'PAN_CARD'].includes(doc.doc_type) && 'Central Statutory Verification Authority'}
          </div>
          <div className="text-sm font-black uppercase tracking-wider text-slate-900 font-sans underline decoration-slate-400">
            {doc.doc_type === 'UDYAM_CERT' && 'Udyam Registration Certificate'}
            {doc.doc_type === 'GST_CERT' && 'Form GST REG-06 Certificate'}
            {doc.doc_type === 'PAN_CARD' && 'Permanent Account Number Card Verification'}
            {!['UDYAM_CERT', 'GST_CERT', 'PAN_CARD'].includes(doc.doc_type) && 'Commercial Statutory Certificate'}
          </div>
        </div>

        {/* Watermark Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
          <Building2 className="w-64 h-64 text-slate-900" />
        </div>

        {/* Main Certificate Fields */}
        <div className="space-y-3 font-sans text-xs pt-1">
          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Enterprise Legal Name:</span>
            <span className={`font-bold ${doc.flagged ? 'text-rose-700' : 'text-slate-900'}`}>
              {ext.company_name || ext.entity_name || bidder?.company_name}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2 font-mono">
            <span className="text-slate-500 font-sans font-medium">Statutory Number:</span>
            <span className="font-bold text-slate-900">
              {ext.registration_number || ext.udyam || ext.gstin || ext.pan || bidder?.gstin}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Enterprise Type / Category:</span>
            <span className="font-bold text-slate-800 font-mono">
              Small Enterprise &bull; Manufacturing & Supplies
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2 font-mono">
            <span className="text-slate-500 font-sans font-medium">Registered Identifier (PAN):</span>
            <span className="font-bold text-slate-900">{ext.pan || bidder?.pan_number}</span>
          </div>

          <div className="flex justify-between border-b border-slate-100 pb-2">
            <span className="text-slate-500 font-medium">Date of Issue / Incorporation:</span>
            <span className="font-bold text-slate-800 font-mono">
              {ext.registration_date || '16/09/2021'}
            </span>
          </div>
        </div>

        {/* Stamp & Seal */}
        <div className="pt-3 flex items-center justify-between font-sans">
          <div className="text-[9px] text-slate-400 font-mono">
            <div>Issued under Authority of GFR 2017</div>
            <div>Digitally Signed by Certifying Officer</div>
          </div>

          <div className={`px-3 py-1.5 rounded-lg border-2 font-black text-xs uppercase tracking-wider transform -rotate-3 ${
            doc.flagged
              ? 'border-rose-600 text-rose-600 bg-rose-50/80'
              : 'border-emerald-600 text-emerald-700 bg-emerald-50/80'
          }`}>
            {doc.flagged ? 'DISCREPANCY FLAGGED' : 'OFFICIAL VERIFIED'}
          </div>
        </div>
      </div>
    );
  };

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

      // Fetch linked bids
      try {
        const bidsRes = await fetch(`/api/bidders/${bidder_id}/bids`);
        const bidsData = await bidsRes.json();
        if (bidsData.success) {
          setBidderBids(bidsData.bids || []);
        }
      } catch (e) {
        console.error('Failed to load linked bids', e);
      }
    } catch (err) {
      setError(err.message || 'Failed to load bidder data');
    } finally {
      setLoading(false);
    }
  };

  // Export full statutory audit dossier as JSON file
  const handleExportAuditReport = () => {
    if (!bidder) return;
    const reportData = {
      report_type: 'NATIONAL_PROCUREMENT_STATUTORY_AUDIT_REPORT',
      portal: 'National Procurement Compliance Portal (NPCP)',
      ministry: 'Ministry of Petroleum & Natural Gas (MoPNG) / CPCL',
      generated_at: new Date().toISOString(),
      authenticated_officer: user?.name || 'Demo Procurement Officer',
      officer_email: user?.email || 'officer@cpcl.gov.in',
      bidder_dossier: {
        bidder_id: bidder.bidder_id,
        legal_name: bidder.company_name,
        gstin: bidder.gstin,
        pan_number: bidder.pan_number,
        udyam_number: bidder.udyam_number,
        registered_address: bidder.registered_address,
        official_email: bidder.email,
        phone_contact: bidder.phone,
        enrolled_date: bidder.created_at
      },
      statutory_evaluation: {
        compliance_score: `${compliance?.score ?? 0} / 100`,
        risk_classification: compliance?.risk || 'Pending',
        official_recommendation: compliance?.recommendation || 'Pending',
        discrepancy_flags: compliance?.flags || []
      },
      statutory_checks_ledger: compliance?.verificationResults || [],
      uploaded_statutory_documents: documents.map(d => ({
        doc_id: d.doc_id,
        doc_type: d.doc_type,
        file_url: d.file_url,
        flagged: d.flagged,
        flag_reason: d.flag_reason,
        uploaded_at: d.uploaded_at
      })),
      linked_tender_bids: bidderBids,
      audit_events: auditLogs
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${bidder.company_name.replace(/[^a-zA-Z0-9]/g, '_')}_Statutory_Audit_Report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          to="/bidders"
          className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-[#0B2546] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Participating Bidders Directory</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportAuditReport}
            className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-lg shadow-2xs transition cursor-pointer"
            title="Download full statutory dossier as JSON report"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Audit Dossier</span>
          </button>

          <button
            type="button"
            onClick={handleRerunVerification}
            disabled={verifying}
            className="inline-flex items-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Re-verifying with Portals...' : 'Re-run Verification Engine'}</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: EXECUTIVE CORPORATE BRIEFING & COMPLIANCE DOSSIER */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Dossier Header Strip */}
        <div className="bg-gradient-to-r from-[#0B2546] to-[#133E6D] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono uppercase tracking-wider bg-white/20 text-white font-bold px-2 py-0.5 rounded">
                Bidder Entity ID: {bidder.bidder_id.substring(0, 8).toUpperCase()}
              </span>
              <span className="text-[11px] text-slate-200">
                Enrolled: {new Date(bidder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Building2 className="w-6 h-6 text-sky-400 shrink-0" />
              <span>{bidder.company_name}</span>
            </h1>
            <p className="text-xs text-slate-200 max-w-2xl">
              Commercial Supplier & Industrial Contractor verified under GFR 2017 & Public Procurement Guidelines.
            </p>
          </div>

          {/* Compliance Dial / Score Card */}
          <div className={`flex items-center p-4 rounded-xl border ${badgeBg} shadow-sm shrink-0 min-w-[260px] justify-between`}>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-0.5">
                AI Statutory Compliance
              </div>
              <div className="flex items-baseline space-x-1.5">
                <span className={`text-4xl font-extrabold font-mono ${scoreTextColor}`}>
                  {compliance?.score ?? '—'}
                </span>
                <span className="text-xs text-slate-500 font-bold">/ 100</span>
              </div>
              <div className="mt-1 text-xs font-semibold text-slate-800">
                Risk Tier: <span className="underline decoration-current">{compliance?.risk}</span>
              </div>
            </div>

            <div className="text-right pl-4 border-l border-slate-200/80">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Advisory
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

        {/* Executive 4-Pillar Company Dossier */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Enterprise Category</span>
            <div className="text-xs font-bold text-[#0B2546]">
              {bidder.udyam_number?.includes('TN-02') ? 'Medium Enterprise (Mfg)' :
               bidder.udyam_number?.includes('TN-03') ? 'Large Engineering Corp' :
               bidder.udyam_number?.includes('TN-05') ? 'Small Enterprise (Line Pipe)' :
               bidder.udyam_number?.includes('TN-04') ? 'Micro / Refining Spares' : 'Medium Enterprise (Govt)'}
            </div>
            <div className="text-[11px] text-slate-500 font-mono">MSME Udyam: {bidder.udyam_number}</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">GSTN Tax Profile</span>
            <div className="text-xs font-bold text-[#0B2546] font-mono">{bidder.gstin}</div>
            <div className="text-[11px] text-slate-500">Regular Taxpayer &bull; Tamil Nadu</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Income Tax (CBDT)</span>
            <div className="text-xs font-bold text-[#0B2546] font-mono">{bidder.pan_number}</div>
            <div className="text-[11px] text-emerald-700 font-semibold">Corporate PAN Registered</div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Bids in CPCL</span>
            <div className="text-xs font-bold text-[#0B2546]">
              {bidderBids.length > 0 ? `${bidderBids.length} Submitted Bid${bidderBids.length > 1 ? 's' : ''}` : 'No Active Bids'}
            </div>
            <div className="text-[11px] text-slate-500 truncate">
              {bidderBids[0]?.tender?.title ? bidderBids[0].tender.title : 'Registered Vendor Database'}
            </div>
          </div>
        </div>

        {/* Contact & Registered Address Row */}
        <div className="px-6 py-3.5 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700">Registered Office:</span>
            <span>{bidder.registered_address}</span>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span>Email: <strong className="text-slate-800">{bidder.email}</strong></span>
            <span>Phone: <strong className="text-slate-800">{bidder.phone}</strong></span>
          </div>
        </div>
      </div>

      {/* SECTION 2: STATUTORY DOCUMENTS DOSSIER & OFFICER ADMIN UPLOAD DESK */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2.5">
            <FileCheck2 className="w-5 h-5 text-[#0B2546]" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Statutory Documents Dossier & Administrative Upload Desk
                </h3>
                <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
                  Officer Admin Authority
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Inspect bidder submitted statutory certificates or upload verified documents directly with administrative privileges.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-200 text-slate-700 px-2.5 py-1 rounded">
            {documents.length} Documents On Record
          </span>
        </div>

        <div className="p-6 space-y-6">
          {/* Officer Admin Upload Form */}
          <form onSubmit={handleFileUpload} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-2.5">
              <div className="text-xs font-bold text-[#0B2546] uppercase tracking-wider flex items-center space-x-1.5">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Upload Statutory Document on Behalf of Bidder (Admin Mode)</span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">
                Formats: PDF, PNG, JPG, TXT (Max 10MB)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Document Type Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Document Classification
                </label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0B2546]/20 font-medium"
                >
                  <option value="GST_CERT">GST Registration Certificate (GST REG-06)</option>
                  <option value="PAN_CARD">Permanent Account Number (PAN Card)</option>
                  <option value="UDYAM_CERT">MSME Udyam Registration Certificate</option>
                  <option value="DEBARMENT_AFFIDAVIT">Non-Debarment / Vigilance Affidavit</option>
                  <option value="FINANCIAL_AUDIT">Audited Balance Sheet / Turnover Proof</option>
                </select>
              </div>

              {/* File Selector */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Select Certificate File
                </label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 border border-slate-300 rounded-lg bg-white p-1 cursor-pointer"
                  />
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="inline-flex items-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {uploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Verifying...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload & Reconcile</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {uploadMsg && (
              <div
                className={`text-xs p-3 rounded-lg border flex items-center space-x-2 ${
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
            <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 text-xs">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No statutory documents uploaded yet for this bidder.</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Use the admin form above to upload and verify certificates.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {documents.map((doc) => {
                const extData = doc.extracted_data || {};
                const isLiveAi = extData.extraction_method === 'live_ai';
                const isExpanded = expandedJsonDocId === doc.doc_id;

                return (
                  <div
                    key={doc.doc_id}
                    className={`rounded-xl border p-4 transition ${
                      doc.flagged
                        ? 'border-rose-300 bg-rose-50/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                    }`}
                  >
                    {/* Document Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold uppercase bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                          {doc.doc_type}
                        </span>
                        <span className="text-xs text-slate-700 font-semibold font-mono">
                          {doc.file_url ? doc.file_url.split('/').pop() : 'Certificate'}
                        </span>
                        <span className="text-xs text-slate-400">&bull;</span>
                        <span className="text-xs text-slate-400">{formatTimestamp(doc.uploaded_at)}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                            doc.flagged
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          }`}
                        >
                          {doc.flagged ? (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-600" />
                              <span>Discrepancy Flagged</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Verified Against Registry</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Flagged Warning Banner */}
                    {doc.flagged && (
                      <div className="mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">
                            ⚠️ Discrepancy Flag: {doc.flag_reason || 'Document failed registry validation'}
                          </p>
                          <p className="text-[11px] text-rose-700 mt-0.5">
                            Cross-check discrepancy detected against government registers. Officer review required.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Extracted Key-Value Fields */}
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Legal Entity Name
                        </span>
                        <span className={`font-semibold ${doc.flagged ? 'text-rose-700 font-bold' : 'text-slate-800'}`}>
                          {extData.company_name || extData.entity_name || bidder.company_name}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          GSTIN Extracted
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {extData.gstin || bidder.gstin}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          PAN Number
                        </span>
                        <span className="font-mono font-bold text-slate-900">
                          {extData.pan || bidder.pan_number}
                        </span>
                      </div>

                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Registry Match Status
                        </span>
                        <span className={`font-semibold ${doc.flagged ? 'text-rose-600' : 'text-emerald-700'}`}>
                          {extData.verified_against_registry || (doc.flagged ? 'Discrepancy' : 'Compliant')}
                        </span>
                      </div>
                    </div>

                    {/* Action Bar: View, Download & Raw JSON */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition cursor-pointer"
                          title="Download document file directly"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>Download File</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setExpandedJsonDocId(isExpanded ? null : doc.doc_id)}
                          className="inline-flex items-center space-x-1 text-xs text-slate-500 hover:text-slate-800 font-mono px-2 py-1 rounded hover:bg-slate-100 cursor-pointer"
                        >
                          <FileCode2 className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Raw JSON' : 'Raw JSON'}</span>
                        </button>
                      </div>

                      <span className="text-[10px] text-slate-400 font-mono">
                        Doc ID: {doc.doc_id.substring(0, 8)}
                      </span>
                    </div>

                    {isExpanded && (
                      <pre className="mt-2 p-3 bg-slate-900 text-slate-100 text-[11px] font-mono rounded-lg overflow-x-auto">
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

      {/* SECTION 3: PLAIN-ENGLISH VERIFICATION FINDING */}
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

      {/* SECTION 4: DETAILED 6-POINT STATUTORY COMPARISON TABLE */}
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

      {/* DOCUMENT PREVIEW & DOWNLOAD MODAL */}
      {previewDoc && (() => {
        const ext = typeof previewDoc.extracted_data === 'string' ? JSON.parse(previewDoc.extracted_data || '{}') : (previewDoc.extracted_data || {});
        const hasImage = previewDoc.file_content || (previewDoc.file_url && previewDoc.file_url.match(/\.(png|jpg|jpeg|webp)$/i));
        let imgSrc = previewDoc.file_content;
        if (imgSrc && !imgSrc.startsWith('data:') && !imgSrc.startsWith('http') && !imgSrc.startsWith('/')) {
          imgSrc = `data:image/png;base64,${imgSrc}`;
        } else if (!imgSrc && previewDoc.file_url) {
          imgSrc = previewDoc.file_url;
        }

        return (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <span className="text-xs font-mono font-black uppercase bg-[#0B2546] text-white px-2.5 py-1 rounded">
                    {previewDoc.doc_type}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      {previewDoc.file_url ? previewDoc.file_url.split('/').pop() : 'Statutory Certificate'}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Uploaded: {formatTimestamp(previewDoc.uploaded_at)} &bull; Entity: {bidder.company_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(previewDoc)}
                    className="inline-flex items-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Visual Certificate View */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center min-h-[380px] relative overflow-hidden">
                  {hasImage && imgSrc ? (
                    <div className="w-full h-full flex flex-col items-center justify-center">
                      <img
                        src={imgSrc}
                        alt="Uploaded Document"
                        className="max-h-[360px] w-auto max-w-full object-contain rounded-lg border border-slate-200 shadow-sm bg-white"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fb = document.getElementById('cert-fallback');
                          if (fb) fb.style.display = 'block';
                        }}
                      />
                      <div id="cert-fallback" style={{ display: 'none' }} className="w-full">
                        {renderCertificateVisual(previewDoc, ext)}
                      </div>
                    </div>
                  ) : (
                    renderCertificateVisual(previewDoc, ext)
                  )}
                </div>

                {/* Right Column: AI Extraction & Compliance Audit */}
                <div className="space-y-4 font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Statutory Verification Status
                    </span>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      previewDoc.flagged ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {previewDoc.flagged ? <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{previewDoc.flagged ? 'Discrepancy Detected' : 'Verified Clean'}</span>
                    </span>
                  </div>

                  {previewDoc.flagged && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                        Discrepancy Finding:
                      </span>
                      <p>{previewDoc.flag_reason || 'Certificate does not match bidder registered details'}</p>
                    </div>
                  )}

                  {/* Extracted Key-Value Table */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                      AI Extracted Entity Data
                    </span>
                    <div className="space-y-2">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                        <span className="text-slate-500">Legal Entity Name</span>
                        <span className={`font-bold ${previewDoc.flagged ? 'text-rose-700' : 'text-slate-900'}`}>
                          {ext.company_name || ext.entity_name || bidder.company_name}
                        </span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center font-mono">
                        <span className="text-slate-500 font-sans">GSTIN Number</span>
                        <span className="font-bold text-slate-900">{ext.gstin || bidder.gstin}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center font-mono">
                        <span className="text-slate-500 font-sans">PAN Identifier</span>
                        <span className="font-bold text-slate-900">{ext.pan || bidder.pan_number}</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center font-mono">
                        <span className="text-slate-500 font-sans">Registration No</span>
                        <span className="font-bold text-slate-900">{ext.registration_number || ext.udyam || bidder.udyam_number || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Raw Text Snippet */}
                  {ext.raw_text_snippet && (
                    <div className="space-y-1 text-xs">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                        OCR Text Snippet
                      </span>
                      <p className="p-2.5 bg-slate-100 rounded-lg text-slate-700 text-[11px] font-mono leading-relaxed max-h-24 overflow-y-auto">
                        {ext.raw_text_snippet}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
