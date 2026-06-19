import React, { useState, useEffect } from 'react';
import { Printer, CheckCircle, Calendar, MapPin, Star, MessageSquare, X, Loader2 } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Swal from 'sweetalert2';

const History = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review State
  const [reviewModal, setReviewModal] = useState({ isOpen: false, ticket: null });
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [printTicketId, setPrintTicketId] = useState(null);

  const handlePrint = (ticketId) => {
    setPrintTicketId(ticketId);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPrintTicketId(null), 1000);
    }, 100);
  };

  useEffect(() => {
    const fetchTickets = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const q = query(collection(db, "tickets"), where("userId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          const userTickets = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          // Sort by creation date descending
          userTickets.sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return b.createdAt.toMillis() - a.createdAt.toMillis();
            }
            return 0;
          });
          
          setTickets(userTickets);
        } catch (error) {
          console.error("Error fetching tickets:", error);
        }
      }
      setLoading(false);
    };

    fetchTickets();
  }, []);

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) {
      Swal.fire('Error', 'Ulasan tidak boleh kosong.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      const ticket = reviewModal.ticket;

      await addDoc(collection(db, "reviews"), {
        eventId: ticket.eventId || ticket.id, // Fallback if eventId missing
        ticketId: ticket.id,
        userId: user.uid,
        userName: user.displayName || "User",
        userPhoto: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        rating: rating,
        comment: reviewText,
        createdAt: serverTimestamp()
      });

      await updateDoc(doc(db, "tickets", ticket.id), {
        hasReviewed: true
      });

      setTickets(tickets.map(t => t.id === ticket.id ? { ...t, hasReviewed: true } : t));
      
      Swal.fire({
        title: 'Berhasil',
        text: 'Ulasan Anda berhasil dikirim!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
      
      setReviewModal({ isOpen: false, ticket: null });
      setReviewText("");
      setRating(5);
    } catch (error) {
      console.error("Error submitting review:", error);
      Swal.fire('Error', 'Gagal mengirim ulasan.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 font-sans pb-24 ${printTicketId ? 'print:bg-white print:pb-0' : ''}`}>
      <div className={`bg-gradient-to-br from-[#1D2039] via-[#2b2e4a] to-[#50589F] text-white px-6 py-10 md:py-16 relative overflow-hidden ${printTicketId ? 'print:hidden' : ''}`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Riwayat Tiket</h1>
          <p className="text-slate-300">Lihat dan kelola tiket yang telah Anda beli</p>
        </div>
      </div>

      <div className={`max-w-4xl mx-auto px-6 py-8 -mt-8 relative z-20 ${printTicketId ? 'print:mt-0 print:p-0 print:max-w-full' : ''}`}>
        <div className="flex flex-col gap-6">
          {loading ? (
            <div className="text-center py-10 text-slate-500 font-semibold bg-white rounded-2xl shadow-sm border border-slate-100">
              Memuat riwayat tiket...
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-10 text-slate-500 font-semibold bg-white rounded-2xl shadow-sm border border-slate-100">
              Anda belum memiliki tiket.
            </div>
          ) : (
            tickets.map((ticket) => {
              const isPast = new Date(ticket.date) < new Date();
              const isPrintingThis = printTicketId === ticket.id;
              return (
              <div key={ticket.id} className={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden flex flex-col md:flex-row hover:shadow-lg transition-all ${printTicketId && !isPrintingThis ? 'print:hidden' : ''} ${isPrintingThis ? 'print:shadow-none print:border-none print:m-0' : ''}`}>
                {/* Event Image */}
                <div className="md:w-1/3 h-48 md:h-auto relative">
                  <img src={ticket.image} alt={ticket.title} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-xs font-mono px-2 py-1 rounded">
                    {ticket.id.substring(0, 8).toUpperCase()}
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="p-6 md:w-2/3 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="text-2xl font-bold text-slate-800">{ticket.title}</h2>
                      <span className="text-xl font-bold text-[#50589F]">{ticket.price}</span>
                    </div>

                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 w-fit px-3 py-1 rounded-full text-sm font-semibold mb-4">
                      <CheckCircle size={16} />
                      {ticket.status}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-500 text-sm mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-[#50589F]" />
                        <span>Mulai: {ticket.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#50589F]" />
                        <span>{ticket.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className={`flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-slate-100 gap-4 ${isPrintingThis ? 'print:hidden' : ''}`}>
                    <span className="text-xs text-slate-400 font-medium">Dibeli pada: {ticket.purchaseDate}</span>
                    <div className="flex gap-2 w-full sm:w-auto">
                      {isPast && !ticket.hasReviewed && (
                        <button 
                          onClick={() => setReviewModal({ isOpen: true, ticket })}
                          className="flex-1 sm:flex-none flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-5 py-2.5 rounded-xl font-bold transition-colors justify-center cursor-pointer shadow-md"
                        >
                          <Star size={18} fill="currentColor" />
                          Beri Ulasan
                        </button>
                      )}
                      <button 
                        onClick={() => handlePrint(ticket.id)}
                        className="flex-1 sm:flex-none flex items-center gap-2 bg-[#50589F] hover:bg-[#1D2039] text-white px-5 py-2.5 rounded-xl font-semibold transition-colors justify-center cursor-pointer shadow-md"
                      >
                        <Printer size={18} />
                        Cetak Tiket
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-8 relative">
            <button onClick={() => setReviewModal({ isOpen: false, ticket: null })} className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer">
              <X size={24} />
            </button>
            <h3 className="text-2xl font-bold text-slate-800 mb-2">Beri Ulasan</h3>
            <p className="text-sm text-slate-500 mb-6">Bagaimana pengalaman Anda mengikuti {reviewModal.ticket?.title}?</p>
            
            <div className="flex gap-2 justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button 
                  key={star} 
                  onClick={() => setRating(star)}
                  className={`cursor-pointer transition-transform hover:scale-110 ${star <= rating ? 'text-yellow-400' : 'text-slate-200'}`}
                >
                  <Star size={40} fill="currentColor" />
                </button>
              ))}
            </div>

            <div className="mb-6">
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Ceritakan pengalaman seru Anda..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#50589F] focus:ring-2 focus:ring-[#50589F]/20 transition-all outline-none resize-none h-32"
              ></textarea>
            </div>

            <button
              onClick={handleSubmitReview}
              disabled={isSubmitting}
              className="w-full bg-[#50589F] text-white py-4 rounded-xl font-bold hover:bg-[#1D2039] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-lg"
            >
              {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <><MessageSquare size={20} /> Kirim Ulasan</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
