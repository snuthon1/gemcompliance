import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import BidderDetail from './pages/BidderDetail';
import TendersList from './pages/TendersList';
import TenderDetail from './pages/TenderDetail';
import UserDashboard from './pages/UserDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-100 text-slate-900">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bidder/:bidder_id" element={<BidderDetail />} />
            <Route path="/tenders" element={<TendersList />} />
            <Route path="/tenders/:tender_id" element={<TenderDetail />} />
            <Route path="/vendor" element={<UserDashboard />} />
            <Route path="/portal" element={<UserDashboard />} />
            <Route path="/user-dashboard" element={<UserDashboard />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>BidShield &bull; GeM Integrated Bid Compliance Verification Platform &bull; SIH26100</span>
            <span className="text-slate-400">Chennai Petroleum Corporation Limited (CPCL) / MoPNG</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
