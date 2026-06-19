// --- src/pages/main/EventType.jsx ---
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './EventFilter.css'; // Panggil CSS bersama

// DUMMY DATA (Harusnya sama persis dengan yang ada di Home)
const MOCK_EVENTS = [
  { id: 1, title: "Penthouse RUN", category: "Sports", price: "IDR 350.000" },
  { id: 2, title: "Tennis Match", category: "Sports", price: "IDR 350.000" },
  { id: 3, title: "Rock Festival", category: "Rock", price: "IDR 500.000" },
];

export default function EventType() {
  const { categoryName } = useParams(); // Menangkap kata "Sports" dari URL /type/Sports
  const navigate = useNavigate(); // Fungsi untuk tombol kembali

  // LOGIKA PENYARINGAN: Hanya ambil event yang category-nya sama dengan categoryName di URL
  const filteredEvents = MOCK_EVENTS.filter((event) => 
    event.category.toLowerCase() === categoryName.toLowerCase()
  );

  return (
    <div className="filter-page">
      <div className="filter-header-bg">
        <button className="back-btn" onClick={() => navigate(-1)}>⬅</button>
        <h1 className="filter-logo">REFP</h1>
        <p className="filter-subtitle">Real Event For Public</p>
      </div>

      <div className="hero-image-container">
        {/* Gambar simulasi, nanti bisa diganti gambar dinamis */}
        <img src="https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=400&q=80" alt="Sports" className="hero-img" />
      </div>

      <h2 className="filter-title">{categoryName} Event</h2>

      <div className="filter-grid">
        {filteredEvents.length === 0 ? (
          <p style={{color: 'white', textAlign: 'center', width: '100%'}}>Belum ada event di kategori ini.</p>
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