import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, ChevronRight, AlertCircle, Filter, CheckCircle2, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [bidders, setBidders] = useState([]);
  const [complianceMap, setComplianceMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRisk, setSelectedRisk] = useState('All');
  const navigate = useNavigate();

  const fetchBiddersAndScores = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/bidders');
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Failed to load bidders');
      }

      const biddersList = data.bidders;
      setBidders(biddersList);

      // Fetch or run compliance check for each bidder
      const scoreResults = {};
      await Promise.all(
        biddersList.map(async (b) => {
          try {
            // First try GET /compliance
            let compRes = await fetch(`/api/bidders/${b.bidder_id}/compliance`);
            if (compRes.status === 404) {
              // If not verified yet, trigger POST /verify
              compRes = await fetch(`/api/bidders/${b.bidder_id}/verify`, { method: 'POST' });
            }
            const compData = await compRes.json();
            if (compData.success) {
              scoreResults[b.bidder_id] = compData;
            }
          } catch (e) {
            console.error(`Failed to fetch compliance for ${b.bidder_id}`, e);
          }
        })
      );

      setComplianceMap(scoreResults);
    } catch (err) {
      setError('Unable to connect to backend server at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBiddersAndScores();
  }, []);

  // Filter bidders client-side by risk
  const filteredBidders = useMemo(() => {
    if (selectedRisk === 'All') return bidders;
    return bidders.filter((b) => {
      const comp = complianceMap[b.bidder_id];
      return comp && comp.risk === selectedRisk;
    });
  }, [bidders, complianceMap, selectedRisk]);

  const getRiskBadge = (comp) => {
    if (!comp) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono text-slate-500 bg-slate-100 border border-slate-200">
          Calculating...
        </span>
      );
    }

    switch (comp.risk) {
      case 'Low':
        return (
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
              {comp.score}/100 &bull; Low Risk
            </span>
            <span className="text-[10px] text-emerald-700 font-medium mt-0.5">{comp.recommendation}</span>
          </div>
        );
      case 'Medium':
        return (
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5"></span>
              {comp.score}/100 &bull; Medium Risk
            </span>
            <span className="text-[10px] text-amber-700 font-medium mt-0.5">{comp.recommendation}</span>
          </div>
        );
      case 'High':
      default:
        return (
          <div className="flex flex-col items-center">
            <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-300">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5"></span>
              {comp.score}/100 &bull; High Risk
            </span>
            <span className="text-[10px] text-rose-700 font-medium mt-0.5">{comp.recommendation}</span>
          </div>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tender Metadata Strip */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center space-x-3">
            <span className="font-semibold text-slate-900 font-mono">TENDER REF: CPCL/PROC/2026/089</span>
            <span className="text-slate-300">|</span>
            <span>API 5L High-Pressure Refining Line Pipes & Flow Control Valves</span>
            <span className="text-slate-300">|</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
              5 Bidders Enrolled
            </span>
          </div>
          <div className="flex items-center space-x-2 text-[11px] font-mono">
            <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-medium">
              Explainable Scoring Active
            </span>
            <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-medium">
              Prisma + SQLite
            </span>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header with Filter */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Participating Bidders Directory</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live automated statutory compliance verification against Udyam, GSTN, PAN, and Central Debarment registers
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-lg border border-slate-300 text-xs shadow-sm">
              <Filter className="w-3.5 h-3.5 text-slate-500" />
              <label htmlFor="risk-filter" className="font-medium text-slate-600">Risk Filter:</label>
              <select
                id="risk-filter"
                value={selectedRisk}
                onChange={(e) => setSelectedRisk(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="All">All Tiers ({bidders.length})</option>
                <option value="Low">Low Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="High">High Risk</option>
              </select>
            </div>

            <button
              onClick={fetchBiddersAndScores}
              className="p-1.5 bg-white hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-300 transition"
              title="Refresh Scores"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-14 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm font-medium">Fetching real-time verification records across portals...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600 bg-rose-50/50 flex flex-col items-center">
            <AlertCircle className="w-8 h-8 mb-2 text-rose-500" />
            <p className="text-sm font-semibold">{error}</p>
            <button
              onClick={fetchBiddersAndScores}
              className="mt-3 text-xs bg-rose-600 text-white px-3 py-1.5 rounded hover:bg-rose-700"
            >
              Retry Connection
            </button>
          </div>
        ) : filteredBidders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">
            No bidders found matching the <strong>{selectedRisk}</strong> risk filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Company Name</th>
                  <th scope="col" className="px-5 py-3.5">GSTIN</th>
                  <th scope="col" className="px-5 py-3.5">PAN Number</th>
                  <th scope="col" className="px-5 py-3.5">Udyam Registration</th>
                  <th scope="col" className="px-6 py-3.5 text-center">Compliance Score & Risk</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {filteredBidders.map((bidder) => {
                  const comp = complianceMap[bidder.bidder_id];
                  return (
                    <tr
                      key={bidder.bidder_id}
                      onClick={() => navigate(`/bidder/${bidder.bidder_id}`)}
                      className="hover:bg-blue-50/50 cursor-pointer transition group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-start space-x-3">
                          <div className="p-2 rounded bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 transition mt-0.5">
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-blue-900 transition">
                              {bidder.company_name}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center space-x-2 mt-0.5">
                              <span>{bidder.email}</span>
                              <span>&bull;</span>
                              <span>{bidder.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {bidder.gstin}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {bidder.pan_number}
                        </span>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-700">
                        <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">
                          {bidder.udyam_number}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {getRiskBadge(comp)}
                      </td>

                      <td className="px-4 py-4 text-right">
                        <div className="inline-flex items-center text-xs font-semibold text-slate-500 group-hover:text-blue-600 transition">
                          <span>Inspect</span>
                          <ChevronRight className="w-4 h-4 ml-0.5" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Click any bidder row to inspect full statutory checklist, flags, and officer decision console.</span>
          <span className="font-mono text-[11px]">Showing {filteredBidders.length} of {bidders.length} bidders</span>
        </div>
      </div>
    </div>
  );
}
