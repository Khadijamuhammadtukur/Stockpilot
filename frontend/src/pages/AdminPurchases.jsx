import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import { useAuth } from '../context/AuthContext';
import { exportToCSV } from '../utils/exportCsv';
import { Layers, Plus, RefreshCw, Truck, UserCheck, Calendar, Clock, UserPlus, Download } from 'lucide-react';

export default function AdminPurchases() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPOModal, setShowPOModal] = useState(false);
  const [supplierMode, setSupplierMode] = useState('existing'); // 'existing' or 'new'
  const [supplierId, setSupplierId] = useState('');
  const [newSupplierName, setNewSupplierName] = useState('');
  const [supplierRepresentative, setSupplierRepresentative] = useState('');
  const [deliveryDateTime, setDeliveryDateTime] = useState('');
  const [productId, setProductId] = useState('');
  const [qtyOrdered, setQtyOrdered] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [notes, setNotes] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const pos = await apiFetch('/purchases');
      const sups = await apiFetch('/suppliers');
      const prods = await apiFetch('/products');
      setPurchases(pos);
      setSuppliers(sups);
      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = () => {
    exportToCSV(purchases, [
      { label: 'PO Number', key: 'purchase_number' },
      { label: 'Supplier Name', key: 'supplier_name' },
      { label: 'Representative', key: 'supplier_representative' },
      { label: 'Receiver Staff', key: 'staff_receiver_name' },
      { label: 'Delivery Date/Time', key: 'received_at' },
      { label: 'Total Amount (₦)', key: 'total_amount' },
      { label: 'Status', key: 'status' },
      { label: 'Notes', key: 'notes' }
    ], 'stockpilot_purchase_orders');
  };

  const handleCreatePO = async (e) => {
    e.preventDefault();
    if (!productId || !qtyOrdered || !costPrice) return;
    if (supplierMode === 'existing' && !supplierId) return;
    if (supplierMode === 'new' && !newSupplierName) return;

    try {
      await apiFetch('/purchases', {
        method: 'POST',
        body: JSON.stringify({
          supplier_id: supplierMode === 'existing' ? supplierId : null,
          new_supplier_name: supplierMode === 'new' ? newSupplierName : null,
          supplier_representative: supplierRepresentative,
          received_at: deliveryDateTime || null,
          notes,
          items: [
            {
              product_id: productId,
              qty_ordered: parseInt(qtyOrdered),
              cost_price: parseFloat(costPrice),
              selling_price: sellingPrice ? parseFloat(sellingPrice) : undefined
            }
          ]
        })
      });

      setShowPOModal(false);
      setSupplierId('');
      setNewSupplierName('');
      setSupplierRepresentative('');
      setDeliveryDateTime('');
      setProductId('');
      setQtyOrdered('');
      setCostPrice('');
      setSellingPrice('');
      setNotes('');
      fetchData();
    } catch (err) {
      alert('Error creating Purchase Order: ' + err.message);
    }
  };

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supAddress, setSupAddress] = useState('');

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    try {
      await apiFetch('/suppliers', {
        method: 'POST',
        body: JSON.stringify({
          name: supName,
          contact_person: supContact,
          email: supEmail,
          phone: supPhone,
          address: supAddress
        })
      });
      alert(`Supplier '${supName}' created successfully!`);
      setShowSupplierModal(false);
      setSupName('');
      setSupContact('');
      setSupEmail('');
      setSupPhone('');
      setSupAddress('');
      fetchData();
    } catch (err) {
      alert('Error creating supplier: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Supplier Purchase Orders</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Record new supplier shipments, delivery dates/times, representative details, and auto-increment stock</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={() => setShowSupplierModal(true)}>
            <UserPlus size={16} /> Add New Supplier
          </button>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={() => setShowPOModal(true)}>
            <Plus size={16} /> New Supplier Purchase Order
          </button>
        </div>
      </div>

            <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>PO Ref</th>
              <th>Supplier Name</th>
              <th>Delivered By (Rep)</th>
              <th>Date & Time of Delivery</th>
              <th>Receiving Staff</th>
              <th>Total Cost</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading purchase orders...</td>
              </tr>
            ) : purchases.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No purchase orders recorded yet.</td>
              </tr>
            ) : (
              purchases.map(po => (
                <tr key={po.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb' }}>{po.purchase_number}</td>
                  <td>
                    <strong style={{ fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>
                      {po.supplier_name || po.supplier?.name}
                    </strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{po.notes}</span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>
                      <Truck size={15} color="#06b6d4" />
                      {po.supplier_representative || 'N/A'}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} color="#94a3b8" />
                      {new Date(po.received_at || po.created_at).toLocaleString()}
                    </span>
                  </td>
                  <td>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#10b981' }}>
                      <UserCheck size={15} />
                      {po.staff_receiver_name || po.user?.name || 'Staff User'}
                    </span>
                  </td>
                  <td style={{ fontWeight: 800, color: '#0f172a' }}>₦{Number(po.total_amount).toLocaleString()}</td>
                  <td>
                    <span style={{ padding: '2px 8px', borderRadius: '99px', background: '#ecfdf5', color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>
                      RECEIVED & RESTOCKED
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

            {showPOModal && (
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
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '540px', padding: '28px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              New Supplier Purchase Order
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '18px' }}>
              Receiving staff: <strong style={{ color: '#10b981' }}>{user?.name || 'Logged-In Staff'}</strong>
            </p>

            <form onSubmit={handleCreatePO}>
              
                            <div className="input-group">
                <label>Supplier Selection</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setSupplierMode('existing')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: supplierMode === 'existing' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: supplierMode === 'existing' ? '#eff6ff' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      color: '#0f172a'
                    }}
                  >
                    Select Existing Supplier
                  </button>
                  <button
                    type="button"
                    onClick={() => setSupplierMode('new')}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '6px',
                      border: supplierMode === 'new' ? '2px solid #2563eb' : '1px solid #cbd5e1',
                      background: supplierMode === 'new' ? '#eff6ff' : '#ffffff',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      color: '#0f172a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <UserPlus size={15} /> Add New Supplier
                  </button>
                </div>

                {supplierMode === 'existing' ? (
                  <select className="input-control" required value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                    <option value="">Select Existing Supplier...</option>
                    {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                ) : (
                  <input 
                    type="text" 
                    className="input-control" 
                    required 
                    placeholder="Enter Brand New Supplier Company Name..."
                    value={newSupplierName}
                    onChange={e => setNewSupplierName(e.target.value)}
                  />
                )}
              </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Person Who Supplied / Delivered</label>
                  <input 
                    type="text" 
                    className="input-control" 
                    placeholder="e.g. Mr. David (Driver)" 
                    value={supplierRepresentative}
                    onChange={e => setSupplierRepresentative(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Date & Time of Delivery</label>
                  <input 
                    type="datetime-local" 
                    className="input-control" 
                    value={deliveryDateTime}
                    onChange={e => setDeliveryDateTime(e.target.value)}
                  />
                </div>
              </div>

                            <div className="input-group">
                <label>Select Product to Restock</label>
                <select 
                  className="input-control" 
                  required 
                  value={productId} 
                  onChange={e => {
                    const selectedId = e.target.value;
                    setProductId(selectedId);
                    const prod = products.find(p => String(p.id) === String(selectedId));
                    if (prod) {
                      if (prod.cost_price) setCostPrice(prod.cost_price);
                      if (prod.selling_price) setSellingPrice(prod.selling_price);
                    }
                  }}
                >
                  <option value="">Select Product...</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name} (Current Stock: {p.stock})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                <div className="input-group">
                  <label>Quantity Delivered</label>
                  <input type="number" min="1" className="input-control" required value={qtyOrdered} onChange={e => setQtyOrdered(e.target.value)} placeholder="e.g. 25" />
                </div>
                <div className="input-group">
                  <label>Cost Price (₦)</label>
                  <input type="number" step="0.01" className="input-control" required value={costPrice} onChange={e => setCostPrice(e.target.value)} placeholder="Cost price" />
                </div>
                <div className="input-group">
                  <label>Selling Price (₦)</label>
                  <input type="number" step="0.01" className="input-control" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="Selling price" />
                </div>
              </div>

              <div className="input-group">
                <label>PO Notes & Observations</label>
                <textarea className="input-control" rows="2" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Condition of goods, invoice number..." />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowPOModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Receive Stock & Save PO</button>
              </div>
            </form>
          </div>
        </div>
      )}

            {showSupplierModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(15, 23, 42, 0.65)',
          backdropFilter: 'blur(6px)',
          zIndex: 230,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div className="glass-card animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>Add New Supplier Company</h3>
            
            <form onSubmit={handleCreateSupplier}>
              <div className="input-group">
                <label>Supplier Company Name</label>
                <input className="input-control" required value={supName} onChange={e => setSupName(e.target.value)} placeholder="e.g. Apex Global Distributors Ltd" />
              </div>

              <div className="input-group">
                <label>Contact Person / Agent Name</label>
                <input className="input-control" value={supContact} onChange={e => setSupContact(e.target.value)} placeholder="e.g. Mr. David Ade" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label>Email Address</label>
                  <input type="email" className="input-control" value={supEmail} onChange={e => setSupEmail(e.target.value)} placeholder="orders@apex.com" />
                </div>
                <div className="input-group">
                  <label>Phone Number</label>
                  <input className="input-control" value={supPhone} onChange={e => setSupPhone(e.target.value)} placeholder="+234..." />
                </div>
              </div>

              <div className="input-group">
                <label>Office Address (Optional)</label>
                <input className="input-control" value={supAddress} onChange={e => setSupAddress(e.target.value)} placeholder="Lagos, Nigeria" />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={() => setShowSupplierModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save Supplier</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
