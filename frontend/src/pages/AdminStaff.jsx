import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, Shield, UserCheck, RefreshCw, KeyRound, Lock, ArrowRightLeft } from 'lucide-react';

export default function AdminStaff() {
  const { user, switchUserContext } = useAuth();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleId, setRoleId] = useState('2'); // default sales_staff
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password');

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/admin/users');
      setStaffList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await apiFetch('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          role_id: parseInt(roleId),
          phone,
          password
        })
      });

      alert(res.message);
      setShowModal(false);
      setName('');
      setEmail('');
      setPhone('');
      setPassword('password');
      fetchStaff();
    } catch (err) {
      alert('Error creating staff account: ' + err.message);
    }
  };

  const handleSwitchUser = async (targetUser) => {
    if (!window.confirm(`Switch session context to ${targetUser.name} (${targetUser.role?.display_name || targetUser.role?.name})?`)) {
      return;
    }

    try {
      const res = await apiFetch('/admin/switch-user', {
        method: 'POST',
        body: JSON.stringify({ user_id: targetUser.id })
      });

      switchUserContext(res.user, res.token);
      alert(res.message);
    } catch (err) {
      alert('Error switching user: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Staff Accounts & Access Management</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Manage staff credentials, role-based access, and switch active user sessions</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchStaff}>
            <RefreshCw size={16} /> Refresh Staff List
          </button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <UserPlus size={16} /> Add New Staff Member
          </button>
        </div>
      </div>

            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Shield size={24} color="#38bdf8" />
          <div>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700 }}>Active Logged-In User Session</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{user?.name} ({user?.email})</h3>
          </div>
        </div>
        <span style={{ padding: '4px 12px', borderRadius: '99px', background: '#38bdf8', color: '#0f172a', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
          Role: {user?.role?.display_name || user?.role?.name || 'Administrator'}
        </span>
      </div>

            <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Staff Name</th>
              <th>Email Address</th>
              <th>Assigned Role</th>
              <th>Phone Number</th>
              <th>Default Password</th>
              <th style={{ textAlign: 'right' }}>Session Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>Loading staff users...</td></tr>
            ) : staffList.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '30px' }}>No staff users recorded.</td></tr>
            ) : (
              staffList.map(s => (
                <tr key={s.id}>
                  <td>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a' }}>{s.name}</strong>
                    {s.id === user?.id && (
                      <span style={{ marginLeft: '8px', fontSize: '0.7rem', padding: '2px 6px', borderRadius: '4px', background: '#ecfdf5', color: '#10b981', fontWeight: 700 }}>
                        CURRENT SESSION
                      </span>
                    )}
                  </td>
                  <td style={{ color: '#2563eb', fontWeight: 600 }}>{s.email}</td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '99px',
                      background: s.role?.name === 'admin' ? '#eff6ff' : '#f8fafc',
                      color: s.role?.name === 'admin' ? '#2563eb' : '#475569',
                      fontWeight: 700,
                      fontSize: '0.78rem',
                      textTransform: 'capitalize'
                    }}>
                      {s.role?.display_name || s.role?.name || 'Staff'}
                    </span>
                  </td>
                  <td style={{ color: '#64748b' }}>{s.phone || 'N/A'}</td>
                  <td><code>password</code></td>
                  <td style={{ textAlign: 'right' }}>
                    {s.id === user?.id ? (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 700 }}>Active</span>
                    ) : (
                      <button 
                        onClick={() => handleSwitchUser(s)}
                        className="btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      >
                        <ArrowRightLeft size={14} /> Switch to User
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

            {showModal && (
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
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Add New Staff Account</h3>
            
            <form onSubmit={handleCreateStaff}>
              <div className="input-group">
                <label>Full Name</label>
                <input className="input-control" required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Alex Morgan" />
              </div>

              <div className="input-group">
                <label>Email Address</label>
                <input type="email" className="input-control" required value={email} onChange={e => setEmail(e.target.value)} placeholder="alex@stockpilot.com" />
              </div>

              <div className="input-group">
                <label>Assigned Role</label>
                <select className="input-control" value={roleId} onChange={e => setRoleId(e.target.value)}>
                  <option value="1">Administrator (Full Access)</option>
                  <option value="2">Sales Staff (POS & Orders)</option>
                  <option value="3">Inventory Staff (Stock & Restocks)</option>
                  <option value="4">Manager</option>
                </select>
              </div>

              <div className="input-group">
                <label>Phone Number (Optional)</label>
                <input className="input-control" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234..." />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" className="input-control" required value={password} onChange={e => setPassword(e.target.value)} placeholder="password" />
                <small style={{ fontSize: '0.72rem', color: '#64748b' }}>Standard default password is set to <code>password</code></small>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Create Staff User</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
