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
          active: location.pathname.startsWith('/tenders') || location.pathname === '/'
        },
        {
          name: 'Bidders Directory',
          path: '/bidders',
          icon: Users,
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
          active: location.pathname === '/cartel-watch'
        },
        {
          name: 'Document Tamper Inspector',
          path: '/document-forensics',
          icon: FileSearch,
          active: location.pathname === '/document-forensics'
        },
        {
          name: 'National Debarment',
          path: '/blacklist',
          icon: ShieldAlert,
          active: location.pathname === '/blacklist'
        },
        {
          name: 'Forensic Audit Ledger',
          path: '/audit-trail',
          icon: Fingerprint,
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
          active: location.pathname === '/gfr-rules'
        },
        {
          name: 'Statutory Gateway (APIs)',
          path: '/registry-gateway',
          icon: Zap,
          active: location.pathname === '/registry-gateway'
        },
        {
          name: 'Dispute Redressal Desk',
          path: '/representations',
          icon: FileText,
          active: location.pathname === '/representations'
        },
        {
          name: 'Reports & Analytics',
          path: '/analytics',
          icon: BarChart3,
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
          active:
            location.pathname === '/vendor' ||
            location.pathname === '/vendor/overview' ||
            location.pathname === '/portal' ||
            location.pathname === '/user-dashboard'
        },
        {
          name: 'Profile Status',
          path: '/vendor/profile',
          icon: UserCheck,
          active: location.pathname === '/vendor/profile'
        },
        {
          name: 'Uploaded Documents',
          path: '/vendor/documents',
          icon: FileCheck2,
          active: location.pathname === '/vendor/documents'
        },
        {
          name: 'Apply for Tender/BIDs',
          path: '/vendor/apply',
          icon: Layers,
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
          active: location.pathname === '/gfr-rules'
        },
        {
          name: 'Statutory Gateway',
          path: '/registry-gateway',
          icon: Zap,
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

      {/* Executive Clean Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white text-slate-800 border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 shadow-xs ${
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

          <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
            <Link
              to={isOfficer ? '/tenders' : '/vendor'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-2.5 group"
            >
              <img
                src="/cpcl_logo.png"
                alt="CPCL Logo"
                className="w-9 h-9 object-contain shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-extrabold text-[#0B2546] tracking-tight leading-tight">
                  GeM-CPCL Bid Compliance
                </span>
                <span className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                  BidShield &bull; Ministry of Petroleum
                </span>
              </div>
            </Link>

            <button
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Clean Role Sub-strip */}
          <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {isOfficer ? 'Officer Committee' : 'Vendor Portal'}
            </span>
            <span className="text-[10px] font-mono text-slate-400">SIH26100</span>
          </div>
        </div>

        {/* Middle Scrollable Navigation Section - COMPLETELY BOX-FREE */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {activeSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-2 pt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
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
                      className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                        item.active
                          ? 'bg-[#0B2546] text-white font-semibold shadow-xs'
                          : 'text-slate-600 hover:text-[#0B2546] hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${item.active ? 'text-white' : 'text-slate-400 group-hover:text-[#0B2546]'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Section: User Profile & Logout */}
        <div className="shrink-0 p-3 border-t border-slate-200 bg-slate-50">
          {user && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#0B2546] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  {getInitials(user.name || user.company_name)}
                </div>
                <div className="min-w-0 flex flex-col">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {user.name || user.company_name}
                  </span>
                  <span className="text-[10px] text-slate-500 truncate font-mono">
                    {isOfficer ? 'Procurement Officer' : (user.gstin || 'Registered Vendor')}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
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
