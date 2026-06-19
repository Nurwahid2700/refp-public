// --- src/pages/auth/Register.jsx ---
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore"; // Tambahan logik database
import { auth, db } from '../../firebase'; // Pastikan path benar
import Swal from 'sweetalert2';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState(''); // State gender baru
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return Swal.fire({ icon: 'warning', title: 'Oops...', text: 'Password tidak cocok!', confirmButtonColor: '#1D2039' });
    }

    try {
      // 1. Buat User di Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      // 2. SIMPAN KE DATABASE FIRESTORE (Koleksi: users)
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: name,
        email: email,
        phone: phone,
        dob: dob,
        gender: gender, // Simpan data gender
        createdAt: new Date()
      });

      Swal.fire({ icon: 'success', title: 'Berhasil!', text: 'Akun telah dibuat.', confirmButtonColor: '#50589F' })
        .then(() => navigate('/login'));

    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: error.message, confirmButtonColor: '#1D2039' });
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-brand">
        <div className="auth-logo-row">
          <div className="auth-line"></div>
          <h1 className="auth-title">REFP</h1>
          <div className="auth-line"></div>
        </div>
        <p className="auth-subtitle">Join Real Event For Public</p>
      </div>

      <div className="auth-form-section">
        <div className="auth-glass-card">
          <h2>Create an Account</h2>
          <p className="auth-desc">Fill in your details to join REFP</p>
          <form onSubmit={handleRegister}>
            <div className="auth-input-group">
              <label>Full Name / Username</label>
              <input type="text" className="auth-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Agnes Tachyon" required />
            </div>

            <div className="auth-input-group">
              <label>Email Address</label>
              <input type="email" className="auth-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="agnes@example.com" required />
            </div>

            <div className="auth-input-group">
              <label>Phone Number</label>
              <input type="tel" className="auth-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="081234567890" required />
            </div>

            <div className="auth-input-group">
              <label>Date of Birth</label>
              <input type="date" className="auth-input" value={dob} onChange={(e) => setDob(e.target.value)} required />
            </div>

            {/* Input Gender ditambahkan di sini dengan class yang sama */}
            <div className="auth-input-group">
              <label>Gender</label>
              <select className="auth-input" value={gender} onChange={(e) => setGender(e.target.value)} required>
                <option value="">Pilih Gender</option>
                <option value="Laki-laki">Laki-laki</option>
                <option value="Perempuan">Perempuan</option>
              </select>
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <input className="auth-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>

            <div className="auth-input-group">
              <label>Verify Password</label>
              <input type="password" className="auth-input" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            <button type="submit" className="auth-btn" style={{ marginTop: '20px' }}>Sign Up</button>
          </form>
          <p className="auth-switch-text">Already have an account? <span onClick={() => navigate('/login')}>Sign in</span></p>
        </div>
      </div>
    </div>
  );
}