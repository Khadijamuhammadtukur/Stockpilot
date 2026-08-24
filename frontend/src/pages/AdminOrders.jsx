import React, { useState, useEffect } from 'react';
import { apiFetch } from '../api/config';
import ReceiptModal from '../components/ReceiptModal';
import { exportToCSV } from '../utils/exportCsv';
import { ShoppingBag, Search, Eye, RefreshCw, CheckCircle2, Clock, Download } from 'lucide-react';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let url = `/orders?search=${encodeURIComponent(search)}`;
      if (statusFilter !== 'all') url += `&order_status=${statusFilter}`;
      const data = await apiFetch(url);
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter]);

  const handleExportCSV = () => {
    exportToCSV(orders, [
      { label: 'Order Number', key: 'order_number' },
      { label: 'Customer Name', key: 'customer_name' },
      { label: 'Total Amount (₦)', key: 'total_amount' },
      { label: 'Gross Profit (₦)', key: 'gross_profit' },
      { label: 'Payment Status', key: 'payment_status' },
      { label: 'Order Status', key: 'order_status' },
      { label: 'Date', key: 'created_at' }
    ], 'stockpilot_customer_orders');
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiFetch(`/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ order_status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 20px 60px 20px' }}>
      
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a' }}>Sales & Orders Pipeline</h1>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>Monitor customer online orders, POS sales, order fulfillment, and receipts</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-secondary" onClick={fetchOrders}>
            <RefreshCw size={16} /> Refresh Orders
          </button>
        </div>
      </div>

            <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: '260px' }}>
          <Search size={18} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search by order number or customer name..."
            className="input-control" 
            style={{ margin: 0 }}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b' }}>Order Pipeline Status:</label>
          <select 
            className="input-control" 
            style={{ width: 'auto', margin: 0 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

            <div className="custom-table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Order Ref</th>
              <th>Customer</th>
              <th>Date & Time</th>
              <th>Payment</th>
              <th>Total Amount</th>
              <th>Pipeline Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>Loading orders...</td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No orders found.</td>
              </tr>
            ) : (
              orders.map(order => (
                <tr key={order.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 800, color: '#2563eb' }}>{order.order_number}</td>
                  <td>
                    <strong style={{ fontSize: '0.88rem', color: '#0f172a', display: 'block' }}>{order.customer_name}</strong>
                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{order.customer_email}</span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                    {new Date(order.created_at).toLocaleString()}
                  </td>
                  <td>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '99px',
                      background: order.payment_status === 'paid' ? '#ecfdf5' : '#fffbeb',
                      color: order.payment_status === 'paid' ? '#10b981' : '#f59e0b',
                      fontWeight: 700,
                      fontSize: '0.75rem'
                    }}>
                      {order.payment_method?.toUpperCase()} ({order.payment_status})
                    </span>
                  </td>
                  <td style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a' }}>
                    ₦{Number(order.total_amount).toLocaleString()}
                  </td>
                  <td>
                    <select 
                      value={order.order_status}
                      onChange={e => handleUpdateStatus(order.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        background: '#ffffff',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="ready">Ready</option>
                      <option value="shipped">Shipped</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => setSelectedReceiptOrder(order)}
                      className="btn btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    >
                      <Eye size={14} /> Receipt
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

            {selectedReceiptOrder && (
        <ReceiptModal 
          order={selectedReceiptOrder} 
          onClose={() => setSelectedReceiptOrder(null)} 
        />
      )}

    </div>
  );
}
