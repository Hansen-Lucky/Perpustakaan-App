import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import dayjs from "dayjs";
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
  const [data, setData] = useState([]);
  const [allLoans, setAllLoans] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    if (allLoans.length > 0) {
      generateChart(selectedYear);
    }
  }, [selectedYear, allLoans]);

  const fetchLoans = async () => {
    try {
      const res = await axios.get(`${API_URL}/peminjaman`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const loans = res.data.data || res.data;
      setAllLoans(loans);

      const uniqueYears = [...new Set(loans.map((l) => dayjs(l.tgl_pinjam).format("YYYY")))].sort();

      setYears(uniqueYears);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setAlert("Gagal mengambil data peminjaman.");
      }
    } finally {
      setLoading(false);
    }
  };

  const generateChart = (year) => {
    const filtered = year === "all"
      ? allLoans
      : allLoans.filter((loan) => dayjs(loan.tgl_pinjam).format("YYYY") === year);

    const grouped = {};

    filtered.forEach((loan) => {
      const month = dayjs(loan.tgl_pinjam).format("YYYY-MM");
      grouped[month] = (grouped[month] || 0) + 1;
    });

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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Grafik Peminjaman per Bulan</h3>
        <select
          className="form-select w-auto"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="all">Semua Tahun</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {alert && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {alert}
          <button type="button" className="btn-close" onClick={() => setAlert("")} />
        </div>
      )}

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
