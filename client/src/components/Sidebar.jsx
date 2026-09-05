import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  Layers,
  Users,
  Building2,
  Database,
  LogOut,
  FileCheck2,
  CheckCircle2,
  Activity,
  Menu,
  X,
  ExternalLink,
  Lock,
  ChevronRight,
  Landmark
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isOfficer, isVendor } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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
    if (!name) return 'GO';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navLinks = [
    {
      name: 'Bidders Repository',
      path: '/',
      icon: Users,
      badge: 'Evaluation',
      active: isBiddersActive
    },
    {
      name: 'Tenders & Bids',
      path: '/tenders',
      icon: Layers,
      badge: 'Live',
      active: isTendersActive
    },
    {
      name: 'Vendor Portal Desk',
      path: '/vendor',
      icon: Building2,
      badge: 'Self-Service',
      active: isVendorActive
    }
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-gov-navy text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded bg-white text-gov-navy flex items-center justify-center font-bold">
            <Landmark className="w-4 h-4 text-gov-navy" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-sm">BidShield &bull; GeM</span>
            <span className="block text-[9px] text-slate-300 font-mono">CPCL &bull; MoPNG</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded text-slate-200 hover:bg-gov-navyLight transition"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Left Sidebar Container: Official Deep Govt Navy */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-gov-navyDark text-white border-r border-slate-700/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 shadow-xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          {/* Official Indian Tricolor Top Strip */}
          <div className="h-1.5 w-full flex">
            <div className="h-full w-1/3 bg-gov-saffron"></div>
            <div className="h-full w-1/3 bg-white"></div>
            <div className="h-full w-1/3 bg-gov-green"></div>
          </div>

          <div className="p-5 border-b border-slate-800 bg-gov-navy flex items-center justify-between">
            <Link
              to={isVendor ? '/vendor' : '/'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-3 group"
            >
              {/* Emblem / Ashoka Pillar Inspired Badge */}
              <div className="w-10 h-10 rounded-lg bg-white p-1.5 flex items-center justify-center shadow-md shrink-0 border border-slate-200">
                <ShieldCheck className="w-6 h-6 text-gov-navy" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base font-extrabold text-white tracking-tight">BidShield</span>
                  <span className="bg-gov-saffron text-white font-mono text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase">
                    GeM
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-medium truncate">
                  CPCL &bull; Ministry of Petroleum
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-300 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub-header Government Identity Tag */}
          <div className="px-5 py-2.5 bg-gov-navyDark/90 border-b border-slate-800 text-[10px] text-slate-400 font-mono flex items-center justify-between">
            <span>भारत सरकार | GOI</span>
            <span className="text-gov-saffron font-semibold">GFR 2017</span>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-5 space-y-6">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Procurement Services
              </div>
              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        item.active
                          ? 'bg-gov-navyLight text-white border-l-4 border-gov-saffron shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-gov-navy'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${item.active ? 'text-gov-saffron' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          item.active
                            ? 'bg-gov-saffron text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Statutory Portals Cross-Check Status */}
            <div className="px-3.5 py-3 rounded-lg bg-gov-navy/70 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-200">
                <span className="uppercase tracking-wider">Connected Portals</span>
                <span className="text-gov-green text-[9px] flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gov-green mr-1 animate-pulse"></span>
                  Active
                </span>
              </div>
              <div className="space-y-1 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center justify-between">
                  <span>GSTN Registry (GSTR-3B)</span>
                  <span className="text-gov-green font-bold">&check; Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>MSME Udyam Aadhaar</span>
                  <span className="text-gov-green font-bold">&check; Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>CBDT PAN Verification</span>
                  <span className="text-gov-green font-bold">&check; Live</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>MoPNG Debarment List</span>
                  <span className="text-gov-green font-bold">&check; Live</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Turso Cloud & Officer/User Console */}
        <div className="p-4 border-t border-slate-800 bg-gov-navy space-y-3">
          {/* Cloud Database Pill */}
          <div className="px-3 py-1.5 rounded bg-gov-navyDark border border-slate-700/60 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-gov-green animate-pulse"></span>
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] text-slate-300">Turso Cloud DB</span>
            </div>
            <span className="text-[9px] text-gov-green font-bold uppercase">
              Mumbai (Live)
            </span>
          </div>

          {/* User Account Card */}
          {user && (
            <div className="p-2.5 rounded-lg bg-gov-navyDark border border-slate-700/60 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded bg-white text-gov-navy flex items-center justify-center font-bold text-xs shrink-0 shadow-sm border border-slate-200">
                  {getInitials(user.name || user.company_name)}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-white truncate">
                    {user.name || user.company_name}
                  </span>
                  <span className="text-[10px] text-gov-saffron font-mono truncate font-semibold">
                    {isOfficer ? 'CPCL Procurement Officer' : 'Authorized Signatory'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-300 hover:text-white hover:bg-gov-navyLight rounded transition shrink-0"
                title="Sign Out of Portal"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
