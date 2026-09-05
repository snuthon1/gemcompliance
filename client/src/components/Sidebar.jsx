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
  ExternalLink
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

  // Strictly segregated navigation links based on user role
  const officerNavLinks = [
    {
      name: 'Tenders & Bids Desk',
      path: '/tenders',
      icon: Layers,
      badge: 'Live',
      active: location.pathname.startsWith('/tenders') || location.pathname === '/'
    },
    {
      name: 'Bidder Statutory Directory',
      path: '/bidders',
      icon: Users,
      badge: 'Dossiers',
      active: location.pathname === '/bidders' || location.pathname.startsWith('/bidder/')
    }
  ];

  const vendorNavLinks = [
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
  ];

  const activeLinks = isOfficer ? officerNavLinks : vendorNavLinks;

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shadow-xs">
        <div className="flex items-center space-x-2.5">
          <NationalEmblem className="w-8 h-9 shrink-0" />
          <div>
            <span className="font-bold text-[#0B2546] text-sm">NPCP &bull; BidShield</span>
            <span className="block text-[10px] text-slate-500 font-medium">Government of India &bull; CPCL</span>
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
        <div>
          {/* National Tricolor Line */}
          <div className="h-1.5 w-full flex">
            <div className="h-full w-1/3 bg-[#FF671F]"></div>
            <div className="h-full w-1/3 bg-white border-y border-slate-100"></div>
            <div className="h-full w-1/3 bg-[#046A38]"></div>
          </div>

          <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between">
            <Link
              to={isOfficer ? '/tenders' : '/vendor'}
              onClick={() => setMobileOpen(false)}
              className="flex items-center space-x-3 group"
            >
              <NationalEmblem className="w-10 h-12 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-bold text-slate-500 tracking-wider uppercase font-mono">
                  भारत सरकार
                </span>
                <span className="text-xs font-extrabold text-[#0B2546] tracking-tight leading-tight">
                  National Procurement Compliance Portal
                </span>
                <span className="text-[10px] text-slate-500 font-semibold mt-0.5">
                  Chennai Petroleum Corp Ltd
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
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200/80 text-[10px] text-slate-600 font-medium flex items-center justify-between">
            <span className="font-bold text-[#0B2546] flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isOfficer ? 'bg-[#0B2546]' : 'bg-emerald-500'}`}></span>
              {isOfficer ? 'OFFICER COMMITTEE' : 'VENDOR DESK'}
            </span>
            <span className="font-mono text-slate-500 text-[9px] bg-white border border-slate-200 px-1.5 py-0.5 rounded">
              {isOfficer ? 'GFR 2017' : 'GeM Registered'}
            </span>
          </div>

          {/* Navigation Section */}
          <div className="px-3 py-4 space-y-5">
            <div>
              <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                {isOfficer ? 'Procurement Governance' : 'Enterprise Workspace'}
              </div>
              <nav className="space-y-1">
                {activeLinks.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                        item.active
                          ? 'bg-[#0B2546] text-white shadow-sm'
                          : 'text-slate-600 hover:text-[#0B2546] hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className={`w-4 h-4 ${item.active ? 'text-white' : 'text-slate-500'}`} />
                        <span>{item.name}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                          item.active
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Officer Statutory Integration Status OR Vendor Guidance */}
            {isOfficer ? (
              <div className="px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-800">
                  <span className="uppercase tracking-wider">Statutory Verification Desk</span>
                  <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded text-[8px] font-semibold">
                    Simulated
                  </span>
                </div>
                <p className="text-[9px] text-slate-500 leading-tight">
                  Simulated registries for demonstration — not connected to live government systems.
                </p>
                <div className="space-y-1 text-[9px] text-slate-600 font-mono pt-1">
                  <div className="flex items-center justify-between">
                    <span>GSTN Verification (GSTR-3B)</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">&bull; Synced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>MSME Udyam Aadhaar</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">&bull; Synced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>CBDT Income Tax PAN</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">&bull; Synced</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>MoPNG Vigilance List</span>
                    <span className="text-emerald-600 font-semibold bg-emerald-50 px-1 rounded">&bull; Synced</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="px-3 py-2.5 rounded-lg bg-blue-50/50 border border-blue-100 space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#0B2546]">
                  <span className="uppercase tracking-wider">Vendor Compliance Rules</span>
                  <span className="text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded text-[8px] font-semibold">
                    GFR 2017
                  </span>
                </div>
                <p className="text-[9px] text-slate-600 leading-tight">
                  Ensure all uploaded statutory certificates exactly match legal registered entity names to maintain low-risk status.
                </p>
                <div className="space-y-1 text-[9px] text-slate-600 pt-1">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Upload GST REG-06 Certificate</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Valid PAN Card linked to Entity</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                    <span>Active MSME Udyam Registration</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Database Health & User Profile */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2.5">
          {/* Central DB Cloud Link */}
          <div className="px-2.5 py-1.5 rounded-md bg-white border border-slate-200 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <Database className="w-3 h-3 text-slate-400" />
              <span className="text-[10px] text-slate-600 font-semibold">Turso Edge DB</span>
            </div>
            <span className="text-[9px] text-emerald-700 font-bold uppercase">
              Cloud Active
            </span>
          </div>

          {/* User Account Card */}
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
