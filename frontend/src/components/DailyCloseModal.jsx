import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { X, Printer, Lock, CheckCircle2, DollarSign, ShoppingBag, CreditCard, Award, FileText } from 'lucide-react';

export default function DailyCloseModal({ isOpen, onClose }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [closing, setClosing] = useState(false);
  const [message, setMessage] = useState(null);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/reports/daily-close');
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSummary();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCloseRegister = async () => {
    if (!window.confirm('Are you sure you want to close the sales register for today? This action logs an official Z-Report audit entry.')) {
      return;
    }

    setClosing(true);
    try {
      const res = await apiFetch('/reports/daily-close', { 
        method: 'POST',
        body: JSON.stringify({ staff_name: user?.name || 'Chief Operations' })
      });
      setMessage(res.message);
      fetchSummary();
    } catch (err) {
      setMessage('Error closing register: ' + err.message);
    } finally {
      setClosing(false);
    }
  };

  const handleReopenRegister = async () => {
    if (!window.confirm('Re-open sales register for today? This allows you to make corrections or record additional transactions.')) {
      return;
    }
    setClosing(true);
    try {
      const res = await apiFetch('/reports/daily-close/reopen', { 
        method: 'POST',
        body: JSON.stringify({ staff_name: user?.name || 'Chief Operations' })
      });
      setMessage(res.message);
      fetchSummary();
    } catch (err) {
      setMessage('Error re-opening register: ' + err.message);
    } finally {
      setClosing(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(6px)',
      zIndex: 300,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in print-container" style={{ width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '28px', position: 'relative' }}>
        
        <button 
          onClick={onClose} 
          className="no-print"
          style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: '2px dashed #cbd5e1', paddingBottom: '16px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            STOCKPILOT • DAILY SALES CLOSE (Z-REPORT)
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            Daily Financial Closing & Inventory Sales Summary • Date: <strong>{data?.formatted_date || data?.date}</strong>
          </p>

          {data?.is_closed ? (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ecfdf5', color: '#10b981', padding: '4px 12px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 800, marginTop: '8px' }}>
              <CheckCircle2 size={14} /> REGISTER CLOSED for Today by {data.closed_by}
            </div>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fffbeb', color: '#f59e0b', padding: '4px 12px', borderRadius: '99px', fontSize: '0.78rem', fontWeight: 800, marginTop: '8px' }}>
              <Lock size={14} /> REGISTER OPEN (Active Sales Day)
            </div>
          )}
        </div>

        {message && (
          <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', fontSize: '0.85rem', fontWeight: 700, marginBottom: '16px', textAlign: 'center' }}>
            {message}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Generating Daily Z-Report...</div>
        ) : (
          <div>
            
            {/* Main Financial KPI Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TOTAL REVENUE MADE TODAY</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#10b981', marginTop: '2px' }}>
                  ₦{Number(data?.total_revenue || 0).toLocaleString()}
                </div>
                <small style={{ fontSize: '0.72rem', color: '#64748b' }}>{data?.sales_count || 0} completed orders</small>
              </div>

              <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>GROSS PROFIT MADE TODAY</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#2563eb', marginTop: '2px' }}>
                  ₦{Number(data?.gross_profit || 0).toLocaleString()}
                </div>
                <small style={{ fontSize: '0.72rem', color: '#64748b' }}>COGS: ₦{Number(data?.total_cost || 0).toLocaleString()}</small>
              </div>
            </div>

            {/* Payment Method Breakdown */}
            <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '14px', marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase' }}>
                Payment Method Totals
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', textAlign: 'center' }}>
                <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Cash</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>₦{Number(data?.payment_breakdown?.cash || 0).toLocaleString()}</strong>
                </div>
                <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Card / POS</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>₦{Number(data?.payment_breakdown?.card_pos || 0).toLocaleString()}</strong>
                </div>
                <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Bank Transfer</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>₦{Number(data?.payment_breakdown?.bank_transfer || 0).toLocaleString()}</strong>
                </div>
                <div style={{ background: '#f1f5f9', padding: '8px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Online Paystack</span>
                  <strong style={{ fontSize: '0.85rem', color: '#0f172a' }}>₦{Number(data?.payment_breakdown?.online_paystack || 0).toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* Items Sold Today Table */}
            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase' }}>
                Items Bought & Sold Today
              </h4>

              {(!data?.items_sold || data.items_sold.length === 0) ? (
                <p style={{ fontSize: '0.82rem', color: '#64748b', fontStyle: 'italic', textAlign: 'center', padding: '16px' }}>
                  No items sold yet today.
                </p>
              ) : (
                <table style={{ width: '100%', fontSize: '0.82rem', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '6px 0', color: '#64748b' }}>Item Name</th>
                      <th style={{ padding: '6px 0', color: '#64748b', textAlign: 'center' }}>Qty</th>
                      <th style={{ padding: '6px 0', color: '#64748b', textAlign: 'right' }}>Price</th>
                      <th style={{ padding: '6px 0', color: '#64748b', textAlign: 'right' }}>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.items_sold.map((item, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '8px 0', fontWeight: 700, color: '#0f172a' }}>{item.product_name}</td>
                        <td style={{ padding: '8px 0', textAlign: 'center', fontWeight: 800, color: '#2563eb' }}>{item.total_qty}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', color: '#64748b' }}>₦{Number(item.price).toLocaleString()}</td>
                        <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 800, color: '#0f172a' }}>₦{Number(item.total_revenue).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Action Buttons */}
            <div className="no-print" style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
                Close View
              </button>
              <button type="button" className="btn btn-dark" style={{ flex: 1 }} onClick={handlePrint}>
                <Printer size={16} /> Print Z-Report Receipt
              </button>
              {data?.is_closed ? (
                <button type="button" className="btn btn-secondary" style={{ flex: 1, background: '#fffbeb', border: '1px solid #f59e0b', color: '#b45309', fontWeight: 800 }} onClick={handleReopenRegister} disabled={closing}>
                  Re-Open Register for Editing
                </button>
              ) : (
                <button type="button" className="btn btn-primary" style={{ flex: 1 }} onClick={handleCloseRegister} disabled={closing}>
                  <Lock size={16} /> {closing ? 'Closing...' : 'Close Sales Day'}
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
