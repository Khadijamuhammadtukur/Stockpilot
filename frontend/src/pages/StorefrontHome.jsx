import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { useCart } from '../context/CartContext';
import StockStatusBadge from '../components/StockStatusBadge';
import { ShoppingBag, Eye, ShieldCheck, Zap, ArrowRight, Filter, SearchX } from 'lucide-react';

export default function StorefrontHome({ searchTerm, onSelectProduct, onOpenCart }) {
  const { addToCart } = useCart();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/storefront/products?search=${encodeURIComponent(searchTerm || '')}`;
      if (selectedCategory) url += `&category_id=${selectedCategory}`;

      const res = await apiFetch(url);
      setProducts(res.data || res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await apiFetch('/storefront/categories');
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory]);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      
      {/* Hero Banner */}
      <div className="navy-card" style={{
        padding: '40px 32px',
        marginBottom: '32px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px'
      }}>
        <div style={{ maxWidth: '600px', zIndex: 2 }}>
          <span style={{
            background: 'rgba(56, 189, 248, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '4px 12px',
            borderRadius: '99px',
            fontSize: '0.78rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '14px'
          }}>
            <Zap size={14} /> Real-Time Synchronized Inventory
          </span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.15, marginBottom: '12px' }}>
            Smart Commerce Powered by <span style={{ color: '#38bdf8' }}>StockPilot</span>
          </h1>
          <p style={{ fontSize: '0.98rem', color: '#cbd5e1', lineHeight: 1.5, marginBottom: '24px' }}>
            Discover authentic products with live inventory availability. StockPilot automatically synchronizes available quantities in real time.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-primary" onClick={onOpenCart}>
              <ShoppingBag size={18} /> View Cart
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.82rem' }}>
              <ShieldCheck size={18} color="#10b981" /> 100% Stock Guaranteed
            </div>
          </div>
        </div>

        {/* Hero Decorative Graphic */}
        <div style={{
          width: '240px',
          height: '240px',
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(6, 182, 212, 0.15) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'none',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 40px rgba(37, 99, 235, 0.3)'
        }}>
          <ShoppingBag size={96} color="#38bdf8" />
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          <button 
            onClick={() => setSelectedCategory('')}
            style={{
              padding: '8px 16px',
              borderRadius: '99px',
              border: selectedCategory === '' ? 'none' : '1px solid #cbd5e1',
              background: selectedCategory === '' ? '#0f172a' : '#ffffff',
              color: selectedCategory === '' ? '#ffffff' : '#0f172a',
              fontWeight: 700,
              fontSize: '0.85rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Products
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              style={{
                padding: '8px 16px',
                borderRadius: '99px',
                border: selectedCategory === cat.id ? 'none' : '1px solid #cbd5e1',
                background: selectedCategory === cat.id ? '#0f172a' : '#ffffff',
                color: selectedCategory === cat.id ? '#ffffff' : '#0f172a',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.name} ({cat.products_count})
            </button>
          ))}
        </div>

        {/* Intelligent Visibility Notice */}
        <span style={{ fontSize: '0.78rem', color: '#64748b', background: '#f1f5f9', padding: '6px 12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          💡 <strong>Intelligent Stock Visibility:</strong> Products with 0 stock are automatically hidden.
        </span>
      </div>

      {/* Product Catalog Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#64748b' }}>
          Fetching available inventory...
        </div>
      ) : products.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
          <SearchX size={48} color="#cbd5e1" style={{ margin: '0 auto 12px auto', display: 'block' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>No Available Products Found</h3>
          <p style={{ fontSize: '0.88rem' }}>Try clearing your search or category filter. Out-of-stock items are automatically hidden.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '24px' }}>
          {products.map(product => (
            <div 
              key={product.id} 
              className="glass-card"
              style={{
                borderRadius: '16px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
            >
              <div>
                {/* Image Container */}
                <div style={{ position: 'relative', width: '100%', height: '200px', background: '#f1f5f9', overflow: 'hidden' }}>
                  <img 
                    src={product.main_image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80'} 
                    alt={product.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
                    <StockStatusBadge status={product.stock_status} stock={product.stock} minStock={product.min_stock} />
                  </div>
                  {product.category && (
                    <span style={{
                      position: 'absolute',
                      bottom: '10px',
                      right: '10px',
                      background: 'rgba(15, 23, 42, 0.8)',
                      color: '#ffffff',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '6px'
                    }}>
                      {product.category.name}
                    </span>
                  )}
                </div>

                {/* Product Content */}
                <div style={{ padding: '16px' }}>
                  <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontFamily: 'monospace', fontWeight: 600 }}>SKU: {product.sku}</span>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: '4px 0 8px 0', lineHeight: 1.3 }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#64748b', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', height: '36px' }}>
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Price & Action */}
              <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', display: 'block' }}>Price</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#2563eb' }}>
                    ₦{Number(product.selling_price).toLocaleString()}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '6px' }}>
                  <button 
                    onClick={() => onSelectProduct(product)}
                    title="View Details"
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Eye size={16} color="#0f172a" />
                  </button>

                  <button 
                    onClick={() => addToCart(product, 1)}
                    disabled={product.stock <= 0}
                    className="btn btn-primary"
                    style={{ padding: '8px 12px', fontSize: '0.8rem' }}
                  >
                    <ShoppingBag size={15} /> Add
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
