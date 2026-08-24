import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import StockStatusBadge from '../components/StockStatusBadge';
import InventoryMovementModal from '../components/InventoryMovementModal';
import { exportToCSV } from '../utils/exportCsv';
import { Box, Plus, RefreshCw, Eye, Edit3, History, Search, ArrowUpDown, AlertCircle, Download, Check } from 'lucide-react';

function InlinePriceInput({ value, onSave, label }) {
  const [val, setVal] = useState(value);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setVal(value);
  }, [value]);

  const handleSave = async () => {
    if (parseFloat(val) === parseFloat(value) || isNaN(parseFloat(val))) {
      setIsEditing(false);
      return;
    }
    setSaving(true);
    await onSave(parseFloat(val));
    setSaving(false);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div 
        onClick={() => setIsEditing(true)}
        title="Click to edit price directly"
        style={{
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '6px',
          border: '1px dashed #cbd5e1',
          background: '#f8fafc',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.15s ease'
        }}
      >
        <span style={{ fontSize: '0.88rem', fontWeight: label === 'selling' ? 800 : 600, color: label === 'selling' ? '#2563eb' : '#475569' }}>
          ₦{Number(val).toLocaleString()}
        </span>
        <Edit3 size={12} color="#94a3b8" />
      </div>
    );
  }

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
      <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700 }}>₦</span>
      <input 
        type="number"
        step="0.01"
        autoFocus
        value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') setIsEditing(false); }}
        onBlur={handleSave}
        style={{
          width: '95px',
          padding: '4px 6px',
          borderRadius: '6px',
          border: '2px solid #2563eb',
          fontSize: '0.85rem',
          fontWeight: 700,
          outline: 'none',
          background: '#ffffff'
        }}
      />
    </div>
  );
}

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [search, setSearch] = useState('');
  const [stockFilter, setStockFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const [selectedProductForRestock, setSelectedProductForRestock] = useState(null);
  const [timelineProduct, setTimelineProduct] = useState(null);
  const [timelineData, setTimelineData] = useState([]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductSku, setNewProductSku] = useState('');
  const [newProductCost, setNewProductCost] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [newProductCat, setNewProductCat] = useState('');
  const [newProductSup, setNewProductSup] = useState('');
  const [newProductImg, setNewProductImg] = useState('');
  const [newProductDesc, setNewProductDesc] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?search=${encodeURIComponent(search)}`;
      if (stockFilter !== 'all') url += `&stock_filter=${stockFilter}`;
      const data = await apiFetch(url);
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePrice = async (productId, field, newPrice) => {
    try {
      await apiFetch(`/products/${productId}`, {
        method: 'PUT',
        body: JSON.stringify({
          [field]: newPrice
        })
      });
      fetchProducts();
    } catch (err) {
      alert('Error updating price: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(products, [
      { label: 'Product Name', key: 'name' },
      { label: 'SKU', key: 'sku' },
      { label: 'Category', key: 'category.name' },
      { label: 'Cost Price (₦)', key: 'cost_price' },
      { label: 'Selling Price (₦)', key: 'selling_price' },
      { label: 'Profit Margin (%)', key: 'profit_margin' },
      { label: 'Current Stock', key: 'stock' },
      { label: 'Stock Status', key: 'stock_status' }
    ], 'stockpilot_inventory_catalog');
  };

  const fetchMeta = async () => {
    try {
      const cats = await apiFetch('/categories');
      const sups = await apiFetch('/suppliers');
      setCategories(cats);
      setSuppliers(sups);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, stockFilter]);

  useEffect(() => {
    fetchMeta();
  }, []);

  const openTimeline = async (product) => {
    setTimelineProduct(product);
    try {
      const res = await apiFetch(`/products/${product.id}/performance`);
      setTimelineData(res.timeline || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify({
          name: newProductName,
          sku: newProductSku,
          cost_price: parseFloat(newProductCost),
          selling_price: parseFloat(newProductPrice),
          stock: parseInt(newProductStock),
          category_id: newProductCat || null,
          supplier_id: newProductSup || null,
          main_image: newProductImg || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
          description: newProductDesc,
        })
      });

      setShowCreateModal(false);
      fetchProducts();
    } catch (err) {
      alert('Error creating product: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Inventory & Stock Management</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Click any price directly in table to edit instantaneously without opening modals</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-secondary" onClick={fetchProducts}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Add Product
          </button>
        </div>
      </div>

            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by product name, SKU, or barcode..."
            className="input-control" 
            style={{ margin: 0 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Stock Status:</label>
          <select 
            className="input-control" 
            style={{ width: 'auto', margin: 0 }}
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value)}
          >
            <option value="all">All Products</option>
            <option value="low_stock">Low Stock Warning</option>
            <option value="out_of_stock">Out of Stock (Hidden)</option>
          </select>
        </div>
      </div>

            <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Cost Price (Click to Edit)</th>
              <th>Selling Price (Click to Edit)</th>
              <th>Margin</th>
              <th>Stock Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading inventory...</td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No products found matching filters.</td>
              </tr>
            ) : (
              products.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img 
                        src={p.main_image || 'https://via.placeholder.com/50'} 
                        alt={p.name} 
                        style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div>
                        <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>{p.name}</strong>
                        {p.stock <= 0 && (
                          <span style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 700 }}>
                            Hidden from Storefront
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.sku}</td>
                  <td>{p.category?.name || 'Uncategorized'}</td>
                  <td>
                    <InlinePriceInput 
                      value={p.cost_price} 
                      label="cost" 
                      onSave={(newPrice) => handleUpdatePrice(p.id, 'cost_price', newPrice)} 
                    />
                  </td>
                  <td>
                    <InlinePriceInput 
                      value={p.selling_price} 
                      label="selling" 
                      onSave={(newPrice) => handleUpdatePrice(p.id, 'selling_price', newPrice)} 
                    />
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: p.profit_margin >= 30 ? '#ecfdf5' : '#fffbeb',
                      color: p.profit_margin >= 30 ? '#10b981' : '#f59e0b',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}>
                      {p.profit_margin}%
                    </span>
                  </td>
                  <td>
                    <StockStatusBadge status={p.stock_status} stock={p.stock} minStock={p.min_stock} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button 
                        onClick={() => setSelectedProductForRestock(p)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                      >
                        <ArrowUpDown size={14} /> Adjust / Restock
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

            {selectedProductForRestock && (
        <InventoryMovementModal 
          product={selectedProductForRestock} 
          onClose={() => setSelectedProductForRestock(null)} 
          onRefresh={fetchProducts} 
        />
      )}

            {showCreateModal && (
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
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '540px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Create New Product</h3>
            
            <form onSubmit={handleCreateProduct}>
              <div className="input-group">
                <label>Product Name</label>
                <input 
                  className="input-control" 
                  required 
                  value={newProductName} 
                  onChange={e => {
                    setNewProductName(e.target.value);
                    if (!newProductSku) {
                      const auto = 'SKU-' + e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6) + '-' + Math.floor(100 + Math.random() * 900);
                      setNewProductSku(auto);
                    }
                  }} 
                  placeholder="e.g. Wireless Smart Speaker" 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>SKU (Auto-Generated)</label>
                  <input className="input-control" required value={newProductSku} onChange={e => setNewProductSku(e.target.value)} placeholder="SKU-AUTO-01" />
                </div>
                <div className="input-group">
                  <label>Initial Stock</label>
                  <input type="number" className="input-control" required min="0" value={newProductStock} onChange={e => setNewProductStock(e.target.value)} placeholder="15" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Cost Price (₦)</label>
                  <input type="number" step="0.01" className="input-control" required value={newProductCost} onChange={e => setNewProductCost(e.target.value)} placeholder="12000" />
                </div>
                <div className="input-group">
                  <label>Selling Price (₦)</label>
                  <input type="number" step="0.01" className="input-control" required value={newProductPrice} onChange={e => setNewProductPrice(e.target.value)} placeholder="22000" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Category</label>
                  <select className="input-control" value={newProductCat} onChange={e => setNewProductCat(e.target.value)}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label>Supplier</label>
                  <select className="input-control" value={newProductSup} onChange={e => setNewProductSup(e.target.value)}>
                    <option value="">Select Supplier</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>

                            <div className="input-group">
                <label>Select Product Image (Click Thumbnail)</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '8px' }}>
                  {[
                    { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80' },
                    { label: 'TV Streamer', url: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=800&q=80' },
                    { label: 'Leather Bag', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80' },
                    { label: 'Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80' },
                    { label: 'Watch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80' },
                  ].map((preset, pIdx) => (
                    <img 
                      key={pIdx} 
                      src={preset.url} 
                      alt={preset.label}
                      title={preset.label}
                      onClick={() => setNewProductImg(preset.url)}
                      style={{
                        width: '100%',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: newProductImg === preset.url ? '3px solid #2563eb' : '1px solid #cbd5e1',
                        opacity: newProductImg === preset.url ? 1 : 0.75
                      }}
                    />
                  ))}
                </div>
                <input className="input-control" value={newProductImg} onChange={e => setNewProductImg(e.target.value)} placeholder="Or paste image URL directly..." />
              </div>

              <div className="input-group">
                <label>Description (Optional)</label>
                <textarea className="input-control" rows="2" value={newProductDesc} onChange={e => setNewProductDesc(e.target.value)} placeholder="Optional product specifications..." />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
