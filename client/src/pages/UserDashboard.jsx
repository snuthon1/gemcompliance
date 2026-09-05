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

export default function UserDashboard() {
  const { user, isVendor, isOfficer } = useAuth();
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
          text: `Document uploaded and verified via AI! ${data.document?.flagged ? '⚠️ Discrepancy flagged: ' + data.document?.flag_reason : '✅ Verified clean against government registries.'}`
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

  const formatDate = (iso) =>
    iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const isLowRisk = compliance?.risk === 'Low';
  const isMediumRisk = compliance?.risk === 'Medium';
  const isHighRisk = compliance?.risk === 'High';

  // Compute profile completion percentage
  const calculateProfileCompletion = () => {
    let score = 0;
    if (currentBidder?.company_name) score += 15;
    if (currentBidder?.gstin) score += 15;
    if (currentBidder?.pan_number) score += 15;
    if (currentBidder?.udyam_number) score += 10;
    if (profileForm.email) score += 10;
    if (profileForm.phone) score += 10;
    if (profileForm.registered_address) score += 10;
    if (profileForm.signatory_name) score += 5;
    if (profileForm.bank_account && profileForm.bank_ifsc) score += 10;
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
          {/* TAB 1: OVERVIEW & PORTAL FEATURE GUIDE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Top 4 Scorecard Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Health Score */}
                <div
                  className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between ${
                    isLowRisk
                      ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                      : isMediumRisk
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                      : 'bg-rose-50/70 border-rose-200 text-rose-950'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Statutory Health Score
                      </span>
                      <ShieldCheck
                        className={`w-5 h-5 ${
                          isLowRisk ? 'text-emerald-600' : isMediumRisk ? 'text-amber-600' : 'text-rose-600'
                        }`}
                      />
                    </div>
                    <div className="mt-3 flex items-baseline space-x-2">
                      <span className="text-4xl font-extrabold font-mono tracking-tight">
                        {compliance?.score ?? '—'}
                      </span>
                      <span className="text-xs text-slate-500 font-bold">/ 100</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600">Risk Assessment:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                        isLowRisk
                          ? 'bg-emerald-200/60 text-emerald-900'
                          : isMediumRisk
                          ? 'bg-amber-200/60 text-amber-900'
                          : 'bg-rose-200/60 text-rose-900'
                      }`}
                    >
                      {compliance?.risk || 'Calculating'}
                    </span>
                  </div>
                </div>

                {/* 2. Active CPCL Bids */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        My Submitted Quotations
                      </span>
                      <Layers className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="mt-3 text-4xl font-extrabold font-mono text-slate-900">
                      {bids.length}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Awarded Contracts:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {bids.filter((b) => b.status === 'Awarded').length} Won
                    </span>
                  </div>
                </div>

                {/* 3. Documents in Vault */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Statutory Documents
                      </span>
                      <FileCheck2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="mt-3 text-4xl font-extrabold font-mono text-slate-900">
                      {documents.length}
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Discrepancy Flags:</span>
                    <span className={`font-bold px-2 py-0.5 rounded ${
                      documents.some(d => d.flagged) ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                      {documents.filter(d => d.flagged).length} Flagged
                    </span>
                  </div>
                </div>

                {/* 4. Profile Completion */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Profile Readiness
                      </span>
                      <UserCheck className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="mt-3 flex items-baseline space-x-1.5">
                      <span className="text-4xl font-extrabold font-mono text-[#0B2546]">
                        {completionPct}%
                      </span>
                      <span className="text-xs text-slate-500 font-bold">Complete</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500">Mandate Status:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {completionPct >= 80 ? '✅ Ready to Bid' : '⚠️ Action Needed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Portal Architecture & Where Features Exist Guide (User Explicit Request) */}
              <div className="bg-gradient-to-br from-[#0B2546] to-[#143D6D] rounded-2xl p-6 text-white shadow-md space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-4">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-sky-300 font-bold bg-white/10 px-2 py-0.5 rounded">
                      Vendor Navigation Guide & Portal Architecture
                    </span>
                    <h2 className="text-xl font-extrabold text-white mt-1">
                      Explore the National Procurement Compliance Portal (BidShield)
                    </h2>
                    <p className="text-xs text-slate-200 mt-0.5 max-w-3xl">
                      This overview summarizes where all vendor tools, statutory registries, and bidding workspaces reside. Use the fast-launch cards below to navigate directly.
                    </p>
                  </div>
                  <div className="shrink-0">
                    <span className="text-xs font-mono bg-white/15 text-white px-3 py-1.5 rounded-lg border border-white/20 font-bold">
                      GFR 2017 &bull; Rule 144(xi) Ready
                    </span>
                  </div>
                </div>

                {/* 4 Feature Guide Quadrant Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Overview */}
                  <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl p-4 transition flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-lg bg-sky-500/30 border border-sky-400/40 flex items-center justify-center text-sky-200">
                        <LayoutDashboard className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white">1. Overview & Health</h3>
                      <p className="text-[11px] text-slate-200 leading-relaxed">
                        Live dashboard summarizing your GFR 2017 risk score, Central Debarment vigilance clearance, and active discrepancy notices.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('overview')}
                      className="w-full text-left text-xs font-bold text-sky-300 hover:text-white flex items-center justify-between pt-2 border-t border-white/10 cursor-pointer"
                    >
                      <span>Active Screen</span>
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 2: Profile Status */}
                  <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl p-4 transition flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-200">
                        <UserCheck className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white">2. Profile Status</h3>
                      <p className="text-[11px] text-slate-200 leading-relaxed">
                        Complete your corporate identity, authorized signatory KYC, banking EMD refund mandate, and annual turnover records.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('profile')}
                      className="w-full text-left text-xs font-bold text-sky-300 hover:text-white flex items-center justify-between pt-2 border-t border-white/10 cursor-pointer"
                    >
                      <span>Open Profile Desk</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 3: Uploaded Documents */}
                  <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl p-4 transition flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center text-indigo-200">
                        <FileCheck2 className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white">3. Uploaded Documents</h3>
                      <p className="text-[11px] text-slate-200 leading-relaxed">
                        Statutory vault to showcase certificates (GST REG-06, PAN, Udyam), preview files, check OCR extractions, and delete records.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('documents')}
                      className="w-full text-left text-xs font-bold text-sky-300 hover:text-white flex items-center justify-between pt-2 border-t border-white/10 cursor-pointer"
                    >
                      <span>Manage Vault</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card 4: Apply for Tenders */}
                  <div className="bg-white/10 hover:bg-white/15 border border-white/20 rounded-xl p-4 transition flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-200">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-white">4. Apply for Tender/BIDs</h3>
                      <p className="text-[11px] text-slate-200 leading-relaxed">
                        Browse active CPCL & PSU tenders, check eligibility, apply quotation amount, and track real-time contract award decisions.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleTabChange('apply')}
                      className="w-full text-left text-xs font-bold text-sky-300 hover:text-white flex items-center justify-between pt-2 border-t border-white/10 cursor-pointer"
                    >
                      <span>Apply for Tenders</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Statutory Health Check Advisory */}
              {compliance?.flags && compliance.flags.length > 0 ? (
                <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
                  isHighRisk ? 'bg-rose-50 border-rose-200' : 'bg-amber-50 border-amber-200'
                }`}>
                  <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${isHighRisk ? 'text-rose-600' : 'text-amber-600'}`} />
                  <div className="space-y-1">
                    <h4 className={`text-xs font-bold uppercase tracking-wide ${isHighRisk ? 'text-rose-900' : 'text-amber-900'}`}>
                      Statutory Discrepancy & Fraud Advisory Flags ({compliance.flags.length})
                    </h4>
                    <ul className="text-xs space-y-1">
                      {compliance.flags.map((flag, idx) => (
                        <li key={idx} className={isHighRisk ? 'text-rose-800' : 'text-amber-800'}>
                          &bull; {flag}
                        </li>
                      ))}
                    </ul>
                    <p className="text-[11px] text-slate-600 pt-1">
                      Go to the <strong>Uploaded Documents</strong> tab to re-upload clear certificates or update mismatched legal names.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl border bg-emerald-50 border-emerald-200 flex items-center space-x-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wide text-emerald-900">
                      All 6 Statutory Cross-Checks Verified
                    </h4>
                    <p className="text-xs text-emerald-800">
                      No registry mismatches or MoPNG vigilance debarments found. Enterprise credentials align 100% across Udyam, GSTN, and Income Tax databases.
                    </p>
                  </div>
                </div>
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
                        : 'bg-rose-50 border-rose-200 text-rose-800'
                    }`}
                  >
                    {uploadFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    )}
                    <span className="font-medium">{uploadFeedback.text}</span>
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
                  <div className="space-y-3.5">
                    {documents.map((doc) => {
                      const extData = doc.extracted_data || {};
                      const isDeleting = deletingDocId === doc.doc_id;

                      return (
                        <div
                          key={doc.doc_id}
                          className={`rounded-xl border p-4.5 transition ${
                            doc.flagged
                              ? 'border-rose-300 bg-rose-50/20'
                              : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-mono font-extrabold uppercase bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                                {doc.doc_type}
                              </span>
                              <span className="text-xs font-semibold text-slate-800 font-mono">
                                {doc.file_url ? doc.file_url.split('/').pop() : 'Statutory_Certificate.pdf'}
                              </span>
                              <span className="text-slate-300">&bull;</span>
                              <span className="text-xs text-slate-400">
                                Uploaded {formatDate(doc.uploaded_at)}
                              </span>
                            </div>

                            {/* Action Buttons: View & Delete */}
                            <div className="flex items-center space-x-2">
                              <button
                                type="button"
                                onClick={() => setPreviewDoc(doc)}
                                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                                title="Preview certificate & view metadata"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>View</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDownloadDoc(doc)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
                                title="Download certificate file"
                              >
                                <Download className="w-3.5 h-3.5 text-slate-600" />
                                <span>Download</span>
                              </button>

                              <button
                                type="button"
                                disabled={isDeleting}
                                onClick={() => handleDeleteDoc(doc.doc_id, doc.doc_type)}
                                className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer disabled:opacity-50"
                                title="Permanently remove certificate from vault"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Verification Status Banner */}
                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
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
                                    <span>Flagged Discrepancy: {doc.flag_reason || 'Check Failed'}</span>
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    <span>Verified Against Government Registry</span>
                                  </>
                                )}
                              </span>
                            </div>

                            <span className="text-[10px] font-mono text-slate-400">
                              Document ID: {doc.doc_id.substring(0, 8).toUpperCase()}
                            </span>
                          </div>

                          {/* Extracted Fields Matrix */}
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Entity Name</span>
                              <span className="font-semibold text-slate-800 truncate block">
                                {extData.company_name || extData.entity_name || currentBidder?.company_name}
                              </span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">GSTIN</span>
                              <span className="font-mono font-bold text-slate-800 truncate block">
                                {extData.gstin || currentBidder?.gstin}
                              </span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">PAN Number</span>
                              <span className="font-mono font-bold text-slate-800 truncate block">
                                {extData.pan || currentBidder?.pan_number}
                              </span>
                            </div>
                            <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                              <span className="text-[10px] uppercase font-bold text-slate-400 block">Registry Status</span>
                              <span className={`font-semibold ${doc.flagged ? 'text-rose-600' : 'text-emerald-700'}`}>
                                {extData.verified_against_registry || (doc.flagged ? 'Discrepancy' : 'Compliant')}
                              </span>
                            </div>
                          </div>
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
                    const isAwarded = tender.status === 'Awarded';
                    const isClosed = isAwarded || tender.status === 'Closed';

                    return (
                      <div
                        key={tender.tender_id}
                        className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                              Ref: {tender.tender_id.substring(0, 8).toUpperCase()}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                tender.status === 'Active'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {tender.status}
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
                                {formatINR(tender.budget)}
                              </span>
                            </div>
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                              <span className="text-[10px] text-slate-400 block uppercase font-bold">Published</span>
                              <span className="font-semibold text-slate-700 text-xs">
                                {formatDate(tender.created_at)}
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
                            <span className="text-xs text-slate-400 font-semibold italic">
                              Bidding closed for this tender
                            </span>
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
                return (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Selected Procurement Opportunity
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">
                      {tender?.title || 'Commercial Tender'}
                    </h4>
                    <div className="flex items-center justify-between pt-1 text-slate-500 font-mono text-[11px]">
                      <span>Estimated Value: <strong>{formatINR(tender?.budget)}</strong></span>
                      <span>Ref: {tender?.tender_id.substring(0, 8).toUpperCase()}</span>
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
                  if (!tender || !tender.budget) return null;
                  const diff = parseFloat(bidQuoteAmount) - tender.budget;
                  const pct = ((diff / tender.budget) * 100).toFixed(1);
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
    </div>
  );
}
