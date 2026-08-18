import { useState, useEffect } from 'react';
import Login from './components/Login';
import Register from './components/Register';
import CartView from './components/CartView';
import OrdersView from './components/OrdersView';
import AdminPortal from './components/AdminPortal';
import './index.css';

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentView, setCurrentView] = useState('products');
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [cart, setCart] = useState(null);

  useEffect(() => {
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Fetch cart when user logs in
  useEffect(() => {
    if (currentUser && currentUser.token) {
      fetch(`/api/cart/${currentUser._id}`, {
        headers: { 'Authorization': `Bearer ${currentUser.token}` }
      })
        .then(res => res.json())
        .then(data => setCart(data))
        .catch(err => console.error('Failed to fetch cart:', err));
    } else {
      setCart(null);
    }
  }, [currentUser]);

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentView('products');
  };

  const addToCart = async (productId) => {
    if (!currentUser) {
      setCurrentView('login');
      return;
    }
    
    try {
      const res = await fetch(`/api/cart/${currentUser._id}/add`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      if (!res.ok) throw new Error('Failed to add to cart');
      const updatedCart = await res.json();
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
      alert('Error adding item to cart.');
    }
  };

  const removeFromCart = async (productId) => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/cart/${currentUser._id}/remove`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({ productId })
      });
      if (!res.ok) throw new Error('Failed to remove from cart');
      const updatedCart = await res.json();
      setCart(updatedCart);
    } catch (err) {
      console.error(err);
    }
  };

  const clearCart = () => {
    if (cart) {
      setCart({ ...cart, items: [] });
    }
  };

  const cartItemsCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  const renderContent = () => {
    if (currentView === 'login') {
      return <Login setView={setCurrentView} setCurrentUser={setCurrentUser} />;
    }
    if (currentView === 'register') {
      return <Register setView={setCurrentView} setCurrentUser={setCurrentUser} />;
    }
    if (currentView === 'cart') {
      if (!currentUser) {
        setCurrentView('login');
        return null;
      }
      return <CartView cart={cart} products={products} removeFromCart={removeFromCart} clearCart={clearCart} setView={setCurrentView} currentUser={currentUser} />;
    }
    if (currentView === 'orders') {
      if (!currentUser) {
        setCurrentView('login');
        return null;
      }
      return <OrdersView currentUser={currentUser} setView={setCurrentView} />;
    }
    if (currentView === 'admin') {
      if (!currentUser || currentUser.role !== 'admin') {
        setCurrentView('login');
        return null;
      }
      return <AdminPortal currentUser={currentUser} setView={setCurrentView} products={products} setProducts={setProducts} />;
    }

    return (
      <>
        {loading ? (
          <div className="loading">Loading products...</div>
        ) : error ? (
          <div style={{ color: 'var(--danger-color)', textAlign: 'center', padding: '2rem' }}>
            <h2>Error loading products</h2>
            <p>{error}</p>
            <p style={{ fontSize: '0.875rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
              (Make sure your Product Service and MongoDB are running locally!)
            </p>
          </div>
        ) : products.length === 0 ? (
          <div className="loading">No products found. Add some to your database!</div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card glass-product-card">
                <img src={product.imageUrl || 'https://via.placeholder.com/400x300'} alt={product.name} className="product-image" />
                <div className="product-info">
                  <div className="product-category" style={{color: '#34A853'}}>{product.category}</div>
                  <h3 className="product-name glass-title">{product.name}</h3>
                  <p className="product-description" style={{color: '#333'}}>{product.description}</p>
                  <div className="product-footer">
                    <span className="product-price glass-title">${product.price.toFixed(2)}</span>
                    <button className="add-to-cart-btn glass-btn" onClick={() => addToCart(product._id)}>Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="dashboard-page">
      <div className={currentView === 'login' || currentView === 'register' ? "" : "app-container"}>
        {currentView !== 'login' && currentView !== 'register' && (
          <header className="glass-navbar">
            <div className="logo" onClick={() => setCurrentView('products')} style={{cursor: 'pointer', color: '#000', background: 'none', WebkitTextFillColor: 'initial'}}>LuminaStore</div>
            <nav className="nav-links">
              <a href="#home" style={{color: '#333', fontWeight: '600'}} onClick={(e) => { e.preventDefault(); setCurrentView('products'); }}>Home</a>
              <a href="#products" style={{color: '#333', fontWeight: '600'}} onClick={(e) => { e.preventDefault(); setCurrentView('products'); }}>Products</a>
              <a href="#cart" style={{color: '#333', fontWeight: '600'}} onClick={(e) => { e.preventDefault(); setCurrentView('cart'); }}>Cart ({cartItemsCount})</a>
              {currentUser ? (
                <>
                  <a href="#orders" style={{color: '#333', fontWeight: '600'}} onClick={(e) => { e.preventDefault(); setCurrentView('orders'); }}>Orders</a>
                  {currentUser.role === 'admin' && (
                    <a href="#admin" style={{color: '#10b981', fontWeight: '700'}} onClick={(e) => { e.preventDefault(); setCurrentView('admin'); }}>Admin Portal</a>
                  )}
                  <span style={{color: '#000', fontWeight: '700'}}>Hi, {currentUser.name}</span>
                  <a href="#logout" style={{color: '#ef4444', fontWeight: '600'}} onClick={(e) => { e.preventDefault(); handleLogout(); }}>Logout</a>
                </>
              ) : (
                <>
                  <a href="#login" style={{color: '#333', fontWeight: '600'}} onClick={(e) => { e.preventDefault(); setCurrentView('login'); }}>Login</a>
                  <a href="#register" style={{color: '#333', fontWeight: '600'}} onClick={(e) => { e.preventDefault(); setCurrentView('register'); }}>Register</a>
                </>
              )}
            </nav>
          </header>
        )}

      <main>
        {renderContent()}
      </main>
    </div>
    </div>
  );
}

export default App;
