import React, { useState } from 'react';
import { apiFetch } from '../api/config';
import { X, PlusCircle, MinusCircle, CheckCircle2 } from 'lucide-react';

export default function InventoryMovementModal({ product, onClose, onRefresh }) {
  const [type, setType] = useState('receive');
  const [qtyChange, setQtyChange] = useState('');
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [costPrice, setCostPrice] = useState(product?.cost_price || '');
  const [sellingPrice, setSellingPrice] = useState(product?.selling_price || '');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  if (!product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!qtyChange || parseInt(qtyChange) === 0) return;

    setSubmitting(true);
    setMessage(null);

    const changeVal = type === 'receive' || type === 'return' ? Math.abs(parseInt(qtyChange)) : -Math.abs(parseInt(qtyChange));

    try {
      const res = await apiFetch(`/products/${product.id}/stock`, {
        method: 'POST',
        body: JSON.stringify({
          qty_change: changeVal,
          type,
          reason,
          reference: reference || (type === 'receive' ? 'PO-RESTOCK' : 'ADJ-MANUAL'),
          cost_price: costPrice ? parseFloat(costPrice) : undefined,
          selling_price: sellingPrice ? parseFloat(sellingPrice) : undefined
        })
      });

      setMessage(res.message);
      setTimeout(() => {
        onRefresh();
        onClose();
      }, 1500);
    } catch (err) {
      setMessage('Error updating inventory: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '24px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', right: '18px', top: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
        >
          <X size={20} />
        </button>

        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
          Stock Adjustment / Restock
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '18px' }}>
          Updating stock for <strong style={{ color: '#2563eb' }}>{product.name}</strong> (Current Stock: {product.stock})
        </p>

        {message && (
          <div style={{
            padding: '12px',
            borderRadius: '8px',
            background: message.includes('Error') ? '#fef2f2' : '#ecfdf5',
            color: message.includes('Error') ? '#ef4444' : '#10b981',
            fontSize: '0.85rem',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Movement Type</label>
            <select 
              className="input-control" 
              value={type} 
              onChange={e => setType(e.target.value)}
            >
              <option value="receive">Stock Received / Restock (+)</option>
              <option value="adjustment">Manual Adjustment</option>
              <option value="damaged">Damaged Goods (-)</option>
              <option value="lost">Lost / Discrepancy (-)</option>
              <option value="return">Customer Return (+)</option>
            </select>
          </div>

          <div className="input-group">
            <label>Quantity {type === 'receive' || type === 'return' ? 'to Add (+)' : 'to Deduct (-)'}</label>
            <input 
              type="number" 
              className="input-control" 
              placeholder="e.g. 20" 
              min="1"
              required
              value={qtyChange}
              onChange={e => setQtyChange(e.target.value)}
            />
          </div>

          {/* Pricing Updates on the fly */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label>Cost Price (₦)</label>
              <input 
                type="number" 
                step="0.01"
                className="input-control" 
                placeholder="Unit Cost Price" 
                value={costPrice}
                onChange={e => setCostPrice(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>Selling Price (₦)</label>
              <input 
                type="number" 
                step="0.01"
                className="input-control" 
                placeholder="Unit Selling Price" 
                value={sellingPrice}
                onChange={e => setSellingPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="input-group">
            <label>Reference Number / PO Number</label>
            <input 
              type="text" 
              className="input-control" 
              placeholder="e.g. PO-89102 or ADJ-001" 
              value={reference}
              onChange={e => setReference(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Notes / Reason</label>
            <textarea 
              className="input-control" 
              placeholder="Provide reason for audit logging..." 
              rows="2"
              value={reason}
              onChange={e => setReason(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Updating...' : 'Save Stock Update'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
