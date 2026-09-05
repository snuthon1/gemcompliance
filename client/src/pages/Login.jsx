import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Landmark,
  KeyRound,
  Search,
  ExternalLink
} from 'lucide-react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';

export default function Login() {
  const [activeTab, setActiveTab] = useState('OFFICER'); // 'OFFICER' or 'VENDOR'
  const [email, setEmail] = useState('officer.sharma@cpcl.gov.in');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedVendorKey, setSelectedVendorKey] = useState('apex');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (activeTab === 'OFFICER' ? '/' : '/vendor');

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setError(null);
    if (tab === 'OFFICER') {
      setEmail('officer.sharma@cpcl.gov.in');
      setPassword('••••••••••••');
    } else {
      const vendor = DEMO_PROFILES[selectedVendorKey];
      setEmail(vendor?.email || 'tenders@apexpetrochem.in');
      setPassword('••••••••••••');
    }
  };

  const handleVendorSelect = (key) => {
    setSelectedVendorKey(key);
    const vendor = DEMO_PROFILES[key];
    if (vendor) {
      setEmail(vendor.email);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (activeTab === 'OFFICER') {
        const res = login({
          email: email || 'officer.sharma@cpcl.gov.in',
          role: 'OFFICER'
        });
        if (res.success) {
          navigate(from === '/login' ? '/' : from, { replace: true });
        }
      } else {
        const profile = DEMO_PROFILES[selectedVendorKey] || DEMO_PROFILES.apex;
        const res = login({
          email: email || profile.email,
          role: 'VENDOR',
          bidder_id: profile.bidder_id,
          company_name: profile.company_name
        });
        if (res.success) {
          navigate(from === '/login' ? '/vendor' : from, { replace: true });
        }
      }
    } catch (err) {
      setError('Authentication failed. Please verify credentials or security token.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-slate-900 bg-cover bg-top bg-no-repeat relative flex flex-col justify-between selection:bg-gov-saffron selection:text-white"
      style={{ backgroundImage: "url('/gem_portal_bg.png')" }}
    >
      {/* Semi-transparent dark overlay to keep the GeM portal background visible while making the auth card high-contrast */}
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-[1.5px]"></div>

      {/* Interactive GeM Header Bar overlay */}
      <div className="relative z-20">
        {/* National Tricolor Line */}
        <div className="h-1 w-full flex">
          <div className="h-full w-1/3 bg-gov-saffron"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-gov-green"></div>
        </div>

        <header className="bg-gov-navyDark/90 backdrop-blur-md border-b border-slate-700/80 px-4 sm:px-8 py-2.5 flex items-center justify-between text-white shadow-md">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded bg-white text-gov-navy flex items-center justify-center font-bold shadow-sm">
              <Landmark className="w-5 h-5 text-gov-navy" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Government e-Marketplace &bull; GeM
                </span>
                <span className="bg-gov-saffron text-white font-mono text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase">
                  BidShield
                </span>
              </div>
              <span className="text-[10px] text-slate-300 font-mono">
                Ministry of Petroleum & Natural Gas &bull; CPCL SIH26100
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4 text-xs">
            <span className="text-slate-300 font-medium">GFR 2017 Compliance Engine</span>
            <span className="text-slate-500">|</span>
            <span className="bg-gov-navyLight text-gov-saffron font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700">
              Official Single Sign-On (SSO)
            </span>
          </div>
        </header>
      </div>

      {/* Center GeM SSO Modal / Card */}
      <div className="relative z-20 max-w-md w-full mx-auto px-4 py-8 my-auto">
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-slate-200 overflow-hidden">
          {/* Card Top Banner */}
          <div className="bg-gov-navy text-white px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-gov-saffron" />
              </div>
              <div>
                <h2 className="text-sm font-bold tracking-tight text-white">
                  GeM BidShield Authentication
                </h2>
                <p className="text-[10px] text-slate-300 font-mono">
                  CPCL Statutory Pre-Qualification Portal
                </p>
              </div>
            </div>
            <span className="text-[9px] bg-gov-saffron text-white font-mono font-bold px-2 py-0.5 rounded uppercase">
              Secure SSO
            </span>
          </div>

          <div className="p-6">
            {/* Dual Persona Tab Selector */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg mb-5 border border-slate-200">
              <button
                type="button"
                onClick={() => handleTabChange('OFFICER')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded text-xs font-bold transition-all ${
                  activeTab === 'OFFICER'
                    ? 'bg-gov-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gov-saffron" />
                <span>PSU / Govt Officer</span>
              </button>

              <button
                type="button"
                onClick={() => handleTabChange('VENDOR')}
                className={`flex items-center justify-center space-x-1.5 py-2 px-3 rounded text-xs font-bold transition-all ${
                  activeTab === 'VENDOR'
                    ? 'bg-gov-navy text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-gov-saffron" />
                <span>Tender Bidder</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-2.5 rounded bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700 font-semibold">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Authentication Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {activeTab === 'OFFICER' ? (
                <>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Government Email ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="officer.sharma@cpcl.gov.in"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-gov-navy focus:border-gov-navy"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        DSC Token Passcode
                      </label>
                      <span className="text-[10px] text-gov-green font-bold flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Class-3 DSC Token Active
                      </span>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-gov-navy focus:border-gov-navy"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Select Participating Bidder
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <select
                        value={selectedVendorKey}
                        onChange={(e) => handleVendorSelect(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-gov-navy cursor-pointer"
                      >
                        <option value="apex">Apex Petrochem Engineering (33AAACA1234A1Z5)</option>
                        <option value="coromandel">Coromandel Heavy Valves Ltd (33BBBCB5678B1Z2)</option>
                        <option value="kaveri">Kaveri Refining Spares Ltd (33DDDCD4321D1Z4)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Authorized Signatory Email
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tenders@company.com"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-gov-navy focus:border-gov-navy"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Commercial Access PIN
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-gov-navy focus:border-gov-navy"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-[11px]">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-gov-navy focus:ring-gov-navy" />
                  <span>Remember session</span>
                </label>
                <span className="font-mono text-[10px] text-slate-400">NIC-SSO 256-Bit TLS</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 rounded-lg bg-gov-navy hover:bg-gov-navyLight text-white text-xs font-bold shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>
                  {activeTab === 'OFFICER'
                    ? 'Authenticate Officer via e-Token / DSC'
                    : 'Access Vendor Commercial Desk'}
                </span>
                <ArrowRight className="w-4 h-4 text-gov-saffron" />
              </button>
            </form>

            <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-500 text-center font-mono">
              Protected by Section 43/66 IT Act 2000 & GFR 2017 Audit Protocol
            </div>
          </div>
        </div>
      </div>

      {/* Footer Strip */}
      <div className="relative z-20 bg-gov-navyDark/95 border-t border-slate-800 px-4 py-2.5 text-[11px] text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-1">
        <div className="flex items-center space-x-2">
          <span className="text-white font-bold">Government e-Marketplace (GeM)</span>
          <span>&bull;</span>
          <span>National Public Procurement Portal</span>
        </div>
        <div className="font-mono text-[10px]">
          Chennai Petroleum Corporation Limited (CPCL) &bull; SIH26100
        </div>
      </div>
    </div>
  );
}
