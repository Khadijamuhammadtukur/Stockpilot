import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { apiFetch } from '../api/config';
import { X, Trash2, Plus, Minus, CreditCard, ShoppingBag, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function CartDrawer({ isOpen, onClose, onOrderSuccess }) {
  const { cart, updateQuantity, removeFromCart, clearCart, subtotal, itemCount } = useCart();
  const [step, setStep] = useState('cart'); // 'cart' or 'checkout'
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online_paystack');
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setProcessing(true);
    setErrorMsg(null);

    const payload = {
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      items: cart.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
      }))
    };

    try {
      const data = await apiFetch('/storefront/checkout', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (typeof window !== 'undefined' && window.confetti) {
        window.confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      }
      clearCart();
      setStep('cart');
      onClose();
      onOrderSuccess(data.order);
    } catch (err) {
      setErrorMsg(err.message || 'Checkout failed due to stock availability.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      zIndex: 200,
      display: 'flex',
      justifyContent: 'flex-end'
    }}>
      <div className="animate-fade-in" style={{
        width: '100%',
        maxWidth: '460px',
        background: '#ffffff',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.15)'
      }}>
        {/* Cart Header */}
        <div style={{
          padding: '20px 24px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingBag size={22} color="#38bdf8" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff' }}>
              {step === 'cart' ? `Shopping Cart (${itemCount})` : 'Express Checkout'}
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X size={22} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {errorMsg && (
            <div style={{ padding: '12px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', fontSize: '0.82rem', marginBottom: '14px' }}>
              {errorMsg}
            </div>
          )}

          {step === 'cart' ? (
            cart.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                <ShoppingBag size={48} color="#cbd5e1" style={{ margin: '0 auto 14px auto', display: 'block' }} />
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>Your cart is empty</h4>
                <p style={{ fontSize: '0.85rem' }}>Browse available items in our catalog to get started.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {cart.map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    alignItems: 'center'
                  }}>
                    <img 
                      src={item.product.main_image || 'https://via.placeholder.com/60'} 
                      alt={item.product.name} 
                      style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                    />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{item.product.name}</h4>
                      <p style={{ fontSize: '0.78rem', color: '#2563eb', fontWeight: 700 }}>
                        ₦{Number(item.product.selling_price).toLocaleString()}
                      </p>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.variation?.id, item.quantity - 1)}
                          style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.variation?.id, item.quantity + 1)}
                          style={{ border: '1px solid #cbd5e1', background: '#ffffff', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer' }}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', display: 'block' }}>
                        ₦{(item.product.selling_price * item.quantity).toLocaleString()}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.product.id, item.variation?.id)}
                        style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', marginTop: '8px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Checkout Form */
            <form id="checkout-form" onSubmit={handleCheckout}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '14px', color: '#0f172a' }}>Customer Information</h4>
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="input-control" 
                  required 
                  placeholder="e.g. John Doe"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="input-control" 
                  required 
                  placeholder="john@example.com"
                  value={customerEmail}
                  onChange={e => setCustomerEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  className="input-control" 
                  placeholder="+234 800 000 0000"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>Delivery Shipping Address</label>
                <textarea 
                  className="input-control" 
                  rows="2"
                  placeholder="Street, City, State..."
                  value={shippingAddress}
                  onChange={e => setShippingAddress(e.target.value)}
                />
              </div>

              <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: '18px 0 10px 0', color: '#0f172a' }}>Payment Gateway Method</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <label style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: `2px solid ${paymentMethod === 'online_paystack' ? '#2563eb' : '#e2e8f0'}`,
                  background: paymentMethod === 'online_paystack' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="online_paystack" 
                    checked={paymentMethod === 'online_paystack'}
                    onChange={() => setPaymentMethod('online_paystack')}
                  />
                  Paystack Online Gateway
                </label>

                <label style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: `2px solid ${paymentMethod === 'cash' ? '#2563eb' : '#e2e8f0'}`,
                  background: paymentMethod === 'cash' ? '#eff6ff' : '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <input 
                    type="radio" 
                    name="payment" 
                    value="cash" 
                    checked={paymentMethod === 'cash'}
                    onChange={() => setPaymentMethod('cash')}
                  />
                  Cash / POS Terminal
                </label>
              </div>

              <div style={{
                marginTop: '16px',
                padding: '12px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                fontSize: '0.78rem',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <ShieldCheck size={18} color="#10b981" />
                Live stock verification will occur before payment authorization.
              </div>
            </form>
          )}
        </div>

        {/* Footer Subtotal & Action */}
        {cart.length > 0 && (
          <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>
                ₦{subtotal.toLocaleString()}
              </span>
            </div>

            {step === 'cart' ? (
              <button 
                onClick={() => setStep('checkout')}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '14px', fontSize: '0.95rem' }}
              >
                Proceed to Checkout
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => setStep('cart')}
                >
                  Back to Cart
                </button>
                <button 
                  type="submit" 
                  form="checkout-form"
                  className="btn btn-primary" 
                  style={{ flex: 2, padding: '14px', fontSize: '0.95rem' }}
                  disabled={processing}
                >
                  {processing ? 'Processing Payment...' : 'Complete Payment'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
