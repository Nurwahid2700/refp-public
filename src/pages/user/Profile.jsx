// --- src/pages/Profile.jsx ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, CalendarDays, User as UserIcon, LogOut, Settings, Phone, Mail, X, Camera, Loader2, Image as ImageIcon } from 'lucide-react';
import { signOut, updateProfile } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Swal from 'sweetalert2';

const Profile = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImageURL, setEditImageURL] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Mengambil data dari Firestore saat halaman dimuat
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
            setEditName(docSnap.data().name || "");
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      setLoading(false);
    };
    fetchUserData();
  }, []);

  // Handler untuk menyimpan profil
  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Swal.fire('Error', 'Nama tidak boleh kosong', 'error');
      return;
    }
    
    // Cek apakah ada perubahan
    if (editName === userData?.name && editImageURL === (userData?.photoURL || "")) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const user = auth.currentUser;
      const updateData = {};
      
      if (editName !== userData?.name) updateData.name = editName;
      if (editImageURL !== (userData?.photoURL || "")) updateData.photoURL = editImageURL;

      // Update Firestore jika ada data yang diubah
      if (Object.keys(updateData).length > 0) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, updateData);
        
        // Update profil Auth bawaan Firebase
        await updateProfile(user, {
          ...(updateData.name && { displayName: updateData.name }),
          ...(updateData.photoURL !== undefined && { photoURL: updateData.photoURL })
        });
      }

      setUserData(prev => ({ ...prev, ...updateData }));
      setIsEditing(false);
      Swal.fire({
        title: 'Berhasil!',
        text: 'Profil berhasil diperbarui.',
        icon: 'success',
        confirmButtonColor: '#10B981',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      Swal.fire('Error', 'Gagal memperbarui profil.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Fungsi Logout Terintegrasi
  const handleLogout = async () => {
    Swal.fire({
      title: 'Keluar Aplikasi?',
      text: "Anda harus login kembali nanti.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      cancelButtonColor: '#50589F',
      confirmButtonText: 'Ya, Logout!'
    }).then(async (result) => {
      if (result.isConfirmed) {
        await signOut(auth);
        navigate('/login');
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-[#50589F] font-semibold">
        Memuat profil...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Modern Header Background dengan Efek Gradasi */}
      <div className="bg-gradient-to-br from-[#1D2039] via-[#2b2e4a] to-[#50589F] h-64 md:h-80 w-full relative overflow-hidden">

        {/* Latar Belakang Pattern (pointer-events-none agar tidak menghalangi klik) */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

        {/* Tombol Aksi di Kanan Atas (z-50 agar selalu di depan) */}
        <div className="absolute top-6 right-6 flex gap-4 z-50">
          <button 
            onClick={() => navigate('/settings')}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white border border-white/20 transition-all shadow-lg cursor-pointer"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500/80 hover:bg-red-600 backdrop-blur-md p-2.5 rounded-full text-white border border-white/20 transition-all shadow-lg cursor-pointer"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative -mt-24 md:-mt-32">
        {/* Floating Profile Card dengan Glassmorphism Premium */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 flex flex-col md:flex-row items-center md:items-start gap-6 border border-white">
          <div className="relative">
            <img
              src={userData?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'User'}`}
              alt="Profile"
              className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl bg-slate-100"
            />
            <div className="absolute bottom-2 right-2 bg-emerald-500 p-1.5 rounded-full border-2 border-white shadow-sm">
              <BadgeCheck size={16} className="text-white" />
            </div>
          </div>

          <div className="text-center md:text-left flex-1 pt-2">
            <h1 className="text-3xl font-bold text-slate-800 mb-1">{userData?.name || 'User Name'}</h1>
            <p className="text-slate-500 mb-4">{userData?.email || 'email@example.com'}</p>

            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-semibold border border-emerald-100">
              <BadgeCheck size={16} />
              Verified Member
            </div>
          </div>

          <div className="w-full md:w-auto mt-4 md:mt-0">
            <button
              onClick={() => {
                setIsEditing(true);
                setEditName(userData?.name || "");
                setEditImageURL(userData?.photoURL || "");
              }}
              className="w-full bg-[#1D2039] hover:bg-[#50589F] text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-[#50589F]/30 cursor-pointer"
            >
              Edit Profile
            </button>
          </div>
        </div>

        {/* Info Section - Dinamis dari Firestore */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-[#1D2039] mb-4 px-2">Personal Information</h2>
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-slate-100 p-2">
            <ul className="divide-y divide-slate-100/50">

              <li className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors rounded-xl">
                <div className="bg-[#50589F]/10 text-[#50589F] p-3 rounded-xl">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Gender</p>
                  <p className="text-slate-800 font-semibold">{userData?.gender || 'Belum diatur'}</p>
                </div>
              </li>

              <li className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors rounded-xl">
                <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
                  <CalendarDays size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Date of Birth</p>
                  <p className="text-slate-800 font-semibold">{userData?.dob || 'Belum diatur'}</p>
                </div>
              </li>

              <li className="flex items-center gap-4 p-4 hover:bg-slate-50/50 transition-colors rounded-xl">
                <div className="bg-orange-50 text-orange-600 p-3 rounded-xl">
                  <Phone size={20} />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Phone Number</p>
                  <p className="text-slate-800 font-semibold">{userData?.phone || 'Belum diatur'}</p>
                </div>
              </li>

            </ul>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl transform transition-all">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Edit Profil</h3>
              <button onClick={() => setIsEditing(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Avatar Preview */}
              <div className="flex flex-col items-center gap-4">
                <img
                  src={editImageURL || userData?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.name || 'User'}`}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-4 border-slate-50 shadow-md"
                  onError={(e) => {
                    e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${editName || 'User'}`;
                  }}
                />
              </div>

              {/* Image URL Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2"><ImageIcon size={16}/> URL Foto Profil</label>
                <input
                  type="text"
                  value={editImageURL}
                  onChange={(e) => setEditImageURL(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#50589F] focus:ring-2 focus:ring-[#50589F]/20 transition-all outline-none text-sm"
                  placeholder="https://contoh.com/foto.jpg (opsional)"
                />
              </div>

              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Username</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#50589F] focus:ring-2 focus:ring-[#50589F]/20 transition-all outline-none"
                  placeholder="Masukkan username baru"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-[#50589F] text-white font-semibold hover:bg-[#1D2039] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isSaving ? <Loader2 size={20} className="animate-spin" /> : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;