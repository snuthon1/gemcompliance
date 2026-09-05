import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Building2,
  Scale,
  Search,
  Filter,
  ArrowRight,
  MessageSquare,
  Shield,
  Download,
  Info
} from 'lucide-react';

export default function Representations() {
  const [cases, setCases] = useState([
    {
      id: 'REP-2026-09',
      bidder: 'Apex Technical Instruments',
      tender_ref: 'CPCL/TANK-FARM/2026/03',
      date_submitted: '2026-09-05 16:20 IST',
      flagged_reason: 'CA Net Worth Certificate PAN mismatch with corporate entity',
      vendor_explanation: 'The CA certificate was issued under the managing director\'s individual PAN in error by our external audit firm. We have attached the rectified certificate bearing the corporate entity PAN (AAACA9988C) along with the ICAI UDIN verification slip #2409988CA991.',
      attached_doc: 'Rectified_CA_Networth_UDIN_Verified.pdf (1.4 MB)',
      status: 'PENDING_REVIEW',
      statutory_deadline: '18 Hours Remaining'
    },
    {
      id: 'REP-2026-08',
      bidder: 'Bharat Pipeline Solutions LLP',
      tender_ref: 'CPCL/CRUDE-PIPE/2026/01',
      date_submitted: '2026-09-04 11:15 IST',
      flagged_reason: 'GSTN Portal indicated late filing of GSTR-3B for June 2026',
      vendor_explanation: 'The return was filed within the statutory grace period with late fees settled. Attached is the official GSTN ARN receipt proving regularized active filing status.',
      attached_doc: 'GSTN_ARN_Filing_Challan.pdf (890 KB)',
      status: 'PENDING_REVIEW',
      statutory_deadline: '34 Hours Remaining'
    },
    {
      id: 'REP-2026-07',
      bidder: 'Southern Petrochem Supplies',
      tender_ref: 'CPCL/CATALYST/2026/02',
      date_submitted: '2026-09-02 09:40 IST',
      flagged_reason: 'Missing Class-I Local Content Statutory Undertaking',
      vendor_explanation: 'Original upload truncated the Annexure-B sheet. Uploading signed declaration confirming 62% indigenous value addition verified by cost accountant.',
      attached_doc: 'DPIIT_MII_Annexure_B_Signed.pdf (2.1 MB)',
      status: 'ACCEPTED',
      statutory_deadline: 'Resolved'
    },
    {
      id: 'REP-2026-06',
      bidder: 'Delta Petrochemical Reagents',
      tender_ref: 'CPCL/CATALYST/2026/02',
      date_submitted: '2026-08-30 14:10 IST',
      flagged_reason: 'Ineligible entity sharing beneficial ownership with debarred firm',
      vendor_explanation: 'Appellant claimed divestment of shares, but MCA-21 registry still records active shareholding above 26%.',
      attached_doc: 'Share_Transfer_Deed_Unregistered.pdf (3.4 MB)',
      status: 'REJECTED',
      statutory_deadline: 'Closed'
    }
  ]);

  const [selectedCase, setSelectedCase] = useState(cases[0]);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const handleAction = (id, newStatus, reason) => {
    setCases((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, decision_note: reason } : c))
    );
    if (selectedCase?.id === id) {
      setSelectedCase((prev) => ({ ...prev, status: newStatus, decision_note: reason }));
    }
  };

  const filteredCases = cases.filter((c) => {
    if (filterStatus === 'ALL') return true;
    return c.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B2546] bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-mono">
              <Scale className="w-3.5 h-3.5 text-[#0B2546]" />
              <span>GFR 2017 Rule 175 Dispute Redressal</span>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500 font-mono">Statutory Representation Protocol</span>
          </div>
          <h1 className="text-2xl font-black text-[#0B2546] tracking-tight">
            Vendor Grievance &amp; Representation Desk
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Quasi-judicial officer adjudication portal for pre-bid representations submitted by flagged bidders before electronic tender opening locks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>2 Pending Committee Adjudications</span>
          </span>
        </div>
      </div>

      {/* 2. Filter Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {['ALL', 'PENDING_REVIEW', 'ACCEPTED', 'REJECTED'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className={`text-xs px-3 py-1 rounded-md font-bold transition cursor-pointer ${
              filterStatus === st
                ? 'bg-[#0B2546] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st === 'ALL' ? 'All Representations' : st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* 3. Representation Queue & Detail Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Representation Cards List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredCases.map((c) => {
            const isSelected = selectedCase?.id === c.id;
            return (
              <div
                key={c.id}
                onClick={() => setSelectedCase(c)}
                className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#0B2546] ring-2 ring-[#0B2546]/10 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400">{c.id}</span>
                    <h3 className="text-xs font-black text-slate-900 mt-0.5">{c.bidder}</h3>
                    <span className="text-[10px] font-mono text-[#0B2546] font-semibold block mt-0.5">
                      {c.tender_ref}
                    </span>
                  </div>

                  <span
                    className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded ${
                      c.status === 'PENDING_REVIEW'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : c.status === 'ACCEPTED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                    }`}
                  >
                    {c.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-2">
                  <span className="font-bold text-slate-700">Flag: </span>
                  {c.flagged_reason}
                </div>

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>Submitted: {c.date_submitted.split(' ')[0]}</span>
                  <span className="text-amber-700 font-semibold">{c.statutory_deadline}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Adjudication Workspace (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedCase ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
              <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                    Statutory Appeal Case Dossier
                  </span>
                  <h2 className="text-base font-black text-[#0B2546]">{selectedCase.bidder}</h2>
                  <span className="text-xs text-slate-500 font-mono">
                    Case Ref: {selectedCase.id} &bull; Tender: {selectedCase.tender_ref}
                  </span>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded ${
                    selectedCase.status === 'PENDING_REVIEW'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : selectedCase.status === 'ACCEPTED'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  Status: {selectedCase.status.replace('_', ' ')}
                </span>
              </div>

              {/* Original Disqualification Reason */}
              <div className="bg-rose-50/70 border border-rose-200 rounded-lg p-3.5 text-xs text-rose-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-rose-800 font-mono text-[11px] uppercase tracking-wider">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  Original System Flag / Disqualification Ground
                </span>
                <p className="font-semibold text-rose-950">{selectedCase.flagged_reason}</p>
              </div>

              {/* Vendor's Official Written Representation */}
              <div className="space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#0B2546]" />
                  Vendor Written Clarification &amp; Legal Plea
                </span>
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-700 leading-relaxed">
                  {selectedCase.vendor_explanation}
                </div>
              </div>

              {/* Attached Rectified Documents */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                  Attached Rectification Evidence
                </span>
                <div className="bg-white border border-slate-300 rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <FileText className="w-4 h-4 text-[#0B2546]" />
                    <span className="text-xs font-semibold text-slate-800 font-mono">
                      {selectedCase.attached_doc}
                    </span>
                  </div>
                  <button
                    onClick={() => alert(`Opening ${selectedCase.attached_doc} in secure preview...`)}
                    className="text-xs font-bold text-[#0B2546] hover:underline cursor-pointer"
                  >
                    View File
                  </button>
                </div>
              </div>

              {/* Committee Adjudication Buttons */}
              {selectedCase.status === 'PENDING_REVIEW' ? (
                <div className="pt-4 border-t border-slate-200 space-y-3">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-800 font-mono block">
                    Committee Statutory Decision:
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() =>
                        handleAction(
                          selectedCase.id,
                          'ACCEPTED',
                          'Rectification verified via ICAI/UDIN portal. Disqualification removed.'
                        )
                      }
                      className="py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Accept &amp; Restore Compliance</span>
                    </button>

                    <button
                      onClick={() =>
                        handleAction(
                          selectedCase.id,
                          'REJECTED',
                          'Explanation insufficient under GFR 2017 Rule 175.'
                        )
                      }
                      className="py-2.5 px-3 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-lg transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject Appeal &amp; Uphold</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-100 p-3 rounded-lg text-xs text-slate-600 font-mono">
                  <span className="font-bold">Decision Recorded: </span>
                  {selectedCase.decision_note || 'Adjudication confirmed by Tender Scrutiny Committee.'}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400">
              Select a representation from the queue
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
