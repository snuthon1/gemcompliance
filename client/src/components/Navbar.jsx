import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, UserCheck, RefreshCw, Layers, Users, Building2 } from 'lucide-react';

export default function Navbar({ onRefresh }) {
  const location = useLocation();

  const isBiddersActive = location.pathname === '/' || location.pathname.startsWith('/bidder');
  const isTendersActive = location.pathname.startsWith('/tenders');
  const isVendorActive = location.pathname.startsWith('/vendor') || location.pathname.startsWith('/portal') || location.pathname.startsWith('/user-dashboard');

  return (
    <header className="bg-cpcl-navy text-white border-b-4 border-cpcl-orange shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Link to="/" className="flex items-center space-x-3 group">
          <div className="bg-white/10 p-2 rounded border border-white/20 flex items-center justify-center group-hover:bg-white/15 transition">
            <ShieldCheck className="w-5 h-5 text-cpcl-orange" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-extrabold tracking-tight text-white flex items-center">
                BidShield
              </span>
              <span className="bg-cpcl-orange/20 border border-cpcl-orange/40 text-orange-200 text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tracking-wide uppercase">
                GeM Platform
              </span>
              <span className="bg-blue-600/40 border border-blue-400/40 text-blue-200 text-[11px] px-2 py-0.5 rounded font-mono font-medium">
                SIH26100
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Ministry of Petroleum & Natural Gas &bull; Chennai Petroleum Corporation Limited (CPCL)
            </p>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-lg border border-slate-700">
          <Link
            to="/"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
              isBiddersActive
                ? 'bg-cpcl-orange text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Bidders Directory</span>
          </Link>

          <Link
            to="/tenders"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
              isTendersActive
                ? 'bg-cpcl-orange text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Tenders & Bids</span>
          </Link>

          <Link
            to="/vendor"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
              isVendorActive
                ? 'bg-cpcl-orange text-white shadow'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Vendor Portal</span>
          </Link>
        </div>

        {/* User Info & Refresh */}
        <div className="flex items-center space-x-3">
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded border border-slate-600 transition"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )}

          <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded border border-slate-700 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <div>
              <span className="font-semibold text-slate-200 flex items-center space-x-1">
                <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                <span>Officer R. K. Sharma</span>
              </span>
              <span className="text-slate-400 block text-[10px]">Tender Committee Convener</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
