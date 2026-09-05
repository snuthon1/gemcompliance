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
  History,
  Activity,
  Menu,
  X,
  Sparkles,
  ExternalLink
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
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const navLinks = [
    {
      name: 'Bidders Directory',
      path: '/',
      icon: Users,
      badge: 'Evaluation',
      active: isBiddersActive
    },
    {
      name: 'Tenders & Bids',
      path: '/tenders',
      icon: Layers,
      badge: 'Active',
      active: isTendersActive
    },
    {
      name: 'Vendor Workspace',
      path: '/vendor',
      icon: Building2,
      badge: 'Portal',
      active: isVendorActive
    }
  ];

  return (
    <>
      {/* Mobile Topbar for Hamburger toggle */}
      <div className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <Link to={isVendor ? '/vendor' : '/'} className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight text-base">BidShield</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Left Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-950 text-slate-200 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link
              to={isVendor ? '/vendor' : '/'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-1.5">
                  <span className="text-base font-extrabold text-white tracking-tight">BidShield</span>
                  <span className="bg-indigo-900/80 text-indigo-300 font-mono text-[9px] font-bold px-1.5 py-0.5 rounded border border-indigo-700/50 uppercase">
                    GeM
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-tight">
                  CPCL &bull; Statutory Engine
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-6 space-y-6">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Core Console
              </div>
              <nav className="space-y-1">
                {navLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        item.active
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                          item.active
                            ? 'bg-indigo-700 text-indigo-100'
                            : 'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Quick Context Card */}
            <div className="px-3 py-3 rounded-xl bg-slate-900/70 border border-slate-800/80 space-y-2">
              <div className="flex items-center space-x-2 text-indigo-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Verification Scope</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Autonomous cross-check against GSTN, Udyam, PAN, and Central Debarment with GFR 2017 compliance.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Section: Database Health & User Profile */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          {/* Turso Cloud Status Pill */}
          <div className="px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[11px] font-mono text-slate-300">Turso Cloud</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">
              Live (BOM)
            </span>
          </div>

          {/* User Account Card */}
          {user && (
            <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-950 border border-indigo-700/50 text-indigo-300 flex items-center justify-center font-bold text-xs shrink-0">
                  {getInitials(user.name || user.company_name)}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-semibold text-white truncate">
                    {user.name || user.company_name}
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono truncate">
                    {isOfficer ? 'PSU Procurement Officer' : 'Commercial Bidder'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition shrink-0"
                title="Sign Out"
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
