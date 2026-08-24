import React from 'react';
import { Activity, ShieldAlert, CheckCircle2, ArrowRight, TrendingUp, AlertTriangle } from 'lucide-react';

export default function BusinessPulseCard({ pulse, actionItems, onActionClick }) {
  if (!pulse) return null;

  const score = pulse.score || 85;
  const isHealthy = score >= 80;
  const isWarning = score >= 60 && score < 80;

  const getScoreColor = () => {
    if (isHealthy) return '#10b981';
    if (isWarning) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginBottom: '24px' }}>
      
            <div className="navy-card" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          right: '-20px',
          bottom: '-20px',
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.25) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(56, 189, 248, 0.3)'
            }}>
              <Activity size={20} color="#38bdf8" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ffffff' }}>Business Pulse</h3>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Algorithmic Operational Assessment</p>
            </div>
          </div>

          <span style={{
            padding: '4px 12px',
            borderRadius: '99px',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: isHealthy ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: isHealthy ? '#34d399' : '#fbbf24',
            border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
          }}>
            {pulse.label || 'Healthy'}
          </span>
        </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', margin: '20px 0' }}>
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: `6px solid ${getScoreColor()}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 0 20px ${getScoreColor()}40`,
            background: 'rgba(15, 23, 42, 0.6)'
          }}>
            <span style={{ fontSize: '1.8rem', fontWeight: 800, lineHeight: 1, color: '#ffffff' }}>{score}</span>
            <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>/ 100</span>
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8' }}>Inventory Health</span>
              <span style={{ fontWeight: 600, color: pulse.inventory_status === 'Healthy' ? '#34d399' : '#fbbf24' }}>
                {pulse.inventory_status}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8' }}>Sales Trend</span>
              <span style={{ fontWeight: 600, color: '#38bdf8' }}>{pulse.sales_status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ color: '#94a3b8' }}>Stock Risks</span>
              <span style={{ fontWeight: 600, color: pulse.stock_risk_count > 0 ? '#f87171' : '#34d399' }}>
                {pulse.stock_risk_count} item(s) require attention
              </span>
            </div>
          </div>
        </div>
      </div>

            <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #fecaca'
            }}>
              <ShieldAlert size={20} color="#ef4444" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Action Center</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748b' }}>System Identified Priorities</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {actionItems && actionItems.length > 0 ? (
              actionItems.map((item, idx) => (
                <div 
                  key={item.id || idx}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    background: item.severity === 'critical' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${item.severity === 'critical' ? '#fecaca' : '#fef3c7'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <AlertTriangle size={18} color={item.severity === 'critical' ? '#ef4444' : '#f59e0b'} />
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#1e293b' }}>
                      {item.title}
                    </span>
                  </div>
                  <button
                    onClick={() => onActionClick(item.link)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: '#0f172a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {item.action_label}
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '16px', textFillColor: '#64748b', textAlign: 'center', fontSize: '0.85rem' }}>
                <CheckCircle2 size={24} color="#10b981" style={{ margin: '0 auto 6px auto', display: 'block' }} />
                No critical stock or order bottlenecks detected.
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
