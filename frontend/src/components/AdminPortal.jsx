import React, { useState } from 'react';

const AdminPortal = ({ currentUser, setView, products, setProducts }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    imageUrl: ''
  });

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price)
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to add product');
      }

      const addedProduct = await res.json();
      setProducts([...products, addedProduct]);
      setSuccess('Product added successfully!');
      setNewProduct({ name: '', description: '', price: '', category: '', imageUrl: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 
          'Authorization': `Bearer ${currentUser.token}`
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete product');
      }

      setProducts(products.filter(p => p._id !== productId));
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '2rem' }}>
      <h2 className="glass-title" style={{ marginBottom: '2rem' }}>Admin Portal</h2>

      {/* Add Product Form */}
      <div className="glass-container" style={{ marginBottom: '3rem' }}>
        <h3 className="glass-title" style={{ marginBottom: '1.5rem' }}>Add New Product</h3>
        {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}
        {success && <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{success}</div>}
        
        <form onSubmit={handleAddProduct} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div className="login-input-group" style={{ marginBottom: 0 }}>
            <input 
              type="text" 
              placeholder="Product Name" 
              value={newProduct.name} 
              onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              required 
            />
          </div>
          <div className="login-input-group" style={{ marginBottom: 0 }}>
            <input 
              type="number" 
              step="0.01"
              placeholder="Price" 
              value={newProduct.price} 
              onChange={e => setNewProduct({...newProduct, price: e.target.value})}
              required 
            />
          </div>
          <div className="login-input-group" style={{ marginBottom: 0 }}>
            <input 
              type="text" 
              placeholder="Category" 
              value={newProduct.category} 
              onChange={e => setNewProduct({...newProduct, category: e.target.value})}
              required 
            />
          </div>
          <div className="login-input-group" style={{ marginBottom: 0 }}>
            <input 
              type="text" 
              placeholder="Image URL" 
              value={newProduct.imageUrl} 
              onChange={e => setNewProduct({...newProduct, imageUrl: e.target.value})}
            />
          </div>
          <div className="login-input-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
            <input 
              type="text" 
              placeholder="Description" 
              value={newProduct.description} 
              onChange={e => setNewProduct({...newProduct, description: e.target.value})}
              required 
            />
          </div>
          <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
            <button type="submit" className="glass-btn" style={{ padding: '0.75rem 2rem' }} disabled={loading}>
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>

      {/* Product List */}
      <h3 className="glass-title" style={{ marginBottom: '1.5rem' }}>Manage Products</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {products.map(product => (
          <div key={product._id} className="glass-product-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 1.5rem', marginBottom: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <img src={product.imageUrl || 'https://via.placeholder.com/100'} alt={product.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
              <div>
                <h4 className="glass-title" style={{ margin: '0 0 0.25rem 0' }}>{product.name}</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: '#555' }}>${product.price.toFixed(2)} &bull; {product.category}</p>
              </div>
            </div>
            <button 
              className="glass-btn" 
              style={{ backgroundColor: '#ef4444', color: 'white', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
              onClick={() => handleDeleteProduct(product._id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPortal;
