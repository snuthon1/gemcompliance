import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  CheckCircle2,
  Layers,
  FileCheck,
  Shield,
  Fingerprint,
  AlertCircle
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
      setError('Authentication failed. Please check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center relative overflow-hidden selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Hero branding & value propositions */}
          <div className="lg:col-span-7 space-y-8">
            {/* Header Badge */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
              <span>GeM SIH26100 Statutory Compliance Engine</span>
            </div>

            {/* Brand & Headline */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                    BidShield
                  </h1>
                  <p className="text-xs font-mono text-indigo-300 uppercase tracking-wider">
                    Government e-Marketplace Pre-Qualification
                  </p>
                </div>
              </div>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
                Autonomous statutory pre-qualification and vendor compliance verification platform designed for public sector undertakings and government procurement committees.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl pt-2">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center border border-indigo-800/50">
                  <Layers className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">6-Pillar Statutory Engine</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Real-time live cross-reconciliation against GSTN, Udyam MSME, Income Tax PAN, and MoPNG Debarment portals.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-950 flex items-center justify-center border border-emerald-800/50">
                  <FileCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Vision AI Document Extraction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Multimodal field parsing of GST REG-06, PAN cards, and MSME registrations with automated mismatch alerts.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-violet-950 flex items-center justify-center border border-violet-800/50">
                  <Shield className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">GFR 2017 Audit Trails</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Cryptographically stamped audit logs safeguarding procurement officer determinations and vigilance compliance.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-sm space-y-2">
                <div className="w-8 h-8 rounded-lg bg-amber-950 flex items-center justify-center border border-amber-800/50">
                  <Fingerprint className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="text-sm font-semibold text-white">Human-in-the-Loop</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  AI advisory scoring with ultimate commercial award and override jurisdiction retained by the Tender Committee.
                </p>
              </div>
            </div>

            {/* PSU Trust Marks */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center space-x-3 text-xs text-slate-500 font-medium">
              <span>Deployed for:</span>
              <strong className="text-slate-300">Chennai Petroleum Corporation Limited (CPCL)</strong>
              <span>&bull;</span>
              <span>Ministry of Petroleum & Natural Gas</span>
            </div>
          </div>

          {/* Right Column: Modern Authentication Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-slate-100 text-slate-900 relative">
              {/* Segmented Role Selector */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-6 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTabChange('OFFICER')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'OFFICER'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className={`w-4 h-4 ${activeTab === 'OFFICER' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Govt / PSU Officer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('VENDOR')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${
                    activeTab === 'VENDOR'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Building2 className={`w-4 h-4 ${activeTab === 'VENDOR' ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span>Tender Bidder</span>
                </button>
              </div>

              {/* Form Context Header */}
              <div className="mb-6 space-y-1">
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                  {activeTab === 'OFFICER'
                    ? 'Procurement Committee Sign In'
                    : 'Vendor Commercial Workspace Sign In'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {activeTab === 'OFFICER'
                    ? 'Enter your designated PSU officer credentials to access bidder risk dossiers and award evaluation consoles.'
                    : 'Select your registered tender enterprise to manage compliance certifications and submit bids.'}
                </p>
              </div>

              {error && (
                <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Authentication Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'OFFICER' ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Official Government Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="officer.sharma@cpcl.gov.in"
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Security Token / Password
                        </label>
                        <span className="text-[11px] text-indigo-600 font-medium">e-Token / DSC Active</span>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Participating Tender Enterprise
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <select
                          value={selectedVendorKey}
                          onChange={(e) => handleVendorSelect(e.target.value)}
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition cursor-pointer"
                        >
                          <option value="apex">Apex Petrochem Engineering Pvt Ltd (GSTIN: 33AAACA1234A1Z5)</option>
                          <option value="coromandel">Coromandel Heavy Valves & Alloy Works Ltd (GSTIN: 33BBBCB5678B1Z2)</option>
                          <option value="kaveri">Kaveri Refining Spares & Services Ltd (GSTIN: 33DDDCD4321D1Z4)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Signatory Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tenders@company.com"
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                        Portal Access Passcode
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Remember and DSC Token indicator */}
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Remember this device</span>
                  </label>
                  <span className="font-mono text-[11px] text-slate-400">TLS 1.3 256-Bit</span>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-2"
                >
                  <span>
                    {activeTab === 'OFFICER'
                      ? 'Sign in to Officer Console'
                      : 'Sign in to Vendor Workspace'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Security & Confidentiality Notice */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center space-x-2 text-[11px] text-slate-400 text-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Restricted to authorized GeM & PSU procurement personnel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
