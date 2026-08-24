import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, Shield, UserCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('admin@stockpilot.com');
  const [password, setPassword] = useState('password');
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleDemoLogin = async (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password');
    setErrorMsg(null);
    try {
      await login(demoEmail, 'password');
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Demo login failed');
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(6px)',
      zIndex: 250,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '28px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '18px', top: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <Lock size={22} color="#38bdf8" />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Business Portal Access</h3>
          <p style={{ fontSize: '0.82rem', color: '#64748b' }}>Authenticate to access StockPilot management</p>
        </div>

        {errorMsg && (
          <div style={{ padding: '10px 12px', borderRadius: '8px', background: '#fef2f2', color: '#ef4444', fontSize: '0.82rem', marginBottom: '14px' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              className="input-control" 
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              className="input-control" 
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px', marginTop: '10px' }} disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In to Portal'}
          </button>
        </form>

                <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Quick Demo Login
          </span>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '10px' }}>
            <button 
              onClick={() => handleDemoLogin('admin@stockpilot.com')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}
            >
              👑 Administrator
            </button>
            <button 
              onClick={() => handleDemoLogin('sarah@stockpilot.com')}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer', color: '#0f172a' }}
            >
              🏷️ Sales Staff
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
