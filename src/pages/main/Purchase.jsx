// --- src/pages/main/Purchase.jsx ---
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './Purchase.css';

export default function Purchase() {
  const { eventId } = useParams();
  const navigate = useNavigate();

  // STATE UNTUK LOGIKA POPUP PEMBAYARAN
  const [showModal, setShowModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [qty, setQty] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  // DUMMY DATA EVENT (Nanti ditarik dari Firebase berdasarkan eventId)
  const eventData = {
    title: "UmaFANS Meet",
    price: 350000,
    desc: "Ayo berkumpul bersama penggemar Uma Musume lainnya! Acara ini akan dimeriahkan dengan nobar, diskusi santai, dan pembagian merchandise eksklusif. Jangan sampai kehabisan tiket!",
  };

  const tax = 2500; // Pajak/Admin Fee
  const totalPrice = (eventData.price * qty) + tax;

  // Fungsi saat metode pembayaran diklik
  const handlePaymentClick = (method) => {
    setPaymentMethod(method);
    setQty(1); // Reset jumlah tiket ke 1
    setIsSuccess(false);
    setShowModal(true); // Tampilkan popup
  };

  // Fungsi atur jumlah (Maksimal 10)
  const increaseQty = () => { if (qty < 10) setQty(qty + 1); };
  const decreaseQty = () => { if (qty > 1) setQty(qty - 1); };

  // Fungsi simulasi bayar
  const handleCheckout = () => {
    // Di sini logika Firebase akan mencatat riwayat pembelian ke database
    setIsSuccess(true);
  };

  return (
    <div className="purchase-page">
      {/* HEADER & TOMBOL KEMBALI */}
      <div className="purchase-header">
        <button className="btn-back-absolute" onClick={() => navigate(-1)}>⬅</button>
      </div>

      <div className="purchase-content">
        <div className="event-hero">
          <img src="https://images.unsplash.com/photo-1541532713592-79a0317b6b77?auto=format&fit=crop&w=200&q=80" alt="Poster" className="event-poster" />
          <div className="event-hero-info">
            <h1>{eventData.title}</h1>
            <p className="price">IDR {eventData.price.toLocaleString('id-ID')}</p>
          </div>
        </div>

        <p className="event-desc">{eventData.desc}</p>

        {/* MAP DUMMY */}
        <div className="map-dummy">
          <div className="map-pin">📍 Kitsuki Entertainment, Bandung</div>
        </div>

        {/* METODE PEMBAYARAN */}
        <h3 className="payment-title">Payment Method</h3>
        <div className="payment-grid">
          <button className="pay-btn" onClick={() => handlePaymentClick('QRIS')}>QRIS</button>
          <button className="pay-btn" onClick={() => handlePaymentClick('DANA')}>DANA</button>
          <button className="pay-btn" onClick={() => handlePaymentClick('LinkAja')}>LinkAja</button>
          <button className="pay-btn" onClick={() => handlePaymentClick('GoPay')}>GoPay</button>
        </div>
      </div>

      {/* POPUP MODAL (Hanya muncul jika showModal = true) */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            
            {/* Tampilan Jika SUKSES */}
            {isSuccess ? (
              <>
                <h2>✅ Pembayaran Berhasil!</h2>
                <p style={{fontSize: '14px', marginBottom: '20px'}}>
                  Tiket {eventData.title} Anda telah tersimpan. Silakan cek halaman Riwayat Tiket.
                </p>
                <button className="btn-confirm" onClick={() => {
                  setShowModal(false);
                  navigate('/history'); // Arahkan ke riwayat
                }}>
                  Lihat Tiket
                </button>
              </>
            ) : (
              /* Tampilan Jika Sedang PROSES BAYAR */
              <>
                <h2>Bayar via {paymentMethod}</h2>
                <p style={{fontSize: '12px', color: '#666'}}>Berapa orang yang hadir?</p>
                
                <div className="qty-control">
                  <button className="qty-btn" onClick={decreaseQty}>-</button>
                  <span style={{fontSize: '20px', fontWeight: 'bold'}}>{qty}</span>
                  <button className="qty-btn" onClick={increaseQty}>+</button>
                </div>

                <div className="summary-box">
                  <p><span>Harga Tiket</span> <span>Rp {(eventData.price * qty).toLocaleString('id-ID')}</span></p>
                  <p><span>Biaya Admin</span> <span>Rp {tax.toLocaleString('id-ID')}</span></p>
                  <p className="total"><span>Total</span> <span>Rp {totalPrice.toLocaleString('id-ID')}</span></p>
                </div>

                <button className="btn-confirm" onClick={handleCheckout}>Bayar Sekarang</button>
                <button className="btn-cancel" onClick={() => setShowModal(false)}>Batal</button>
              </>
            )}

          </div>
        </div>
      )}

    </div>
  );
}