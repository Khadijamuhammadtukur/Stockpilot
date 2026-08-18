import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import StockStatusBadge from './StockStatusBadge';
import { X, ShoppingBag, ShieldCheck, Truck, Check } from 'lucide-react';

export default function ProductDetailModal({ product, onClose }) {
  const { addToCart } = useCart();
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [qty, setQty] = useState(1);

  if (!product) return null;

  const currentPrice = selectedVariation?.selling_price || product.selling_price;
  const maxStock = selectedVariation ? selectedVariation.stock : product.stock;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{
        width: '100%',
        maxWidth: '720px',
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

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          
          {/* Main Product Image */}
          <div>
            <div style={{ width: '100%', height: '300px', borderRadius: '16px', overflow: 'hidden', background: '#f1f5f9' }}>
              <img 
                src={product.main_image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} 
                alt={product.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          </div>

          {/* Product Details & Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <StockStatusBadge status={product.stock_status} stock={maxStock} minStock={product.min_stock} />
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontFamily: 'monospace' }}>SKU: {product.sku}</span>
              </div>

              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '8px' }}>{product.name}</h2>
              
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#2563eb', marginBottom: '14px' }}>
                ₦{Number(currentPrice).toLocaleString()}
              </div>

              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
                {product.description}
              </p>

              {/* Product Variations (If any) */}
              {product.variations && product.variations.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                    Select Variation:
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {product.variations.map(varItem => (
                      <button
                        key={varItem.id}
                        onClick={() => setSelectedVariation(varItem)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: selectedVariation?.id === varItem.id ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: selectedVariation?.id === varItem.id ? '#eff6ff' : '#ffffff',
                          color: '#0f172a',
                          fontWeight: 600,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        {varItem.name} (Stock: {varItem.stock})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions & Add to Cart */}
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                <input 
                  type="number" 
                  min="1" 
                  max={maxStock}
                  value={qty}
                  onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{ width: '70px', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 700, textAlign: 'center' }}
                />

                <button 
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '12px' }}
                  disabled={maxStock <= 0}
                  onClick={() => {
                    addToCart(product, qty, selectedVariation);
                    onClose();
                  }}
                >
                  <ShoppingBag size={18} /> {maxStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>
              </div>

              <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={16} color="#10b981" /> Verified Stock</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Truck size={16} color="#2563eb" /> Fast Delivery</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
