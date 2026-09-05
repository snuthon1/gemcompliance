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
  AlertCircle,
  Landmark,
  KeyRound,
  FileText
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
    <div className="min-h-screen bg-gov-slateBg flex flex-col justify-between text-slate-800 selection:bg-gov-saffron selection:text-white">
      {/* 1. Official Government of India Top Strip */}
      <div>
        {/* National Tricolor Line */}
        <div className="h-1.5 w-full flex">
          <div className="h-full w-1/3 bg-gov-saffron"></div>
          <div className="h-full w-1/3 bg-white"></div>
          <div className="h-full w-1/3 bg-gov-green"></div>
        </div>

        {/* Official Masthead */}
        <header className="bg-white border-b border-slate-200 py-3 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-lg bg-gov-navy text-white flex items-center justify-center font-bold shadow-sm">
                <Landmark className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-mono">
                  भारत सरकार &bull; Government of India
                </div>
                <div className="text-base font-extrabold text-gov-navy tracking-tight">
                  Chennai Petroleum Corporation Limited (CPCL)
                </div>
                <div className="text-[11px] text-slate-600 font-medium">
                  Ministry of Petroleum & Natural Gas &bull; GeM Pre-Qualification Portal
                </div>
              </div>
            </div>

            {/* Accessibility and Language Bar */}
            <div className="hidden md:flex items-center space-x-4 text-xs text-slate-600 font-medium">
              <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                English | हिंदी
              </span>
              <span className="text-slate-400">|</span>
              <span className="font-mono text-xs">SIH26100</span>
            </div>
          </div>
        </header>
      </div>

      {/* 2. Main Login Body */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Left Column: Official Tender & Compliance Notice */}
          <div className="lg:col-span-6 bg-gov-navy text-white rounded-xl p-8 flex flex-col justify-between shadow-lg border-t-4 border-gov-saffron">
            <div className="space-y-6">
              <div className="inline-flex items-center space-x-2 bg-gov-navyLight/80 px-3 py-1 rounded text-xs font-mono text-gov-saffron font-bold uppercase border border-slate-700">
                <span>Official e-Procurement Portal</span>
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  BidShield &bull; GeM Edition
                </h1>
                <p className="text-xs text-slate-300 mt-1 font-mono uppercase tracking-wide">
                  Statutory Pre-Qualification & Verification System
                </p>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed">
                Automated multi-portal cross-verification engine for commercial bidders participating in CPCL tenders. Designed to eliminate manual vetting delays under GFR 2017.
              </p>

              {/* 4 Pillars in Government Card */}
              <div className="space-y-3 pt-2">
                <div className="flex items-start space-x-3 text-xs">
                  <span className="w-5 h-5 rounded bg-gov-green/20 text-gov-green flex items-center justify-center font-bold shrink-0 border border-gov-green/40">
                    &check;
                  </span>
                  <div>
                    <strong className="text-white">6-Pillar Statutory Reconciliation:</strong>
                    <p className="text-slate-300 text-[11px]">Direct integration with GSTN, MSME Udyam, CBDT PAN & MoPNG Debarment.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <span className="w-5 h-5 rounded bg-gov-green/20 text-gov-green flex items-center justify-center font-bold shrink-0 border border-gov-green/40">
                    &check;
                  </span>
                  <div>
                    <strong className="text-white">Multimodal Vision Document AI:</strong>
                    <p className="text-slate-300 text-[11px]">Field extraction of GST REG-06, PAN cards, and Udyam registrations.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 text-xs">
                  <span className="w-5 h-5 rounded bg-gov-green/20 text-gov-green flex items-center justify-center font-bold shrink-0 border border-gov-green/40">
                    &check;
                  </span>
                  <div>
                    <strong className="text-white">Cryptographic Audit Trail:</strong>
                    <p className="text-slate-300 text-[11px]">Tamper-evident logging for vigilance audits and tender committee reviews.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/80 mt-6 text-[11px] text-slate-400 font-mono">
              Certified compliant with GFR 2017 & CVC Vigilance Guidelines
            </div>
          </div>

          {/* Right Column: Official Sign In Box */}
          <div className="lg:col-span-6 bg-white rounded-xl shadow-md border border-slate-200 p-8 flex flex-col justify-between">
            <div>
              {/* Dual Tab Navigation */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-lg mb-6 border border-slate-200">
                <button
                  type="button"
                  onClick={() => handleTabChange('OFFICER')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded text-xs font-bold transition-all ${
                    activeTab === 'OFFICER'
                      ? 'bg-gov-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-gov-saffron" />
                  <span>PSU / Govt Officer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabChange('VENDOR')}
                  className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded text-xs font-bold transition-all ${
                    activeTab === 'VENDOR'
                      ? 'bg-gov-navy text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-4 h-4 text-gov-saffron" />
                  <span>Tender Bidder</span>
                </button>
              </div>

              {/* Header Details */}
              <div className="mb-5 space-y-1">
                <h2 className="text-base font-extrabold text-gov-navy tracking-tight">
                  {activeTab === 'OFFICER'
                    ? 'Tender Evaluation Committee Sign In'
                    : 'Registered Vendor Commercial Desk'}
                </h2>
                <p className="text-xs text-slate-500">
                  {activeTab === 'OFFICER'
                    ? 'Enter authorized CPCL credentials with Digital Signature Certificate (DSC).'
                    : 'Select your registered enterprise to inspect compliance scores and submit bids.'}
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 flex items-center space-x-2 text-xs text-rose-700 font-semibold">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Standard Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'OFFICER' ? (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Official Government Email ID
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="officer.sharma@cpcl.gov.in"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-gov-navy focus:border-gov-navy"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                          DSC Passcode / Security PIN
                        </label>
                        <span className="text-[10px] text-gov-green font-bold flex items-center">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Class-3 DSC Connected
                        </span>
                      </div>
                      <div className="relative">
                        <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-gov-navy focus:border-gov-navy"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Select Participating Company
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <select
                          value={selectedVendorKey}
                          onChange={(e) => handleVendorSelect(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-gov-navy cursor-pointer"
                        >
                          <option value="apex">Apex Petrochem Engineering Pvt Ltd (33AAACA1234A1Z5)</option>
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
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tenders@company.com"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-gov-navy focus:border-gov-navy"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                        Vendor Access Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-gov-navy focus:border-gov-navy"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded border-slate-300 text-gov-navy focus:ring-gov-navy" />
                    <span>Remember session</span>
                  </label>
                  <span className="font-mono text-[10px] text-slate-400">NIC-SSO 256-Bit TLS</span>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-lg bg-gov-navy hover:bg-gov-navyLight text-white text-xs font-bold shadow transition-all flex items-center justify-center space-x-2 disabled:opacity-50 mt-3 cursor-pointer"
                >
                  <span>
                    {activeTab === 'OFFICER'
                      ? 'Authenticate Officer via DSC / Token'
                      : 'Authenticate & Access Vendor Desk'}
                  </span>
                  <ArrowRight className="w-4 h-4 text-gov-saffron" />
                </button>
              </form>
            </div>

            {/* Official Security Disclaimer */}
            <div className="mt-6 pt-4 border-t border-slate-200 text-[10px] text-slate-500 text-center font-mono">
              Protected by Section 43/66 IT Act 2000. Monitored by Chief Vigilance Officer (CVO).
            </div>
          </div>
        </div>
      </main>

      {/* 3. Official Government Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-gov-navy">BidShield</span>
            <span>&bull;</span>
            <span>Government e-Marketplace (GeM) Statutory Verification Platform</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            NIC / CPCL SIH26100 &bull; UX4G Compliant &bull; All Rights Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
