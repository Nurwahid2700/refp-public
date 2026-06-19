// --- src/pages/main/EventOrganizer.jsx ---
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventFilter.css'; // Pakai CSS yang sama!

const MOCK_EVENTS = [
  { id: 1, title: "UmaFANS Meet", organizer: "MineGG", price: "IDR 350.000" },
  { id: 2, title: "Musume Event", organizer: "MineGG", price: "IDR 350.000" },
  { id: 3, title: "Rock Festival", organizer: "RLivent", price: "IDR 500.000" },
];

export default function EventOrganizer() {
  const { eoName } = useParams(); // Menangkap kata "MineGG" dari URL
  const navigate = useNavigate();

  // LOGIKA PENYARINGAN: Cek berdasarkan Organizer
  const filteredEvents = MOCK_EVENTS.filter((event) => 
    event.organizer.toLowerCase() === eoName.toLowerCase()
  );

  return (
    <div className="filter-page">
      <div className="filter-header-bg">
        <button className="back-btn" onClick={() => navigate(-1)}>⬅</button>
        <h1 className="filter-logo">REFP</h1>
        <p className="filter-subtitle">Real Event For Public</p>
      </div>

      <div className="hero-image-container">
        <img src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=400&q=80" alt="Concert" className="hero-img" />
      </div>

      <h2 className="filter-title">{eoName}</h2>
      <p className="filter-desc">I am present for your event</p>

      <div className="filter-grid">
        {filteredEvents.length === 0 ? (
          <p style={{color: 'white', textAlign: 'center', width: '100%'}}>EO ini belum memiliki event aktif.</p>
        ) : (
          filteredEvents.map(event => (
            <div className="event-card" key={event.id}>
              <div className="event-img"></div>
              <div className="event-info">
                <h4>{event.title}</h4>
                <p className="price">{event.price}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}