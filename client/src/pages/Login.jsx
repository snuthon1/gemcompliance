import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Shield,
  Clock,
  FileCheck2,
  Landmark,
  AlertCircle,
  Accessibility,
  Headphones
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
    <div className="min-h-screen flex flex-col lg:flex-row font-sans selection:bg-amber-500 selection:text-white">
      {/* LEFT PANEL: Deep Navy Executive Hero & Government Governance Pillar (52%) */}
      <div className="lg:w-[52%] bg-gradient-to-br from-[#061528] via-[#0B2546] to-[#0A2240] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden min-h-[460px] lg:min-h-screen">
        {/* National Tricolor Line at very top of panel */}
        <div className="h-1.5 w-full flex absolute top-0 left-0">
          <div className="h-full w-1/3 bg-[#FF671F]"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-[#046A38]"></div>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>

        {/* Ashoka Chakra 24-Spoke Geometric Watermark in Background */}
        <svg
          viewBox="0 0 200 200"
          className="w-[620px] h-[620px] text-white opacity-[0.035] absolute -right-24 top-1/2 -translate-y-1/2 select-none pointer-events-none"
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

        {/* Top Masthead Branding */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <NationalEmblem className="w-12 h-14 shrink-0" color="#FFFFFF" />
              <div>
                <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest font-mono block">
                  भारत सरकार &bull; Government of India
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                  GeM-CPCL Bid Compliance Portal
                </h1>
                <p className="text-xs text-slate-300 font-medium">
                  Ministry of Petroleum &amp; Natural Gas &bull; CPCL
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-block text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
              SIH26100 Mandate
            </span>
          </div>
        </div>

        {/* Center Hero Description & Pillars */}
        <div className="relative z-10 py-10 lg:py-12 space-y-7">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-xs border border-white/15 px-3 py-1 rounded-full text-xs font-semibold text-amber-200">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Automated Statutory Due-Diligence System</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-white tracking-tight leading-[1.18]">
              Zero-Trust Bid Integrity for Public Procurement.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
              Real-time cross-referencing against GSTN REG-06, CBDT PAN, MSME Udyam, and All-India PSU debarment rosters to enforce 100% GFR 2017 compliance.
            </p>
          </div>

          {/* 3 Dark Modern Governance Pillar Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 transition space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300">
                <Shield className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white tracking-tight">Multi-Registry Verification</h3>
              <p className="text-[11px] text-slate-300 leading-normal">
                Instant sync across GSTN active status, CBDT PAN, and MSME Udyam databases.
              </p>
            </div>

            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 transition space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white tracking-tight">Anti-Debarment Shield</h3>
              <p className="text-[11px] text-slate-300 leading-normal">
                Continuous cross-checks against CVC, MoPNG &amp; PSU blacklist registers.
              </p>
            </div>

            <div className="bg-white/5 hover:bg-white/10 backdrop-blur-xs rounded-xl p-3.5 border border-white/10 transition space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-bold text-white tracking-tight">Zero-Trust OCR</h3>
              <p className="text-[11px] text-slate-300 leading-normal">
                Detects certificate tampering, expiry, and credential mismatches on upload.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Trust & Compliance Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>CERT-In Baseline Audited &bull; 256-Bit SSL Encrypted</span>
          </div>
          <span className="font-mono text-slate-400 text-[10px]">
            Smart India Hackathon 2026 &bull; CPCL Mandate
          </span>
        </div>
      </div>

      {/* RIGHT PANEL: Clean White / Slate Sign-In Console (48%) */}
      <div className="lg:w-[48%] bg-[#F8FAFC] p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative shadow-xl border-l border-slate-200">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/80">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-mono font-semibold text-slate-600">
              Official Session Gateway Active
            </span>
          </div>
          <button
            type="button"
            onClick={() => alert('Official Evaluation Credentials:\n\n• Officer Committee Login:\n  Email: admin@admin.com\n  Password: password\n\n• Vendor Enterprise Portal:\n  GSTIN: 33AABCA1234F1Z5 (or company email)\n  Password: password\n\nSupport: sih-procurement@cpcl.gov.in')}
            className="text-[11px] font-bold text-[#0B2546] hover:text-sky-700 hover:underline cursor-pointer"
          >
            Demo Credentials &rarr;
          </button>
        </div>

        {/* Center Login Box */}
        <div className="max-w-md w-full mx-auto my-auto py-8 space-y-6">
          {/* Officer / Vendor Selector Pills */}
          <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl border border-slate-300/80">
            <button
              type="button"
              onClick={() => handleTabChange('OFFICER')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'OFFICER'
                  ? 'bg-white text-[#0B2546] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Officer Sign In
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('VENDOR')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'VENDOR'
                  ? 'bg-white text-[#0B2546] shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vendor Sign In
            </button>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-[#0B2546] tracking-tight">
              {activeTab === 'OFFICER' ? 'Procurement Committee Access' : 'Enterprise Vendor Access'}
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              {activeTab === 'OFFICER'
                ? 'Sign in with your designated officer email to review bidder dossiers and tender compliance.'
                : 'Sign in with your registered GSTIN or corporate email to manage certificates and tenders.'}
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form Fields */}
          <div
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(e);
            }}
            className="space-y-4"
          >
            {activeTab === 'OFFICER' ? (
              <>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Official designated email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2546]/15 focus:border-[#0B2546]"
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
                      placeholder="Enter security password"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2546]/15 focus:border-[#0B2546]"
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
                      name={`vnd_usr_${seed}`}
                      id={`vnd_usr_${seed}`}
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck="false"
                      value={vendorIdentifier}
                      onChange={(e) => setVendorIdentifier(e.target.value)}
                      placeholder="e.g. 33AABCA1234F1Z5 or vendor email"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2546]/15 focus:border-[#0B2546]"
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
                      className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2546]/15 focus:border-[#0B2546]"
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

            {/* Help and CERT-In Note */}
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span className="flex items-center space-x-1 text-slate-400">
                <Shield className="w-3 h-3 text-slate-400" />
                <span>CERT-In Secure Gateway</span>
              </span>
              <button
                type="button"
                onClick={() => alert('Official Login Guidelines:\n- Officer Admin: admin@admin.com / password\n- Vendor: Registered GSTIN or company email / password\n- Assistance: support@cpcl.gov.in')}
                className="font-semibold text-[#0B2546] hover:underline cursor-pointer"
              >
                Need Help?
              </button>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl bg-[#0B2546] hover:bg-[#07182D] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              <span>{submitting ? 'Authenticating...' : 'Sign in securely'}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-[#F8FAFC] px-3 text-xs text-slate-400 font-semibold uppercase tracking-wider">
                OR
              </span>
              <div className="border-t border-slate-200 w-full"></div>
            </div>

            {/* Jan Parichay Government SSO */}
            <button
              type="button"
              onClick={() => alert('Jan Parichay SSO is active for NIC/Govt intranet gateways. For portal evaluation, sign in with your designated credentials.')}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white text-[#0B2546] hover:bg-slate-50 font-bold text-xs transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-2xs"
            >
              <Landmark className="w-4 h-4 text-[#0B2546]" />
              <span>Continue with Government SSO (Jan Parichay)</span>
            </button>
          </div>
        </div>

        {/* Bottom Legal & Footer Links */}
        <div className="pt-6 border-t border-slate-200/80 space-y-3">
          <p className="text-[10px] text-slate-400 text-center leading-relaxed">
            Statutory Notice: Access to this public procurement portal is restricted to authorized CPCL committee officers and verified bidders under the Information Technology Act, 2000.
          </p>
          <div className="flex items-center justify-center space-x-4 text-xs text-slate-500">
            <a href="#" className="hover:text-[#0B2546] transition flex items-center space-x-1">
              <Accessibility className="w-3.5 h-3.5" />
              <span>Accessibility</span>
            </a>
            <span>&bull;</span>
            <a href="#" className="hover:text-[#0B2546] transition flex items-center space-x-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Privacy Policy</span>
            </a>
            <span>&bull;</span>
            <a href="#" className="hover:text-[#0B2546] transition flex items-center space-x-1">
              <Headphones className="w-3.5 h-3.5" />
              <span>Helpdesk</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
