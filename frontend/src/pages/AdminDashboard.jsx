import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import BusinessPulseCard from '../components/BusinessPulseCard';
import StockStatusBadge from '../components/StockStatusBadge';
import { DollarSign, TrendingUp, Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Clock, Box, ShieldCheck, RefreshCw } from 'lucide-react';

export default function AdminDashboard({ onNavigateTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/dashboard');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '80px', color: '#64748b' }}>Loading Command Center metrics...</div>;
  }

  const { metrics, business_pulse, action_center, recent_movements, fast_movers, slow_movers } = data || {};

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Business Operations Command Center</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Real-time inventory, sales, and algorithmic health intelligence</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDashboardData}>
          <RefreshCw size={16} /> Refresh Metrics
        </button>
      </div>

      {/* 1. Business Pulse & Action Center Section */}
      <BusinessPulseCard 
        pulse={business_pulse} 
        actionItems={action_center} 
        onActionClick={(link) => {
          if (link.includes('inventory')) onNavigateTab('inventory');
          if (link.includes('orders')) onNavigateTab('orders');
        }} 
      />

      {/* 2. KPI Cards Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '28px' }}>
        
        {/* Total Revenue */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>Total Revenue</span>
            <DollarSign size={18} color="#2563eb" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
            ₦{Number(metrics?.total_revenue || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> {metrics?.total_sales_count || 0} Total Orders
          </span>
        </div>

        {/* Estimated Profit */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>Estimated Profit</span>
            <TrendingUp size={18} color="#10b981" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981', margin: '8px 0 4px 0' }}>
            ₦{Number(metrics?.estimated_profit || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>
            {metrics?.profit_margin || 0}% Gross Profit Margin
          </span>
        </div>

        {/* Inventory Valuation */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>Inventory Valuation</span>
            <Package size={18} color="#06b6d4" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#0f172a', margin: '8px 0 4px 0' }}>
            ₦{Number(metrics?.total_inventory_value || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
            Across {metrics?.total_products || 0} active catalog items
          </span>
        </div>

        {/* Stock Risks */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#64748b', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>Critical / Out of Stock</span>
            <AlertTriangle size={18} color="#ef4444" />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: metrics?.out_of_stock_count > 0 ? '#ef4444' : '#0f172a', margin: '8px 0 4px 0' }}>
            {metrics?.critical_stock_count + metrics?.out_of_stock_count} Items
          </div>
          <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700 }}>
            {metrics?.out_of_stock_count || 0} Hidden from Storefront
          </span>
        </div>

      </div>

      {/* 3. Recent Movements & Fast/Slow Movers Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
        
        {/* Inventory Timeline Feed */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="#2563eb" /> Recent Inventory Timeline
            </h3>
            <button className="btn btn-secondary" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={() => onNavigateTab('inventory')}>
              View All
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(recent_movements || []).map((m, idx) => (
              <div key={idx} style={{ padding: '12px', borderRadius: '10px', background: '#f8fafc', border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a', display: 'block' }}>{m.product?.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Ref: {m.reference} • {new Date(m.exact_timestamp || m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                    color: m.qty_change > 0 ? '#10b981' : '#ef4444'
                  }}>
                    {m.qty_change > 0 ? `+${m.qty_change}` : m.qty_change}
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block' }}>
                    {m.previous_qty} → {m.new_qty}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fast & Slow Moving Products */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={18} color="#06b6d4" /> Stock Turnover Analysis
          </h3>

          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            ⚡ Fast Moving Products (Low Stock Turnover Risk)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
            {(fast_movers || []).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '6px 10px', background: '#ecfdf5', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</span>
                <StockStatusBadge status={p.stock_status} stock={p.stock} minStock={p.min_stock} />
              </div>
            ))}
          </div>

          <h4 style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
            🐢 Slow Moving / High Stock Items
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(slow_movers || []).map(p => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', padding: '6px 10px', background: '#fffbeb', borderRadius: '6px' }}>
                <span style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</span>
                <span style={{ fontWeight: 700, color: '#0f172a' }}>{p.stock} in stock</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
