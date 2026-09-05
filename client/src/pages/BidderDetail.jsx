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
  Clock,
  Send,
  Upload,
  ExternalLink,
  FileCheck2,
  FileCode2,
  AlertCircle,
  Download,
  Eye,
  X,
  Layers,
  Search,
  ChevronRight
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

  // Active Tab: 'checks' | 'documents' | 'decision'
  const [activeTab, setActiveTab] = useState('checks');

  // Officer Decision State
  const [decisionNotes, setDecisionNotes] = useState('');
  const [selectedDecision, setSelectedDecision] = useState('Approved');
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const [latestDecision, setLatestDecision] = useState(null);
  const [decisionSuccessMsg, setDecisionSuccessMsg] = useState(null);

  // Documents State
  const [documents, setDocuments] = useState([]);
  const [uploadDocType, setUploadDocType] = useState('GST_CERT');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [showRawJsonDocId, setShowRawJsonDocId] = useState(null);
  const fileInputRef = useRef(null);

  // Load Bidder Data
  const loadBidderData = async () => {
    setLoading(true);
    setError(null);
    try {
      const bRes = await fetch('/api/bidders');
      const bData = await bRes.json();
      if (!bData.success) throw new Error('Failed to load bidders');
      const found = bData.bidders.find((b) => b.bidder_id === bidder_id);
      if (!found) throw new Error('Bidder not found');
      setBidder(found);

      // Compliance
      let cRes = await fetch(`/api/bidders/${bidder_id}/compliance`);
      if (cRes.status === 404) {
        cRes = await fetch(`/api/bidders/${bidder_id}/verify`, { method: 'POST' });
      }
      const cData = await cRes.json();
      if (cData.success) setCompliance(cData);

      // Documents
      const dRes = await fetch(`/api/bidders/${bidder_id}/documents`);
      const dData = await dRes.json();
      if (dData.success) setDocuments(dData.documents || []);

      // Audit Logs
      const aRes = await fetch(`/api/bidders/${bidder_id}/audit-log`);
      const aData = await aRes.json();
      if (aData.success) {
        setAuditLogs(aData.auditLogs || []);
        const lastDec = (aData.auditLogs || []).find((l) => l.action === 'OFFICER_DECISION');
        if (lastDec) setLatestDecision(lastDec);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error loading bidder dossier');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBidderData();
  }, [bidder_id]);

  // Re-run Verification
  const handleRerunVerification = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/bidders/${bidder_id}/verify`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setCompliance(data);
        const aRes = await fetch(`/api/bidders/${bidder_id}/audit-log`);
        const aData = await aRes.json();
        if (aData.success) setAuditLogs(aData.auditLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  // Submit Officer Decision
  const handleDecisionSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!decisionNotes.trim()) {
      alert('Please enter justification remarks for your decision.');
      return;
    }

    setSubmittingDecision(true);
    setDecisionSuccessMsg(null);
    try {
      const res = await fetch(`/api/bidders/${bidder_id}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          decision: selectedDecision,
          remarks: decisionNotes.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setLatestDecision(data.auditLog);
        setDecisionSuccessMsg(`Decision successfully logged: ${selectedDecision}`);
        setDecisionNotes('');
        const aRes = await fetch(`/api/bidders/${bidder_id}/audit-log`);
        const aData = await aRes.json();
        if (aData.success) setAuditLogs(aData.auditLogs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingDecision(false);
    }
  };

  // Upload Manual Document
  const handleDocUpload = async (e) => {
    if (e) e.preventDefault();
    if (!uploadFile) return;

    setUploading(true);
    setUploadMsg(null);
    try {
      const formData = new FormData();
      formData.append('doc_type', uploadDocType);
      formData.append('file', uploadFile);

      const res = await fetch(`/api/bidders/${bidder_id}/documents`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadMsg({ type: 'success', text: 'Document uploaded & audited successfully!' });
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadBidderData();
      } else {
        setUploadMsg({ type: 'error', text: data.message || 'Upload failed' });
      }
    } catch (err) {
      setUploadMsg({ type: 'error', text: 'Network error uploading document' });
    } finally {
      setUploading(false);
    }
  };

  // Direct Document Download
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

    const textContent = `=======================================================
CHENNAI PETROLEUM CORPORATION LIMITED (CPCL)
STATUTORY CERTIFICATE RECORD
=======================================================
DOCUMENT TYPE:     ${doc.doc_type}
LEGAL ENTITY:      ${extData.company_name || extData.entity_name || bidder?.company_name}
GSTIN:             ${extData.gstin || bidder?.gstin}
PAN:               ${extData.pan || bidder?.pan_number}
REGISTRATION NO:   ${extData.registration_number || extData.udyam || bidder?.udyam_number || 'N/A'}
UPLOAD TIMESTAMP:  ${new Date(doc.uploaded_at).toLocaleString('en-IN')}
STATUS:            ${doc.flagged ? 'DISCREPANCY: ' + doc.flag_reason : 'VERIFIED COMPLIANT'}
=======================================================`;
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

  // Export JSON Report
  const handleExportJSON = () => {
    const report = {
      bidder,
      compliance,
      documents,
      auditLogs,
      exported_at: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(bidder?.company_name || 'bidder').replace(/\\s+/g, '_')}_audit_dossier.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTimestamp = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-20 text-center text-slate-500">
        <div className="w-9 h-9 border-3 border-[#0B2546] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-semibold text-slate-700">Loading vendor compliance dossier...</p>
      </div>
    );
  }

  if (error || !bidder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6">
          <p className="font-bold text-rose-800 mb-2">{error || 'Vendor not found'}</p>
          <Link to="/bidders" className="inline-block text-xs font-bold bg-[#0B2546] text-white px-4 py-2 rounded-xl">
            Back to Bidders Directory
          </Link>
        </div>
      </div>
    );
  }

  const isLow = compliance?.risk === 'Low';
  const isMed = compliance?.risk === 'Medium';
  const isHigh = compliance?.risk === 'High';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 font-sans">
      {/* 1. Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link
          to="/bidders"
          className="inline-flex items-center text-xs font-bold text-slate-600 hover:text-[#0B2546] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Bidders Directory</span>
        </Link>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleExportJSON}
            className="inline-flex items-center space-x-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-3.5 py-2 rounded-xl shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Dossier (JSON)</span>
          </button>

          <button
            type="button"
            onClick={handleRerunVerification}
            disabled={verifying}
            className="inline-flex items-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${verifying ? 'animate-spin' : ''}`} />
            <span>{verifying ? 'Re-Verifying...' : 'Re-Run Verification'}</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Snapshot Card (Company + Big Score Badge) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
              ID: {bidder.bidder_id.substring(0, 8).toUpperCase()}
            </span>
            <span className="text-xs text-slate-400">
              Registered on {new Date(bidder.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-sky-600 shrink-0" />
            <span>{bidder.company_name}</span>
          </h1>

          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
            <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
              GSTIN: {bidder.gstin}
            </span>
            <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
              PAN: {bidder.pan_number}
            </span>
            <span className="bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg text-slate-700 font-bold">
              Udyam: {bidder.udyam_number}
            </span>
          </div>
        </div>

        {/* Large High-Contrast Compliance Score Badge */}
        <div className={`p-5 rounded-2xl border flex items-center space-x-5 shrink-0 ${
          isLow
            ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
            : isMed
            ? 'bg-amber-50 border-amber-200 text-amber-950'
            : 'bg-rose-50 border-rose-200 text-rose-950'
        }`}>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider block opacity-75">
              GFR 2017 Compliance
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className={`text-4xl font-black font-mono ${
                isLow ? 'text-emerald-700' : isMed ? 'text-amber-700' : 'text-rose-700'
              }`}>
                {compliance?.score ?? '—'}
              </span>
              <span className="text-xs font-bold opacity-60">/ 100</span>
            </div>
            <div className="text-xs font-bold mt-1">
              Risk: <span className="underline">{compliance?.risk}</span>
            </div>
          </div>

          <div className="pl-4 border-l border-current/15 text-right">
            <span className="text-[10px] font-bold uppercase opacity-75 block mb-1">
              Recommendation
            </span>
            <span className={`inline-block px-3 py-1 rounded-lg text-xs font-extrabold ${
              isLow
                ? 'bg-emerald-600 text-white'
                : isMed
                ? 'bg-amber-600 text-white'
                : 'bg-rose-600 text-white'
            }`}>
              {compliance?.recommendation}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Plain-English Finding Banner */}
      {compliance?.flags && compliance.flags.length > 0 ? (
        <div className={`p-4 rounded-2xl border flex items-start space-x-3 ${
          isHigh ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isHigh ? 'text-rose-600' : 'text-amber-600'}`} />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold uppercase tracking-wide">
              ⚠️ Attention: {compliance.flags.length} Discrepanc{compliance.flags.length > 1 ? 'ies' : 'y'} Detected
            </h4>
            <ul className="space-y-0.5">
              {compliance.flags.map((flag, idx) => (
                <li key={idx} className="font-medium">
                  &bull; {flag}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-900 flex items-center space-x-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h4 className="font-bold uppercase tracking-wide">
              ✅ All 6 Statutory Registry Checks Verified Clean
            </h4>
            <p className="text-emerald-800 mt-0.5">
              No registry mismatches or vigilance debarments found. Entity credentials match 100% across Udyam, GSTN, and Income Tax databases.
            </p>
          </div>
        </div>
      )}

      {/* 4. Three Clean, Dedicated Navigation Tabs */}
      <div className="flex border-b border-slate-200 space-x-4">
        {[
          { id: 'checks', label: '1. Statutory Verification Ledger', count: compliance?.verificationResults?.length || 6 },
          { id: 'documents', label: '2. Uploaded Documents Vault', count: documents.length },
          { id: 'decision', label: '3. Officer Determination & Audit', count: auditLogs.length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-1 text-xs font-bold transition flex items-center space-x-2 cursor-pointer border-b-2 ${
              activeTab === tab.id
                ? 'border-[#0B2546] text-[#0B2546]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
              activeTab === tab.id
                ? 'bg-[#0B2546] text-white'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* TAB 1: STATUTORY VERIFICATION LEDGER (6 CHECKS) */}
      {activeTab === 'checks' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Statutory Check</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5">Bidder Declared Record</th>
                  <th className="px-5 py-3.5">Government Registry Match</th>
                  <th className="px-4 py-3.5 text-center">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {compliance?.verificationResults?.map((check) => {
                  const isMatch = check.match_status === 'Match';
                  return (
                    <tr key={check.check_id} className={!isMatch ? 'bg-rose-50/30' : 'hover:bg-slate-50/60'}>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        <div>{HUMAN_CHECK_NAMES[check.check_type] || check.check_type}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">{check.check_type}</div>
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isMatch ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {isMatch ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                          <span>{isMatch ? 'Passed' : 'Mismatch'}</span>
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-700">
                        <span className="bg-slate-50 border border-slate-200 px-2 py-1 rounded block max-w-xs truncate">
                          {check.document_value || 'None'}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-slate-700">
                        <span className={`px-2 py-1 rounded block max-w-xs truncate border ${
                          isMatch ? 'bg-slate-50 border-slate-200' : 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                        }`}>
                          {check.portal_value || 'None'}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          check.severity === 'Critical'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : check.severity === 'Major'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}>
                          {check.severity}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: UPLOADED DOCUMENTS & VAULT */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Documents Grid */}
          {documents.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-sm">No statutory certificates uploaded yet.</p>
              <p className="mt-1">Use the upload tool below to add documents to this vendor&apos;s vault.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc) => {
                const extData = typeof doc.extracted_data === 'string' ? JSON.parse(doc.extracted_data || '{}') : (doc.extracted_data || {});
                return (
                  <div
                    key={doc.doc_id}
                    className={`bg-white rounded-2xl border p-5 shadow-xs space-y-3.5 transition ${
                      doc.flagged ? 'border-rose-300 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          doc.flagged ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-[#0B2546]'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-xs">{doc.doc_type}</div>
                          <div className="text-[11px] text-slate-400 font-mono mt-0.5 truncate max-w-[200px]">
                            {doc.file_url ? doc.file_url.split('/').pop() : 'Certificate'}
                          </div>
                        </div>
                      </div>

                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        doc.flagged ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {doc.flagged ? <AlertTriangle className="w-3 h-3 text-rose-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        <span>{doc.flagged ? 'Flagged' : 'Verified'}</span>
                      </span>
                    </div>

                    {doc.flagged && (
                      <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px]">
                        <strong>Discrepancy:</strong> {doc.flag_reason}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-slate-400 block">Extracted Legal Name:</span>
                        <span className="font-bold text-slate-800 truncate block">
                          {extData.company_name || extData.entity_name || bidder.company_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Identifier (PAN/GST):</span>
                        <span className="font-mono font-bold text-slate-800 truncate block">
                          {extData.gstin || extData.pan || bidder.gstin}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons: View, Download & Raw JSON */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Document</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownloadDoc(doc)}
                          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition cursor-pointer"
                          title="Download document file directly"
                        >
                          <Download className="w-3.5 h-3.5 text-slate-500" />
                          <span>Download</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => setShowRawJsonDocId(showRawJsonDocId === doc.doc_id ? null : doc.doc_id)}
                        className="text-[11px] text-slate-400 hover:text-slate-700 font-mono cursor-pointer"
                      >
                        {showRawJsonDocId === doc.doc_id ? 'Hide JSON' : 'Raw JSON'}
                      </button>
                    </div>

                    {showRawJsonDocId === doc.doc_id && (
                      <pre className="mt-2 p-3 bg-slate-900 text-slate-100 text-[10px] font-mono rounded-xl overflow-x-auto">
                        {JSON.stringify(extData, null, 2)}
                      </pre>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Upload New Document Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#0B2546] uppercase tracking-wider flex items-center space-x-2">
              <Upload className="w-4 h-4 text-sky-600" />
              <span>Upload Additional Document (Admin Vault Entry)</span>
            </h3>

            {uploadMsg && (
              <div className={`text-xs p-3 rounded-xl border ${
                uploadMsg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
              }`}>
                {uploadMsg.text}
              </div>
            )}

            <form onSubmit={handleDocUpload} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Classification</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="GST_CERT">GST Registration (GST REG-06)</option>
                  <option value="PAN_CARD">Permanent Account Number (PAN Card)</option>
                  <option value="UDYAM_CERT">MSME Udyam Certificate</option>
                  <option value="AUDIT_REPORT">Audited Balance Sheet</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select File</label>
                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,.pdf,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#0B2546]/10 file:text-[#0B2546] border border-slate-300 rounded-xl bg-slate-50 p-1"
                  />
                  <button
                    type="submit"
                    disabled={uploading || !uploadFile}
                    className="inline-flex items-center space-x-1 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-4 py-2 rounded-xl transition disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{uploading ? 'Auditing...' : 'Upload'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 3: OFFICER DETERMINATION & AUDIT HISTORY */}
      {activeTab === 'decision' && (
        <div className="space-y-6">
          {/* Officer Decision Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <UserCheck className="w-5 h-5 text-sky-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Procurement Officer Final Determination
                </h3>
              </div>
              <span className="text-xs text-slate-400">
                Logged as: <strong>{user?.name || 'Officer'}</strong>
              </span>
            </div>

            {decisionSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{decisionSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Determination Decision
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'Approved', label: 'Approve & Pre-Qualify', icon: Check, color: 'hover:border-emerald-500 hover:bg-emerald-50/50' },
                    { id: 'Clarification Requested', label: 'Request Clarification', icon: AlertTriangle, color: 'hover:border-amber-500 hover:bg-amber-50/50' },
                    { id: 'Rejected', label: 'Disqualify / Reject', icon: Ban, color: 'hover:border-rose-500 hover:bg-rose-50/50' }
                  ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = selectedDecision === opt.id;
                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setSelectedDecision(opt.id)}
                        className={`p-3 rounded-xl border text-left text-xs font-bold transition cursor-pointer flex items-center space-x-2.5 ${opt.color} ${
                          isSelected
                            ? 'border-[#0B2546] bg-[#0B2546] text-white shadow-sm'
                            : 'border-slate-200 text-slate-700 bg-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-500'}`} />
                        <span>{opt.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Official Justification Remarks *
                </label>
                <textarea
                  rows="3"
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  placeholder="Enter committee reasoning, statutory cross-check citations, or clarification instructions..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#0B2546]"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingDecision || !decisionNotes.trim()}
                  className="inline-flex items-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingDecision ? 'Recording Determination...' : 'Submit Official Determination'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Audit History Timeline */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2 pb-3 border-b border-slate-100">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>Audit Trail History ({auditLogs.length} Events)</span>
            </h3>

            {auditLogs.length === 0 ? (
              <p className="text-xs text-slate-400">No events logged yet.</p>
            ) : (
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div key={log.log_id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#0B2546] font-mono">{log.action}</span>
                      <span className="text-slate-400 font-mono">{formatTimestamp(log.timestamp)}</span>
                    </div>
                    <p className="text-slate-700">{log.details}</p>
                    <div className="text-[10px] text-slate-400">Performed by: {log.performed_by}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW & DOWNLOAD MODAL */}
      {previewDoc && (() => {
        const ext = typeof previewDoc.extracted_data === 'string' ? JSON.parse(previewDoc.extracted_data || '{}') : (previewDoc.extracted_data || {});
        const hasImage = previewDoc.file_content || (previewDoc.file_url && previewDoc.file_url.match(/\\.(png|jpg|jpeg|webp)$/i));
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
                      Uploaded {formatTimestamp(previewDoc.uploaded_at)} &bull; {bidder.company_name}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => handleDownloadDoc(previewDoc)}
                    className="inline-flex items-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
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
                {/* Left: Image or Certificate Preview */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col items-center justify-center min-h-[380px]">
                  {hasImage && imgSrc ? (
                    <img
                      src={imgSrc}
                      alt="Uploaded Document"
                      className="max-h-[360px] w-auto max-w-full object-contain rounded-lg border border-slate-200 shadow-sm bg-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm space-y-4 text-center font-serif">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 font-sans">
                        भारत सरकार &bull; Government of India
                      </div>
                      <div className="text-xs font-black uppercase text-[#0B2546] font-sans">
                        {previewDoc.doc_type} Statutory Certificate
                      </div>
                      <div className="text-xs text-slate-700 py-4 font-mono border-y border-slate-100 font-sans">
                        Registration: {ext.registration_number || ext.udyam || ext.gstin || ext.pan || bidder?.gstin}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold uppercase font-sans">
                        Officially Recorded in BidShield Ledger
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Extracted Data */}
                <div className="space-y-4 text-xs font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="font-bold uppercase tracking-wider text-slate-500">
                      Status
                    </span>
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full font-bold ${
                      previewDoc.flagged ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {previewDoc.flagged ? <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      <span>{previewDoc.flagged ? 'Discrepancy Detected' : 'Verified Clean'}</span>
                    </span>
                  </div>

                  {previewDoc.flagged && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
                      <span className="font-bold">⚠️ Finding:</span>
                      <p>{previewDoc.flag_reason}</p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <span className="text-slate-500">Legal Entity</span>
                      <span className="font-bold text-slate-900">{ext.company_name || ext.entity_name || bidder?.company_name}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center font-mono">
                      <span className="text-slate-500 font-sans">GSTIN</span>
                      <span className="font-bold text-slate-900">{ext.gstin || bidder?.gstin}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center font-mono">
                      <span className="text-slate-500 font-sans">PAN</span>
                      <span className="font-bold text-slate-900">{ext.pan || bidder?.pan_number}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
