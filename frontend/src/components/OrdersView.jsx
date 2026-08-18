import React, { useState, useEffect } from 'react';

const OrdersView = ({ currentUser, setView }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`/api/orders/${currentUser._id}`, {
          headers: { 'Authorization': `Bearer ${currentUser.token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch orders');
        const data = await res.json();
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  if (loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  if (error) {
    return (
      <div className="glass-container" style={{ textAlign: 'center', margin: '0 auto', maxWidth: '600px' }}>
        <h2 style={{ color: '#ef4444' }}>Error</h2>
        <p>{error}</p>
        <button className="glass-btn" onClick={() => setView('products')}>Back to Products</button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="glass-container" style={{ textAlign: 'center', margin: '0 auto', maxWidth: '600px' }}>
        <h2 className="glass-title">No Orders Yet</h2>
        <p className="auth-toggle" style={{ marginTop: '2rem' }}>
          <span onClick={() => setView('products')}>Start Shopping</span>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="glass-title" style={{ marginBottom: '2rem' }}>Your Order History</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {orders.map((order) => (
          <div key={order._id} className="glass-product-card" style={{ 
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Order ID:</span>
                <div style={{ fontWeight: '600' }}>{order._id}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Date:</span>
                <div>{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              {order.items.map(item => (
                <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                  <span>{item.quantity}x {item.name}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div>
                <span style={{ padding: '0.25rem 0.75rem', borderRadius: '999px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', fontSize: '0.75rem', fontWeight: 'bold' }}>
                  {order.status}
                </span>
              </div>
              <div className="glass-title" style={{ fontWeight: 'bold', fontSize: '1.25rem', color: '#34A853' }}>
                Total: ${order.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="auth-toggle" style={{ marginTop: '2rem' }}>
        <span onClick={() => setView('products')}>&larr; Back to Products</span>
      </p>
    </div>
  );
};

export default OrdersView;
