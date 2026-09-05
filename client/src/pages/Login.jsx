import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  Clock,
  FileCheck2,
  HelpCircle,
  Accessibility,
  Headphones,
  Landmark,
  AlertCircle
} from 'lucide-react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';
import NationalEmblem from '../components/NationalEmblem';

export default function Login() {
  const [activeTab, setActiveTab] = useState('OFFICER'); // 'OFFICER' or 'VENDOR'
  const [officerEmail, setOfficerEmail] = useState('officer@cpcl.gov.in');
  const [officerPassword, setOfficerPassword] = useState('Officer@2026');
  const [vendorIdentifier, setVendorIdentifier] = useState('tenders@apexpetrochem.in');
  const [vendorPassword, setVendorPassword] = useState('Vendor@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
  };

  const handleQuickFill = (role, id, pw) => {
    setError(null);
    if (role === 'OFFICER') {
      setActiveTab('OFFICER');
      setOfficerEmail(id);
      setOfficerPassword(pw);
    } else {
      setActiveTab('VENDOR');
      setVendorIdentifier(id);
      setVendorPassword(pw);
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

  const handleSSO = () => {
    handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-slate-800 selection:bg-amber-500 selection:text-white relative overflow-hidden font-sans">
      {/* Background Ashoka Chakra Watermark & Architectural Sky */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
        {/* Soft radial blue-tint gradient */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-sky-100/40 rounded-full blur-3xl -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-slate-200/40 rounded-full blur-3xl -ml-48 -mb-48"></div>

        {/* Ashoka Chakra 24-Spoke Geometric Watermark */}
        <svg
          viewBox="0 0 200 200"
          className="w-[750px] h-[750px] text-slate-300 opacity-[0.09] absolute select-none"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="100" cy="100" r="92" strokeWidth="3" />
          <circle cx="100" cy="100" r="84" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="16" strokeWidth="3" />
          <circle cx="100" cy="100" r="6" fill="currentColor" />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="100"
              y1="100"
              x2={100 + 92 * Math.cos((i * 15 * Math.PI) / 180)}
              y2={100 + 92 * Math.sin((i * 15 * Math.PI) / 180)}
              strokeWidth="1.8"
            />
          ))}
        </svg>
      </div>

      {/* Top Section: Tricolor Line & Header */}
      <div className="relative z-10">
        {/* National Tricolor Line */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-[#FF671F]"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-[#046A38]"></div>
        </div>

        {/* Clean Official White Masthead */}
        <header className="bg-white border-b border-slate-200 py-4 px-6 sm:px-12 shadow-xs">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <NationalEmblem className="w-10 h-12 shrink-0" />
              <div className="flex flex-col">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0B2546] tracking-tight">
                  National Procurement Compliance Portal
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-semibold tracking-wide">
                  Government of India &bull; Ministry of Petroleum & Natural Gas (CPCL)
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-2 text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>BidShield &bull; SIH26100</span>
            </div>
          </div>
        </header>
      </div>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-12 py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero Typography & Feature Cards */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-extrabold text-[#0B2546] tracking-tight leading-[1.15]">
                Transparent procurement. <br />
                Trusted outcomes.
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-xl">
                AI-assisted bid compliance verification that helps government officers ensure fairness, reduce risk, and deliver accountable public procurement.
              </p>
            </div>

            {/* 3 Clean Modern Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[#0B2546] shadow-2xs">
                  <Shield className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-xs font-bold text-[#0B2546] tracking-tight">Secure verification</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Verify bids with confidence using AI-assisted checks and data protection.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[#0B2546] shadow-2xs">
                  <Clock className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-xs font-bold text-[#0B2546] tracking-tight">Faster review</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Automate compliance checks to reduce review time and speed decisions.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-xs rounded-xl p-4 border border-slate-200 shadow-xs space-y-2">
                <div className="w-10 h-10 rounded-lg border border-slate-200 bg-white flex items-center justify-center text-[#0B2546] shadow-2xs">
                  <FileCheck2 className="w-5 h-5 stroke-[1.75]" />
                </div>
                <h3 className="text-xs font-bold text-[#0B2546] tracking-tight">Complete audit trail</h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Maintain an immutable record of actions for full transparency and oversight.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Floating White Sign-In Card */}
          <div className="lg:col-span-5 max-w-md w-full mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/60 p-8 space-y-6">
              {/* Officer / Vendor Selector Pills */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTabChange('OFFICER')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'OFFICER'
                      ? 'bg-white text-[#0B2546] shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Officer Sign In
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('VENDOR')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'VENDOR'
                      ? 'bg-white text-[#0B2546] shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Vendor Sign In
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-[#0B2546] tracking-tight">
                  {activeTab === 'OFFICER' ? 'Officer Sign In' : 'Vendor Sign In'}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeTab === 'OFFICER'
                    ? 'Sign in to access your departmental dashboard.'
                    : 'Sign in to access your enterprise vendor portal.'}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'OFFICER' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Official designated email
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={officerEmail}
                          onChange={(e) => setOfficerEmail(e.target.value)}
                          placeholder="officer@cpcl.gov.in"
                          className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2546]/15 focus:border-[#0B2546]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Officer security password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={officerPassword}
                          onChange={(e) => setOfficerPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2546]/15 focus:border-[#0B2546]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Registered GSTIN or Corporate Email
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={vendorIdentifier}
                          onChange={(e) => setVendorIdentifier(e.target.value)}
                          placeholder="33AAACA1234A1Z5 or tenders@company.com"
                          className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2546]/15 focus:border-[#0B2546]"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700">
                        Vendor portal password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={vendorPassword}
                          onChange={(e) => setVendorPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2546]/15 focus:border-[#0B2546]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-[#0B2546] focus:ring-[#0B2546]"
                    />
                    <span>Remember this device</span>
                  </label>
                  <a href="#" className="text-xs font-semibold text-[#0B2546] hover:underline">
                    Forgot password?
                  </a>
                </div>

                {/* Primary Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-lg bg-[#0B2546] hover:bg-[#07182D] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
                >
                  <span>Sign in securely</span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-3">
                  <div className="border-t border-slate-200 w-full"></div>
                  <span className="bg-white px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    OR
                  </span>
                  <div className="border-t border-slate-200 w-full"></div>
                </div>

                {/* Secondary Button: Continue with Government SSO */}
                <button
                  type="button"
                  onClick={handleSSO}
                  className="w-full py-2.5 px-4 rounded-lg border-2 border-[#0B2546] text-[#0B2546] hover:bg-slate-50 font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Landmark className="w-4 h-4 text-[#0B2546]" />
                  <span>Continue with Government SSO</span>
                </button>

                {/* Demo Helper Badges */}
                <div className="pt-3 border-t border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
                    Evaluation Demo Credentials (Click to load)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('OFFICER', 'officer@cpcl.gov.in', 'Officer@2026')}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col cursor-pointer"
                    >
                      <span className="font-bold text-[#0B2546]">Officer Account</span>
                      <span className="text-slate-500 font-mono text-[9px] truncate">officer@cpcl.gov.in</span>
                      <span className="text-emerald-700 font-mono text-[9px] font-semibold">PW: Officer@2026</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('VENDOR', 'tenders@apexpetrochem.in', 'Vendor@2026')}
                      className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-left transition flex flex-col cursor-pointer"
                    >
                      <span className="font-bold text-[#0B2546]">Vendor (Apex)</span>
                      <span className="text-slate-500 font-mono text-[9px] truncate">tenders@apexpetrochem.in</span>
                      <span className="text-emerald-700 font-mono text-[9px] font-semibold">PW: Vendor@2026</span>
                    </button>
                  </div>
                </div>
              </form>

              {/* Security Footnote */}
              <div className="pt-2 flex items-center justify-center space-x-2 text-xs text-slate-500 text-center">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>For authorized departmental officers only</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Footer: Official Links & SIH Hackathon Attribution */}
      <footer className="relative z-10 bg-white border-t border-slate-200 py-4 px-6 sm:px-12 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            <a href="#" className="flex items-center space-x-1.5 hover:text-[#0B2546] transition">
              <Accessibility className="w-4 h-4 text-slate-500" />
              <span className="font-semibold">Accessibility</span>
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" className="flex items-center space-x-1.5 hover:text-[#0B2546] transition">
              <Shield className="w-4 h-4 text-slate-500" />
              <span className="font-semibold">Privacy Policy</span>
            </a>
            <span className="text-slate-300">|</span>
            <a href="#" className="flex items-center space-x-1.5 hover:text-[#0B2546] transition">
              <Headphones className="w-4 h-4 text-slate-500" />
              <span className="font-semibold">Helpdesk</span>
            </a>
          </div>

          <div className="flex items-center space-x-2 text-slate-500">
            <span className="text-[11px] font-medium">Built for Smart India Hackathon 2026</span>
            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">SIH26100</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
