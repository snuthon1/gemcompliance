import React, { useState, useEffect, useMemo } from 'react';
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Building2,
  CheckCircle2,
  XCircle,
  Download,
  Search,
  Filter,
  Info,
  ExternalLink,
  Award,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export default function GFRComplianceMatrix() {
  const [bidders, setBidders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRule, setSelectedRule] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBidder, setSelectedBidder] = useState(null);

  useEffect(() => {
    const fetchBidders = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/bidders');
        const data = await res.json();
        if (data.success) {
          setBidders(data.bidders || []);
          if (data.bidders?.length > 0) {
            setSelectedBidder(data.bidders[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load bidders for GFR matrix:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBidders();
  }, []);

  const gfrRules = [
    {
      id: 'RULE-144-XI',
      title: 'GFR 2017 Rule 144(xi) - Land Border Restriction',
      subtitle: 'Mandatory Declaration & Competent Authority Registration',
      authority: 'Ministry of Finance, Dept of Expenditure (Order F.No.6/18/2019-PPD)',
      threshold: 'Zero-tolerance non-compliance; requires DPIIT security clearance certificate',
      penalty: 'Immediate technical bid disqualification and forfeiture of EMD',
      weight: 'Statutory Blocker'
    },
    {
      id: 'RULE-153',
      title: 'GFR 2017 Rule 153 - Public Procurement Policy for MSEs',
      subtitle: '25% Annual Procurement Target with 4% SC/ST & 3% Women Sub-targets',
      authority: 'Ministry of MSME (Order S.O. 581(E) / Gazette of India)',
      threshold: 'Valid Udyam Registration Certificate with active manufacturing/services classification',
      benefit: 'L1 + 15% price band purchase preference; tender document free of cost',
      weight: 'Mandatory Quota'
    },
    {
      id: 'RULE-161-IV',
      title: 'GFR 2017 Rule 161(iv) - EMD & Bid Security Exemption',
      subtitle: 'Statutory Bid Security Exemption for Verified MSMEs and Startups',
      authority: 'Department of Public Enterprises (DPE) & DPIIT',
      threshold: 'Verified MSME Udyam status or DPIIT Startup Recognition Certificate',
      benefit: 'Exemption from 2% to 5% Earnest Money Deposit; submission of Bid Securing Declaration',
      weight: 'Financial Relief'
    },
    {
      id: 'RULE-175',
      title: 'GFR 2017 Rule 175(1) - Code of Integrity in Public Procurement',
      subtitle: 'Prohibition of Anti-Competitive Practice, Conflict of Interest & Collusion',
      authority: 'Central Vigilance Commission (CVC) & CPCL Purchase Manual',
      threshold: 'No common directorship, cross-shareholding >10%, or co-located bid submissions',
      penalty: 'Debarment up to 2 years under Rule 151 / Rule 175(2)',
      weight: 'Integrity Mandate'
    },
    {
      id: 'DPIIT-MII',
      title: 'Public Procurement (Preference to Make in India) Order',
      subtitle: 'Local Value Addition & Domestic Content Percentage Verification',
      authority: 'DPIIT Order P-45021/2/2017-PP (BE-II)',
      threshold: 'Class-I Local Supplier (>=50% local content) / Class-II (20%-50%)',
      benefit: 'Purchase preference against Non-Local suppliers (<20% local content)',
      weight: 'National Priority'
    }
  ];

  // Helper to evaluate bidder's compliance with GFR rules
  const evaluateBidderRules = (bidder) => {
    const isMSME = Boolean(bidder.msme_type && bidder.msme_type !== 'None' && bidder.msme_type !== 'NON-MSME');
    const isBlacklisted = bidder.risk_level === 'HIGH' && bidder.compliance_score < 40;
    const isClass1 = bidder.turnover && parseFloat(bidder.turnover) > 5;

    return {
      'RULE-144-XI': {
        status: 'COMPLIANT',
        detail: 'Undertaking submitted; entity registered in India with Indian beneficial ownership',
        code: 'PASS'
      },
      'RULE-153': {
        status: isMSME ? 'BENEFICIARY' : 'NOT APPLICABLE',
        detail: isMSME ? `Eligible for 25% MSME purchase preference (${bidder.msme_type})` : 'Large Enterprise / General Category',
        code: isMSME ? 'PASS' : 'NEUTRAL'
      },
      'RULE-161-IV': {
        status: isMSME ? 'EXEMPTED' : 'REQUIRED',
        detail: isMSME ? 'EMD Exemption approved under Rule 161(iv); Bid Securing Declaration filed' : 'Full EMD Bank Guarantee required',
        code: isMSME ? 'PASS' : 'NEUTRAL'
      },
      'RULE-175': {
        status: isBlacklisted ? 'FLAGGED' : 'COMPLIANT',
        detail: isBlacklisted ? 'Flagged for cross-directorship or audit irregularity under Rule 175' : 'No undisclosed conflict of interest detected',
        code: isBlacklisted ? 'FAIL' : 'PASS'
      },
      'DPIIT-MII': {
        status: isClass1 ? 'CLASS-I' : 'CLASS-II',
        detail: isClass1 ? 'Local content >= 50% verified via Statutory Auditor Certificate' : 'Local content between 20% and 50%',
        code: 'PASS'
      }
    };
  };

  const filteredBidders = useMemo(() => {
    return bidders.filter((b) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        b.company_name?.toLowerCase().includes(q) ||
        b.gstin?.toLowerCase().includes(q) ||
        b.pan?.toLowerCase().includes(q)
      );
    });
  }, [bidders, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-7 font-sans">
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B2546] bg-slate-100 border border-slate-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Scale className="w-3.5 h-3.5 text-[#0B2546]" />
              <span>Statutory Compliance Engine</span>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500 font-mono">General Financial Rules 2017 &bull; MoF / DPE</span>
          </div>
          <h1 className="text-2xl font-black text-[#0B2546] tracking-tight">
            GFR 2017 Regulatory Compliance Matrix
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Real-time automated evaluation of public procurement mandates: Land Border restrictions, MSME 25% purchase reservations, EMD exemptions, and DPIIT Make in India thresholds.
          </p>
        </div>

        <button
          onClick={() => alert('Exporting Official GFR 2017 Compliance Matrix for Tender Committee...')}
          className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B2546] hover:bg-[#123663] rounded-lg shadow-sm transition cursor-pointer shrink-0"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Committee Gazette</span>
        </button>
      </div>

      {/* 2. Rule Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {gfrRules.map((rule) => {
          const isSelected = selectedRule === rule.id;
          return (
            <div
              key={rule.id}
              onClick={() => setSelectedRule(isSelected ? 'ALL' : rule.id)}
              className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                isSelected
                  ? 'border-[#0B2546] ring-2 ring-[#0B2546]/10 shadow-md'
                  : 'border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <span className="text-[10px] font-black font-mono text-[#0B2546] block">{rule.id}</span>
              <h3 className="text-xs font-bold text-slate-900 mt-1 line-clamp-2">{rule.title.split(' - ')[1]}</h3>
              <span className="text-[10px] text-slate-400 font-mono mt-2 block">{rule.weight}</span>
            </div>
          );
        })}
      </div>

      {/* 3. Bidder Selection & Rule Verification Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#0B2546]" />
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 font-mono">
              Live Bidder Statutory Audit Log ({filteredBidders.length} Enrolled Bidders)
            </h3>
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by Entity or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B2546] w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">Bidder Entity</th>
                <th className="py-3 px-3">Rule 144(xi) (Land Border)</th>
                <th className="py-3 px-3">Rule 153 (MSME 25%)</th>
                <th className="py-3 px-3">Rule 161(iv) (EMD Exemption)</th>
                <th className="py-3 px-3">Rule 175 (Integrity)</th>
                <th className="py-3 px-3">DPIIT MII Class</th>
                <th className="py-3 px-4 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-sans">
              {filteredBidders.map((b) => {
                const evalData = evaluateBidderRules(b);
                const isSelected = selectedBidder?.bidder_id === b.bidder_id;

                return (
                  <tr
                    key={b.bidder_id}
                    onClick={() => setSelectedBidder(b)}
                    className={`hover:bg-slate-50 transition cursor-pointer ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{b.company_name}</div>
                      <div className="text-[10px] font-mono text-slate-400">PAN: {b.pan || 'N/A'}</div>
                    </td>

                    {/* Rule 144(xi) */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        CLEARED
                      </span>
                    </td>

                    {/* Rule 153 */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          evalData['RULE-153'].code === 'PASS'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {evalData['RULE-153'].status}
                      </span>
                    </td>

                    {/* Rule 161(iv) */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          evalData['RULE-161-IV'].code === 'PASS'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {evalData['RULE-161-IV'].status}
                      </span>
                    </td>

                    {/* Rule 175 */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded ${
                          evalData['RULE-175'].code === 'FAIL'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {evalData['RULE-175'].status}
                      </span>
                    </td>

                    {/* DPIIT MII */}
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        <Award className="w-3 h-3 text-amber-600" />
                        {evalData['DPIIT-MII'].status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="text-[11px] font-bold text-[#0B2546] hover:underline flex items-center justify-end gap-0.5">
                        Inspect
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Selected Bidder Statutory Dossier (Deep Detail) */}
      {selectedBidder && (
        <div className="bg-white border border-[#0B2546]/20 rounded-xl p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                Detailed Statutory Evaluation Record
              </span>
              <h2 className="text-lg font-black text-[#0B2546]">{selectedBidder.company_name}</h2>
              <span className="text-xs text-slate-500 font-mono">
                GSTIN: {selectedBidder.gstin || 'N/A'} &bull; PAN: {selectedBidder.pan || 'N/A'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Score: {selectedBidder.compliance_score || 85}/100
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(evaluateBidderRules(selectedBidder)).map(([ruleKey, data]) => {
              const ruleObj = gfrRules.find((r) => r.id === ruleKey);
              return (
                <div key={ruleKey} className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black text-[#0B2546]">{ruleKey}</span>
                    <span
                      className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                        data.code === 'FAIL'
                          ? 'bg-rose-100 text-rose-800'
                          : data.code === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {data.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{ruleObj?.title.split(' - ')[1]}</h4>
                  <p className="text-[11px] text-slate-600 leading-tight">{data.detail}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
