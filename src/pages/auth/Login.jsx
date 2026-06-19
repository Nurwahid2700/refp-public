// --- src/pages/auth/Login.jsx ---
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from '../../firebase';
import Swal from 'sweetalert2';
import './Auth.css';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Swal.fire({ icon: 'success', title: 'Berhasil Login!', text: 'Selamat datang kembali.', confirmButtonColor: '#50589F' })
        .then(() => navigate('/'));
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal Login', text: 'Email atau password salah.', confirmButtonColor: '#1D2039' });
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
        <p className="auth-subtitle">Real Event For Public</p>
      </div>

      <div className="auth-form-section">
        <div className="auth-glass-card">
          <form onSubmit={handleLogin}>
            <div className="auth-input-group">
              <label>Email Address</label>
              <input className="auth-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            </div>

            <div className="auth-input-group">
              <label>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="auth-input" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '15px', top: '12px', cursor: 'pointer' }}>
                  {showPassword ? "👁️" : "🙈"}
                </span>
              </div>
            </div>

            <button type="submit" className="auth-btn">Sign In</button>
          </form>

          <p className="auth-switch-text">
            Are you new? <span onClick={() => navigate('/register')}>Create An Account</span>
          </p>
        </div>
      </div>
    </div>
  );
}