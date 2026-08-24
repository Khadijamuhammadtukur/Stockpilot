import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api/config';
import { 
  Package, Truck, CheckCircle2, Clock, MapPin, Search, 
  AlertCircle, ShieldCheck, User, Calendar, ChevronRight 
} from 'lucide-react';

export default function CustomerTracking() {
  const { trackingNumber: urlTracking } = useParams();
  const navigate = useNavigate();

  const [inputTracking, setInputTracking] = useState(urlTracking || '');
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTrackingInfo = async (tn) => {
    if (!tn) return;
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetch(`/storefront/tracking/${encodeURIComponent(tn)}`);
      setTrackingData(data);
    } catch (err) {
      setError(err.message || 'Tracking number not found. Please verify and try again.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (urlTracking) {
      setInputTracking(urlTracking);
      fetchTrackingInfo(urlTracking);
    }
  }, [urlTracking]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!inputTracking.trim()) return;
    navigate(`/track/${encodeURIComponent(inputTracking.trim())}`);
    fetchTrackingInfo(inputTracking.trim());
  };

  const statusSteps = [
    { key: 'processing', label: 'Order Confirmed & Processing' },
    { key: 'ready_for_dispatch', label: 'Ready for Dispatch' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'in_transit', label: 'In Transit' },
    { key: 'out_for_delivery', label: 'Out for Delivery' },
    { key: 'delivered', label: 'Delivered' },
  ];

  const getStepIndex = (currentStatus) => {
    const map = {
      pending: 0,
      processing: 1,
      ready_for_dispatch: 2,
      dispatched: 3,
      in_transit: 4,
      out_for_delivery: 5,
      delivered: 6,
    };
    return map[currentStatus] || 1;
  };

  const delivery = trackingData?.delivery;
  const currentStep = delivery ? getStepIndex(delivery.delivery_status) : 0;

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', padding: '40px 20px 80px 20px' }}>
      
      {/* Search Header */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <Package size={36} color="#2563eb" /> Track Your Package
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#64748b', marginTop: '6px' }}>
          Enter your StockPilot package tracking number below to view timestamped status updates
        </p>

        <form onSubmit={handleSearch} style={{ maxWidth: '520px', margin: '20px auto 0 auto', display: 'flex', gap: '10px' }}>
          <input 
            className="input-control" 
            placeholder="e.g. TRK-982145"
            value={inputTracking}
            onChange={e => setInputTracking(e.target.value)}
            style={{ fontSize: '1rem', padding: '12px 16px' }}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
            <Search size={18} /> Track
          </button>
        </form>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748b', fontSize: '1rem' }}>
          Retrieving live tracking details...
        </div>
      )}

      {error && (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', borderLeft: '4px solid #ef4444', marginBottom: '32px' }}>
          <AlertCircle size={32} color="#ef4444" style={{ margin: '0 auto 10px auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>Tracking Error</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '4px' }}>{error}</p>
        </div>
      )}

      {delivery && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Status Header Card */}
          <div className="glass-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', uppercase: 'true', letterSpacing: '0.05em', fontWeight: 700 }}>TRACKING NUMBER</span>
                <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38bdf8', marginTop: '2px' }}>{delivery.tracking_number}</h2>
                <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
                  Order Reference: <strong>{delivery.order?.order_number}</strong>
                </div>
              </div>

              {/* GPS Status Notice Badge */}
              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '12px', padding: '10px 16px', textAlign: 'right' }}>
                <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, uppercase: 'true', display: 'block' }}>GPS LOCATION STATUS</span>
                <strong style={{ fontSize: '0.85rem', color: '#ffffff' }}>Live GPS Tracking — Coming Soon</strong>
              </div>
            </div>
          </div>

          {/* Progress Timeline Stepper */}
          <div className="glass-card" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Truck size={20} color="#2563eb" /> Fulfillment Status Timeline
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', position: 'relative' }}>
              {statusSteps.map((step, idx) => {
                const isPassed = idx + 1 <= currentStep;
                const isCurrent = idx + 1 === currentStep;

                return (
                  <div key={step.key} style={{ textAlign: 'center', padding: '12px 8px', borderRadius: '10px', background: isCurrent ? '#eff6ff' : isPassed ? '#f8fafc' : '#ffffff', border: isCurrent ? '2px solid #2563eb' : '1px solid #e2e8f0' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: isPassed ? '#2563eb' : '#cbd5e1',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 8px auto',
                      fontWeight: 800,
                      fontSize: '0.8rem'
                    }}>
                      {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? '#2563eb' : isPassed ? '#0f172a' : '#94a3b8' }}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recipient & Package Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Address & Recipient Card */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={18} color="#2563eb" /> Delivery Address
              </h4>

              <div style={{ fontSize: '0.85rem', color: '#334155', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Recipient: <strong style={{ color: '#0f172a' }}>{delivery.address?.recipient_name || delivery.order?.customer_name}</strong></div>
                <div>Phone: <strong style={{ color: '#0f172a' }}>{delivery.address?.phone || delivery.order?.customer_phone || 'N/A'}</strong></div>
                <div>Address: <strong style={{ color: '#0f172a' }}>{delivery.address?.address}</strong></div>
                {delivery.address?.city && <div>City/State: {delivery.address.city}, {delivery.address.state}</div>}
                <div>Delivery Zone: <strong>{delivery.zone?.name || 'Standard Region'}</strong></div>
              </div>
            </div>

            {/* Timeline Log History */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="#2563eb" /> Timestamped Audit History
              </h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
                {delivery.status_histories?.map((h, hIdx) => (
                  <div key={hIdx} style={{ padding: '8px 12px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '0.78rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#0f172a', fontWeight: 700 }}>
                      <span style={{ textTransform: 'capitalize' }}>{h.status.replace(/_/g, ' ')}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>{new Date(h.exact_timestamp || h.created_at).toLocaleString()}</span>
                    </div>
                    <div style={{ color: '#64748b', marginTop: '2px' }}>{h.note}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
