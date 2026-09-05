import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  AlertCircle,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NationalEmblem from '../components/NationalEmblem';

export default function Login() {
  const [activeTab, setActiveTab] = useState('OFFICER'); // 'OFFICER' or 'VENDOR'
  const [officerEmail, setOfficerEmail] = useState('');
  const [officerPassword, setOfficerPassword] = useState('');
  const [vendorIdentifier, setVendorIdentifier] = useState('');
  const [vendorPassword, setVendorPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [seed] = useState(() => Math.random().toString(36).substring(2, 9));

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    setOfficerEmail('');
    setOfficerPassword('');
    setVendorIdentifier('');
    setVendorPassword('');
  };

  const handleQuickFill = (role) => {
    if (role === 'OFFICER') {
      setActiveTab('OFFICER');
      setOfficerEmail('admin@admin.com');
      setOfficerPassword('password');
      setError(null);
    } else {
      setActiveTab('VENDOR');
      setVendorIdentifier('33AABCA1234F1Z5');
      setVendorPassword('password');
      setError(null);
    }
  };

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (activeTab === 'OFFICER') {
        const res = login({
          identifier: officerEmail,
          password: officerPassword,
          role: 'OFFICER'
        });
        if (res.success) {
          navigate('/tenders', { replace: true });
        } else {
          setError(res.error || 'Authentication failed. Please verify officer credentials.');
        }
      } else {
        const res = login({
          identifier: vendorIdentifier,
          password: vendorPassword,
          role: 'VENDOR'
        });
        if (res.success) {
          navigate('/vendor', { replace: true });
        } else {
          setError(res.error || 'Authentication failed. Please check registered GSTIN / Email and password.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred during authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col justify-between font-sans text-slate-800 antialiased selection:bg-amber-500 selection:text-white">
      {/* 1. TOP OFFICIAL ACCESSIBILITY & GOI STRIP */}
      <div className="shrink-0">
        <div className="bg-[#07182D] text-slate-300 px-4 sm:px-8 py-1 text-[11px] flex flex-col sm:flex-row justify-between items-center gap-1 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-white">भारत सरकार</span>
            <span className="text-slate-500">|</span>
            <span>Government of India</span>
            <span className="text-slate-500">|</span>
            <span className="text-amber-300 font-medium">पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय (MoPNG)</span>
          </div>
          <div className="flex items-center space-x-4 text-[10px] font-mono text-slate-400">
            <span className="hidden md:inline">Helpline: 1800-425-4252 (09:30 - 17:30 IST)</span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hover:text-white cursor-pointer">Screen Reader Access</span>
            <span className="text-slate-600">|</span>
            <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 font-bold">A-</span>
            <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 font-bold">A</span>
            <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded border border-slate-700 font-bold">A+</span>
            <span className="text-slate-600">|</span>
            <span className="text-amber-400 font-bold cursor-pointer">English</span>
          </div>
        </div>

        {/* 2. NATIONAL TRICOLOR LINE */}
        <div className="h-1 w-full flex">
          <div className="h-full w-1/3 bg-[#FF671F]"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-[#046A38]"></div>
        </div>

        {/* 3. OFFICIAL GOVERNMENT MASTHEAD */}
        <header className="bg-white border-b border-slate-200 py-2.5 sm:py-3 px-4 sm:px-8 shadow-xs">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left & Center: MoPNG + Vertical Divider + CPCL Trilingual Brand */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 sm:gap-5">
              {/* Ministry of Petroleum & Natural Gas */}
              <div className="flex items-center space-x-3 shrink-0">
                <NationalEmblem className="w-8 h-10 shrink-0" color="#1E293B" />
                <div className="flex flex-col text-left">
                  <span className="text-[11px] text-slate-500 font-medium leading-none">
                    Ministry of
                  </span>
                  <h2 className="text-sm sm:text-[15px] font-bold text-[#0B2546] tracking-tight leading-tight mt-0.5">
                    Petroleum &amp; Natural Gas
                  </h2>
                  <span className="text-[10px] text-slate-500 font-medium leading-none mt-0.5">
                    Government of India
                  </span>
                </div>
              </div>

              {/* Vertical Divider */}
              <div className="hidden sm:block h-9 w-[1px] bg-slate-300 shrink-0"></div>

              {/* CPCL: Official Circular Logo + Trilingual Names */}
              <div className="flex items-center space-x-3">
                <img
                  src="/cpcl_logo.png"
                  alt="CPCL Logo"
                  className="w-10 h-10 object-contain shrink-0"
                />
                <div className="flex flex-col text-left">
                  <h1 className="text-xs sm:text-sm font-bold text-[#0B2546] tracking-tight leading-tight">
                    चेन्नई पेट्रोलियम कॉर्पोरेशन लिमिटेड (CPCL)
                  </h1>
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-snug">
                    Chennai Petroleum Corporation Limited - (A Group Company of IndianOil)
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium leading-tight">
                    சென்னை பெட்ரோலியம் கார்ப்பரேஷன் லிமிடெட் (CPCL)
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Hackathon & Problem Statement Pill */}
            <div className="flex flex-col sm:items-end space-y-1 text-right shrink-0">
              <div className="inline-flex items-center space-x-2 bg-emerald-50 border border-emerald-200/90 px-3 py-0.5 rounded-full text-xs font-mono text-emerald-950 font-bold shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>SIH26100 Mandate</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">
                General Financial Rules (GFR) 2017 &mdash; CVC Guidelines
              </span>
            </div>
          </div>
        </header>

      </div>

      {/* 5. MAIN CONTENT AREA: WITH CPCL REFINERY BACKGROUND */}
      <div
        className="relative flex-1 min-h-[calc(100vh-200px)] flex items-center justify-center py-16 sm:py-24 bg-slate-900 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/cpcl_refinery_bg.png')" }}
      >
        {/* Crisp subtle overlay - NO BLUR */}
        <div className="absolute inset-0 bg-slate-950/35 pointer-events-none" />

        <main className="relative z-10 max-w-lg mx-auto w-full px-4 sm:px-6 my-auto">
          {/* Official Government Sign-In Form - Centered */}
          <div className="bg-white rounded-xl border border-slate-300 shadow-2xl overflow-hidden">
              <div className="p-6 space-y-5">
                {/* Role Tabs */}
                <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleTabChange('OFFICER')}
                    className={`py-2 px-3 rounded text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'OFFICER'
                        ? 'bg-[#0B2546] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Officer Login
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTabChange('VENDOR')}
                    className={`py-2 px-3 rounded text-xs font-bold transition-all cursor-pointer ${
                      activeTab === 'VENDOR'
                        ? 'bg-[#0B2546] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Bidder / Vendor Login
                  </button>
                </div>

                {/* Subtitle / Department Guidance */}
                <div className="border-b border-slate-100 pb-3">
                  <h4 className="text-sm font-bold text-slate-900">
                    {activeTab === 'OFFICER' ? 'Procurement Committee Credentials' : 'Registered Vendor Credentials'}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {activeTab === 'OFFICER'
                      ? 'Access restricted to CPCL tender evaluation committee officers.'
                      : 'Sign in with your registered enterprise GSTIN or corporate email.'}
                  </p>
                </div>

                {/* Demo Credentials Quick-Fill Pill */}
                <div className="bg-amber-50 border border-amber-200 rounded p-2.5 text-[11px] flex items-center justify-between">
                  <div className="text-amber-900">
                    <span className="font-bold">Evaluation Demo Login:</span>{' '}
                    <span className="font-mono text-slate-700">
                      {activeTab === 'OFFICER' ? 'admin@admin.com / password' : '33AABCA1234F1Z5 / password'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickFill(activeTab)}
                    className="ml-2 text-[10px] font-bold text-amber-900 bg-amber-200/80 hover:bg-amber-300 px-2 py-0.5 rounded transition cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 rounded bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-800 font-semibold">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form Fields */}
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  {activeTab === 'OFFICER' ? (
                    <>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Official Designated Email ID <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            inputMode="email"
                            required
                            name={`gov_usr_${seed}`}
                            id={`gov_usr_${seed}`}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            value={officerEmail}
                            onChange={(e) => setOfficerEmail(e.target.value)}
                            placeholder="e.g. admin@admin.com"
                            className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2546] focus:border-[#0B2546]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Officer Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
                            required
                            name={`gov_pwd_${seed}`}
                            id={`gov_pwd_${seed}`}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            value={officerPassword}
                            onChange={(e) => setOfficerPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-white border border-slate-300 rounded pl-9 pr-10 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2546] focus:border-[#0B2546]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Registered GSTIN or Corporate Email <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            name={`vnd_usr_${seed}`}
                            id={`vnd_usr_${seed}`}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            value={vendorIdentifier}
                            onChange={(e) => setVendorIdentifier(e.target.value)}
                            placeholder="e.g. 33AABCA1234F1Z5 or vendor@domain.com"
                            className="w-full bg-white border border-slate-300 rounded pl-9 pr-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2546] focus:border-[#0B2546]"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-slate-700">
                          Vendor Password <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            style={{ WebkitTextSecurity: showPassword ? 'none' : 'disc' }}
                            required
                            name={`vnd_pwd_${seed}`}
                            id={`vnd_pwd_${seed}`}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck="false"
                            value={vendorPassword}
                            onChange={(e) => setVendorPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full bg-white border border-slate-300 rounded pl-9 pr-10 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0B2546] focus:border-[#0B2546]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Security Note */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center space-x-1 text-slate-500">
                      <Shield className="w-3 h-3 text-emerald-600" />
                      <span>256-Bit SSL Encrypted Session</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => alert('Official Login Assistance:\n- Officer Admin: admin@admin.com / password\n- Vendor: 33AABCA1234F1Z5 / password\n- Helpdesk: 044-2594 4000 (support@cpcl.co.in)')}
                      className="text-[#0B2546] font-semibold hover:underline cursor-pointer"
                    >
                      Login Assistance
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-2.5 px-4 bg-[#0B2546] hover:bg-[#07182D] text-white font-bold text-xs rounded transition-colors shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                  >
                    <span>{submitting ? 'Authenticating Credentials...' : 'Login to Secure Session'}</span>
                  </button>
                </form>


              </div>
            </div>
          </main>
        </div>

      {/* 6. AUTHENTIC GOVERNMENT OF INDIA (NIC STYLE) FOOTER */}
      <footer className="bg-[#07182D] text-slate-300 text-xs border-t-4 border-t-[#0B2546] mt-auto shrink-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 space-y-4">
          {/* Top Links Row */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-[11px] text-slate-300 pb-4 border-b border-slate-800">
            <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
              National Portal of India (india.gov.in)
            </a>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <a href="https://gem.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Government e-Marketplace (gem.gov.in)
            </a>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <a href="https://eprocure.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Central Public Procurement Portal (eprocure.gov.in)
            </a>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <a href="https://mopng.gov.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
              Ministry of Petroleum &amp; Natural Gas
            </a>
            <span className="text-slate-600 hidden sm:inline">&bull;</span>
            <a href="https://cpcl.co.in" target="_blank" rel="noreferrer" className="hover:text-white transition">
              CPCL Official Website
            </a>
          </div>

          {/* Bottom Attribution & Statutory Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-400 font-mono">
            <div className="space-y-0.5 text-center sm:text-left">
              <p>
                &copy; 2026 Chennai Petroleum Corporation Limited. Content owned, maintained and updated by CPCL Procurement Cell.
              </p>
              <p className="text-slate-500">
                Developed for Smart India Hackathon 2026 &bull; Problem Statement ID: SIH26100 (CPCL / MoPNG)
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-300">
                CERT-In Baseline Audited
              </span>
              <span className="bg-slate-800 border border-slate-700 px-2 py-1 rounded text-slate-300">
                W3C HTML5 Validated
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
