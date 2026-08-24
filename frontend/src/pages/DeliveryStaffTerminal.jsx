import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { Truck, PackageCheck, MapPin, Clock, User, CheckCircle2, Navigation, AlertCircle } from 'lucide-react';

export default function DeliveryStaffTerminal() {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');

  const fetchMyDeliveries = async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/deliveries/my-deliveries');
      setDeliveries(data || []);
    } catch (err) {
      console.error('Error fetching courier deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyDeliveries();
  }, []);

  const handleUpdateStatus = async (deliveryId, status) => {
    try {
      await apiFetch(`/deliveries/${deliveryId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          note: note || `Status updated by courier ${user?.name || 'Driver'}.`,
        }),
      });
      alert(`Package status updated to '${status.replace(/_/g, ' ')}'!`);
      setNote('');
      fetchMyDeliveries();
    } catch (err) {
      alert('Error updating package status: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '24px 16px 80px 16px' }}>
      
            <div className="glass-card" style={{ padding: '20px', marginBottom: '24px', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: '#a5b4fc', uppercase: 'true', fontWeight: 800 }}>COURIER DISPATCH TERMINAL</span>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#ffffff', marginTop: '2px' }}>
              Welcome, {user?.name || 'Delivery Staff'}
            </h2>
            <div style={{ fontSize: '0.8rem', color: '#c7d2fe', marginTop: '4px' }}>
              Assigned Packages: <strong>{deliveries.length}</strong>
            </div>
          </div>
          <Truck size={36} color="#818cf8" />
        </div>
      </div>

            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <PackageCheck size={20} color="#2563eb" /> Active Assigned Deliveries
      </h3>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading assigned deliveries...</div>
      ) : deliveries.length === 0 ? (
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center', color: '#64748b' }}>
          No deliveries currently assigned to your account.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {deliveries.map(d => (
            <div key={d.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>TRACKING</span>
                  <h4 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2563eb' }}>{d.tracking_number}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Order: <strong>{d.order?.order_number}</strong></div>
                </div>

                <span style={{
                  padding: '4px 10px',
                  borderRadius: '99px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  background: d.delivery_status === 'delivered' ? '#dcfce7' : '#e0f2fe',
                  color: d.delivery_status === 'delivered' ? '#15803d' : '#0369a1',
                  textTransform: 'uppercase'
                }}>
                  {d.delivery_status.replace(/_/g, ' ')}
                </span>
              </div>

                            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px', fontSize: '0.85rem' }}>
                <div style={{ fontWeight: 800, color: '#0f172a' }}>Recipient: {d.address?.recipient_name || d.order?.customer_name}</div>
                <div style={{ color: '#2563eb', fontWeight: 700 }}>Phone: {d.address?.phone || d.order?.customer_phone || 'N/A'}</div>
                <div style={{ color: '#475569', marginTop: '4px' }}>Address: {d.address?.address}</div>
              </div>

                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                  onClick={() => handleUpdateStatus(d.id, 'out_for_delivery')}
                >
                  Out for Delivery
                </button>
                <button 
                  className="btn btn-primary" 
                  style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                  onClick={() => handleUpdateStatus(d.id, 'delivered')}
                >
                  <CheckCircle2 size={16} /> Mark Delivered
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
