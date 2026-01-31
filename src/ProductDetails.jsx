import React, { useEffect, useState } from 'react';

function ProductDetails({ productId, onBack }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch the history (Timeline) for this specific product
    fetch(`http://localhost:8080/api/events?productId=${productId}`)
      .then(res => res.json())
      .then(data => setEvents(data));
  }, [productId]);

  return (
    <div className="details-container">
      <button onClick={onBack} className="qr-button">← Back to Dashboard</button>
      <h2>Product Journey Timeline</h2>
      <div className="timeline">
        {events.map((event, index) => (
          <div key={event.id} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>{event.eventType}</h4>
              <p>📍 {event.location}</p>
              <p><small>{new Date(event.timestamp).toLocaleString()}</small></p>
              <p className="details-text">{event.details}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductDetails;