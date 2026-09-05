import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck, UserCheck, RefreshCw, Layers, Users, Building2, LogOut, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onRefresh }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isOfficer, isVendor, logout } = useAuth();

  const isBiddersActive = location.pathname === '/' || location.pathname.startsWith('/bidder');
  const isTendersActive = location.pathname.startsWith('/tenders');
  const isVendorActive = location.pathname.startsWith('/vendor') || location.pathname.startsWith('/portal') || location.pathname.startsWith('/user-dashboard');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-cpcl-navy text-white border-b-4 border-cpcl-orange shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <Link to={isVendor ? "/vendor" : "/"} className="flex items-center space-x-3 group">
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

        {/* Navigation Tabs (Role-Aware) */}
        {isAuthenticated && (
          <div className="flex items-center space-x-1 bg-slate-950/60 p-1 rounded-lg border border-slate-700">
            {isOfficer && (
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
            )}

            <Link
              to="/tenders"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                isTendersActive
                  ? 'bg-cpcl-orange text-white shadow'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{isOfficer ? 'Tenders & Bids' : 'Browse Tenders'}</span>
            </Link>

            {isVendor && (
              <Link
                to="/vendor"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded text-xs font-semibold transition ${
                  isVendorActive
                    ? 'bg-cpcl-orange text-white shadow'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>My Vendor Workspace</span>
              </Link>
            )}
          </div>
        )}

        {/* User Info & Actions */}
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

          {isAuthenticated ? (
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-2 bg-slate-800/90 px-3 py-1.5 rounded border border-slate-700 text-xs">
                <div className={`w-2 h-2 rounded-full ${isOfficer ? 'bg-emerald-400 animate-pulse' : 'bg-orange-400'}`}></div>
                <div>
                  <span className="font-semibold text-slate-200 flex items-center space-x-1 truncate max-w-[180px]">
                    {isOfficer ? (
                      <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    ) : (
                      <Building2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                    )}
                    <span className="truncate">{user.name}</span>
                  </span>
                  <span className="text-slate-400 block text-[10px] font-mono">
                    {isOfficer ? 'Tender Committee Convener' : 'Registered GeM Vendor'}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 bg-slate-800 hover:bg-rose-900/80 text-slate-300 hover:text-white rounded border border-slate-700 hover:border-rose-700 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="flex items-center space-x-1.5 bg-cpcl-orange hover:bg-orange-600 text-white text-xs font-bold px-3.5 py-1.5 rounded shadow transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
