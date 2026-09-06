import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  Users,
  Network,
  FileSearch,
  ShieldAlert,
  Scale,
  BarChart3,
  Fingerprint,
  FileText,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Building2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NationalEmblem from './NationalEmblem';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isOfficer, isVendor } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const officerNavItems = [
    {
      name: 'Tenders & Bids',
      path: '/tenders',
      icon: Layers,
      active: location.pathname.startsWith('/tenders') || location.pathname === '/'
    },
    {
      name: 'Bidders Directory',
      path: '/bidders',
      icon: Users,
      active: location.pathname === '/bidders' || location.pathname.startsWith('/bidder/')
    },
    {
      name: 'Cartel Watch',
      path: '/cartel-watch',
      icon: Network,
      active: location.pathname === '/cartel-watch'
    },
    {
      name: 'Doc Forensics',
      path: '/document-forensics',
      icon: FileSearch,
      active: location.pathname === '/document-forensics'
    },
    {
      name: 'Debarred Registry',
      path: '/blacklist',
      icon: ShieldAlert,
      active: location.pathname === '/blacklist'
    },
    {
      name: 'GFR 2017 Rules',
      path: '/gfr-rules',
      icon: Scale,
      active: location.pathname === '/gfr-rules'
    },
    {
      name: 'Risk Analytics',
      path: '/analytics',
      icon: BarChart3,
      active: location.pathname === '/analytics'
    },
    {
      name: 'Audit Ledger',
      path: '/audit-trail',
      icon: Fingerprint,
      active: location.pathname === '/audit-trail'
    },
    {
      name: 'Disputes & Redressal',
      path: '/representations',
      icon: FileText,
      active: location.pathname === '/representations'
    }
  ];

  const vendorNavItems = [
    {
      name: 'Vendor Workspace',
      path: '/vendor',
      icon: LayoutDashboard,
      active:
        location.pathname === '/vendor' ||
        location.pathname.startsWith('/vendor/') ||
        location.pathname === '/portal' ||
        location.pathname === '/user-dashboard'
    },
    {
      name: 'Active CPCL Tenders',
      path: '/tenders',
      icon: Layers,
      active: location.pathname.startsWith('/tenders')
    },
    {
      name: 'GFR Compliance Matrix',
      path: '/gfr-rules',
      icon: Scale,
      active: location.pathname === '/gfr-rules'
    },
    {
      name: 'File Representation',
      path: '/representations',
      icon: FileText,
      active: location.pathname === '/representations'
    }
  ];

  const navItems = isOfficer ? officerNavItems : vendorNavItems;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* 1. National Tricolor Accent Line */}
      <div className="h-1 w-full flex">
        <div className="h-full w-1/3 bg-[#FF671F]"></div>
        <div className="h-full w-1/3 bg-white"></div>
        <div className="h-full w-1/3 bg-[#046A38]"></div>
      </div>

      {/* 2. Top Header Masthead Row */}
      <div className="px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-4 border-b border-slate-100">
        {/* Left: Ministry & Portal Title */}
        <div className="flex items-center space-x-3 min-w-0">
          <NationalEmblem className="w-6 h-8 shrink-0 hidden sm:block" color="#0B2546" />
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-[#0B2546] tracking-tight text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0B2546]"></span>
                GeM-CPCL Bid Compliance
              </span>
              <span className="text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-300/80 px-2 py-0.5 rounded-full">
                CPCL &bull; MoPNG
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate hidden md:inline">
              Automated Statutory Credential Verification &amp; Anti-Cartel System
            </span>
          </div>
        </div>

        {/* Right: User Profile, Role Badge & Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="hidden lg:flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-[11px] font-mono text-emerald-900 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            <span>CVC &bull; GeM Sync Active</span>
          </div>

          {user && (
            <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
              <div className="w-6 h-6 rounded-md bg-[#0B2546] text-white flex items-center justify-center font-bold text-[11px]">
                {user.name ? user.name.slice(0, 2).toUpperCase() : (isOfficer ? 'OF' : 'VN')}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-xs font-bold text-slate-800 max-w-[130px] truncate">
                  {user.name || user.company_name || 'Authorized User'}
                </span>
                <span className="text-[10px] text-slate-500 font-mono mt-0.5">
                  {isOfficer ? 'Procurement Officer' : 'Registered Vendor'}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            title="Sign out of portal session"
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* 3. Dedicated Top Navigation Bar (Navbar) Row */}
      <div className="bg-[#07182D] text-white px-3 sm:px-6 lg:px-8 py-1 flex items-center justify-between overflow-hidden shadow-inner">
        <nav className="flex items-center space-x-1 overflow-x-auto scrollbar-none py-0.5 max-w-full">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                  item.active
                    ? 'bg-[#123663] text-white font-bold shadow-xs border-b-2 border-amber-400'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.active ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Status Tag */}
        <div className="hidden xl:flex items-center space-x-2 text-[10px] font-mono text-slate-400 shrink-0 pl-3 border-l border-slate-700">
          <span className="text-amber-300 font-semibold">SIH26100</span>
          <span>&bull;</span>
          <span>GFR 2017</span>
        </div>
      </div>
    </header>
  );
}
