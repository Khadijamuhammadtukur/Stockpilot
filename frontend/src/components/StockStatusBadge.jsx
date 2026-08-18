import React from 'react';

export default function StockStatusBadge({ status, stock, minStock }) {
  if (stock <= 0 || status === 'out_of_stock') {
    return <span className="badge badge-out">Out of Stock ({stock})</span>;
  }
  if (stock <= 2 || status === 'critical_stock') {
    return <span className="badge badge-critical">Critical ({stock} left)</span>;
  }
  if (stock <= (minStock || 5) || status === 'low_stock') {
    return <span className="badge badge-low">Low Stock ({stock})</span>;
  }
  return <span className="badge badge-healthy">In Stock ({stock})</span>;
}
