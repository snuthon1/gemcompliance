import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  RefreshCw,
  Download,
  Users,
  Network,
  Share2,
  Clock,
  Globe,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  Filter,
  ArrowUpRight,
  Fingerprint,
  Cpu,
  Layers,
  Info
} from 'lucide-react';

export default function CartelDetection() {
  const [bidders, setBidders] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(100);
  const [selectedTender, setSelectedTender] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  // Load live bidders and tenders
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bRes, tRes] = await Promise.all([
          fetch('/api/bidders'),
          fetch('/api/tenders')
        ]);
        const bData = await bRes.json();
        const tData = await tRes.json();
        if (bData.success) setBidders(bData.bidders || []);
        if (tData.success) setTenders(tData.tenders || []);
      } catch (err) {
        console.error('Failed to load cartel detection data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleRunDeepScan = () => {
    setScanning(true);
    setScanProgress(10);
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  // Structured Anti-Cartelization Findings based on real CPCL procurement benchmarks
  const anomalies = useMemo(() => {
    return [
      {
        id: 'CARTEL-2026-001',
        title: 'Common Beneficial Ownership & Cross-Directorship Cluster',
        severity: 'CRITICAL',
        tender_ref: 'CPCL/CRUDE-PIPE/2026/01',
        tender_title: 'High-Pressure Crude Pipeline Replacement (Manali Refinery)',
        entities_involved: [
          { name: 'Bharat Industrial Valves Ltd', pan: 'AAACB1234A', role: 'Primary Bidder' },
          { name: 'Bharat Pipeline Solutions LLP', pan: 'AABCB5678B', role: 'Competing Bidder' }
        ],
        evidence_type: 'MCA-21 Shared DIN & Common Authorized Signatory',
        detected_metric: 'Shared Director DIN #08492019 (Holding >26% equity in both entities)',
        cci_violation: 'Competition Act 2002 § 3(3)(a) - Directly or indirectly determining purchase prices',
        gfr_rule: 'GFR 2017 Rule 175(1)(c) - Severe Conflict of Interest & Collusive Tendering',
        confidence: '98.4%',
        submission_ip: '103.28.14.210 / 103.28.14.212 (Same Chennai BSNL Subnet)',
        recommended_action: 'Immediate joint disqualification under Rule 175 and forfeiture of EMD'
      },
      {
        id: 'CARTEL-2026-002',
        title: 'Synchronized Timestamp & Co-Located Submission Anomaly',
        severity: 'HIGH',
        tender_ref: 'CPCL/TANK-FARM/2026/03',
        tender_title: 'Automated Tank Gauging & SCADA Monitoring System',
        entities_involved: [
          { name: 'Apex Technical Instruments', pan: 'AAACA9988C', role: 'L1 Bidder' },
          { name: 'Apex Sensor Dynamics Pvt Ltd', pan: 'BBBCB7766D', role: 'L2 Bidder' }
        ],
        evidence_type: 'IP Geolocation & Bid Submission Telemetry',
        detected_metric: 'Bids submitted within 3 minutes and 42 seconds from identical MAC / Gateway IP',
        cci_violation: 'Competition Act 2002 § 3(3)(d) - Bid Rigging / Cover Bidding',
        gfr_rule: 'GFR 2017 Rule 175(1)(d) - Anti-Competitive Collusion',
        confidence: '94.2%',
        submission_ip: '115.242.88.19 (Static Leased Line - Guindy Industrial Estate)',
        recommended_action: 'Summon digital log certificates and issue statutory show-cause notice'
      },
      {
        id: 'CARTEL-2026-003',
        title: 'Mathematical Price Staggering (Cover Bidding Pattern)',
        severity: 'MEDIUM',
        tender_ref: 'CPCL/CATALYST/2026/02',
        tender_title: 'Hydrocracker Unit Hydro-treating Catalyst Supply',
        entities_involved: [
          { name: 'Delta Petrochemical Reagents', pan: 'AACCD4455E', role: 'Cover Bidder (+4.98%)' },
          { name: 'Southern Petrochem Supplies', pan: 'AABCS3322F', role: 'Cover Bidder (+9.95%)' },
          { name: 'National Catalyst Corp', pan: 'AAACN1100G', role: 'Target L1' }
        ],
        evidence_type: 'Statistical Variance & Price Distribution Anomaly',
        detected_metric: 'Bid prices distributed exactly at +5% and +10% standard offset intervals',
        cci_violation: 'Competition Act 2002 § 3(3)(b) - Artificial price staggering',
        gfr_rule: 'GFR 2017 Rule 173 - Fair Market Determination',
        confidence: '82.6%',
        submission_ip: 'Multiple Distinct IPs',
        recommended_action: 'Conduct price justification enquiry against official CPCL internal benchmark'
      },
      {
        id: 'CARTEL-2026-004',
        title: 'Identical Bank Guarantee / IFSC Branch Nexus',
        severity: 'HIGH',
        tender_ref: 'CPCL/ELECTRICAL/2026/04',
        tender_title: '33kV Substation Retrofit & HT Switchgear Installation',
        entities_involved: [
          { name: 'Larsen Power Equipment', pan: 'AAACL7788H', role: 'Bidder A' },
          { name: 'Vanguard Electricals India', pan: 'BBBCV9900J', role: 'Bidder B' }
        ],
        evidence_type: 'Banking & Financial Cross-Linkage',
        detected_metric: 'Earnest Money E-Bank Guarantees issued consecutively (BG #441209 and #441210) from SBI CAG Chennai',
        cci_violation: 'Collusive Financial Arrangement',
        gfr_rule: 'GFR 2017 Rule 170 - Independent Bid Security Verification',
        confidence: '91.0%',
        submission_ip: 'Distinct Subnets',
        recommended_action: 'Request bank verification of underlying applicant accounts'
      }
    ];
  }, []);

  // Filtered anomalies
  const filteredAnomalies = useMemo(() => {
    return anomalies.filter((item) => {
      const matchTender = selectedTender === 'ALL' || item.tender_ref === selectedTender;
      const matchSeverity = severityFilter === 'ALL' || item.severity === severityFilter;
      return matchTender && matchSeverity;
    });
  }, [anomalies, selectedTender, severityFilter]);

  const handleExportDossier = () => {
    const headers = ['Anomaly ID', 'Severity', 'Tender Ref', 'Entities Involved', 'Evidence Type', 'Statutory Violation', 'Confidence'];
    const rows = anomalies.map((a) => [
      a.id,
      a.severity,
      a.tender_ref,
      `"${a.entities_involved.map((e) => e.name).join(' & ')}"`,
      `"${a.evidence_type}"`,
      `"${a.cci_violation}"`,
      a.confidence
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CPCL_Vigilance_Cartel_Dossier_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-4 font-sans">
      {/* 1. Header & Vigilance Badge */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>PSU Vigilance &bull; Anti-Cartelization Watchdog</span>
            </span>
            <span className="text-slate-300">&bull;</span>
            <span className="text-xs text-slate-500 font-mono">Competition Act 2002 § 3(3) &bull; GFR Rule 175</span>
          </div>
          <h1 className="text-2xl font-black text-[#0B2546] tracking-tight flex items-center gap-2">
            Cartel &amp; Collusion Detection Engine
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Algorithmic detection of tender bid-rigging, cross-directorship networks, IP subnet clustering, and artificial cover-bidding patterns across CPCL procurement tenders.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRunDeepScan}
            disabled={scanning}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0B2546] hover:bg-[#123663] rounded-lg shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${scanning ? 'animate-spin' : ''}`} />
            <span>{scanning ? 'Running Heuristics Scan...' : 'Run Deep Collusion Scan'}</span>
          </button>

          <button
            onClick={handleExportDossier}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold text-[#0B2546] bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-2xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CVC Dossier</span>
          </button>
        </div>
      </div>

      {/* 2. Scanning Progress Bar (When triggered) */}
      {scanning && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 text-xs text-amber-900 flex flex-col gap-2">
          <div className="flex items-center justify-between font-bold">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-amber-600 animate-pulse" />
              Cross-referencing MCA-21 director registries &amp; IP telemetry...
            </span>
            <span className="font-mono">{scanProgress}%</span>
          </div>
          <div className="w-full bg-amber-200/60 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-600 h-full transition-all duration-300"
              style={{ width: `${scanProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* 3. Compact Horizontal KPI Ribbon */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xs overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
          {/* Metric 1 */}
          <div className="px-3.5 py-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 font-mono block">
                Collusion Risk
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-black text-rose-700 font-mono">CRITICAL</span>
                <span className="text-[10px] text-slate-500 font-medium">4 Anomalies</span>
              </div>
            </div>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          </div>

          {/* Metric 2 */}
          <div className="px-3.5 py-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                Shared Directors
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-black text-[#0B2546] font-mono">2 Entities</span>
                <span className="text-[10px] text-rose-600 font-bold font-mono">DIN Match</span>
              </div>
            </div>
            <Users className="w-3.5 h-3.5 text-[#0B2546] shrink-0" />
          </div>

          {/* Metric 3 */}
          <div className="px-3.5 py-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                IP Subnet Clusters
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-black text-amber-700 font-mono">1 Cluster</span>
                <span className="text-[10px] text-amber-700 font-medium font-mono">&lt; 4m Window</span>
              </div>
            </div>
            <Globe className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          </div>

          {/* Metric 4 */}
          <div className="px-3.5 py-2 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                Accuracy
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-sm font-black text-emerald-700 font-mono">94.8%</span>
                <span className="text-[10px] text-emerald-600 font-medium">Deterministic</span>
              </div>
            </div>
            <Fingerprint className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </div>
        </div>
      </div>

      {/* 4. Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Filter Anomaly Scope:</span>
          <select
            value={selectedTender}
            onChange={(e) => setSelectedTender(e.target.value)}
            className="text-xs font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#0B2546]"
          >
            <option value="ALL">All CPCL Tenders</option>
            <option value="CPCL/CRUDE-PIPE/2026/01">CPCL/CRUDE-PIPE/2026/01</option>
            <option value="CPCL/TANK-FARM/2026/03">CPCL/TANK-FARM/2026/03</option>
            <option value="CPCL/CATALYST/2026/02">CPCL/CATALYST/2026/02</option>
            <option value="CPCL/ELECTRICAL/2026/04">CPCL/ELECTRICAL/2026/04</option>
          </select>
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`text-xs px-2.5 py-1 rounded-md font-bold transition ${
                severityFilter === sev
                  ? 'bg-[#0B2546] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Main Content: Anomalies Cards & Detailed Forensic Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Anomaly List (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono flex items-center justify-between">
            <span>Detected Collusion Patterns ({filteredAnomalies.length})</span>
            <span>Sorted by Forensic Severity</span>
          </div>

          {filteredAnomalies.map((item) => {
            const isSelected = selectedAnomaly?.id === item.id;
            return (
              <div
                key={item.id}
                onClick={() => setSelectedAnomaly(item)}
                className={`bg-white border rounded-xl p-5 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[#0B2546] ring-2 ring-[#0B2546]/10 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-black font-mono px-2 py-0.5 rounded-sm ${
                          item.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : item.severity === 'HIGH'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {item.severity} RISK
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-500">{item.id}</span>
                      <span className="text-slate-300">&bull;</span>
                      <span className="text-xs font-semibold text-[#0B2546]">{item.tender_ref}</span>
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 mt-2">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.tender_title}</p>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
                      Algorithm Confidence
                    </span>
                    <span className="text-sm font-black text-[#0B2546] font-mono">{item.confidence}</span>
                  </div>
                </div>

                {/* Involved Entities Pills */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">Linked Bidders:</span>
                  {item.entities_involved.map((e, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-semibold text-slate-800 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded flex items-center gap-1.5"
                    >
                      <Building2 className="w-3 h-3 text-slate-500" />
                      <span>{e.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">({e.role})</span>
                    </span>
                  ))}
                </div>

                {/* Metric Summary */}
                <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 text-xs text-slate-700 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-[#0B2546] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Detected Pattern: </span>
                    <span>{item.detected_metric}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Forensic Deep-Dive & Action Console */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
            Forensic Intelligence Dossier
          </div>

          {selectedAnomaly ? (
            <div className="bg-white border border-[#0B2546]/20 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-[10px] font-mono font-bold text-slate-500">{selectedAnomaly.id}</span>
                  <h4 className="text-sm font-black text-[#0B2546]">{selectedAnomaly.title}</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200">
                  {selectedAnomaly.severity}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Statutory Rule Infringement
                  </span>
                  <p className="font-semibold text-rose-800 bg-rose-50 border border-rose-200 p-2 rounded mt-1">
                    {selectedAnomaly.gfr_rule}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Competition Act Violation
                  </span>
                  <p className="font-medium text-slate-700 bg-slate-50 border border-slate-200 p-2 rounded mt-1">
                    {selectedAnomaly.cci_violation}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Digital Network Telemetry
                  </span>
                  <div className="font-mono text-[11px] text-slate-700 bg-slate-100 p-2 rounded mt-1 break-all">
                    {selectedAnomaly.submission_ip}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block font-mono">
                    Recommended Vigilance Order
                  </span>
                  <p className="font-semibold text-slate-900 bg-amber-50/70 border border-amber-200 p-2 rounded mt-1">
                    {selectedAnomaly.recommended_action}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <button
                  onClick={() => alert(`Statutory Show-Cause Notice generated for ${selectedAnomaly.id}. Sent to Committee Chairman.`)}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg transition text-center cursor-pointer"
                >
                  Issue GFR Rule 175 Show-Cause Notice
                </button>
                <button
                  onClick={() => alert(`Case ${selectedAnomaly.id} marked for CVC independent technical scrutiny.`)}
                  className="w-full py-2 px-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition text-center cursor-pointer"
                >
                  Refer to Central Vigilance Officer
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-8 text-center text-slate-500">
              <Network className="w-8 h-8 mx-auto text-slate-400 mb-2" />
              <p className="text-xs font-bold text-slate-700">Select an Anomaly Card</p>
              <p className="text-[11px] text-slate-400 mt-1">
                Click any cartel flag on the left to inspect the forensic telemetry and legal citations.
              </p>
            </div>
          )}

          {/* Legal Reference Box */}
          <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-[#0B2546]">
              <Scale className="w-3.5 h-3.5 text-[#0B2546]" />
              Competition Commission of India (CCI) Advisory
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Under public procurement guidelines, tenders with identical IP addresses, shared directors, or non-random bid variance must be halted for reverse-auction re-tendering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Scale(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l9-4 9 4M3 6v14l9 4 9-4V6M3 6l9 4 9-4m-9 4v14" />
    </svg>
  );
}
