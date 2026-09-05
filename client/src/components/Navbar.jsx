import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Layers,
  Users,
  Building2,
  Database,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onRefresh }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isOfficer, isVendor } = useAuth();

  const isBiddersActive = location.pathname === '/' || location.pathname.startsWith('/bidder');
  const isTendersActive = location.pathname.startsWith('/tenders');
  const isVendorActive =
    location.pathname.startsWith('/vendor') ||
    location.pathname.startsWith('/portal') ||
    location.pathname.startsWith('/user-dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to={isVendor ? '/vendor' : '/'} className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold text-slate-900 tracking-tight">BidShield</span>
              <span className="bg-indigo-50 text-indigo-700 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md border border-indigo-200/60">
                GeM Edition
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">CPCL &bull; Statutory Pre-Qualification</span>
          </div>
        </Link>

        {/* Center Modern Segmented Navigation Tabs */}
        <nav className="hidden md:flex items-center space-x-1 bg-slate-100/90 p-1 rounded-full border border-slate-200/80">
          <Link
            to="/"
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
              isBiddersActive
                ? 'bg-white text-slate-900 shadow-sm font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-600" />
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
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
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
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Vendor Workspace</span>
          </Link>
        </nav>

        {/* Right Section: Cloud Status, Profile, and Sign Out */}
        <div className="flex items-center space-x-3">
          {/* Turso Cloud Live Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-full text-[11px] font-mono text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3 h-3 text-slate-400" />
            <span>Turso Cloud &bull; Mumbai</span>
          </div>

          {/* User Profile Pill */}
          {user && (
            <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs border border-indigo-200 shadow-sm">
                {getInitials(user.name || user.company_name)}
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xs font-semibold text-slate-800 leading-tight max-w-[150px] truncate">
                  {user.name || user.company_name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {isOfficer ? 'CPCL Procurement Officer' : 'Commercial Vendor'}
                </span>
              </div>
            </div>
          )}

          {/* Sign Out Button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
