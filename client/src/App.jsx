import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BidderDetail from './pages/BidderDetail';
import TendersList from './pages/TendersList';
import TenderDetail from './pages/TenderDetail';
import UserDashboard from './pages/UserDashboard';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function LoginRoute() {
  const { user, isVendor } = useAuth();

  if (user) {
    return <Navigate to={isVendor ? '/vendor' : '/'} replace />;
  }

  return <Login />;
}

function AppLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white antialiased">
      {/* Show Navbar only when authenticated and not on login page */}
      {user && !isLoginPage && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/login" element={<LoginRoute />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bidder/:bidder_id"
            element={
              <ProtectedRoute>
                <BidderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenders"
            element={
              <ProtectedRoute>
                <TendersList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tenders/:tender_id"
            element={
              <ProtectedRoute>
                <TenderDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vendor"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portal"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Show footer only when authenticated and not on login page */}
      {user && !isLoginPage && (
        <footer className="border-t border-slate-200/80 bg-white/70 backdrop-blur-sm py-6 text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700 tracking-tight">BidShield</span>
              <span className="text-slate-300">&bull;</span>
              <span>GeM Statutory Bid Compliance Platform</span>
              <span className="bg-indigo-50 text-indigo-700 font-mono text-[10px] font-semibold px-2 py-0.5 rounded-full border border-indigo-200/60">
                SIH26100
              </span>
            </div>
            <div className="text-slate-400 text-[11px] font-medium">
              Chennai Petroleum Corporation Limited (CPCL) &bull; Ministry of Petroleum & Natural Gas
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  );
}
