import React, { useEffect, useState } from 'react';
import './App.css';
import ProductDetails from './ProductDetails'; // Import the new component

// --- STEP 1: DEFINE JOURNEY DATA ---
const MOCK_TIMELINE = {
  RAW_MATERIAL: [
    { stage: "Source", location: "Nashik Farms, India", date: "2023-11-01", icon: "🌱" },
    { stage: "Processing", location: "Gujarat Ginning Plant", date: "2023-11-15", icon: "⚙️" },
    { stage: "Quality Check", location: "Mumbai Lab", date: "2023-11-20", icon: "✅" }
  ],
  COMPONENT: [
    { stage: "Manufacturing", location: "Pune Industrial Zone", date: "2023-12-05", icon: "🏭" },
    { stage: "Assembly", location: "Aurangabad Unit", date: "2023-12-10", icon: "🔧" },
    { stage: "Transport", location: "On Route to Mumbai", date: "2023-12-12", icon: "🚚" }
  ],
  FINAL_PRODUCT: [
    { stage: "Packaging", location: "Mumbai Logistics Hub", date: "2024-01-05", icon: "📦" },
    { stage: "Distribution", location: "Global Port Terminal", date: "2024-01-10", icon: "🚢" },
    { stage: "Retail", location: "Customer Storefront", date: "2024-01-20", icon: "🏪" }
  ]
};

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
// --- DELETE FUNCTION ---
  const handleDelete = (id, e) => {
    e.stopPropagation(); // Prevents the card from opening the Timeline
    if (confirm("Are you sure you want to delete this product?")) {
      fetch(`http://localhost:8080/api/products/${id}`, { method: 'DELETE' })
        .then(() => {
          setProducts(products.filter(p => p.id !== id)); // Remove from screen
        })
        .catch(err => console.error("Error deleting:", err));
    }
  };
};
const totalProducts = products.length;
const totalCo2 = products.reduce((sum, p) => sum + (p.baseCo2Impact || 0), 0).toFixed(1);
const highImpactCount = products.filter(p => (p.baseCo2Impact || 0) > 10).length;

// --- NEW TIMELINE LOGIC ---
  if (selectedProductId) {
    const product = products.find(p => p.id === selectedProductId);
    if (!product) { setSelectedProductId(null); return null; }
    const events = MOCK_TIMELINE[product.type] || MOCK_TIMELINE.FINAL_PRODUCT;

    return (
          <div className="app-container" style={{ padding: '40px' }}>
            {/* 1. Back Button stays OUTSIDE so it sits on the left */}
            <button className="back-button" onClick={() => setSelectedProductId(null)}>
              ⬅ Back to Dashboard
            </button>

            {/* 2. THE NEW CENTERING WRAPPER */}
            {/* This div forces everything inside it to be 600px wide and centered */}
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>

              <div className="timeline-header" style={{ marginTop: '20px', textAlign: 'center' }}>
                <h1>{product.name} Journey</h1>
                <span className={`status-badge ${product.type}`}>
                  {product.type.replace('_', ' ')}
                </span>
              </div>

              <div className="timeline-container">
                {events.map((event, index) => (
                  <div key={index} className="timeline-item">
                    <div className="timeline-icon">{event.icon}</div>
                    <div className="timeline-content">
                      <h3>{event.stage}</h3>
                      <p>📍 {event.location}</p>
                      <span className="timeline-date">📅 {event.date}</span>
                    </div>
                  </div>
                ))}

                <div className="timeline-item active">
                  <div className="timeline-icon pulse">📍</div>
                  <div className="timeline-content">
                    <h3>Live Status</h3>
                    <p>Tracking Active</p>
                  </div>
                </div>
              </div>
            </div> {/* End of Centering Wrapper */}
          </div>
    );
  }

  // IF a product is selected, show the Timeline instead of the Dashboard

    return (
        <div className="app-container">
          {/* 1. Add this new Header section with the Toggle Button */}
          <div className="header-flex">
            <h1>🍃 GreenChain Dashboard</h1>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📦</span>
                <div className="stat-info">
                  <h3>{totalProducts}</h3>
                  <p>Total Products</p>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">🌱</span>
                <div className="stat-info">
                  <h3>{totalCo2} kg</h3>
                  <p>Total CO2 Footprint</p>
                </div>
              </div>

              <div className="stat-card urgent">
                <span className="stat-icon">⚠️</span>
                <div className="stat-info">
                  <h3>{highImpactCount}</h3>
                  <p>High Impact Items</p>
                </div>
              </div>
            </div>
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
              <div className="button-group">
                  {/* 1. View QR Button */}
                <button
                  className="qr-button"
                  onClick={(e) => {
                      e.stopPropagation();
                      window.open(`http://localhost:8080/api/products/${product.id}/qr`);
                  }}
              >
                 View QR
                 </button>

                                {/* 2. The Delete Button (Trash Can) */}
               <button
                className="delete-button"
                onClick={(e) => handleDelete(product.id, e)}
                title="Delete Product"
                style={{ marginLeft: '10px' }}
               >
                🗑️
               </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;