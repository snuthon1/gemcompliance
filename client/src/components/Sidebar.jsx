import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Layers,
  Users,
  LayoutDashboard,
  UserCheck,
  Building2,
  Database,
  LogOut,
  FileCheck2,
  Menu,
  X,
  Shield,
  Activity,
  FileText,
  CheckCircle2,
  Lock,
  ExternalLink,
  ShieldAlert,
  BarChart3,
  Network,
  Scale,
  Zap,
  Fingerprint,
  FileSearch
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NationalEmblem from './NationalEmblem';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isOfficer, isVendor } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Structured Officer Navigation Sections
  const officerSections = [
    {
      heading: 'Procurement Operations',
      items: [
        {
          name: 'Tenders & Bids',
          path: '/tenders',
          icon: Layers,
          badge: 'Active',
          active: location.pathname.startsWith('/tenders') || location.pathname === '/'
        },
        {
          name: 'Bidders Directory',
          path: '/bidders',
          icon: Users,
          badge: 'Enrolled',
          active: location.pathname === '/bidders' || location.pathname.startsWith('/bidder/')
        }
      ]
    },
    {
      heading: 'Vigilance & Risk Intelligence',
      items: [
        {
          name: 'Cartel & Collusion Watch',
          path: '/cartel-watch',
          icon: Network,
          badge: 'AI Monitor',
          active: location.pathname === '/cartel-watch'
        },
        {
          name: 'Document Tamper Inspector',
          path: '/document-forensics',
          icon: FileSearch,
          badge: 'Forensics',
          active: location.pathname === '/document-forensics'
        },
        {
          name: 'National Debarment',
          path: '/blacklist',
          icon: ShieldAlert,
          badge: 'CVC Sync',
          active: location.pathname === '/blacklist'
        },
        {
          name: 'Forensic Audit Ledger',
          path: '/audit-trail',
          icon: Fingerprint,
          badge: 'Immutable',
          active: location.pathname === '/audit-trail'
        }
      ]
    },
    {
      heading: 'Statutory & Governance',
      items: [
        {
          name: 'GFR 2017 Rulebook',
          path: '/gfr-rules',
          icon: Scale,
          badge: 'Mandates',
          active: location.pathname === '/gfr-rules'
        },
        {
          name: 'Statutory Gateway (APIs)',
          path: '/registry-gateway',
          icon: Zap,
          badge: 'Live APIs',
          active: location.pathname === '/registry-gateway'
        },
        {
          name: 'Dispute Redressal Desk',
          path: '/representations',
          icon: FileText,
          badge: 'GFR 175',
          active: location.pathname === '/representations'
        },
        {
          name: 'Reports & Analytics',
          path: '/analytics',
          icon: BarChart3,
          badge: 'BI',
          active: location.pathname === '/analytics'
        }
      ]
    }
  ];

  // Structured Vendor Navigation Sections
  const vendorSections = [
    {
      heading: 'Enterprise Workspace',
      items: [
        {
          name: 'Overview',
          path: '/vendor/overview',
          icon: LayoutDashboard,
          badge: 'Summary',
          active: location.pathname === '/vendor' || location.pathname === '/vendor/overview' || location.pathname === '/portal' || location.pathname === '/user-dashboard'
        },
        {
          name: 'Profile Status',
          path: '/vendor/profile',
          icon: UserCheck,
          badge: 'KYC & Info',
          active: location.pathname === '/vendor/profile'
        },
        {
          name: 'Uploaded Documents',
          path: '/vendor/documents',
          icon: FileCheck2,
          badge: 'Vault',
          active: location.pathname === '/vendor/documents'
        },
        {
          name: 'Apply for Tender/BIDs',
          path: '/vendor/apply',
          icon: Layers,
          badge: 'Live Desk',
          active: location.pathname === '/vendor/apply'
        }
      ]
    },
    {
      heading: 'Statutory Benchmarks',
      items: [
        {
          name: 'GFR 2017 Matrix',
          path: '/gfr-rules',
          icon: Scale,
          badge: 'Mandates',
          active: location.pathname === '/gfr-rules'
        },
        {
          name: 'Statutory Gateway',
          path: '/registry-gateway',
          icon: Zap,
          badge: 'Live APIs',
          active: location.pathname === '/registry-gateway'
        }
      ]
    }
  ];

  const activeSections = isOfficer ? officerSections : vendorSections;

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <NationalEmblem className="w-8 h-9 shrink-0" />
          <div>
            <span className="font-bold text-[#0B2546] text-sm">GeM-CPCL • BidShield</span>
            <span className="block text-[10px] text-slate-500 font-medium">Ministry of Petroleum &amp; Natural Gas</span>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Clean White Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-800 border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 shadow-xs ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="shrink-0">
          {/* National Tricolor Line */}
          <div className="h-1.5 w-full flex">
            <div className="h-full w-1/3 bg-[#FF671F]"></div>
            <div className="h-full w-1/3 bg-white border-y border-slate-100"></div>
            <div className="h-full w-1/3 bg-[#046A38]"></div>
          </div>

          <div className="p-3.5 border-b border-slate-200 bg-white flex items-center justify-between">
            <Link
              to={isOfficer ? '/tenders' : '/vendor'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-2.5 group"
            >
              <NationalEmblem className="w-9 h-11 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[9px] font-bold text-slate-500 tracking-wider uppercase font-mono">
                  भारत सरकार
                </span>
                <span className="text-xs font-extrabold text-[#0B2546] tracking-tight leading-tight">
                  GeM-CPCL Bid Compliance
                </span>
                <span className="text-[9px] text-slate-500 font-semibold mt-0.5">
                  Ministry of Petroleum &amp; Natural Gas
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Role Pillar Badge */}
          <div className="px-3.5 py-1.5 bg-slate-50 border-b border-slate-200/80 text-[10px] text-slate-600 font-medium flex items-center justify-between">
            <span className="font-bold text-[#0B2546] flex items-center gap-1 text-[10px]">
              <span className={`w-1.5 h-1.5 rounded-full ${isOfficer ? 'bg-[#0B2546]' : 'bg-emerald-500'}`}></span>
              {isOfficer ? 'OFFICER COMMITTEE' : 'VENDOR DESK'}
            </span>
            <span className="font-mono text-slate-500 text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-bold">
              {isOfficer ? 'GFR 2017 • CVC' : 'GeM Registered'}
            </span>
          </div>
        </div>

        {/* Middle Scrollable Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col justify-between">
          <div className="space-y-4">
            {activeSections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-1">
                <div className="px-2 text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                  {section.heading}
                </div>
                <nav className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                          item.active
                            ? 'bg-[#0B2546] text-white shadow-xs'
                            : 'text-slate-600 hover:text-[#0B2546] hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : 'text-slate-500'}`} />
                          <span className="truncate text-xs">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold shrink-0 ${
                              item.active
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-500 border border-slate-200'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

          {/* Statutory Engine Telemetry / Compliance Status Card */}
          <div className="pt-4 mt-4 border-t border-slate-200">
            {isOfficer ? (
              <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-2.5 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B2546] font-mono">
                      Statutory Gateways
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                    100% LIVE
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">●</span> GSTN Master
                    </span>
                    <span className="text-slate-500 font-semibold text-[9px]">24ms</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">●</span> CBDT PAN API
                    </span>
                    <span className="text-emerald-700 font-bold text-[9px]">SYNC</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">●</span> MCA-21 DIN
                    </span>
                    <span className="text-emerald-700 font-bold text-[9px]">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-blue-600 font-bold">●</span> CVC Debarment
                    </span>
                    <span className="text-[#0B2546] font-bold text-[9px]">LOCKED</span>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>GFR Rule 144(xi)</span>
                  <span className="text-slate-400 font-semibold">SHA-256</span>
                </div>
              </div>
            ) : (
              <div className="rounded-lg border border-slate-200 bg-slate-50/90 p-2.5 shadow-2xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#0B2546] font-mono">
                      Vendor Compliance
                    </span>
                  </div>
                  <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-1.5 py-0.5 rounded font-mono">
                    VERIFIED
                  </span>
                </div>

                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">●</span> GeM Registry
                    </span>
                    <span className="text-emerald-700 font-bold text-[9px]">ENROLLED</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">●</span> CVC Debarment
                    </span>
                    <span className="text-emerald-700 font-bold text-[9px]">CLEARED</span>
                  </div>
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-emerald-600 font-bold">●</span> Document Vault
                    </span>
                    <span className="text-blue-700 font-bold text-[9px]">ENCRYPTED</span>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-200/80 flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>CPCL e-Procure</span>
                  <span className="text-slate-400 font-semibold">SSL 256-bit</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: User Profile & Logout */}
        <div className="shrink-0 p-2.5 border-t border-slate-200 bg-slate-50">
          {user && (
            <div className="p-2 rounded-lg bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs">
              <div className="flex items-center space-x-2 min-w-0">
                <div className="w-7 h-7 rounded-md bg-slate-100 text-[#0B2546] flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300">
                  {getInitials(user.name || user.company_name)}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {user.name || user.company_name}
                  </span>
                  <span className="text-[9px] text-[#0B2546] font-semibold truncate font-mono">
                    {isOfficer ? 'Procurement Officer (Admin)' : `GST: ${user.gstin || 'Enrolled'}`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition shrink-0 cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
