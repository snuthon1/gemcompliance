import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  UserCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileCheck2,
  Layers
} from 'lucide-react';
import { useAuth, DEMO_PROFILES } from '../context/AuthContext';

export default function Login() {
  const [activeTab, setActiveTab] = useState('OFFICER'); // 'OFFICER' or 'VENDOR'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedVendorKey, setSelectedVendorKey] = useState('apex');
  const [error, setError] = useState(null);

  const { login, quickLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || (activeTab === 'OFFICER' ? '/' : '/vendor');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);

    if (activeTab === 'OFFICER') {
      if (!email && !password) {
        // Default to demo officer if empty
        login({ email: 'officer.sharma@cpcl.gov.in', role: 'OFFICER' });
        navigate('/');
        return;
      }
      login({ email, role: 'OFFICER' });
      navigate(from === '/login' ? '/' : from);
    } else {
      // Vendor login
      const profile = DEMO_PROFILES[selectedVendorKey];
      login({
        email: email || profile.email,
        role: 'VENDOR',
        bidder_id: profile.bidder_id,
        company_name: profile.company_name
      });
      navigate(from === '/login' ? '/vendor' : from);
    }
  };

  const handleQuickLogin = (key) => {
    const res = quickLogin(key);
    if (res.success) {
      if (res.user.role === 'OFFICER') {
        navigate('/');
      } else {
        navigate('/vendor');
      }
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        {/* Logo and branding */}
        <div className="inline-flex items-center justify-center p-3 bg-slate-900 rounded-2xl shadow-lg border border-slate-700 mb-4">
          <ShieldCheck className="w-9 h-9 text-brand-400" />
        </div>
        <div className="flex items-center justify-center space-x-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">BidShield</h1>
          <span className="bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold px-2 py-0.5 rounded font-mono uppercase">
            GeM Edition
          </span>
        </div>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Ministry of Petroleum & Natural Gas &bull; Chennai Petroleum Corporation Limited (CPCL)
        </p>
        <p className="text-xs text-slate-400 font-mono mt-0.5">SIH26100 Statutory Compliance Verification Engine</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-xl space-y-6">
          {/* Dual Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => {
                setActiveTab('OFFICER');
                setError(null);
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                activeTab === 'OFFICER'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Government / PSU Officer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('VENDOR');
                setError(null);
              }}
              className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-lg text-xs font-bold transition ${
                activeTab === 'VENDOR'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Tender Company / Bidder</span>
            </button>
          </div>

          {/* Form Description */}
          <div className="text-center">
            {activeTab === 'OFFICER' ? (
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Procurement Committee Authentication</h3>
                <p className="text-xs text-slate-500">
                  Access confidential statutory verification, risk auditing, and contract award consoles.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Commercial Bidder Workspace</h3>
                <p className="text-xs text-slate-500">
                  Manage company registrations, pre-qualification health scores, and submit sealed tender quotations.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-xs text-rose-800 font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Standard Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {activeTab === 'OFFICER' ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Official CPCL / MoPNG Email:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="officer.sharma@cpcl.gov.in"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Security Passcode / Token:
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Select Participating Bidder Company:
                  </label>
                  <select
                    value={selectedVendorKey}
                    onChange={(e) => setSelectedVendorKey(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
                  >
                    <option value="apex">Apex Petrochem Engineering Pvt Ltd (GSTIN: 33AAACA1234A1Z5)</option>
                    <option value="coromandel">Coromandel Heavy Valves & Alloy Works Ltd (GSTIN: 33BBBCB5678B1Z2)</option>
                    <option value="kaveri">Kaveri Refining Spares & Services Ltd (GSTIN: 33DDDCD4321D1Z4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Authorized Signatory Email:
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenders@apexpetrochem.in"
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              className={`w-full text-white text-xs font-bold py-3 rounded-lg shadow-md transition flex items-center justify-center space-x-2 ${
                activeTab === 'OFFICER'
                  ? 'bg-slate-900 hover:bg-slate-800'
                  : 'bg-brand-600 hover:bg-brand-700'
              }`}
            >
              <span>{activeTab === 'OFFICER' ? 'Authenticate as Officer' : 'Access Vendor Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Evaluator Access (1-Click Demo Profiles for Judges) */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center space-x-1.5 mb-3">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                1-Click Judge & Evaluator Quick Login:
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Officer Sharma */}
              <button
                type="button"
                onClick={() => handleQuickLogin('officer')}
                className="text-left p-3 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-100/60 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-900 flex items-center">
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-700 mr-1" />
                      Officer R. K. Sharma
                    </span>
                    <span className="text-[9px] bg-blue-200 text-blue-800 font-mono px-1.5 py-0.5 rounded font-bold uppercase">
                      Govt / PSU
                    </span>
                  </div>
                  <p className="text-[10px] text-blue-700 mt-1">CPCL Tender Committee Convener</p>
                </div>
                <div className="text-[10px] text-blue-600 font-semibold mt-2 group-hover:underline">
                  Enter Officer Console &rarr;
                </div>
              </button>

              {/* Apex Petrochem */}
              <button
                type="button"
                onClick={() => handleQuickLogin('apex')}
                className="text-left p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 hover:bg-emerald-100/60 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-900 flex items-center truncate">
                      <Building2 className="w-3.5 h-3.5 text-emerald-700 mr-1 shrink-0" />
                      Apex Petrochem
                    </span>
                    <span className="text-[9px] bg-emerald-200 text-emerald-800 font-mono px-1.5 py-0.5 rounded font-bold">
                      100/100
                    </span>
                  </div>
                  <p className="text-[10px] text-emerald-700 mt-1">Clean Compliant Vendor Tier</p>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-2 group-hover:underline">
                  Enter Vendor Portal &rarr;
                </div>
              </button>

              {/* Coromandel */}
              <button
                type="button"
                onClick={() => handleQuickLogin('coromandel')}
                className="text-left p-3 rounded-xl border border-amber-200 bg-amber-50/50 hover:bg-amber-100/60 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 flex items-center truncate">
                      <Building2 className="w-3.5 h-3.5 text-amber-700 mr-1 shrink-0" />
                      Coromandel Valves
                    </span>
                    <span className="text-[9px] bg-amber-200 text-amber-800 font-mono px-1.5 py-0.5 rounded font-bold">
                      85/100
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-700 mt-1">Legal Name Mismatch Flag</p>
                </div>
                <div className="text-[10px] text-amber-600 font-semibold mt-2 group-hover:underline">
                  Enter Vendor Portal &rarr;
                </div>
              </button>

              {/* Kaveri */}
              <button
                type="button"
                onClick={() => handleQuickLogin('kaveri')}
                className="text-left p-3 rounded-xl border border-rose-200 bg-rose-50/50 hover:bg-rose-100/60 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-rose-900 flex items-center truncate">
                      <Building2 className="w-3.5 h-3.5 text-rose-700 mr-1 shrink-0" />
                      Kaveri Refining
                    </span>
                    <span className="text-[9px] bg-rose-200 text-rose-800 font-mono px-1.5 py-0.5 rounded font-bold">
                      0/100
                    </span>
                  </div>
                  <p className="text-[10px] text-rose-700 mt-1">MoPNG Vigilance Debarred</p>
                </div>
                <div className="text-[10px] text-rose-600 font-semibold mt-2 group-hover:underline">
                  Enter Vendor Portal &rarr;
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
