import React, { useEffect, useState } from 'react';
import { getOrderHistory } from '../../api/trading';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getOrderHistory();
        if (res && res.success && Array.isArray(res.data)) {
          setOrders(res.data);
        } else {
          setOrders([]);
          setError('No orders found.');
        }
      } catch (err) {
        setError('Failed to fetch orders.');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div style={{ background: '#fff', borderRadius: 8, boxShadow: '0 1px 6px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0', padding: 'clamp(1em, 3vw, 1.5em)' }}>
      <h3 style={{ color: '#2c3e50', marginBottom: '1em', fontSize: 'clamp(1em, 3vw, 1.2em)' }}>Order List</h3>
      {loading ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div style={{ color: '#dc3545' }}>{error}</div>
      ) : orders.length === 0 ? (
        <div>No orders found.</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'clamp(11px, 2.5vw, 13px)', minWidth: '600px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e0e0e0', background: '#f8f9fa' }}>
                <th>Order ID</th>
                <th>Symbol</th>
                <th>Type</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, idx) => (
                <tr key={order.id || idx} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td>{order.id || order.orderId || '-'}</td>
                  <td>{order.symbol || order.tradingSymbol || '-'}</td>
                  <td>{order.type || order.orderType || '-'}</td>
                  <td>{order.quantity || '-'}</td>
                  <td>{order.price || '-'}</td>
                  <td>{order.status || '-'}</td>
                  <td>{order.time || order.timestamp ? new Date(order.time || order.timestamp).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrderList; 