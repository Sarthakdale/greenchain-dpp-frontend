import React, { useEffect, useState } from 'react';
import './App.css';
import ProductDetails from './ProductDetails'; // Import the new component

function App() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductId, setSelectedProductId] = useState(null); // Track which product to show

  const [showForm, setShowForm] = useState(false); // Controls if the form is visible
  const [newProduct, setNewProduct] = useState({ name: '', type: 'RAW_MATERIAL', baseCo2Impact: 0, description: '' });

  // Function to send data to Java
  const handleAddProduct = (e) => {
      e.preventDefault();
      fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      })
      .then(res => res.json())
      .then(data => {
        setProducts([...products, data]); // Update the list immediately
        setShowForm(false); // Close the form
        setNewProduct({ name: '', type: 'RAW_MATERIAL', baseCo2Impact: 0, description: '' }); // Reset
      });
  };

  useEffect(() => {
    fetch('http://localhost:8080/api/products')
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error('Error connecting to backend:', error));
  }, []);

const handleStatusChange = (id, newStatus) => {
  fetch(`http://localhost:8080/api/products/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newStatus)
  })
  .then(res => res.json())
  .then(updatedProduct => {
    // This refreshes the specific card with the new data from Java
    setProducts(products.map(p => p.id === id ? updatedProduct : p));
  });
};

  // IF a product is selected, show the Timeline instead of the Dashboard
  if (selectedProductId) {
    return (
        <div className="app-container">
          {/* 1. Add this new Header section with the Toggle Button */}
          <div className="header-flex">
            <h1>🍃 GreenChain Dashboard</h1>
            <button className="qr-button" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Close Form' : '+ Add New Product'}
            </button>
          </div>

          {/* 2. Add this Form section */}
          {showForm && (
            <form className="add-form" onSubmit={handleAddProduct}>
              <input
                type="text"
                placeholder="Product Name"
                required
                onChange={e => setNewProduct({...newProduct, name: e.target.value})}
              />

              <select onChange={e => setNewProduct({...newProduct, type: e.target.value})}>
                <option value="RAW_MATERIAL">Raw Material</option>
                <option value="COMPONENT">Component</option>
                <option value="FINAL_PRODUCT">Final Product</option>
              </select>

              <input
                type="number"
                placeholder="CO2 Impact (kg)"
                required
                onChange={e => setNewProduct({...newProduct, baseCo2Impact: parseFloat(e.target.value)})}
              />

              <button type="submit" className="qr-button">Save Product</button>
            </form>
          )}

          {/* 3. This is your existing grid, keep it inside the new structure */}
          <div className="search-container">
            <input
              type="text"
              placeholder="🔍 Search products by name..."
              className="search-input"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="product-grid">
            {products.map(product => (
              <div key={product.id} className="card" onClick={() => setSelectedProductId(product.id)} style={{cursor: 'pointer'}}>

                {/* --- PLACE THE NEW CODE HERE --- */}
                <span className={`status-badge ${product.type}`}>
                  {product.type === 'RAW_MATERIAL' ? '🌿 Sourced' :
                   product.type === 'COMPONENT' ? '⚙️ In Process' : '📦 Final Product'}
                </span>
                <h3>{product.name}</h3>
                <div className="status-selector" onClick={(e) => e.stopPropagation()}>
                  <strong>Update Status: </strong>
                  <select
                    value={product.type}
                    className="status-dropdown"
                    onChange={(e) => handleStatusChange(product.id, e.target.value)}
                  >
                    <option value="RAW_MATERIAL">🌿 Sourced</option>
                    <option value="COMPONENT">⚙️ In Process</option>
                    <option value="FINAL_PRODUCT">📦 Final Product</option>
                  </select>
                </div>
                <p><strong>Carbon Footprint:</strong> {product.baseCo2Impact} kg</p>
                <div className="co2-meter-bg">
                  <div
                    className="co2-meter-fill"
                    style={{
                      width: `${Math.min(product.baseCo2Impact * 5, 100)}%`,
                      backgroundColor: product.baseCo2Impact > 10 ? '#ff5252' : '#4caf50'
                    }}
                  ></div>
                </div>

                <div className="button-group">
                  <button
                    className="qr-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`http://localhost:8080/api/products/${product.id}/qr`);
                    }}
                  >
                    View QR
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
    );
  }

  return (
    <div className="app-container">
      <h1>🍃 GreenChain Dashboard</h1>

      <div className="product-grid">
        {products
          .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(product => (
            // ... keep the rest of your existing card code here ...
          <div key={product.id} className="card" onClick={() => setSelectedProductId(product.id)} style={{cursor: 'pointer'}}>
            <h3>{product.name}</h3>
            <p><strong>Category:</strong> {product.type}</p>
            <p><strong>Carbon Footprint:</strong> {product.baseCo2Impact} kg</p>

            <div className="button-group">
              <button
                className="qr-button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents opening the timeline when clicking QR
                  window.open(`http://localhost:8080/api/products/${product.id}/qr`);
                }}
              >
                View QR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;