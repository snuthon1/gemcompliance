import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
  UserCheck,
  FileCheck2,
  ArrowUpRight,
  LayoutDashboard,
  Trash2,
  Eye,
  X,
  FileCode2,
  Check,
  ShieldAlert,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  AlertCircle,
  Save,
  Download
} from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { scanAndVerifyDocument } from '../utils/documentScanner';

export default function UserDashboard() {
  const { user, isVendor, isOfficer, updatePassword, deferPasswordChange } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Active tab derived from URL
  const getActiveTabFromUrl = () => {
    const path = location.pathname;
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/documents')) return 'documents';
    if (path.includes('/apply')) return 'apply';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl);

  // Mandatory First-Time Password Reset State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    if (isVendor && user?.must_change_password) {
      setShowPasswordModal(true);
    }
  }, [user, isVendor]);

  const handlePasswordSubmit = (e) => {
    if (e) e.preventDefault();
    setPasswordError('');
    if (!newPasswordInput || newPasswordInput.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('Passwords do not match. Please verify.');
      return;
    }
    if (updatePassword) {
      updatePassword(newPasswordInput);
    }
    setPasswordSuccess(true);
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess(false);
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    }, 1500);
  };

  const handleDeferPassword = () => {
    if (deferPasswordChange) {
      deferPasswordChange();
    }
    setShowPasswordModal(false);
  };

  useEffect(() => {
    setActiveTab(getActiveTabFromUrl());
  }, [location.pathname]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') navigate('/vendor/overview');
    else navigate(`/vendor/${tab}`);
  };

  const [bidders, setBidders] = useState([]);
  const [selectedBidderId, setSelectedBidderId] = useState(() => {
    return (user?.bidder_id) || localStorage.getItem('bidshield_active_vendor_id') || '';
  });
  const [currentBidder, setCurrentBidder] = useState(null);
  const [compliance, setCompliance] = useState(null);
  const [bids, setBids] = useState([]);
  const [openTenders, setOpenTenders] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reverifying, setReverifying] = useState(false);

  // New Bid Application Form / Modal State
  const [selectedTenderForBid, setSelectedTenderForBid] = useState('');
  const [bidQuoteAmount, setBidQuoteAmount] = useState('');
  const [bidTimelineDays, setBidTimelineDays] = useState('60');
  const [bidDeclarationAccepted, setBidDeclarationAccepted] = useState(true);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidFeedback, setBidFeedback] = useState(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  // Document Upload State
  const [uploadDocType, setUploadDocType] = useState('GST_CERT');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadProgressMsg, setUploadProgressMsg] = useState('');
  const [uploadFeedback, setUploadFeedback] = useState(null);
  const fileInputRef = useRef(null);

  // Document Preview Modal State
  const [previewDoc, setPreviewDoc] = useState(null);
  const [deletingDocId, setDeletingDocId] = useState(null);
  const [deleteFeedback, setDeleteFeedback] = useState(null);

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    phone: '',
    email: '',
    registered_address: '',
    signatory_name: 'Rajesh Kumar Mehta',
    signatory_designation: 'Managing Director & Authorized Signatory',
    signatory_phone: '+91 98410 88231',
    signatory_email: '',
    bank_name: 'State Bank of India',
    bank_account: '39485729104',
    bank_ifsc: 'SBIN0001824',
    annual_turnover: '₹24.80 Crores',
    msme_category: 'Medium Enterprise (Plant & Machinery < ₹50 Cr)',
    itr_ay: 'AY 2025-26 Filed (Valid)'
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState(false);

  const handleDownloadDoc = (doc) => {
    if (!doc) return;
    const extData = typeof doc.extracted_data === 'string' ? JSON.parse(doc.extracted_data || '{}') : (doc.extracted_data || {});
    const fileName = doc.file_url ? doc.file_url.split('/').pop() : `${doc.doc_type}_${(currentBidder?.company_name || 'document').replace(/\\s+/g, '_')}.pdf`;

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
STATUTORY CERTIFICATE AUDIT RECORD (VENDOR VAULT)
=======================================================
DOCUMENT TYPE:     ${doc.doc_type}
LEGAL ENTITY:      ${extData.company_name || extData.entity_name || currentBidder?.company_name}
GSTIN:             ${extData.gstin || currentBidder?.gstin}
PAN:               ${extData.pan || currentBidder?.pan_number}
REGISTRATION NO:   ${extData.registration_number || extData.udyam || currentBidder?.udyam_number || 'N/A'}
UPLOAD DATE:       ${new Date(doc.uploaded_at).toLocaleString('en-IN')}
STATUS:            ${doc.flagged ? 'FLAGGED: ' + doc.flag_reason : 'VERIFIED COMPLIANT'}
=======================================================`;
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${doc.doc_type}_${(currentBidder?.company_name || 'document').replace(/\\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1. Fetch bidders & initialize
  useEffect(() => {
    async function loadBidders() {
      try {
        const res = await fetch('/api/bidders');
        const data = await res.json();
        if (data.success && data.bidders.length > 0) {
          setBidders(data.bidders);
          if (isVendor && user?.bidder_id) {
            setSelectedBidderId(user.bidder_id);
            localStorage.setItem('bidshield_active_vendor_id', user.bidder_id);
          } else if (!selectedBidderId || !data.bidders.some(b => b.bidder_id === selectedBidderId)) {
            const defaultId = (isVendor && user?.bidder_id) ? user.bidder_id : data.bidders[0].bidder_id;
            setSelectedBidderId(defaultId);
            localStorage.setItem('bidshield_active_vendor_id', defaultId);
          }
        }
      } catch (err) {
        console.error('Failed to load bidders:', err);
      }
    }
    loadBidders();
  }, [isVendor, user]);

  // 2. Fetch vendor data
  const loadVendorData = async (bidderId) => {
    if (!bidderId) return;
    setLoading(true);
    setBidFeedback(null);
    setUploadFeedback(null);
    setDeleteFeedback(null);

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

      if (bData.success) {
        setCurrentBidder(bData.bidder);
        // Load saved profile data from localStorage if exists
        const savedProfileKey = `bidshield_vendor_profile_${bidderId}`;
        const storedProfile = localStorage.getItem(savedProfileKey);
        let extraProfile = {};
        if (storedProfile) {
          try { extraProfile = JSON.parse(storedProfile); } catch (e) {}
        }
        setProfileForm({
          phone: bData.bidder.phone || '+91 44 2839 0110',
          email: bData.bidder.email || 'tenders@apexpetrochem.in',
          registered_address: bData.bidder.registered_address || 'Plot 42, SIDCO Industrial Estate, Ambattur, Chennai 600058',
          signatory_name: extraProfile.signatory_name || 'Rajesh Kumar Mehta',
          signatory_designation: extraProfile.signatory_designation || 'Managing Director & Authorized Signatory',
          signatory_phone: extraProfile.signatory_phone || '+91 98410 88231',
          signatory_email: extraProfile.signatory_email || bData.bidder.email || 'r.mehta@apexpetrochem.in',
          bank_name: extraProfile.bank_name || 'State Bank of India',
          bank_account: extraProfile.bank_account || '39485729104',
          bank_ifsc: extraProfile.bank_ifsc || 'SBIN0001824',
          annual_turnover: extraProfile.annual_turnover || '₹28.40 Crores',
          msme_category: extraProfile.msme_category || 'Medium Enterprise (Plant & Machinery < ₹50 Cr)',
          itr_ay: extraProfile.itr_ay || 'AY 2025-26 Filed (Verified)'
        });
      }
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

  // Submit Bid Quotation
  const handleBidSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!selectedTenderForBid || !bidQuoteAmount) {
      alert('Please select an open tender and enter your quotation amount.');
      return;
    }
    if (!bidDeclarationAccepted) {
      alert('You must accept the GFR 2017 compliance declaration to submit a bid.');
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
        setBidFeedback({ type: 'success', text: 'Commercial quotation submitted successfully to CPCL and logged to the central ledger!' });
        setBidQuoteAmount('');
        setSelectedTenderForBid('');
        setIsBidModalOpen(false);
        await loadVendorData(selectedBidderId);
      } else {
        setBidFeedback({ type: 'error', text: data.message || 'Failed to submit quotation.' });
      }
    } catch (err) {
      setBidFeedback({ type: 'error', text: 'Network error submitting bid quotation.' });
    } finally {
      setSubmittingBid(false);
    }
  };

  // Upload Document
  const handleDocUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      alert('Please select a certificate/document file to upload.');
      return;
    }
    setUploadingDoc(true);
    setUploadProgressMsg('Scanning document text via OCR...');
    setUploadFeedback(null);

    let scanResult = null;
    try {
      scanResult = await scanAndVerifyDocument(
        uploadFile,
        uploadDocType,
        currentBidder,
        (pct, msg) => setUploadProgressMsg(`${msg} (${pct}%)`)
      );
    } catch (scanErr) {
      console.warn('OCR scan error:', scanErr);
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('doc_type', uploadDocType);
    if (scanResult) {
      formData.append('extracted_data', JSON.stringify(scanResult.extracted));
      formData.append('flagged', scanResult.flagged ? '1' : '0');
      formData.append('flag_reason', scanResult.flag_reason || '');
    }

    try {
      const res = await fetch(`/api/bidders/${selectedBidderId}/documents`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        const isDocFlagged = Boolean(data.document?.flagged);
        setUploadFeedback({
          type: isDocFlagged ? 'warning' : 'success',
          text: isDocFlagged
            ? `⚠️ Discrepancy Flagged: ${data.document?.flag_reason}`
            : '✅ Document verified clean against statutory requirements!'
        });
        setUploadFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        await loadVendorData(selectedBidderId);
      } else {
        setUploadFeedback({ type: 'error', text: data.message || 'Upload failed.' });
      }
    } catch (err) {
      setUploadFeedback({ type: 'error', text: 'Failed to upload document.' });
    } finally {
      setUploadingDoc(false);
      setUploadProgressMsg('');
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docId, docType) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete this ${docType} certificate? This action will be permanently recorded in the statutory audit ledger.`
    );
    if (!confirmDelete) return;

    setDeletingDocId(docId);
    setDeleteFeedback(null);

    try {
      const res = await fetch(`/api/bidders/${selectedBidderId}/documents/${docId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success) {
        setDeleteFeedback({ type: 'success', text: `Document successfully removed from the vault.` });
        if (previewDoc && previewDoc.doc_id === docId) {
          setPreviewDoc(null);
        }
        await loadVendorData(selectedBidderId);
      } else {
        setDeleteFeedback({ type: 'error', text: data.message || 'Failed to delete document.' });
      }
    } catch (err) {
      setDeleteFeedback({ type: 'error', text: 'Error connecting to delete API.' });
    } finally {
      setDeletingDocId(null);
    }
  };

  // Save Profile
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSaveSuccess(false);

    try {
      // 1. Update Bidder on Backend DB
      const res = await fetch(`/api/bidders/${selectedBidderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: profileForm.phone,
          email: profileForm.email,
          registered_address: profileForm.registered_address
        })
      });

      // 2. Persist comprehensive KYC/banking fields locally
      const savedProfileKey = `bidshield_vendor_profile_${selectedBidderId}`;
      localStorage.setItem(savedProfileKey, JSON.stringify(profileForm));

      setProfileSaveSuccess(true);
      await loadVendorData(selectedBidderId);
      setTimeout(() => setProfileSaveSuccess(false), 4000);
    } catch (err) {
      alert('Failed to save profile changes. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  const formatINR = (val) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val || 0);

  const formatDate = (val) => {
    if (!val) return '—';
    const num = Number(val);
    const d = !isNaN(num) && num > 1000000000 ? new Date(num) : new Date(val);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isLowRisk = compliance?.risk === 'Low';
  const isMediumRisk = compliance?.risk === 'Medium';
  const isHighRisk = compliance?.risk === 'High';

  // Mandatory Statutory Documents Requirement
  const MANDATORY_DOCS = [
    { type: 'GST_CERT', label: 'GST Registration Certificate', sublabel: 'Form GST REG-06', hint: 'Mandatory for GSTN tax compliance' },
    { type: 'PAN_CARD', label: 'Permanent Account Number Card', sublabel: 'Income Tax PAN', hint: 'Mandatory for direct tax & legal entity proof' },
    { type: 'UDYAM_CERT', label: 'MSME Udyam Registration Certificate', sublabel: 'Ministry of MSME', hint: 'Required for purchase preference & EMD waiver' }
  ];

  const uploadedDocMap = (documents || []).reduce((acc, d) => {
    acc[d.doc_type] = d;
    return acc;
  }, {});

  const mandatoryUploadedCount = MANDATORY_DOCS.filter((m) => uploadedDocMap[m.type]).length;
  const missingMandatoryDocs = MANDATORY_DOCS.filter((m) => !uploadedDocMap[m.type]);
  const hasAllMandatoryDocs = missingMandatoryDocs.length === 0;
  const hasFlaggedDocs = (documents || []).some((d) => d.flagged === 1 || d.flagged === '1' || d.flagged === true);

  // Strict Statutory Clean Document Tracking
  const cleanMandatoryDocs = MANDATORY_DOCS.filter((m) => {
    const doc = uploadedDocMap[m.type];
    return doc && !(doc.flagged === 1 || doc.flagged === '1' || doc.flagged === true);
  });
  const mandatoryCleanCount = cleanMandatoryDocs.length;
  const flaggedMandatoryCount = MANDATORY_DOCS.filter((m) => {
    const doc = uploadedDocMap[m.type];
    return doc && (doc.flagged === 1 || doc.flagged === '1' || doc.flagged === true);
  }).length;
  const isClearedToBid = hasAllMandatoryDocs && !hasFlaggedDocs && (compliance?.risk !== 'High');

  // Compute realistic public procurement readiness (GFR 2017 & GeM Rules)
  // 40% Profile KYC + 40% Clean Statutory Certificates + 20% Central Registry Standing
  const calculateProfileCompletion = () => {
    let score = 0;
    if (currentBidder?.company_name) score += 8;
    if (currentBidder?.gstin) score += 8;
    if (currentBidder?.pan_number) score += 8;
    if (profileForm.email && profileForm.phone) score += 8;
    if (profileForm.bank_account && profileForm.bank_ifsc) score += 8;

    // ONLY clean, verified statutory documents award readiness points!
    const docScore = Math.round((mandatoryCleanCount / MANDATORY_DOCS.length) * 40);
    score += docScore;

    // Central Registry compliance contribution
    const compScore = Math.round(((compliance?.score || 0) / 100) * 20);
    score += compScore;

    // HARD STATUTORY DISQUALIFICATION CAP:
    // If ANY mandatory document has a discrepancy or compliance is High Risk,
    // procurement clearance is BLOCKED and readiness is capped at max 40% (Profile only).
    if (hasFlaggedDocs || compliance?.risk === 'High') {
      return Math.min(score, 40);
    }

    return Math.min(score, 100);
  };

  const completionPct = calculateProfileCompletion();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Header & Identity Strip */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded border border-slate-200">
              Vendor GSTIN: {currentBidder?.gstin || '33AAACA1234A1Z5'}
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded border border-blue-200">
              MSME UDYAM: {currentBidder?.udyam_number || 'UDYAM-TN-02-0012345'}
            </span>
            <span className="text-[11px] text-slate-500">
              Enrolled: {formatDate(currentBidder?.created_at)}
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-[#0B2546] flex items-center gap-2.5">
            <Building2 className="w-6 h-6 text-sky-600 shrink-0" />
            <span className="truncate">{currentBidder ? currentBidder.company_name : 'Loading Profile...'}</span>
          </h1>
          <p className="text-xs text-slate-500 max-w-3xl truncate">
            {currentBidder?.registered_address} &bull; {currentBidder?.email} &bull; {currentBidder?.phone}
          </p>
        </div>

        {/* Action Controls & Identity Lock */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 shrink-0">
          {isVendor ? (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 flex items-center space-x-2.5">
              <Building2 className="w-4 h-4 text-[#0B2546] shrink-0" />
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-800">
                  {user?.company_name || currentBidder?.company_name}
                </span>
                <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded border border-emerald-200">
                  Verified Signatory
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Officer Inspecting:</span>
              <select
                value={selectedBidderId}
                onChange={(e) => handleVendorSwitch(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
              >
                {bidders.map((b) => (
                  <option key={b.bidder_id} value={b.bidder_id}>
                    {b.company_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleReverify}
            disabled={reverifying}
            className="px-3.5 py-2 bg-[#0B2546] hover:bg-[#07182D] text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50 cursor-pointer"
            title="Trigger automated statutory re-check across government registries"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${reverifying ? 'animate-spin' : ''}`} />
            <span>{reverifying ? 'Auditing Registries...' : 'Re-verify Health'}</span>
          </button>
        </div>
      </div>

      {/* 2. Four Prominent Navigation Tabs (Matches Left Navbar Options) */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs">
        <nav className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => handleTabChange('overview')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[#0B2546] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>1. Overview & Guide</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('profile')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-[#0B2546] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <div className="flex items-center space-x-1.5">
              <span>2. Profile Status</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'profile' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {completionPct}%
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('documents')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'documents'
                ? 'bg-[#0B2546] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <div className="flex items-center space-x-1.5">
              <span>3. Uploaded Documents</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'documents' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {documents.length}
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleTabChange('apply')}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'apply'
                ? 'bg-[#0B2546] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <div className="flex items-center space-x-1.5">
              <span>4. Apply for Tender/BIDs</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                activeTab === 'apply' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {openTenders.length} Live
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Loading Spinner */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
          <div className="w-8 h-8 border-4 border-[#0B2546] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-medium">Loading statutory verification health, documents vault, and tender matrix...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: OVERVIEW & ACTIONABLE WORKSPACE */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Top 4 Compact Scorecard Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {/* 1. Health Score */}
                <div
                  className={`p-4 rounded-xl border shadow-2xs flex flex-col justify-between transition ${
                    !hasAllMandatoryDocs
                      ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                      : isLowRisk
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                      : isMediumRisk
                      ? 'bg-amber-50/50 border-amber-200 text-amber-950'
                      : 'bg-rose-50/50 border-rose-200 text-rose-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Statutory Health Score
                      </span>
                      <ShieldCheck
                        className={`w-4 h-4 ${
                          !hasAllMandatoryDocs
                            ? 'text-amber-600'
                            : isLowRisk
                            ? 'text-emerald-600'
                            : isMediumRisk
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-1.5">
                      {!hasAllMandatoryDocs ? (
                        <div className="flex items-baseline space-x-1.5">
                          <span className="text-2xl font-black font-mono tracking-tight text-amber-800">
                            Pending
                          </span>
                          <span className="text-xs text-amber-700 font-bold">
                            ({mandatoryUploadedCount}/3 Docs)
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-baseline space-x-1">
                          <span className="text-2xl font-black font-mono tracking-tight">
                            {compliance?.score ?? 100}
                          </span>
                          <span className="text-xs text-slate-500 font-bold">/ 100</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-200/70 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Status:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        !hasAllMandatoryDocs
                          ? 'bg-amber-200/80 text-amber-900'
                          : isLowRisk
                          ? 'bg-emerald-200/80 text-emerald-900'
                          : isMediumRisk
                          ? 'bg-amber-200/80 text-amber-900'
                          : 'bg-rose-200/80 text-rose-900'
                      }`}
                    >
                      {!hasAllMandatoryDocs
                        ? 'Missing Documents'
                        : isLowRisk
                        ? 'Low Risk (Verified)'
                        : compliance?.risk || 'Discrepancy'}
                    </span>
                  </div>
                </div>

                {/* 2. Mandatory Documents in Vault */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Mandatory Certificates
                      </span>
                      <FileCheck2 className="w-4 h-4 text-[#0B2546]" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-1.5">
                      <span className={`text-2xl font-black font-mono ${flaggedMandatoryCount > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {mandatoryCleanCount} / {MANDATORY_DOCS.length}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Verified Clean</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Vault Health:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        flaggedMandatoryCount > 0
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : hasAllMandatoryDocs
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {flaggedMandatoryCount > 0
                        ? `⚠️ ${flaggedMandatoryCount} Discrepanc${flaggedMandatoryCount > 1 ? 'ies' : 'y'}`
                        : hasAllMandatoryDocs
                        ? 'Complete (3/3 Clean)'
                        : `${missingMandatoryDocs.length} Missing`}
                    </span>
                  </div>
                </div>

                {/* 3. Submitted Quotations */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Submitted Bids
                      </span>
                      <Layers className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-1.5">
                      <span className="text-2xl font-black font-mono text-slate-900">
                        {bids.length}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Active Quotations</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Awarded Contracts:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                      {bids.filter((b) => b.status === 'Awarded').length} Won
                    </span>
                  </div>
                </div>

                {/* 4. Profile & Bidding Clearance */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Bidding Clearance
                      </span>
                      <UserCheck className="w-4 h-4 text-sky-600" />
                    </div>
                    <div className="mt-2 flex items-baseline space-x-1.5">
                      <span className={`text-2xl font-black font-mono ${!isClearedToBid ? 'text-rose-600' : 'text-[#0B2546]'}`}>
                        {completionPct}%
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{!isClearedToBid ? 'Readiness (Blocked)' : 'Readiness'}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Mandate Status:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] font-mono ${
                        isClearedToBid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : flaggedMandatoryCount > 0
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {isClearedToBid
                        ? '✅ Cleared to Bid'
                        : flaggedMandatoryCount > 0
                        ? '❌ Clearance Blocked'
                        : '⚠️ Action Needed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* ACTIONABLE SECTION 1: MANDATORY STATUTORY DOCUMENT CHECKLIST */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-[#0B2546] flex items-center space-x-2">
                      <FileCheck2 className="w-4 h-4 text-sky-600" />
                      <span>Mandatory Statutory Document Checklist (GFR 2017 Requirement)</span>
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All 3 baseline certificates must be uploaded and verified before official tender awarding clearance is granted.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-md border ${
                        flaggedMandatoryCount > 0
                          ? 'bg-rose-50 text-rose-800 border border-rose-200'
                          : hasAllMandatoryDocs
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {flaggedMandatoryCount > 0
                        ? `⚠️ ${flaggedMandatoryCount} of ${MANDATORY_DOCS.length} Certificates Have Discrepancies`
                        : hasAllMandatoryDocs
                        ? '✓ All 3 Mandatory Certificates Verified Clean'
                        : `${mandatoryCleanCount} of ${MANDATORY_DOCS.length} Mandatory Certificates Verified`}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {MANDATORY_DOCS.map((reqDoc) => {
                    const uploaded = uploadedDocMap[reqDoc.type];
                    const isFlagged = uploaded && (uploaded.flagged === 1 || uploaded.flagged === '1' || uploaded.flagged === true);

                    return (
                      <div
                        key={reqDoc.type}
                        className={`rounded-xl border p-3.5 flex flex-col justify-between transition ${
                          !uploaded
                            ? 'bg-slate-50/70 border-dashed border-slate-300'
                            : isFlagged
                            ? 'bg-rose-50/30 border-rose-200'
                            : 'bg-white border-slate-200 shadow-2xs'
                        }`}
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              {reqDoc.type}
                            </span>
                            {uploaded ? (
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  isFlagged
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {isFlagged ? 'Discrepancy' : 'Verified'}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                                Missing
                              </span>
                            )}
                          </div>

                          <div className="pt-1">
                            <h4 className="text-xs font-bold text-slate-800 leading-snug">
                              {reqDoc.label}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {reqDoc.hint}
                            </p>
                          </div>
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                          {uploaded ? (
                            <div className="flex items-center justify-between w-full">
                              <span className="text-[11px] font-mono text-slate-500 truncate max-w-[130px]">
                                {uploaded.file_url ? uploaded.file_url.split('/').pop() : 'Uploaded'}
                              </span>
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(uploaded)}
                                className="inline-flex items-center space-x-1 text-xs font-bold text-[#0B2546] hover:underline cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>Inspect</span>
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setUploadDocType(reqDoc.type);
                                handleTabChange('documents');
                              }}
                              className="w-full inline-flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-lg bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                            >
                              <Upload className="w-3 h-3" />
                              <span>Upload {reqDoc.type.replace('_CERT', '').replace('_CARD', '')}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {!hasAllMandatoryDocs && (
                  <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 text-xs flex items-start space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Action Required:</strong> Please upload the remaining <strong>{missingMandatoryDocs.length} mandatory certificate(s)</strong> above. Your statutory health score will be certified and tender participation unlocked once these certificates are in your vault.
                    </div>
                  </div>
                )}
              </div>

              {/* ACTIONABLE SECTION 1B: SPECIALIZED CPCL / MoPNG STATUTORY STANDINGS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* A. Make in India (PPP-MII 2017) Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🇮🇳</span>
                      <div>
                        <h4 className="text-xs font-bold text-[#0B2546]">Make in India (PPP-MII) Standing</h4>
                        <p className="text-[10px] text-slate-400">Public Procurement Order 2017 (MoPNG)</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Class-I Local Supplier
                    </span>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Local Content (Domestic Value Addition):</span>
                      <span className="font-mono text-emerald-700 font-bold">
                        {currentBidder?.company_name?.toLowerCase().includes('apex') ? '82%' : (currentBidder?.company_name?.toLowerCase().includes('bharat') ? '68%' : '60%')}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: currentBidder?.company_name?.toLowerCase().includes('apex') ? '82%' : (currentBidder?.company_name?.toLowerCase().includes('bharat') ? '68%' : '60%') }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>Threshold: 50% for Class-I</span>
                      <span className="text-emerald-700 font-semibold">✓ 20% L1 Preference Margin Active</span>
                    </div>
                  </div>
                </div>

                {/* B. EPFO & ESIC Labour Compliance Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-4.5 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#0B2546]">EPFO & ESIC Labour Standing</h4>
                        <p className="text-[10px] text-slate-400">Shram Suvidha Central Databank</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      Active / Cleared
                    </span>
                  </div>

                  <div className="space-y-1.5 text-[11px] pt-1">
                    <div className="flex justify-between items-center py-0.5 border-b border-slate-100">
                      <span className="text-slate-500">EPF Code:</span>
                      <span className="font-mono font-bold text-slate-800">TN/MAS/00{currentBidder?.pan_number?.slice(5, 9) || '4821'}/000</span>
                    </div>
                    <div className="flex justify-between items-center py-0.5">
                      <span className="text-slate-500">ECR & Monthly Challans:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Up-to-Date (Refinery Pass Eligible)</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTIONABLE SECTION 2: TWO-COLUMN WORKSPACE (LIVE TENDERS & RECENT ACTIVITY) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left (7 Cols): Live CPCL Procurement Tenders */}
                <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2546] flex items-center space-x-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        <span>Active Procurement Tenders Ready for Bidding</span>
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Participate in live tenders published by Chennai Petroleum Corporation Limited.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('apply')}
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 flex items-center space-x-0.5 cursor-pointer"
                    >
                      <span>View All ({openTenders.length})</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {openTenders.slice(0, 4).map((tender) => {
                      const existingBid = bids.find((b) => b.tender_id === tender.tender_id);
                      const isTenderOpen = (tender.status || '').toLowerCase() === 'open';
                      const deadlineNum = Number(tender.submission_deadline);
                      const deadlineDate = !isNaN(deadlineNum) && deadlineNum > 1000000000 ? new Date(deadlineNum) : new Date(tender.submission_deadline);
                      const isExpired = deadlineDate && !isNaN(deadlineDate.getTime()) ? deadlineDate.getTime() < Date.now() : false;
                      const tenderValue = tender.estimated_value || tender.estimated_value_inr || tender.budget || 0;

                      return (
                        <div
                          key={tender.tender_id}
                          className="rounded-lg border border-slate-200 p-3 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                                {tender.tender_ref_number || tender.tender_id.substring(0, 8).toUpperCase()}
                              </span>
                              {existingBid ? (
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  existingBid.status === 'Awarded'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    : 'bg-blue-100 text-blue-800 border-blue-200'
                                }`}>
                                  {existingBid.status === 'Awarded' ? '🏆 Awarded' : '✓ Bid Submitted'}
                                </span>
                              ) : isTenderOpen && !isExpired ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                  Open
                                </span>
                              ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                                  {tender.status === 'Awarded' ? 'Awarded' : 'Closed'}
                                </span>
                              )}
                              <span className="text-xs font-bold text-slate-800 truncate block">
                                {tender.title}
                              </span>
                            </div>
                            <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                              <span>Est: <strong className="text-slate-700">{formatINR(tenderValue)}</strong></span>
                              <span>&bull;</span>
                              <span>Due: {formatDate(tender.submission_deadline)}</span>
                            </div>
                          </div>

                          <div className="shrink-0">
                            {existingBid ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTenderForBid(tender.tender_id);
                                  handleTabChange('apply');
                                }}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 cursor-pointer"
                              >
                                <span>View Bid ({formatINR(existingBid.bid_amount)})</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            ) : !isTenderOpen || isExpired ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded bg-slate-100 text-slate-400 text-xs font-semibold">
                                Bidding Closed
                              </span>
                            ) : !isClearedToBid ? (
                              <button
                                type="button"
                                onClick={() => handleTabChange('docs')}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold transition border border-rose-200 cursor-pointer"
                              >
                                <span>{hasFlaggedDocs ? '⚠️ Resolve Discrepancy to Bid' : 'Upload Docs to Bid'}</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedTenderForBid(tender.tender_id);
                                  handleTabChange('apply');
                                }}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                              >
                                <span>Apply Bid</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Right (5 Cols): Recent Statutory & Audit Ledger Activity */}
                <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#0B2546] flex items-center space-x-1.5">
                      <Clock className="w-4 h-4 text-[#0B2546]" />
                      <span>Recent Compliance Activity</span>
                    </h3>
                    <span className="text-[11px] text-slate-400 font-mono">Audit Trail</span>
                  </div>

                  {auditLogs.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      No compliance transactions recorded yet.
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {auditLogs.slice(0, 4).map((log) => (
                        <div key={log.log_id} className="text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-100 space-y-0.5">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800 font-mono text-[11px]">
                              {log.action}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(log.timestamp)}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2">
                            {log.details}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Statutory Advisory Message */}
              {hasAllMandatoryDocs && (
                compliance?.flags && compliance.flags.length > 0 ? (
                  <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                    isHighRisk ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
                  }`}>
                    <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${isHighRisk ? 'text-rose-600' : 'text-amber-600'}`} />
                    <div className="space-y-1 text-xs">
                      <h4 className={`font-bold uppercase tracking-wide ${isHighRisk ? 'text-rose-900' : 'text-amber-900'}`}>
                        Statutory Discrepancy Notice ({compliance.flags.length})
                      </h4>
                      <ul className="space-y-0.5">
                        {compliance.flags.map((flag, idx) => (
                          <li key={idx} className={isHighRisk ? 'text-rose-800' : 'text-amber-800'}>
                            &bull; {flag}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl border bg-emerald-50 border-emerald-200 flex items-center space-x-3 text-xs text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <strong>GFR 2017 Pre-Qualification Certified:</strong> All mandatory statutory certificates and central registry checks are verified clean.
                    </div>
                  </div>
                )
              )}
            </div>
          )}

          {/* TAB 2: PROFILE STATUS & ENTERPRISE KYC DESK */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Completion Meter Card */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Corporate Profile Completion
                    </span>
                    <h2 className="text-lg font-extrabold text-[#0B2546]">
                      Enterprise Public Procurement Readiness
                    </h2>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-black font-mono text-[#0B2546]">{completionPct}%</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                      completionPct >= 80 ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {completionPct >= 80 ? 'Eligible for CPCL Tenders' : 'Incomplete Information'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-sky-500 to-[#0B2546] h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500">
                  Fill in your authorized signatory and banking details below to ensure seamless Earnest Money Deposit (EMD) processing and automatic tender evaluations.
                </p>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-6">
                {/* 1. Legal Statutory Pillars (Verified) */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-[#0B2546]" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        1. Legal Registration Pillars (Verified against Registries)
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-bold">
                      Registry Locked
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Legal Company Name</label>
                      <input
                        type="text"
                        disabled
                        value={currentBidder?.company_name || ''}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">GSTIN (15-Digit)</label>
                      <input
                        type="text"
                        disabled
                        value={currentBidder?.gstin || ''}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">Permanent Account No (PAN)</label>
                      <input
                        type="text"
                        disabled
                        value={currentBidder?.pan_number || ''}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-500 font-medium mb-1">MSME Udyam Number</label>
                      <input
                        type="text"
                        disabled
                        value={currentBidder?.udyam_number || ''}
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50 font-mono font-bold text-slate-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Registered Communications */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                    <Mail className="w-4 h-4 text-[#0B2546]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      2. Corporate Communications & Registered Office (Editable)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Official Tendering Email *</label>
                      <input
                        type="email"
                        required
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0B2546] focus:border-[#0B2546]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Corporate Phone / Landline *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0B2546] focus:border-[#0B2546]"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-slate-700 font-bold mb-1">Registered Office Address *</label>
                      <textarea
                        rows={2}
                        required
                        value={profileForm.registered_address}
                        onChange={(e) => setProfileForm({ ...profileForm, registered_address: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0B2546] focus:border-[#0B2546]"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Authorized Signatory & Management KYC */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                    <UserCheck className="w-4 h-4 text-[#0B2546]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      3. Authorized Signatory & Tendering Representation
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Signatory Full Name *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.signatory_name}
                        onChange={(e) => setProfileForm({ ...profileForm, signatory_name: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0B2546]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Designation / Capacity *</label>
                      <input
                        type="text"
                        required
                        value={profileForm.signatory_designation}
                        onChange={(e) => setProfileForm({ ...profileForm, signatory_designation: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0B2546]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Signatory Direct Mobile</label>
                      <input
                        type="text"
                        value={profileForm.signatory_phone}
                        onChange={(e) => setProfileForm({ ...profileForm, signatory_phone: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0B2546]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Signatory Direct Email</label>
                      <input
                        type="email"
                        value={profileForm.signatory_email}
                        onChange={(e) => setProfileForm({ ...profileForm, signatory_email: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0B2546]"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Banking & EMD Mandate Details */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
                    <CreditCard className="w-4 h-4 text-[#0B2546]" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      4. Banking Mandate (EMD & Performance Security Refund)
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Bank Name</label>
                      <input
                        type="text"
                        value={profileForm.bank_name}
                        onChange={(e) => setProfileForm({ ...profileForm, bank_name: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0B2546]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">Current Account Number</label>
                      <input
                        type="text"
                        value={profileForm.bank_account}
                        onChange={(e) => setProfileForm({ ...profileForm, bank_account: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-bold focus:ring-1 focus:ring-[#0B2546]"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-700 font-bold mb-1">RTGS / IFSC Code</label>
                      <input
                        type="text"
                        value={profileForm.bank_ifsc}
                        onChange={(e) => setProfileForm({ ...profileForm, bank_ifsc: e.target.value })}
                        className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-bold focus:ring-1 focus:ring-[#0B2546]"
                      />
                    </div>
                  </div>
                </div>

                {/* Save Banner & Action */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="text-xs text-slate-600">
                    {profileSaveSuccess ? (
                      <span className="inline-flex items-center text-emerald-700 font-bold">
                        <CheckCircle2 className="w-4 h-4 mr-1.5" />
                        Company profile and authorized signatory records updated successfully!
                      </span>
                    ) : (
                      <span>All updates are synchronized with the central CPCL vendor master ledger.</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center space-x-2 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{savingProfile ? 'Saving Changes...' : 'Save & Update Profile'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 3: UPLOADED DOCUMENTS & CERTIFICATES VAULT */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Vault Header & Direct Upload Desk */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                  <div className="flex items-center space-x-2.5">
                    <FileCheck2 className="w-6 h-6 text-sky-600 shrink-0" />
                    <div>
                      <h2 className="text-lg font-extrabold text-[#0B2546]">
                        Statutory Documents Vault
                      </h2>
                      <p className="text-xs text-slate-500">
                        Showcasing all uploaded regulatory certificates with optical verification & instant deletion options.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-3 py-1 rounded-lg border border-slate-200">
                      {documents.length} Certificates on Record
                    </span>
                  </div>
                </div>

                {/* Upload Feedback Notice */}
                {uploadFeedback && (
                  <div
                    className={`text-xs p-3.5 rounded-xl border flex items-center space-x-2.5 ${
                      uploadFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : uploadFeedback.type === 'warning'
                        ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-xs'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {uploadFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <span className="font-semibold">{uploadFeedback.text}</span>
                  </div>
                )}

                {/* Delete Feedback Notice */}
                {deleteFeedback && (
                  <div
                    className={`text-xs p-3.5 rounded-xl border flex items-center space-x-2.5 ${
                      deleteFeedback.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span className="font-medium">{deleteFeedback.text}</span>
                  </div>
                )}

                {/* Document Upload Form */}
                <form onSubmit={handleDocUpload} className="bg-slate-50/80 border border-slate-200 rounded-xl p-4.5 space-y-4">
                  <div className="text-xs font-bold text-[#0B2546] uppercase tracking-wider flex items-center space-x-2">
                    <Upload className="w-4 h-4 text-sky-600" />
                    <span>Upload New Statutory Certificate to Vault</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Document Classification
                      </label>
                      <select
                        value={uploadDocType}
                        onChange={(e) => setUploadDocType(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0B2546]"
                      >
                        <option value="GST_CERT">GST Registration Certificate (GST REG-06)</option>
                        <option value="PAN_CARD">Permanent Account Number (PAN Card)</option>
                        <option value="UDYAM_CERT">MSME Udyam Registration Certificate</option>
                        <option value="ITR_V">ITR-V Income Tax Return Acknowledgement</option>
                        <option value="AUDIT_REPORT">Audited Balance Sheet / Financials</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Select Certificate File (PDF, Image, or Text)
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*,.pdf,.txt"
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                          className="w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#0B2546]/10 file:text-[#0B2546] hover:file:bg-[#0B2546]/20 border border-slate-300 rounded-lg bg-white p-1"
                        />
                        <button
                          type="submit"
                          disabled={uploadingDoc || !uploadFile}
                          className="inline-flex items-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition disabled:opacity-50 shrink-0 cursor-pointer"
                        >
                          {uploadingDoc ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <Upload className="w-3.5 h-3.5" />
                              <span>Upload to Vault</span>
                            </>
                          )}
                        </button>
                      </div>
                      {uploadProgressMsg && (
                        <div className="text-xs text-sky-700 font-medium flex items-center space-x-1.5 pt-1.5 animate-pulse">
                          <RefreshCw className="w-3 h-3 animate-spin" />
                          <span>{uploadProgressMsg}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </form>

                {/* Documents Grid / Vault Cards */}
                {documents.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 text-xs">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-700 text-sm">Your Statutory Vault is Currently Empty</p>
                    <p className="text-slate-400 mt-0.5">Use the upload box above to add your company certificates for automated AI verification.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documents.map((doc) => {
                      const extData = doc.extracted_data || {};
                      const isDeleting = deletingDocId === doc.doc_id;
                      const isFlagged = doc.flagged === 1 || doc.flagged === '1' || doc.flagged === true;

                      return (
                        <div
                          key={doc.doc_id}
                          className={`rounded-xl border p-4 transition ${
                            isFlagged
                              ? 'border-rose-200 bg-rose-50/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                isFlagged ? 'bg-rose-100 text-rose-700' : 'bg-blue-50 text-[#0B2546]'
                              }`}>
                                <FileText className="w-4.5 h-4.5" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-bold text-slate-800 truncate max-w-xs">
                                    {doc.file_url ? doc.file_url.split('/').pop() : 'Statutory_Certificate.pdf'}
                                  </span>
                                  <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                                    {doc.doc_type}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
                                  <span>Uploaded {formatDate(doc.uploaded_at)}</span>
                                  {extData?.identified_number && (
                                    <>
                                      <span>&bull;</span>
                                      <span className="font-mono text-slate-700 font-semibold">
                                        Identified: {extData.identified_number}
                                      </span>
                                    </>
                                  )}
                                  <span className="hidden sm:inline">&bull;</span>
                                  <span className="font-mono text-slate-400 hidden sm:inline">
                                    ID: {doc.doc_id.substring(0, 8).toUpperCase()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Right: Status Pill & Action Buttons */}
                            <div className="flex items-center space-x-2.5 shrink-0">
                              <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5">
                                <span
                                  className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                    isFlagged
                                      ? 'bg-rose-50 text-rose-800 border-rose-200'
                                      : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  }`}
                                >
                                  {isFlagged ? (
                                    <>
                                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                                      <span>Discrepancy</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      <span>Verified Clean</span>
                                    </>
                                  )}
                                </span>
                                {!isFlagged && (
                                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100/70 text-emerald-900 border border-emerald-300">
                                    <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                    <span>DigiLocker</span>
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center space-x-1 border-l border-slate-200 pl-2">
                                <button
                                  type="button"
                                  onClick={() => setPreviewDoc(doc)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                                  title="Preview certificate & inspect document"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>View</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDownloadDoc(doc)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                                  title="Download certificate file"
                                >
                                  <Download className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Download</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={isDeleting}
                                  onClick={() => handleDeleteDoc(doc.doc_id, doc.doc_type)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer disabled:opacity-50"
                                  title="Permanently remove certificate from vault"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{isDeleting ? '...' : 'Delete'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Inline Discrepancy Notice */}
                          {isFlagged && doc.flag_reason && (
                            <div className="mt-2.5 pt-2.5 border-t border-rose-100 flex items-start space-x-2 text-xs text-rose-800">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                              <span className="font-medium">{doc.flag_reason}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: APPLY FOR TENDER/BIDS */}
          {activeTab === 'apply' && (
            <div className="space-y-6">
              {/* Apply Header */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                    CPCL Live Procurement Desk
                  </span>
                  <h2 className="text-xl font-extrabold text-[#0B2546] mt-0.5">
                    Participate & Apply for Public Tenders
                  </h2>
                  <p className="text-xs text-slate-500">
                    Submit commercial quotations, specify completion commitments, and track official awarding determinations.
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <span className="bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-lg">
                    {openTenders.length} Active Public Tenders
                  </span>
                </div>
              </div>

              {/* Quotation Submission Feedback Notice */}
              {bidFeedback && (
                <div
                  className={`text-xs p-4 rounded-xl border flex items-center space-x-2.5 ${
                    bidFeedback.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {bidFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                  )}
                  <span className="font-bold">{bidFeedback.text}</span>
                </div>
              )}

              {/* Active Tenders Catalog */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Available Tenders Open for Bidding
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {openTenders.map((tender) => {
                    const existingBid = bids.find((b) => b.tender_id === tender.tender_id);
                    const isOpen = (tender.status || '').toLowerCase() === 'open';
                    const isAwarded = (tender.status || '').toLowerCase() === 'awarded';
                    const deadlineNum = Number(tender.submission_deadline);
                    const deadlineDate = !isNaN(deadlineNum) && deadlineNum > 1000000000 ? new Date(deadlineNum) : new Date(tender.submission_deadline);
                    const isExpired = deadlineDate && !isNaN(deadlineDate.getTime()) ? deadlineDate.getTime() < Date.now() : false;
                    const isClosed = !isOpen || isAwarded || isExpired;
                    const tenderValue = tender.estimated_value || tender.estimated_value_inr || tender.budget || 0;

                    return (
                      <div
                        key={tender.tender_id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              Ref: {tender.tender_ref_number || tender.tender_id.substring(0, 8).toUpperCase()}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                existingBid
                                  ? 'bg-blue-100 text-blue-800'
                                  : isOpen && !isExpired
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : isAwarded
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {existingBid ? 'Bid Submitted' : isOpen && !isExpired ? 'Open for Bidding' : tender.status}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-[#0B2546] leading-snug">
                            {tender.title}
                          </h4>
                          <p className="text-xs text-slate-500 line-clamp-2">
                            {tender.description}
                          </p>

                          <div className="pt-2 grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Value</span>
                              <span className="font-mono font-extrabold text-slate-900 text-sm">
                                {formatINR(tenderValue)}
                              </span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">Submission Deadline</span>
                              <span className="font-semibold text-slate-700 text-xs">
                                {formatDate(tender.submission_deadline)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bid Status / Action Button */}
                        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                          {existingBid ? (
                            <div className="flex items-center justify-between w-full">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Quotation</span>
                                <span className="font-mono font-black text-[#0B2546] text-sm">
                                  {formatINR(existingBid.bid_amount)}
                                </span>
                              </div>
                              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                                existingBid.status === 'Awarded'
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                  : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}>
                                {existingBid.status === 'Awarded' ? '🏆 Contract Awarded' : 'Submitted (Under Review)'}
                              </span>
                            </div>
                          ) : isClosed ? (
                            <div className="w-full py-2 text-center text-xs text-slate-400 bg-slate-50 border border-slate-200 rounded-xl font-semibold">
                              Bidding closed for this tender ({isAwarded ? 'Contract Awarded' : 'Closed'})
                            </div>
                          ) : !isClearedToBid ? (
                            <button
                              type="button"
                              onClick={() => handleTabChange('docs')}
                              className="w-full inline-flex items-center justify-center space-x-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-300 text-rose-900 text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                              <span>{hasFlaggedDocs ? '⚠️ Resolve Document Discrepancies to Bid' : 'Upload Mandatory Docs to Unlock Bidding'}</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedTenderForBid(tender.tender_id);
                                setIsBidModalOpen(true);
                              }}
                              className="w-full inline-flex items-center justify-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white text-xs font-bold py-2.5 rounded-xl shadow-xs transition cursor-pointer"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Apply / Submit Official Quotation</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* My Submitted Bids Table */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="p-4.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-[#0B2546]" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      My Submitted Quotations Ledger ({bids.length})
                    </h4>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    Cryptographically Logged
                  </span>
                </div>

                {bids.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs">
                    <p className="font-semibold text-slate-700">No quotations submitted yet.</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click &ldquo;Apply / Submit Official Quotation&rdquo; on any active tender above.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-100/60 text-slate-600 font-bold uppercase tracking-wider">
                          <th className="px-5 py-3">Tender Ref / Title</th>
                          <th className="px-5 py-3">Submitted Quotation</th>
                          <th className="px-5 py-3">Submission Timestamp</th>
                          <th className="px-5 py-3">Official Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {bids.map((b) => {
                          const tender = openTenders.find((t) => t.tender_id === b.tender_id);
                          return (
                            <tr key={b.bid_id} className="hover:bg-slate-50/60 transition">
                              <td className="px-5 py-3.5 font-semibold text-slate-900">
                                <div>{tender?.title || 'CPCL Procurement Package'}</div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  Ref: {b.tender_id.substring(0, 8).toUpperCase()}
                                </div>
                              </td>

                              <td className="px-5 py-3.5 font-mono font-black text-slate-900 text-sm">
                                {formatINR(b.bid_amount)}
                              </td>

                              <td className="px-5 py-3.5 text-slate-500 font-mono">
                                {formatDate(b.submitted_at)}
                              </td>

                              <td className="px-5 py-3.5">
                                <span
                                  className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                    b.status === 'Awarded'
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                      : b.status === 'Not Selected'
                                      ? 'bg-slate-100 text-slate-600 border-slate-200'
                                      : 'bg-blue-50 text-blue-800 border-blue-200'
                                  }`}
                                >
                                  {b.status === 'Awarded' && <Award className="w-3.5 h-3.5 text-emerald-600" />}
                                  <span>{b.status}</span>
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
          )}
        </>
      )}

      {/* MODAL 1: DOCUMENT PREVIEW VIEWER MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-[#0B2546] to-[#143D6D] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold">
                  Statutory Certificate Preview: {previewDoc.doc_type}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* File Info */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Document Path</span>
                  <span className="font-mono font-semibold text-slate-800">{previewDoc.file_url}</span>
                </div>
                <span className="text-[11px] text-slate-500 font-mono">
                  Uploaded: {formatDate(previewDoc.uploaded_at)}
                </span>
              </div>

              {/* Rendered Preview if Base64 */}
              {previewDoc.file_content ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900/5 p-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-2 font-mono">
                    Encoded Document Payload
                  </span>
                  {/* If image base64 */}
                  {previewDoc.file_url && (previewDoc.file_url.endsWith('.png') || previewDoc.file_url.endsWith('.jpg') || previewDoc.file_url.endsWith('.jpeg')) ? (
                    <img
                      src={`data:image/png;base64,${previewDoc.file_content}`}
                      alt="Certificate Preview"
                      className="max-h-72 mx-auto rounded-lg shadow-sm border border-slate-200"
                    />
                  ) : (
                    <div className="bg-white p-4 rounded-lg border border-slate-200 text-left max-h-48 overflow-y-auto font-mono text-[11px] text-slate-800">
                      {atob(previewDoc.file_content.substring(0, 500))}...
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-slate-500">
                  <FileText className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-700">Digital Certificate Registered</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Physical copy recorded in the statutory registry ledger.</p>
                </div>
              )}

              {/* Extracted JSON Metadata */}
              <div>
                <div className="flex items-center space-x-1.5 mb-1.5">
                  <FileCode2 className="w-4 h-4 text-slate-600" />
                  <span className="text-[11px] font-bold uppercase text-slate-700">
                    Vision AI Extracted Metadata
                  </span>
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                  {JSON.stringify(previewDoc.extracted_data || {}, null, 2)}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDeleteDoc(previewDoc.doc_id, previewDoc.doc_type)}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Document</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: APPLY FOR TENDER / SUBMIT BID MODAL */}
      {isBidModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="p-4.5 bg-gradient-to-r from-[#0B2546] to-[#143D6D] text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <h3 className="text-sm font-bold">
                  Apply for CPCL Public Tender
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsBidModalOpen(false)}
                className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBidSubmit} className="p-6 space-y-4 text-xs">
              {/* Selected Tender Overview */}
              {(() => {
                const tender = openTenders.find((t) => t.tender_id === selectedTenderForBid);
                const tenderVal = tender?.estimated_value || tender?.estimated_value_inr || tender?.budget || 0;
                return (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Selected Procurement Opportunity
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {tender?.title || 'Commercial Tender'}
                    </h4>
                    <div className="flex items-center justify-between pt-1 text-slate-500 font-mono text-[11px]">
                      <span>Estimated Value: <strong>{formatINR(tenderVal)}</strong></span>
                      <span>Ref: {tender?.tender_ref_number || tender?.tender_id.substring(0, 8).toUpperCase()}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Quotation Amount Input */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Enterprise Commercial Quotation (INR ₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    min="1"
                    step="any"
                    placeholder="Enter quotation in Rupees (e.g. 4250000)"
                    value={bidQuoteAmount}
                    onChange={(e) => setBidQuoteAmount(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 font-mono font-bold focus:ring-1 focus:ring-[#0B2546]"
                  />
                </div>
                {bidQuoteAmount && (() => {
                  const tender = openTenders.find((t) => t.tender_id === selectedTenderForBid);
                  const tenderVal = tender?.estimated_value || tender?.estimated_value_inr || tender?.budget || 0;
                  if (!tender || !tenderVal) return null;
                  const diff = parseFloat(bidQuoteAmount) - tenderVal;
                  const pct = ((diff / tenderVal) * 100).toFixed(1);
                  return (
                    <div className="mt-1 text-[11px] font-mono">
                      {diff <= 0 ? (
                        <span className="text-emerald-700 font-bold">
                          ✓ {Math.abs(pct)}% below estimated budget (Highly Competitive)
                        </span>
                      ) : (
                        <span className="text-amber-700 font-bold">
                          ▲ {pct}% above estimated budget
                        </span>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Execution Timeline Commitment */}
              <div>
                <label className="block text-slate-800 font-bold mb-1">
                  Committed Delivery / Completion Timeline *
                </label>
                <select
                  value={bidTimelineDays}
                  onChange={(e) => setBidTimelineDays(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 focus:ring-1 focus:ring-[#0B2546]"
                >
                  <option value="45">45 Calendar Days (Expedited)</option>
                  <option value="60">60 Calendar Days (Standard CPCL Schedule)</option>
                  <option value="90">90 Calendar Days</option>
                  <option value="120">120 Calendar Days</option>
                </select>
              </div>

              {/* Statutory Compliance Declaration */}
              <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                <label className="flex items-start space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bidDeclarationAccepted}
                    onChange={(e) => setBidDeclarationAccepted(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-[#0B2546] focus:ring-[#0B2546]"
                  />
                  <span className="text-[11px] text-slate-700 leading-relaxed font-medium">
                    I hereby certify under <strong>GFR 2017 Rule 144(xi)</strong> that our enterprise is registered in India, is not debarred or blacklisted by any Government or CPCL department, and all submitted rates are firm and binding.
                  </span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsBidModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={submittingBid || !bidQuoteAmount || !bidDeclarationAccepted}
                  className="inline-flex items-center space-x-1.5 bg-[#0B2546] hover:bg-[#07182D] text-white font-bold px-5 py-2.5 rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
                >
                  {submittingBid ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Submitting to Ledger...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Official Tender Quotation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW & DOWNLOAD MODAL */}
      {previewDoc && (() => {
        const ext = typeof previewDoc.extracted_data === 'string' ? JSON.parse(previewDoc.extracted_data || '{}') : (previewDoc.extracted_data || {});
        const fileName = previewDoc.file_url ? previewDoc.file_url.split('/').pop() : `${previewDoc.doc_type || 'document'}.pdf`;
        const isPdf = /\.pdf$/i.test(fileName) ||
                      (previewDoc.file_content && (previewDoc.file_content.startsWith('JVBERi') || previewDoc.file_content.startsWith('data:application/pdf')));
        const isImage = /\.(png|jpe?g|webp|bmp|gif)$/i.test(fileName) ||
                        (previewDoc.file_content && !isPdf && (previewDoc.file_content.startsWith('data:image/') || previewDoc.file_content.startsWith('iVBORw0KGgo')));

        let docSrc = previewDoc.file_content;
        if (docSrc && !docSrc.startsWith('data:') && !docSrc.startsWith('http') && !docSrc.startsWith('/')) {
          docSrc = `data:${isPdf ? 'application/pdf' : 'image/png'};base64,${docSrc}`;
        } else if (!docSrc && previewDoc.file_url) {
          docSrc = previewDoc.file_url;
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
                      {fileName}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      Uploaded {formatDate(previewDoc.uploaded_at)} &bull; {currentBidder?.company_name}
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
                {/* Left: Image or PDF Preview */}
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-2 flex flex-col items-center justify-center min-h-[380px] overflow-hidden">
                  {isPdf && docSrc ? (
                    <div className="w-full h-full flex flex-col items-center justify-between">
                      <iframe
                        src={docSrc}
                        title="PDF Document Preview"
                        className="w-full h-[360px] rounded-lg border border-slate-200 bg-white shadow-xs"
                      />
                      <div className="w-full mt-2 flex items-center justify-between text-[11px] px-1">
                        <span className="text-slate-500 font-medium">Digital PDF Certificate</span>
                        <a
                          href={docSrc}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center space-x-1 font-bold text-[#0B2546] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Open Fullscreen</span>
                        </a>
                      </div>
                    </div>
                  ) : isImage && docSrc ? (
                    <img
                      src={docSrc}
                      alt="Uploaded Document"
                      className="max-h-[360px] w-auto max-w-full object-contain rounded-lg border border-slate-200 shadow-sm bg-white"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full bg-white rounded-xl border-2 border-slate-300 p-5 shadow-sm space-y-4 text-center">
                      <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                        भारत सरकार &bull; Government of India
                      </div>
                      <div className="text-xs font-black uppercase text-[#0B2546]">
                        {previewDoc.doc_type} Verification
                      </div>
                      <div className="text-xs text-slate-600 py-4 font-mono border-y border-slate-100">
                        Registration: {ext.registration_number || ext.udyam || ext.gstin || ext.pan || currentBidder?.gstin}
                      </div>
                      <div className="text-[10px] text-emerald-700 font-bold uppercase">
                        Certified in GeM Compliance Ledger
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
                      {previewDoc.flagged ? 'Discrepancy Detected' : 'Verified Clean'}
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
                      <span className="font-bold text-slate-900">{ext.company_name || ext.entity_name || currentBidder?.company_name}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center font-mono">
                      <span className="text-slate-500 font-sans">GSTIN</span>
                      <span className="font-bold text-slate-900">{ext.gstin || currentBidder?.gstin}</span>
                    </div>
                    <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center font-mono">
                      <span className="text-slate-500 font-sans">PAN</span>
                      <span className="font-bold text-slate-900">{ext.pan || currentBidder?.pan_number}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 6. First-Time Enterprise Login: Mandatory Password Reset Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="bg-[#0B2546] text-white p-5 flex items-start space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                    Security Advisory
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  Change Initial System Password
                </h3>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  In compliance with GeM & CERT-In cyber-security protocols, vendor organizations must replace their initial system-generated password.
                </p>
              </div>
            </div>

            {/* Body Form */}
            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4 text-xs font-sans">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                <span className="font-bold">Enterprise Account:</span> {user?.company_name || currentBidder?.company_name}
                <div className="text-[10px] text-amber-700 mt-0.5 font-mono">
                  User ID / Email: {user?.email}
                </div>
              </div>

              {passwordError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>Password successfully updated! Your account is now secured.</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  New Confidential Password (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="Enter new confidential password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B2546]/20 focus:border-[#0B2546]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Re-enter new confidential password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0B2546]/20 focus:border-[#0B2546]"
                />
              </div>

              <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleDeferPassword}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-800 text-xs font-bold transition cursor-pointer"
                  title="Ask again on your next login"
                >
                  Remind Me Next Login
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0B2546] hover:bg-[#07182D] text-white rounded-lg text-xs font-bold shadow-sm transition cursor-pointer"
                >
                  Set Password & Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
