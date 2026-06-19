import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, ChevronDown, ChevronRight, Shield, Mail, Calendar, MessageSquare, Loader2, Key } from 'lucide-react';
import { signOut, EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import Swal from 'sweetalert2';

export default function Settings() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = useState(null);
  const [showBugReport, setShowBugReport] = useState(false);
  
  // State Password
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [user, setUser] = useState(null);

  // State Feedback
  const [reportText, setReportText] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUser(currentUser);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const toggleMenu = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleLogout = () => {
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return Swal.fire('Error', 'Konfirmasi kata sandi tidak cocok!', 'error');
    }
    if (newPassword.length < 6) {
      return Swal.fire('Error', 'Kata sandi minimal 6 karakter!', 'error');
    }
    
    setIsChangingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, oldPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      
      Swal.fire('Berhasil', 'Kata sandi berhasil diubah.', 'success');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveMenu(null);
    } catch (error) {
      let errorMessage = 'Gagal mengubah kata sandi. Pastikan kata sandi lama benar.';
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Kata sandi lama salah.';
      }
      Swal.fire('Error', errorMessage, 'error');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSendFeedback = async () => {
    if (!reportText.trim()) {
      return Swal.fire('Error', 'Deskripsi masalah tidak boleh kosong.', 'error');
    }
    
    setIsSubmittingReport(true);
    try {
      await addDoc(collection(db, "feedback"), {
        uid: user.uid,
        email: user.email,
        name: user.displayName || "User",
        message: reportText,
        status: "pending",
        createdAt: serverTimestamp()
      });
      Swal.fire('Terkirim!', 'Laporan Anda telah dikirim ke tim kami.', 'success');
      setShowBugReport(false);
      setReportText('');
    } catch (error) {
      console.error("Error sending feedback:", error);
      Swal.fire('Error', 'Gagal mengirim laporan. Silakan coba lagi nanti.', 'error');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-50 flex justify-center items-center">Memuat...</div>;

  const joinDate = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) 
    : 'Tidak diketahui';

  const censorEmail = (email) => {
    if (!email) return '';
    const [name, domain] = email.split('@');
    if (name.length <= 3) return email; // Too short to censor properly
    return name.substring(0, Math.min(5, name.length - 2)) + "***@" + domain;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header Background */}
      <div className="bg-gradient-to-br from-[#1D2039] via-[#2b2e4a] to-[#50589F] h-48 md:h-64 w-full relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>
        <div className="absolute top-8 w-full text-center z-10">
          <h1 className="text-3xl font-bold text-white tracking-wider">REFP</h1>
          <p className="text-slate-300 text-sm mt-1">Real Event For Public</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 relative -mt-16 md:-mt-24 z-20">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 md:p-8 border border-white space-y-4">
          <h2 className="text-xl font-bold text-slate-800 mb-6 px-2 flex items-center gap-2">
            <Shield className="text-[#50589F]" size={24}/> Pengaturan Akun
          </h2>

          {/* Account Information */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all">
            <button 
              onClick={() => toggleMenu('account')}
              className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-700 flex items-center gap-3">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Mail size={18}/></div>
                Informasi Akun
              </span>
              {activeMenu === 'account' ? <ChevronDown size={20} className="text-slate-400"/> : <ChevronRight size={20} className="text-slate-400"/>}
            </button>
            
            {activeMenu === 'account' && (
              <div className="px-5 pb-5 pt-2 border-t border-slate-50 bg-slate-50/50">
                <div className="space-y-4 mt-2">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-slate-800 font-medium">{censorEmail(user.email)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Calendar size={14}/> Bergabung Sejak</p>
                    <p className="text-slate-800 font-medium">{joinDate}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all">
            <button 
              onClick={() => toggleMenu('password')}
              className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-700 flex items-center gap-3">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Key size={18}/></div>
                Ubah Kata Sandi
              </span>
              {activeMenu === 'password' ? <ChevronDown size={20} className="text-slate-400"/> : <ChevronRight size={20} className="text-slate-400"/>}
            </button>
            
            {activeMenu === 'password' && (
              <form onSubmit={handleChangePassword} className="px-5 pb-5 pt-4 border-t border-slate-50 bg-slate-50/50 space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">Kata Sandi Lama</label>
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#50589F] focus:ring-2 focus:ring-[#50589F]/20 transition-all outline-none" 
                    placeholder="Masukkan kata sandi saat ini" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#50589F] focus:ring-2 focus:ring-[#50589F]/20 transition-all outline-none" 
                    placeholder="Minimal 6 karakter" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 block mb-1.5">Konfirmasi Kata Sandi Baru</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-[#50589F] focus:ring-2 focus:ring-[#50589F]/20 transition-all outline-none" 
                    placeholder="Ketik ulang kata sandi baru" 
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full mt-2 bg-[#50589F] hover:bg-[#1D2039] text-white px-4 py-3 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 flex justify-center items-center gap-2"
                >
                  {isChangingPassword ? <Loader2 size={18} className="animate-spin" /> : 'Simpan Kata Sandi'}
                </button>
              </form>
            )}
          </div>

          {/* Technical Assistance */}
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm transition-all mt-6">
            <button 
              onClick={() => setShowBugReport(true)}
              className="w-full flex justify-between items-center p-5 text-left hover:bg-slate-50 transition-colors"
            >
              <span className="font-semibold text-slate-700 flex items-center gap-3">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MessageSquare size={18}/></div>
                Bantuan Teknis
              </span>
              <ChevronRight size={20} className="text-slate-400"/>
            </button>
          </div>

          <div className="pt-6">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-red-50 text-red-600 hover:bg-red-500 hover:text-white px-6 py-4 rounded-2xl font-bold transition-all shadow-sm border border-red-100 hover:border-red-500 cursor-pointer"
            >
              <LogOut size={20} />
              Keluar Akun
            </button>
          </div>
        </div>
      </div>

      {/* Pop-up Bantuan Teknis */}
      {showBugReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl p-6">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Laporkan Kendala</h3>
            <p className="text-sm text-slate-500 mb-6">Jelaskan bug atau masalah yang Anda temui agar tim kami dapat memperbaikinya.</p>

            <textarea
              rows="4"
              value={reportText}
              onChange={(e) => setReportText(e.target.value)}
              placeholder="Deskripsi masalah..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#50589F] focus:ring-2 focus:ring-[#50589F]/20 transition-all outline-none resize-none mb-6"
            ></textarea>

            <div className="flex gap-3">
              <button 
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => {
                  setShowBugReport(false);
                  setReportText('');
                }}
              >
                Batal
              </button>
              <button 
                className="flex-1 px-4 py-3 rounded-xl bg-[#50589F] text-white font-semibold hover:bg-[#1D2039] transition-colors cursor-pointer flex justify-center items-center gap-2"
                onClick={handleSendFeedback}
                disabled={isSubmittingReport}
              >
                {isSubmittingReport ? <Loader2 size={18} className="animate-spin" /> : 'Kirim Laporan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}