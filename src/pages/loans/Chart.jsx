import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import dayjs from "dayjs";

// Import komponen untuk membuat grafik bar dari Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

import { useNavigate } from "react-router-dom";

export default function Chart() {
  // State untuk menyimpan data grafik yang sudah diproses
  const [data, setData] = useState([]);
  // State untuk menyimpan semua data peminjaman dari API
  const [allLoans, setAllLoans] = useState([]);
  // State untuk menyimpan tahun unik dari data peminjaman
  const [years, setYears] = useState([]);
  // Tahun yang sedang dipilih untuk ditampilkan di grafik
  const [selectedYear, setSelectedYear] = useState("all");
  // State loading & alert
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState("");

  // Ambil token dari localStorage untuk autentikasi
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  // Fetch data peminjaman saat komponen pertama kali dirender
  useEffect(() => {
    fetchLoans();
  }, []);

  // Generate grafik saat data atau tahun terpilih berubah
  useEffect(() => {
    if (allLoans.length > 0) {
      generateChart(selectedYear);
    }
  }, [selectedYear, allLoans]);

  // Fungsi mengambil semua data peminjaman dari API
  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${API_URL}/peminjaman`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const loans = res.data.data || res.data;
      setAllLoans(loans);

      // Ambil semua tahun unik dari tanggal peminjaman
      const uniqueYears = [...new Set(loans.map((l) => dayjs(l.tgl_pinjam).format("YYYY")))].sort();
      setYears(uniqueYears);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        // Jika token tidak valid, arahkan ke halaman login
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setAlert("Gagal mengambil data peminjaman.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk memproses data menjadi format yang siap untuk grafik
  const generateChart = (year) => {
    // Filter data berdasarkan tahun yang dipilih (atau semua jika "all")
    const filtered = year === "all"
      ? allLoans
      : allLoans.filter((loan) => dayjs(loan.tgl_pinjam).format("YYYY") === year);

    const grouped = {};

    // Kelompokkan data berdasarkan bulan
    filtered.forEach((loan) => {
      const month = dayjs(loan.tgl_pinjam).format("YYYY-MM");
      grouped[month] = (grouped[month] || 0) + 1;
    });

    // Ubah menjadi array objek agar bisa digunakan di Recharts
    const chartData = Object.entries(grouped)
      .sort(([a], [b]) => dayjs(a).unix() - dayjs(b).unix())
      .map(([month, count]) => ({
        bulan: dayjs(month).format("MMM YYYY"),
        jumlah: count,
      }));

    setData(chartData);
  };

  return (
    <div>
      {/* Header dan dropdown filter tahun */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Grafik Peminjaman per Bulan</h3>
        <select
          className="form-select w-auto"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="all">Semua Tahun</option>
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Tampilkan alert jika ada kesalahan */}
      {alert && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {alert}
          <button type="button" className="btn-close" onClick={() => setAlert("")} />
        </div>
      )}

      {/* Tampilkan loading atau grafik */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="bulan" angle={-45} textAnchor="end" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="jumlah" fill="#007bff" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
