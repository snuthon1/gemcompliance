import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Layers, Users, Building2, RefreshCw, Database } from 'lucide-react';

export default function Navbar({ onRefresh }) {
  const location = useLocation();

  const isBiddersActive = location.pathname === '/' || location.pathname.startsWith('/bidder');
  const isTendersActive = location.pathname.startsWith('/tenders');
  const isVendorActive = location.pathname.startsWith('/vendor') || location.pathname.startsWith('/portal') || location.pathname.startsWith('/user-dashboard');

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">BidShield</span>
              <span className="bg-indigo-50 text-indigo-700 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md border border-indigo-200/60">
                GeM
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">CPCL &bull; Statutory Verification Engine</span>
          </div>
        </Link>

        {/* Center Modern Segmented Navigation Tabs */}
        <nav className="flex items-center space-x-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/80">
          <Link
            to="/"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isBiddersActive
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Bidders Directory</span>
          </Link>

          <Link
            to="/tenders"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isTendersActive
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tenders & Bids</span>
          </Link>

          <Link
            to="/vendor"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isVendorActive
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Vendor Portal</span>
          </Link>
        </nav>

        {/* Right Status & Refresh */}
        <div className="flex items-center space-x-3">
          {/* Cloud Database Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3 h-3 text-slate-400" />
            <span>Turso Cloud</span>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200/80 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Quick Persona Pill */}
          <Link
            to={isVendorActive ? '/' : '/vendor'}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition"
          >
            <span>{isVendorActive ? 'Switch to Officer View' : 'Switch to Vendor View'}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
