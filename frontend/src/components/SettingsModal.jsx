import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiFetch } from '../api/config';
import { X, User, Mail, Lock, CheckCircle2, Shield } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const { user, login } = useAuth();
  const [name, setName] = useState(user?.name || 'Chief Operations');
  const [email, setEmail] = useState(user?.email || 'admin@stockpilot.com');
  const [phone, setPhone] = useState(user?.phone || '+234 801 234 5678');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage(null);

    try {
      const res = await apiFetch('/auth/profile', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          phone,
          new_password: newPassword || null,
        })
      });

      setMessage({ type: 'success', text: res.message });
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error updating credentials.' });
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
      zIndex: 260,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '460px', padding: '28px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '18px', top: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Shield size={22} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>Account & Security Settings</h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Update email address, name, or change password</p>
          </div>
        </div>

        {message && (
          <div style={{
            padding: '10px 12px',
            borderRadius: '8px',
            background: message.type === 'error' ? '#fef2f2' : '#ecfdf5',
            color: message.type === 'error' ? '#ef4444' : '#10b981',
            fontSize: '0.82rem',
            marginBottom: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <CheckCircle2 size={16} />
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Full Name</label>
            <input 
              type="text" 
              className="input-control" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>

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
            <label>Phone Number</label>
            <input 
              type="text" 
              className="input-control" 
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>New Password (Leave blank to keep current password)</label>
            <input 
              type="password" 
              className="input-control" 
              placeholder="Min 6 characters..."
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submitting}>
              {submitting ? 'Updating...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
