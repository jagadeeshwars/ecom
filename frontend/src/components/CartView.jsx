import React, { useState } from 'react';

const CartView = ({ cart, products, removeFromCart, clearCart, setView, currentUser }) => {
  const [checkingOut, setCheckingOut] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Calculate cart details
  let total = 0;
  const cartItems = (cart?.items || []).map(item => {
    const product = products.find(p => p._id === item.productId);
    if (product) {
      total += product.price * item.quantity;
      return { ...item, product };
    }
    return item;
  }).filter(item => item.product); // only show valid products

  const handleCheckout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      const orderItems = cartItems.map(item => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));

      const res = await fetch('/api/orders/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          userId: currentUser._id,
          items: orderItems,
          totalAmount: total
        })
      });

      if (!res.ok) {
        throw new Error('Checkout failed');
      }

      await clearCart();
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setCheckingOut(false);
    }
  };

  if (success) {
    return (
      <div className="glass-container" style={{ textAlign: 'center', borderColor: '#10b981', margin: '0 auto', maxWidth: '600px' }}>
        <h2 style={{ color: '#10b981' }}>Order Successful!</h2>
        <p style={{ marginBottom: '2rem', color: '#666' }}>Thank you for your purchase.</p>
        <button className="glass-btn" onClick={() => setView('products')}>
          Continue Shopping
        </button>
      </div>
    );
  }

  // If cart is empty
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="glass-container" style={{ textAlign: 'center', margin: '0 auto', maxWidth: '600px' }}>
        <h2 className="glass-title">Your Cart is Empty</h2>
        <p className="auth-toggle" style={{ marginTop: '2rem' }}>
          <span onClick={() => setView('products')}>Continue Shopping</span>
        </p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 className="glass-title" style={{ marginBottom: '2rem' }}>Your Shopping Cart</h2>
      
      {error && <div className="auth-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
        {cartItems.map((item) => (
          <div key={item.productId} className="glass-product-card" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img 
                src={item.product.imageUrl || 'https://via.placeholder.com/100'} 
                alt={item.product.name} 
                style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
              />
              <div>
                <h3 className="glass-title" style={{ margin: '0 0 0.5rem 0' }}>{item.product.name}</h3>
                <p style={{ color: '#333', margin: 0 }}>Quantity: {item.quantity}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
              <div className="glass-title" style={{ fontSize: '1.25rem' }}>
                ${(item.product.price * item.quantity).toFixed(2)}
              </div>
              <button 
                className="add-to-cart-btn" 
                style={{ backgroundColor: '#ef4444', color: '#fff' }}
                onClick={() => removeFromCart(item.productId)}
                disabled={checkingOut}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-container" style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '2rem',
        borderColor: 'rgba(46, 162, 85, 0.5)'
      }}>
        <h2 className="glass-title" style={{ margin: 0 }}>Total: ${total.toFixed(2)}</h2>
        <button 
          className="glass-btn" 
          style={{ margin: 0, padding: '1rem 3rem' }} 
          onClick={handleCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? 'Processing...' : 'Checkout'}
        </button>
      </div>

      <p className="auth-toggle" style={{ marginTop: '2rem' }}>
        <span onClick={() => setView('products')}>&larr; Continue Shopping</span>
      </p>
    </div>
  );
};

export default CartView;
