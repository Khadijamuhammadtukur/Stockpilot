import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { exportToCSV } from '../utils/exportCsv';
import { TrendingUp, ShieldCheck, FileText, Search, RefreshCw, Download, Printer } from 'lucide-react';

export default function AdminReports() {
  const [profitData, setProfitData] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const pData = await apiFetch(`/reports/profit?timeframe=${timeframe}`);
      const aData = await apiFetch(`/reports/audit-logs?search=${encodeURIComponent(search)}`);
      setProfitData(pData);
      setAuditLogs(aData.data || aData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [search, timeframe]);

  const handleExportAuditCSV = () => {
    exportToCSV(auditLogs, [
      { label: 'Timestamp', key: 'exact_timestamp' },
      { label: 'User Name', key: 'user_name' },
      { label: 'User Role', key: 'user_role' },
      { label: 'Action', key: 'action' },
      { label: 'Category', key: 'category' },
      { label: 'Description', key: 'description' }
    ], 'stockpilot_audit_logs');
  };

  const handleExportProfitCSV = () => {
    if (!profitData) return;
    const summary = [
      { Metric: 'Total Revenue Processed', Amount: `₦${profitData.total_sales || 0}` },
      { Metric: 'Cost of Goods Sold (COGS)', Amount: `₦${profitData.total_cost || 0}` },
      { Metric: 'Net Gross Profit', Amount: `₦${profitData.gross_profit || 0}` },
      { Metric: 'Overall Profit Margin (%)', Amount: `${profitData.overall_margin || 0}%` },
    ];
    exportToCSV(summary, [
      { label: 'Metric', key: 'Metric' },
      { label: 'Amount / Value', key: 'Amount' }
    ], 'stockpilot_profit_intelligence_summary');
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Profit Intelligence & Audit Trails</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Gross profit calculations, category margin analysis, and staff audit log history</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportProfitCSV}>
            <Download size={16} /> Export Financial Summary
          </button>
          <button className="btn btn-secondary" onClick={handleExportAuditCSV}>
            <Download size={16} /> Export Audit Logs (CSV)
          </button>
          <button className="btn btn-dark" onClick={handlePrintReport}>
            <Printer size={16} /> Print / Save PDF
          </button>
          <button className="btn btn-secondary" onClick={fetchReports}>
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
      </div>

            <div className="glass-card" style={{ padding: '12px 18px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a' }}>Financial Period Report:</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'today', label: "Today's Report" },
            { id: 'this_week', label: 'Weekly Report' },
            { id: 'this_month', label: 'Monthly Report' },
            { id: 'this_year', label: 'Yearly Report' },
            { id: 'all', label: 'All Time' },
          ].map(tf => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '99px',
                border: timeframe === tf.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                background: timeframe === tf.id ? '#2563eb' : '#ffffff',
                color: timeframe === tf.id ? '#ffffff' : '#0f172a',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer'
              }}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Revenue Processed</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '6px 0' }}>
            ₦{Number(profitData?.total_sales || 0).toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Cost of Goods Sold (COGS)</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ef4444', margin: '6px 0' }}>
            ₦{Number(profitData?.total_cost || 0).toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Net Gross Profit</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', margin: '6px 0' }}>
            ₦{Number(profitData?.gross_profit || 0).toLocaleString()}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Overall Profit Margin</span>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', margin: '6px 0' }}>
            {profitData?.overall_margin || 0}%
          </div>
        </div>
      </div>

            <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="#2563eb" /> System Audit Trail Log
          </h3>

          <div style={{ width: '300px' }}>
            <input 
              type="text" 
              placeholder="Search logs by action or user..." 
              className="input-control" 
              style={{ margin: 0 }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="custom-table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User / Role</th>
                <th>Action</th>
                <th>Category</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>Loading audit logs...</td></tr>
              ) : auditLogs.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px' }}>No audit logs recorded.</td></tr>
              ) : (
                auditLogs.map((log, idx) => (
                  <tr key={log.id || idx}>
                    <td style={{ fontSize: '0.78rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(log.exact_timestamp || log.created_at).toLocaleString()}
                    </td>
                    <td>
                      <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>{log.user_name}</strong>
                      <span style={{ fontSize: '0.72rem', color: '#2563eb', textTransform: 'capitalize' }}>{log.user_role}</span>
                    </td>
                    <td>
                      <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', color: '#0f172a', fontWeight: 700, fontSize: '0.75rem', fontFamily: 'monospace' }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700 }}>
                        {log.category}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#334155' }}>{log.description}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
