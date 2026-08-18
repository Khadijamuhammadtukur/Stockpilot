import React from 'react';
import { X, Printer, CheckCircle, Download, FileText } from 'lucide-react';

export default function ReceiptModal({ order, onClose }) {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.7)',
      backdropFilter: 'blur(6px)',
      zIndex: 250,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '540px',
        padding: '30px',
        position: 'relative',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        <button 
          onClick={onClose} 
          style={{ position: 'absolute', right: '20px', top: '20px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={22} />
        </button>

        {/* Receipt Header */}
        <div style={{ textAlign: 'center', paddingBottom: '20px', borderBottom: '2px dashed #cbd5e1' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: '#ecfdf5',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <CheckCircle size={28} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a' }}>Order Receipt & Confirmation</h2>
          <p style={{ fontSize: '0.82rem', color: '#2563eb', fontWeight: 700, marginTop: '2px' }}>
            StockPilot Intelligent Commerce
          </p>
          <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '4px' }}>
            {new Date(order.created_at || Date.now()).toLocaleString()}
          </span>
        </div>

        {/* Order Info Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', margin: '20px 0', fontSize: '0.82rem' }}>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Order Number:</span>
            <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{order.order_number}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#64748b', display: 'block' }}>Payment Status:</span>
            <span style={{
              padding: '2px 8px',
              borderRadius: '99px',
              background: '#ecfdf5',
              color: '#10b981',
              fontWeight: 700,
              fontSize: '0.75rem'
            }}>
              {order.payment_status?.toUpperCase() || 'PAID'}
            </span>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block' }}>Customer Name:</span>
            <strong style={{ color: '#0f172a' }}>{order.customer_name}</strong>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ color: '#64748b', display: 'block' }}>Transaction Ref:</span>
            <strong style={{ color: '#64748b', fontFamily: 'monospace' }}>{order.transaction_reference || 'N/A'}</strong>
          </div>
        </div>

        {/* Item List Table */}
        <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '10px 12px', textAlign: 'left', color: '#64748b' }}>Item</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', color: '#64748b' }}>Qty</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>Price</th>
                <th style={{ padding: '10px 12px', textAlign: 'right', color: '#64748b' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#0f172a' }}>
                    {item.product_name || item.product?.name}
                  </td>
                  <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.quantity}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right' }}>₦{Number(item.price).toLocaleString()}</td>
                  <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 700 }}>₦{Number(item.subtotal).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotal & Grand Total */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', background: '#f8fafc', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
            <span>Subtotal</span>
            <span>₦{Number(order.subtotal || order.total_amount).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', borderTop: '1px solid #cbd5e1', paddingTop: '8px' }}>
            <span>Total Paid</span>
            <span style={{ color: '#2563eb' }}>₦{Number(order.total_amount).toLocaleString()}</span>
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handlePrint}>
            <Printer size={16} />
            Print Receipt
          </button>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
