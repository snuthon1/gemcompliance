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
  BarChart3
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
      name: 'Blacklist Search',
      path: '/blacklist',
      icon: ShieldAlert,
      active: location.pathname === '/blacklist'
    },
    {
      name: 'Reports & Analytics',
      path: '/analytics',
      icon: BarChart3,
      active: location.pathname === '/analytics'
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
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
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
          </div>
        </div>

        {/* Bottom Section: User Profile & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50">

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
