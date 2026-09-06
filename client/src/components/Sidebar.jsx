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

      {/* Executive Government Navy Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0B132B] text-slate-100 border-r border-slate-800/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 shadow-xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header & Brand */}
        <div className="shrink-0">
          {/* National Tricolor Line */}
          <div className="h-1 w-full flex">
            <div className="h-full w-1/3 bg-[#FF671F]"></div>
            <div className="h-full w-1/3 bg-white"></div>
            <div className="h-full w-1/3 bg-[#046A38]"></div>
          </div>

          <div className="p-3.5 border-b border-slate-800 bg-[#070D1F] flex items-center justify-between">
            <Link
              to={isOfficer ? '/tenders' : '/vendor'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-2.5 group"
            >
              <img
                src="/cpcl_logo.png"
                alt="CPCL Logo"
                className="w-8 h-8 object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white tracking-tight leading-tight">
                    BidPramaan
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-1 py-0.2 rounded font-bold">
                    CPCL
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium leading-tight mt-0.5">
                  Ministry of Petroleum &amp; Natural Gas
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-white p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subheader Role Badge */}
          <div className="px-3.5 py-1.5 bg-[#050A16] border-b border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isOfficer ? 'Procurement Officer Desk' : 'Vendor Workspace'}
            </span>
            <span className="font-mono text-[9px] text-slate-400 bg-slate-800/80 border border-slate-700/60 px-1.5 py-0.5 rounded font-medium">
              {isOfficer ? 'GFR 2017' : 'GeM Synced'}
            </span>
          </div>
        </div>

        {/* Middle Scrollable Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-2.5 space-y-3.5">
          {activeSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-2 pt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 font-mono">
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
                      className={`group flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-all ${
                        item.active
                          ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-900/40'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60 font-medium'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                        <span className="truncate">{item.name}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                            item.active
                              ? 'bg-blue-700 text-blue-100 font-medium'
                              : 'bg-slate-800/80 text-slate-400 border border-slate-700/50'
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

        {/* Bottom Section: User Profile & Logout */}
        <div className="shrink-0 p-3 border-t border-slate-800 bg-[#050A16]">
          {user && (
            <div className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-7 h-7 rounded-md bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {getInitials(user.name || user.company_name)}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-semibold text-white truncate">
                    {user.name || user.company_name}
                  </span>
                  <span className="text-[9px] text-slate-400 truncate font-mono">
                    {isOfficer ? 'Procurement Officer' : (user.gstin || 'Registered Vendor')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-700/60 rounded-md transition shrink-0 cursor-pointer"
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
