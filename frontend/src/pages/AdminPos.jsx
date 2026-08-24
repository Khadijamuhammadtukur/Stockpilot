import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { Search, ShoppingBag, Plus, Minus, Trash2, CreditCard, Banknote, Landmark, CheckCircle2, User, Printer } from 'lucide-react';
import ReceiptModal from '../components/ReceiptModal';

export default function AdminPos() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [loading, setLoading] = useState(true);

  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('Walk-In Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const prods = await apiFetch('/products');
      const cats = await apiFetch('/categories');
      setProducts(prods.filter(p => p.stock > 0));
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || String(p.category_id) === String(selectedCat);
    return matchesSearch && matchesCat;
  });

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product_id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Cannot add more. Maximum available stock is ${product.stock}.`);
          return prev;
        }
        return prev.map(item => item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      } else {
        return [...prev, { product_id: product.id, name: product.name, price: parseFloat(product.selling_price), stock: product.stock, image: product.main_image, quantity: 1 }];
      }
    });
  };

  const updateQty = (productId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product_id === productId) {
        const newQty = item.quantity + delta;
        if (newQty > item.stock) {
          alert(`Maximum available stock is ${item.stock}`);
          return item;
        }
        return newQty > 0 ? { ...item, quantity: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.product_id !== productId));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setSubmitting(true);
    try {
      const res = await apiFetch('/storefront/checkout', {
        method: 'POST',
        body: JSON.stringify({
          customer_name: customerName || 'Walk-In Customer',
          customer_email: 'pos-storefront@stockpilot.com',
          customer_phone: customerPhone || undefined,
          payment_method: paymentMethod,
          items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity }))
        })
      });

      setCompletedOrder(res.order);
      setCart([]);
      setCustomerName('Walk-In Customer');
      setCustomerPhone('');
      fetchCatalog();
    } catch (err) {
      alert('POS Sale Error: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1380px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      
            <div style={{ marginBottom: '20px' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>In-Store POS Sales Terminal</h1>
        <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Fast checkout for physical walk-in customers with instant receipt generation</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px' }}>
        
                <div>
          
                    <div className="glass-card" style={{ padding: '16px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px', minWidth: '220px' }}>
              <Search size={18} color="#94a3b8" />
              <input 
                type="text" 
                placeholder="Search items by name or SKU..." 
                className="input-control"
                style={{ margin: 0 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button 
                onClick={() => setSelectedCat('all')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '99px',
                  border: selectedCat === 'all' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                  background: selectedCat === 'all' ? '#2563eb' : '#ffffff',
                  color: selectedCat === 'all' ? '#ffffff' : '#0f172a',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer'
                }}
              >
                All Items
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setSelectedCat(cat.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '99px',
                    border: String(selectedCat) === String(cat.id) ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    background: String(selectedCat) === String(cat.id) ? '#2563eb' : '#ffffff',
                    color: String(selectedCat) === String(cat.id) ? '#ffffff' : '#0f172a',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

                    {loading ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>Loading store catalog...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
              No active stock items found.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="glass-card animate-fade-in"
                  onClick={() => addToCart(product)}
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <img 
                      src={product.main_image || 'https://via.placeholder.com/150'} 
                      alt={product.name} 
                      style={{ width: '100%', height: '110px', objectFit: 'cover', borderRadius: '8px', marginBottom: '10px' }}
                    />
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block', lineHeight: '1.2' }}>{product.name}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b', fontFamily: 'monospace' }}>SKU: {product.sku}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#2563eb' }}>
                      ₦{Number(product.selling_price).toLocaleString()}
                    </span>
                    <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: '#ecfdf5', color: '#10b981', fontWeight: 800 }}>
                      Stock: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

                <div>
          <div className="glass-card" style={{ padding: '20px', position: 'sticky', top: '24px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={18} color="#2563eb" /> Walk-In Order Register
            </h3>

                        <div style={{ maxHeight: '280px', overflowY: 'auto', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 10px', color: '#94a3b8', fontSize: '0.85rem' }}>
                  Click products on the left to add to walk-in cart.
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ flex: 1, paddingRight: '8px' }}>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>{item.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>₦{item.price.toLocaleString()} x {item.quantity}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button onClick={() => updateQty(item.product_id, -1)} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}>-</button>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.quantity}</span>
                      <button onClick={() => updateQty(item.product_id, 1)} style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid #cbd5e1', background: '#ffffff', cursor: 'pointer' }}>+</button>
                      <button onClick={() => removeFromCart(item.product_id)} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', marginLeft: '4px' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>Total Payable:</span>
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>₦{cartTotal.toLocaleString()}</span>
            </div>

                        <form onSubmit={handleCheckout}>
              
              <div className="input-group">
                <label>Customer Name / Identifier</label>
                <input 
                  type="text" 
                  className="input-control" 
                  value={customerName} 
                  onChange={e => setCustomerName(e.target.value)} 
                  placeholder="e.g. Walk-In Customer or Mr. John"
                />
              </div>

              <div className="input-group">
                <label>Customer Phone (Optional)</label>
                <input 
                  type="text" 
                  className="input-control" 
                  value={customerPhone} 
                  onChange={e => setCustomerPhone(e.target.value)} 
                  placeholder="+234..."
                />
              </div>

              <div className="input-group">
                <label>Payment Method Received</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: paymentMethod === 'cash' ? '2px solid #10b981' : '1px solid #cbd5e1',
                      background: paymentMethod === 'cash' ? '#ecfdf5' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: '#0f172a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Banknote size={14} color="#10b981" /> Cash
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card_pos')}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: paymentMethod === 'card_pos' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: paymentMethod === 'card_pos' ? '#eff6ff' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: '#0f172a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <CreditCard size={14} color="#2563eb" /> Card / POS
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '6px',
                      border: paymentMethod === 'bank_transfer' ? '2px solid #8b5cf6' : '1px solid #cbd5e1',
                      background: paymentMethod === 'bank_transfer' ? '#f5f3ff' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: '#0f172a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <Landmark size={14} color="#8b5cf6" /> Transfer
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 800, marginTop: '10px' }}
                disabled={cart.length === 0 || submitting}
              >
                {submitting ? 'Processing POS Sale...' : 'Complete Sale & Issue Receipt'}
              </button>

            </form>
          </div>
        </div>

      </div>

            {completedOrder && (
        <ReceiptModal 
          order={completedOrder} 
          onClose={() => setCompletedOrder(null)} 
        />
      )}

    </div>
  );
}
