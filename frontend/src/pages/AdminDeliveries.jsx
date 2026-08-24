import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { useCart } from '../context/CartContext';
import { 
  Truck, PackageCheck, Clock, MapPin, User, Search, Filter, 
  Plus, Edit, CheckCircle2, AlertCircle, Calendar, ShieldCheck, ArrowRight 
} from 'lucide-react';

export default function AdminDeliveries() {
  const { showToast } = useCart();
  const [deliveries, setDeliveries] = useState([]);
  const [zones, setZones] = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [zoneFilter, setZoneFilter] = useState('');

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [statusModal, setStatusModal] = useState(false);
  const [assignModal, setAssignModal] = useState(false);
  const [zoneModal, setZoneModal] = useState(false);

  const [newStatus, setNewStatus] = useState('processing');
  const [statusNote, setStatusNote] = useState('');
  const [estimatedDate, setEstimatedDate] = useState('');
  const [assignedStaffId, setAssignedStaffId] = useState('');

  const [zoneName, setZoneName] = useState('');
  const [zoneRegion, setZoneRegion] = useState('');
  const [standardFee, setStandardFee] = useState('1500');
  const [expressFee, setExpressFee] = useState('3000');
  const [estimatedTime, setEstimatedTime] = useState('1-2 Business Days');

  const fetchData = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter) queryParams.append('status', statusFilter);
      if (zoneFilter) queryParams.append('zone_id', zoneFilter);

      const [dData, zData, uData] = await Promise.all([
        apiFetch(`/deliveries?${queryParams.toString()}`),
        apiFetch('/delivery-zones'),
        apiFetch('/admin/users'),
      ]);

      setDeliveries(dData || []);
      setZones(zData || []);
      setCouriers(uData?.filter(u => u.role?.name === 'delivery_staff' || u.role?.name === 'admin' || u.role?.name === 'sales_staff') || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search, statusFilter, zoneFilter]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedDelivery) return;
    try {
      await apiFetch(`/deliveries/${selectedDelivery.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          note: statusNote,
          estimated_delivery_date: estimatedDate || null,
        }),
      });
      showToast(`Delivery status updated to '${newStatus.replace(/_/g, ' ')}'!`);
      setStatusModal(false);
      setSelectedDelivery(null);
      setStatusNote('');
      fetchData();
    } catch (err) {
      showToast('Error updating status: ' + err.message, 'error');
    }
  };

  const handleAssignStaff = async (e) => {
    e.preventDefault();
    if (!selectedDelivery || !assignedStaffId) return;
    try {
      await apiFetch(`/deliveries/${selectedDelivery.id}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assigned_to: assignedStaffId }),
      });
      showToast('Delivery staff assigned successfully!');
      setAssignModal(false);
      setSelectedDelivery(null);
      fetchData();
    } catch (err) {
      showToast('Error assigning courier: ' + err.message, 'error');
    }
  };

  const handleCreateZone = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/delivery-zones', {
        method: 'POST',
        body: JSON.stringify({
          name: zoneName,
          city_region: zoneRegion,
          standard_fee: parseFloat(standardFee),
          express_fee: parseFloat(expressFee),
          estimated_delivery_time: estimatedTime,
        }),
      });
      showToast(`Delivery zone '${zoneName}' created successfully!`);
      setZoneModal(false);
      setZoneName('');
      setZoneRegion('');
      fetchData();
    } catch (err) {
      showToast('Error creating zone: ' + err.message, 'error');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: '#fef3c7', color: '#b45309', label: 'Pending' },
      processing: { bg: '#e0f2fe', color: '#0369a1', label: 'Processing' },
      ready_for_dispatch: { bg: '#fae8ff', color: '#86198f', label: 'Ready for Dispatch' },
      dispatched: { bg: '#e0e7ff', color: '#3730a3', label: 'Dispatched' },
      in_transit: { bg: '#ddd6fe', color: '#5b21b6', label: 'In Transit' },
      out_for_delivery: { bg: '#fed7aa', color: '#c2410c', label: 'Out for Delivery' },
      delivered: { bg: '#dcfce7', color: '#15803d', label: 'Delivered' },
      delivery_failed: { bg: '#fee2e2', color: '#b91c1c', label: 'Delivery Failed' },
      cancelled: { bg: '#f3f4f6', color: '#4b5563', label: 'Cancelled' },
    };
    const b = badges[status] || { bg: '#f3f4f6', color: '#4b5563', label: status };
    return (
      <span style={{
        background: b.bg,
        color: b.color,
        padding: '4px 10px',
        borderRadius: '99px',
        fontSize: '0.75rem',
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: '0.03em'
      }}>
        {b.label}
      </span>
    );
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={28} color="#2563eb" /> Delivery & Logistics Management
          </h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '2px' }}>
            Track package dispatches, assign couriers, manage delivery zones, and monitor timestamped fulfillment history
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setZoneModal(true)}>
            <MapPin size={16} /> Configure Delivery Zones
          </button>
          <button className="btn btn-primary" onClick={fetchData}>
            <PackageCheck size={16} /> Refresh Logistics
          </button>
        </div>
      </div>

            <div className="glass-card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            className="input-control" 
            style={{ paddingLeft: '36px' }}
            placeholder="Search tracking number, recipient, address..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        <div style={{ width: '180px' }}>
          <select className="input-control" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Delivery Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="ready_for_dispatch">Ready for Dispatch</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="delivery_failed">Delivery Failed</option>
          </select>
        </div>

        <div style={{ width: '180px' }}>
          <select className="input-control" value={zoneFilter} onChange={e => setZoneFilter(e.target.value)}>
            <option value="">All Zones</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
          </select>
        </div>
      </div>

            <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Loading logistics data...</div>
        ) : deliveries.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>No delivery records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '14px 16px' }}>Tracking Number & Method</th>
                  <th style={{ padding: '14px 16px' }}>Recipient & Destination</th>
                  <th style={{ padding: '14px 16px' }}>Zone & Fee</th>
                  <th style={{ padding: '14px 16px' }}>Assigned Courier</th>
                  <th style={{ padding: '14px 16px' }}>Delivery Status</th>
                  <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 800, color: '#2563eb', fontSize: '0.9rem' }}>{d.tracking_number}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Order: <strong>{d.order?.order_number}</strong> • Method: <span style={{ textTransform: 'capitalize' }}>{d.delivery_method}</span></div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.address?.recipient_name || d.order?.customer_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Phone: {d.address?.phone || d.order?.customer_phone || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>{d.address?.address}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>{d.zone?.name || 'Standard Region'}</div>
                      <div style={{ fontWeight: 800, color: '#10b981' }}>₦{Number(d.delivery_fee || 0).toLocaleString()}</div>
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {d.courier ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <User size={14} color="#2563eb" />
                          <span style={{ fontWeight: 700, color: '#0f172a' }}>{d.courier.name}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>

                    <td style={{ padding: '14px 16px' }}>
                      {getStatusBadge(d.delivery_status)}
                    </td>

                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button 
                          className="btn btn-secondary" 
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          onClick={() => { setSelectedDelivery(d); setAssignModal(true); }}
                        >
                          Assign Courier
                        </button>
                        <button 
                          className="btn btn-primary" 
                          style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                          onClick={() => { setSelectedDelivery(d); setNewStatus(d.delivery_status); setStatusModal(true); }}
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

            {statusModal && selectedDelivery && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Update Delivery Status ({selectedDelivery.tracking_number})
            </h3>
            
            <form onSubmit={handleUpdateStatus}>
              <div className="input-group">
                <label>Target Delivery Status</label>
                <select className="input-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="ready_for_dispatch">Ready for Dispatch</option>
                  <option value="dispatched">Dispatched</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered (Final)</option>
                  <option value="delivery_failed">Delivery Failed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="input-group">
                <label>Estimated Delivery Date</label>
                <input type="date" className="input-control" value={estimatedDate} onChange={e => setEstimatedDate(e.target.value)} />
              </div>

              <div className="input-group">
                <label>Status Update Note / Observation</label>
                <textarea className="input-control" rows="2" placeholder="e.g. Package dispatched via van #3..." value={statusNote} onChange={e => setStatusNote(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setStatusModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Status Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

            {assignModal && selectedDelivery && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Assign Courier Staff
            </h3>
            
            <form onSubmit={handleAssignStaff}>
              <div className="input-group">
                <label>Select Delivery Staff Member</label>
                <select className="input-control" required value={assignedStaffId} onChange={e => setAssignedStaffId(e.target.value)}>
                  <option value="">-- Choose Courier --</option>
                  {couriers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setAssignModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Assign Courier</button>
              </div>
            </form>
          </div>
        </div>
      )}

            {zoneModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)', zIndex: 230, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Add New Delivery Zone
            </h3>
            
            <form onSubmit={handleCreateZone}>
              <div className="input-group">
                <label>Zone Name</label>
                <input className="input-control" required placeholder="e.g. Island Express Zone" value={zoneName} onChange={e => setZoneName(e.target.value)} />
              </div>

              <div className="input-group">
                <label>City / Covered Region</label>
                <input className="input-control" required placeholder="e.g. Victoria Island, Lekki, Ikoyi" value={zoneRegion} onChange={e => setZoneRegion(e.target.value)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Standard Fee (₦)</label>
                  <input type="number" step="0.01" className="input-control" required value={standardFee} onChange={e => setStandardFee(e.target.value)} />
                </div>
                <div className="input-group">
                  <label>Express Fee (₦)</label>
                  <input type="number" step="0.01" className="input-control" value={expressFee} onChange={e => setExpressFee(e.target.value)} />
                </div>
              </div>

              <div className="input-group">
                <label>Estimated Delivery Time</label>
                <input className="input-control" placeholder="1-2 Business Days" value={estimatedTime} onChange={e => setEstimatedTime(e.target.value)} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setZoneModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Delivery Zone</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
