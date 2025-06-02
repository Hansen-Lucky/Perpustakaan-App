import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../constant';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  // State untuk input dan notifikasi
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const navigate = useNavigate();

  // Fungsi login ketika form disubmit
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password }, {
        headers: { Accept: 'application/json' },
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        setSuccess('Login berhasil! Mengarahkan ke dashboard...');
      } else {
        setError('Login gagal. Email atau password salah.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal. Periksa email dan password Anda.');
      localStorage.removeItem('token');
    }
  };

  // Redirect otomatis ke dashboard setelah login berhasil
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => navigate('/dashboard'), 2000);
      return () => clearTimeout(timer); // bersihkan timer saat komponen unmount
    }
  }, [success, navigate]);

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-4">
          <i className="bi bi-person-circle" style={{ fontSize: '3rem', color: '#0d6efd' }}></i>
          <h3 className="mt-2">Login</h3>
        </div>

        {/* Alert Error */}
        {error && (
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')} aria-label="Close" />
          </div>
        )}

        {/* Alert Success */}
        {success && (
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            {success}
            <button type="button" className="btn-close" onClick={() => setSuccess('')} aria-label="Close" />
          </div>
        )}

        {/* Form Login */}
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Masukkan email"
            />
          </div>
          <div className="mb-3">
            <label>Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Masukkan password"
            />
          </div>
          <div className="d-grid">
            <button className="btn btn-primary" type="submit">
              Login
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-muted mt-3 mb-0" style={{ fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Aplikasi Perpustakaan
        </p>
      </div>
    </div>
  );
};

export default Login;
