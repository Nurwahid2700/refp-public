import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, getDocs, query, where, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { ArrowLeft, MapPin, Calendar, Users, Star, QrCode, Loader2, CheckCircle, X } from 'lucide-react';
import Swal from 'sweetalert2';

export default function EventDetail() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment State
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const docRef = doc(db, "events", eventId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setEvent({ id: docSnap.id, ...docSnap.data() });
          
          // Fetch Reviews
          const q = query(collection(db, "reviews"), where("eventId", "==", eventId));
          const reviewSnap = await getDocs(q);
          const eventReviews = reviewSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          eventReviews.sort((a,b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
          setReviews(eventReviews);
        } else {
          Swal.fire('Error', 'Event tidak ditemukan', 'error');
          navigate('/');
        }
      } catch (error) {
        console.error("Error fetching event:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, navigate]);

  const handleCheckout = async () => {
    setIsProcessing(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        Swal.fire('Error', 'Silakan login terlebih dahulu.', 'error');
        navigate('/login');
        return;
      }

      await addDoc(collection(db, "tickets"), {
        eventId: event.id || "",
        title: event.title || event.name || "Untitled Event",
        date: event.date || "-",
        location: event.location || event.venue || "-",
        image: event.image || "",
        price: event.price || "Rp 0",
        userId: user.uid,
        status: 'Payment Successful',
        purchaseDate: new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }),
        createdAt: serverTimestamp()
      });

      setIsSuccess(true);
    } catch (error) {
      console.error("Error saving ticket:", error);
      Swal.fire('Error', 'Gagal memproses pembayaran.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex justify-center items-center font-semibold text-slate-500">Memuat detail event...</div>;
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header Image */}
      <div className="relative w-full h-72 md:h-96 bg-dark-navy">
        <img src={event.image} alt={event.title || event.name} className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent"></div>
        <button 
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white/40 transition-colors cursor-pointer"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-6 relative -mt-32 z-10">
        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold mb-4 uppercase tracking-wider">
                <Users size={14} />
                Penyelenggara: {event.organizer || 'REFP'}
              </div>
              <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 mb-4">{event.title || event.name}</h1>
              <div className="flex flex-wrap gap-4 text-slate-500 font-medium">
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-[#50589F]" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-[#50589F]" />
                  <span>{event.location || event.venue}</span>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-slate-400 font-semibold mb-1">Mulai Dari</p>
              <p className="text-3xl font-bold text-emerald-600">{event.price}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-8 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4">Deskripsi Event</h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              {event.description || 'Deskripsi acara belum tersedia untuk saat ini. Nantikan pembaruan selanjutnya dari penyelenggara.'}
            </p>
          </div>

          {/* Review Section */}
          <div className="border-t border-slate-100 pt-8 mb-8">
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Star className="text-yellow-400" size={24} fill="currentColor" />
              Ulasan Pengunjung ({reviews.length})
            </h3>
            
            {reviews.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200 border-dashed">
                <p className="text-slate-500 font-medium">Belum ada ulasan. Jadilah yang pertama memberikan ulasan setelah mengikuti event ini!</p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map(review => (
                  <div key={review.id} className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex gap-4">
                    <img src={review.userPhoto} alt={review.userName} className="w-12 h-12 rounded-full object-cover shadow-sm bg-white" />
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-slate-800">{review.userName}</h4>
                        <div className="flex text-yellow-400">
                          {[...Array(review.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating Bottom Bar for Purchase */}
      <div className="fixed bottom-0 w-full bg-white border-t border-slate-200 p-4 px-6 md:px-12 flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-40">
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase">Total Pembayaran</p>
          <p className="text-2xl font-bold text-slate-800">{event.price}</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-[#50589F] hover:bg-[#1D2039] text-white px-8 py-3.5 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all cursor-pointer"
        >
          Beli Tiket
        </button>
      </div>

      {/* Payment Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8 relative text-center">
            
            {isSuccess ? (
              <div className="animate-in fade-in zoom-in duration-300">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={40} />
                </div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Pembayaran Berhasil!</h2>
                <p className="text-slate-500 mb-8">Tiket "{event.title || event.name}" telah ditambahkan ke riwayat Anda.</p>
                <button 
                  onClick={() => navigate('/history')}
                  className="w-full bg-[#50589F] text-white py-3.5 rounded-xl font-bold hover:bg-[#1D2039] transition-colors cursor-pointer"
                >
                  Lihat Riwayat Tiket
                </button>
              </div>
            ) : (
              <div>
                <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 cursor-pointer">
                  <X size={24} />
                </button>
                <h2 className="text-xl font-bold text-slate-800 mb-1">Pembayaran QRIS</h2>
                <p className="text-sm text-slate-500 mb-6">Pindai QR Code di bawah menggunakan aplikasi M-Banking atau e-Wallet Anda.</p>
                
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-6 flex justify-center">
                  <div className="w-48 h-48 bg-white border-2 border-dashed border-slate-300 flex items-center justify-center rounded-xl relative">
                    <QrCode size={120} className="text-slate-800 opacity-80" />
                    <div className="absolute inset-0 flex items-center justify-center bg-white/10 backdrop-blur-[1px]">
                      <span className="bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">DUMMY QRIS</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 font-bold">
                  <span>Total Tagihan</span>
                  <span className="text-xl">{event.price}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  disabled={isProcessing}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/30 flex justify-center items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessing ? <Loader2 size={24} className="animate-spin" /> : 'Konfirmasi Pembayaran'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
