import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../constant';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');

    // Jika tidak ada token, arahkan ke login
    if (!token) {
      navigate('/login');
      return;
    }

    // Verifikasi token ke backend
    const verifyToken = async () => {
      try {
        await axios.get(`${API_URL}/user`, {
          headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        // Jika token tidak valid (401), hapus token dan arahkan ke login
        if (err.response?.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
        }
      }
    };

    verifyToken();
  }, [navigate]);

  return (
    <div className="container mt-4 text-center" style={{ maxWidth: '800px' }}>
      <h2 className="mb-4">Dashboard Perpustakaan</h2>

      <img
        src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80"
        alt="Perpustakaan"
        className="img-fluid rounded mb-4 shadow"
        style={{ maxHeight: '350px', objectFit: 'cover', width: '100%' }}
      />

      <p className="lead">
        Selamat datang di sistem perpustakaan! Anda dapat mengelola data member, buku, peminjaman,
        pengembalian, dan melihat laporan peminjaman dengan mudah.
      </p>
    </div>
  );
};

export default Dashboard;
