import React, { useState, useEffect } from 'react';
import { Search, Calendar, MapPin, Star } from 'lucide-react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    { name: 'Music', bg: 'bg-blue-100', text: 'text-blue-700' },
    { name: 'Technology', bg: 'bg-purple-100', text: 'text-purple-700' },
    { name: 'Workshop', bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { name: 'Sports', bg: 'bg-orange-100', text: 'text-orange-700' },
    { name: 'Arts', bg: 'bg-red-100', text: 'text-red-700' },
    { name: 'Business', bg: 'bg-emerald-100', text: 'text-emerald-700' },
  ];
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {

        // Fetch Events
        const querySnapshot = await getDocs(collection(db, "events"));
        if (querySnapshot.empty) {
          const dummyEvents = [
            {
              title: 'Neon Nights Festival',
              date: 'Aug 15, 2026',
              price: 'Rp 1.200.000',
              location: 'Stadium Utama',
              image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop',
              organizer: 'LiveNation',
              description: 'Festival musik elektronik terbesar tahun ini dengan penampilan DJ papan atas dari seluruh dunia.'
            },
            {
              title: 'Jazz in the City',
              date: 'Sep 02, 2026',
              price: 'Rp 850.000',
              location: 'Downtown Park',
              image: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop',
              organizer: 'Ismaya Live',
              description: 'Nikmati suasana malam yang syahdu dengan alunan musik Jazz dari musisi lokal dan internasional.'
            },
            {
              title: 'Tech Summit 2026',
              date: 'Oct 10, 2026',
              price: 'Rp 2.500.000',
              location: 'Convention Center',
              image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop',
              organizer: 'TechCorp',
              description: 'Konferensi teknologi terbesar yang membahas tren terbaru dalam AI, Web3, dan keamanan siber.'
            },
            {
              title: 'Indie Rock Concert',
              date: 'Nov 05, 2026',
              price: 'Rp 450.000',
              location: 'The Underground',
              image: 'https://images.unsplash.com/photo-1470229722913-7c090be5c524?q=80&w=800&auto=format&fit=crop',
              organizer: 'Golden Voice',
              description: 'Konser intim menampilkan band-band indie rock pendatang baru terbaik tahun ini.'
            },
          ];
          for (const ev of dummyEvents) {
            await addDoc(collection(db, "events"), ev);
          }
          const newSnapshot = await getDocs(collection(db, "events"));
          setEvents(newSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } else {
          setEvents(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredEvents = events.filter(ev => {
    const matchSearch = (ev.title || ev.name || "").toLowerCase().includes((searchQuery || "").toLowerCase());
    const evCat = ev.category || "General";
    const matchCat = selectedCategory === "All" || evCat.toLowerCase() === selectedCategory.toLowerCase();
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-10">
      {/* Hero Section */}
      <div className="bg-dark-navy text-white rounded-b-3xl px-6 py-12 md:px-16 md:py-20 relative overflow-hidden">
        <div className="absolute w-72 h-72 bg-light-navy/40 rounded-full blur-3xl -top-10 -right-10"></div>
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Discover the best events <br className="hidden md:block" /> happening around you.
          </h1>
          <p className="text-slate-300 mb-8 text-lg md:text-xl max-w-2xl">
            Book tickets for concerts, festivals, workshops, and more with just a few clicks.
          </p>

          {/* Search Bar */}
          <div className="flex items-center bg-white rounded-xl p-2 shadow-lg w-full max-w-2xl focus-within:ring-2 focus-within:ring-light-navy transition-all">
            <Search className="text-slate-400 ml-3" size={24} />
            <input
              type="text"
              placeholder="Search events, artists, or venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full py-3 px-4 outline-none text-slate-800 bg-transparent"
            />
            <button className="bg-light-navy hover:bg-light-navy/90 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-16 mt-12">
        {/* Event Categories */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Kategori Event</h2>
          <div className="flex overflow-x-auto pb-4 gap-4 hide-scrollbar items-center">
            <div
              onClick={() => setSelectedCategory("All")}
              className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-all ${selectedCategory === "All" ? 'bg-dark-navy text-white shadow-md' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'}`}
            >
              All Events
            </div>
            {categories.map((cat, index) => {
              const isSelected = selectedCategory === cat.name;
              return (
              <div
                key={cat.id || index}
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-6 py-3 rounded-full font-semibold whitespace-nowrap cursor-pointer transition-all ${isSelected ? 'bg-dark-navy text-white shadow-md' : cat.bg ? `${cat.bg} ${cat.text} hover:opacity-80` : 'bg-slate-100 text-slate-700 hover:opacity-80'}`}
              >
                {cat.name}
              </div>
            )})}
          </div>
        </div>

        {/* Highlight Events */}
        <div>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Highlight Events</h2>
            <button className="text-light-navy font-semibold hover:underline">View All</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <div className="col-span-full py-10 text-center text-slate-500 font-semibold">
                Memuat daftar event...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="col-span-full py-10 text-center text-slate-500 font-semibold">
                Tidak ada event yang cocok dengan pencarian.
              </div>
            ) : filteredEvents.map((event) => (
              <div 
                key={event.id} 
                onClick={() => navigate(`/event/${event.id}`)}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 group cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={event.image}
                    alt={event.title || event.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-[#50589F] shadow-sm uppercase tracking-wider">
                    {event.category || 'General'}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-dark-navy shadow-sm">
                    {event.price}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{event.title || event.name}</h3>
                  <div className="flex flex-col gap-2 text-slate-500 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-light-navy" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-light-navy" />
                      <span>{event.location || event.venue}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default Home;
