import React, { useState } from 'react';
import { useViewOnly } from '../components/RoleGuard.jsx';
import { FileText, Plus, Download, Trash2, Calendar, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * Reports Page Component
 * Compliance audits, SAR (Suspicious Activity Report) exports, and regulatory filings.
 * Permissions: Admin (Full), Fraud Analyst (Full), Viewer (View-only)
 */
export default function Reports() {
  const isViewOnly = useViewOnly();

  const [reports, setReports] = useState([
    {
      id: 'REP-2023-09',
      title: 'Monthly SAR Compliance Audit',
      type: 'FinCEN Regulatory Filing',
      date: 'Sep 20, 2023',
      author: 'E. Vance (Lead Analyst)',
      size: '2.4 MB',
      status: 'Ready',
    },
    {
      id: 'REP-2023-08',
      title: 'Chargeback Ratio & Loss Mitigation Summary',
      type: 'Executive Quarterly Audit',
      date: 'Sep 15, 2023',
      author: 'Automated Sentinel-Scheduler',
      size: '1.8 MB',
      status: 'Ready',
    },
    {
      id: 'REP-2023-07',
      title: 'PCI-DSS Data Access & Security Review',
      type: 'Annual Security Attestation',
      date: 'Sep 01, 2023',
      author: 'SecOps Team',
      size: '4.1 MB',
      status: 'Ready',
    },
    {
      id: 'REP-2023-06',
      title: 'Cross-Border Velocity Anomaly Assessment',
      type: 'Ad-hoc Deep Dive',
      date: 'Aug 28, 2023',
      author: 'Fraud Analyst Pool',
      size: '950 KB',
      status: 'Ready',
    },
  ]);

  const handleGenerateReport = () => {
    if (isViewOnly) return;
    const newReport = {
      id: `REP-2023-${Math.floor(10 + Math.random() * 90)}`,
      title: 'Live Real-Time Fraud Assessment',
      type: 'Ad-hoc Export',
      date: 'Just now',
      author: 'Active User Session',
      size: '1.2 MB',
      status: 'Ready',
    };
    setReports([newReport, ...reports]);
  };

  const handleDeleteReport = (id) => {
    if (isViewOnly) return;
    setReports(reports.filter((r) => r.id !== id));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Compliance</h1>
          <p className="text-sm text-gray-400 mt-1 font-normal">
            Export official SAR filings, executive summaries, and regulatory audit dossiers.
          </p>
        </div>

        {/* Action Button: Generate New Report */}
        <button
          type="button"
          disabled={isViewOnly}
          onClick={handleGenerateReport}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Plus className="w-4 h-4" />
          Generate New Report
        </button>
      </div>

      {/* Reports Table / List */}
      <div className="bg-[#161A22] border border-[#222734] rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-[#222734] flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Available Regulatory & Audit Files
          </h2>
          <span className="text-xs text-gray-400 font-mono">
            {reports.length} Total Documents
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#222734] text-xs font-semibold text-gray-400 uppercase tracking-wider bg-[#0E121A]/50">
                <th className="py-3 px-5">Report Title</th>
                <th className="py-3 px-5">Classification</th>
                <th className="py-3 px-5">Generated Date</th>
                <th className="py-3 px-5">Author</th>
                <th className="py-3 px-5">File Size</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222734] text-sm">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-[#1C212B] transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-white text-sm">
                          {report.title}
                        </div>
                        <div className="text-[11px] font-mono text-gray-400">
                          {report.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-gray-300">
                    <span className="px-2.5 py-0.5 rounded bg-[#0B0E14] border border-[#222734]">
                      {report.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-xs text-gray-400 font-mono">
                    {report.date}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-gray-300">
                    {report.author}
                  </td>
                  <td className="py-3.5 px-5 text-xs text-gray-400 font-mono">
                    {report.size}
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isViewOnly}
                        onClick={() => alert(`Downloading ${report.title} (PDF)...`)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#0B0E14] hover:bg-[#222734] border border-[#222734] text-xs text-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={isViewOnly ? 'Disabled in View-only mode' : 'Download PDF'}
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        disabled={isViewOnly}
                        onClick={() => handleDeleteReport(report.id)}
                        className="p-1 rounded hover:bg-rose-500/10 text-gray-500 hover:text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        title={isViewOnly ? 'Disabled in View-only mode' : 'Delete Report'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
