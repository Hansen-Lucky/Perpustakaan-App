import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import * as XLSX from "xlsx"; // Untuk export Excel
import jsPDF from "jspdf"; // Untuk export PDF
import autoTable from "jspdf-autotable"; // Untuk membuat tabel di PDF
import dayjs from "dayjs"; // Untuk manipulasi tanggal
import { useNavigate } from "react-router-dom";

// Konstanta denda per hari keterlambatan
const DENDA_PER_HARI = 1000;

export default function LoansIndex() {
  const navigate = useNavigate();

  // State utama
  const [loans, setLoans] = useState([]); // Data peminjaman
  const [members, setMembers] = useState([]); // Data member
  const [books, setBooks] = useState([]); // Data buku

  // State tambahan
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState("");
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("list"); // Tampilan: list | form | detail
  const [selectedMemberId, setSelectedMemberId] = useState(null); // Untuk riwayat member tertentu

  // State form input peminjaman
  const [form, setForm] = useState({
    id_member: "",
    id_buku: "",
    tgl_pinjam: "",
    tgl_pengembalian: "",
  });

  const token = localStorage.getItem("token");

  // Saat pertama kali load, ambil semua data
  useEffect(() => {
    fetchAllData();
  }, []);

  // Reset alert setelah 3 detik
  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  // Reset error setelah 3 detik
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Jika token tidak valid, redirect ke login
  const handleUnauthorized = (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
      return true;
    }
    return false;
  };

  // Ambil semua data: peminjaman, member, buku
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [loanRes, memberRes, bookRes] = await Promise.all([
        axios.get(`${API_URL}/peminjaman`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/member`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/buku`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      // Normalisasi data
      const loanData = loanRes.data.data || loanRes.data;
      const memberData = memberRes.data.data || memberRes.data;
      const bookData = bookRes.data.data || bookRes.data;

      // Gabungkan data member dan buku ke dalam loan
      const enriched = loanData.map((loan) => {
        const member = memberData.find((m) => String(m.id) === String(loan.id_member));
        const book = bookData.find((b) => String(b.id) === String(loan.id_buku));

        let status = "Aktif";
        if (loan.status_pengembalian) {
          status = "Dikembalikan";
        } else if (dayjs().isAfter(dayjs(loan.tgl_pengembalian))) {
          status = "Terlambat";
        }

        return {
          ...loan,
          nama_member: member?.nama || "Tidak ditemukan",
          judul_buku: book?.judul || "Tidak ditemukan",
          status,
        };
      });

      // Set state
      setLoans(enriched);
      setMembers(memberData);
      setBooks(bookData);
    } catch (err) {
      if (!handleUnauthorized(err)) {
        setError("Gagal mengambil data");
      }
    } finally {
      setLoading(false);
    }
  };

  // Saat form berubah
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Submit form peminjaman
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const body = new FormData();
      Object.entries(form).forEach(([key, value]) => body.append(key, value));

      await axios.post(`${API_URL}/peminjaman`, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      setAlert("Peminjaman berhasil ditambahkan.");
      setMode("list");
      fetchAllData();
    } catch (err) {
      if (!handleUnauthorized(err)) {
        setError("Gagal menambahkan peminjaman.");
      }
    }
  };

  // Lihat detail riwayat peminjaman berdasarkan member
  const handleDetailByMember = async (memberId) => {
    if (!memberId) {
      fetchAllData();
      setMode("list");
      return;
    }

    try {
      setLoading(true);
      setSelectedMemberId(memberId);

      const res = await axios.get(`${API_URL}/peminjaman/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const member = members.find((m) => String(m.id) === String(memberId));
      const memberLoans = res.data.data || res.data;

      const enriched = memberLoans.map((loan) => {
        const book = books.find((b) => String(b.id) === String(loan.id_buku));

        let status = "Aktif";
        if (loan.status_pengembalian) {
          status = "Dikembalikan";
        } else if (dayjs().isAfter(dayjs(loan.tgl_pengembalian))) {
          status = "Terlambat";
        }

        return {
          ...loan,
          nama_member: member?.nama || "Tidak ditemukan",
          judul_buku: book?.judul || "Tidak ditemukan",
          status,
        };
      });

      setLoans(enriched);
      setMode("detail");
    } catch (err) {
      if (!handleUnauthorized(err)) {
        setError("Gagal mengambil riwayat member");
      }
    } finally {
      setLoading(false);
    }
  };

  // Hitung denda berdasarkan keterlambatan
  const hitungDenda = (tgl_pengembalian) => {
    const hariIni = dayjs();
    const jatuhTempo = dayjs(tgl_pengembalian);
    const selisih = hariIni.diff(jatuhTempo, "day");
    return selisih > 0 ? selisih * DENDA_PER_HARI : 0;
  };

  // Proses pengembalian buku + denda
  const handleReturn = async (id) => {
    try {
      const loan = loans.find((l) => l.id === id);
      if (!loan) return;

      await axios.put(`${API_URL}/peminjaman/pengembalian/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const jumlah_denda = hitungDenda(loan.tgl_pengembalian);

      // Tambahkan denda jika terlambat
      if (jumlah_denda > 0) {
        const formDenda = new FormData();
        formDenda.append("id_member", loan.id_member);
        formDenda.append("id_buku", loan.id_buku);
        formDenda.append("jumlah_denda", jumlah_denda);
        formDenda.append("jenis_denda", "terlambat");
        formDenda.append("deskripsi", "Pengembalian melebihi batas waktu");

        await axios.post(`${API_URL}/denda`, formDenda, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      setAlert(`Buku berhasil dikembalikan.${jumlah_denda > 0 ? ` Denda: Rp${jumlah_denda}` : ""}`);
      await fetchAllData();
    } catch (err) {
      if (!handleUnauthorized(err)) {
        setError("Gagal memproses pengembalian atau denda.");
      }
    }
  };

  // Export data peminjaman ke Excel
  const exportExcel = () => {
    const exportData = loans.map((loan) => ({
      "Nama Member": loan.nama_member,
      "Judul Buku": loan.judul_buku,
      "Tanggal Pinjam": dayjs(loan.tgl_pinjam).format("DD/MM/YYYY"),
      "Tanggal Kembali": loan.tgl_pengembalian ? dayjs(loan.tgl_pengembalian).format("DD/MM/YYYY") : "-",
      Status: loan.status || "-",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Peminjaman");
    XLSX.writeFile(workbook, "data-peminjaman.xlsx");
  };

  // Export data ke PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Riwayat Peminjaman Member", 14, 10);
    autoTable(doc, {
      head: [["Nama Member", "Judul Buku", "Tgl Pinjam", "Tgl Kembali", "Status"]],
      body: loans.map((l) => [
        l.nama_member,
        l.judul_buku,
        dayjs(l.tgl_pinjam).format("DD/MM/YYYY"),
        l.tgl_pengembalian ? dayjs(l.tgl_pengembalian).format("DD/MM/YYYY") : "-",
        l.status || "-",
      ]),
    });
    doc.save("riwayat-member.pdf");
  };

  return (
    <div>
      {/* Bagian header dengan judul dan tombol */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Data Peminjaman</h3>
        {/* Tombol yang tampil tergantung mode */}
        {mode === "list" && (
          <div className="d-flex gap-2">
            <button className="btn btn-primary" onClick={() => setMode("form")}>
              Tambah Peminjaman
            </button>
            <button className="btn btn-success" onClick={exportExcel}>
              Export Excel
            </button>
          </div>
        )}
        {mode === "detail" && (
          <div className="d-flex gap-2">
            <button className="btn btn-secondary" onClick={() => {
              fetchAllData();
              setMode("list");
            }}>
              Kembali
            </button>
            <button className="btn btn-danger" onClick={exportPDF}>
              Export PDF
            </button>
          </div>
        )}
      </div>

      {/* Alert untuk sukses */}
      {alert && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {alert}
          <button type="button" className="btn-close" onClick={() => setAlert("")} />
        </div>
      )}

      {/* Alert untuk error */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}

      {/* Kondisi Loading */}
      {loading ? (
        <p>Loading...</p>
      ) : mode === "form" ? (
        // Form tambah peminjaman
        <>
          <h4>Tambah Peminjaman</h4>
          <form onSubmit={handleSubmit}>
            {/* Dropdown pilih member */}
            <div className="mb-3">
              <label>Member</label>
              <select name="id_member" className="form-control" value={form.id_member} onChange={handleChange} required>
                <option value="">-- Pilih Member --</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.nama}</option>
                ))}
              </select>
            </div>

            {/* Dropdown pilih buku */}
            <div className="mb-3">
              <label>Buku</label>
              <select name="id_buku" className="form-control" value={form.id_buku} onChange={handleChange} required>
                <option value="">-- Pilih Buku --</option>
                {books.map((b) => (
                  <option key={b.id} value={b.id}>{b.judul}</option>
                ))}
              </select>
            </div>

            {/* Input tanggal pinjam */}
            <div className="mb-3">
              <label>Tanggal Pinjam</label>
              <input type="date" name="tgl_pinjam" className="form-control" value={form.tgl_pinjam} onChange={handleChange} required />
            </div>

            {/* Input tanggal pengembalian */}
            <div className="mb-3">
              <label>Tanggal Pengembalian</label>
              <input type="date" name="tgl_pengembalian" className="form-control" value={form.tgl_pengembalian} onChange={handleChange} />
            </div>

            {/* Tombol simpan dan batal */}
            <button className="btn btn-primary me-2" type="submit">Simpan</button>
            <button type="button" className="btn btn-secondary" onClick={() => setMode("list")}>Batal</button>
          </form>
        </>
      ) : (
        // Tabel daftar peminjaman (mode list atau detail)
        <>
          {mode === "list" && (
            <div className="mb-3">
              {/* Dropdown untuk memilih member agar bisa lihat riwayat peminjaman per member */}
              <label>Lihat Riwayat Member</label>
              <select className="form-select w-auto d-inline-block ms-2" onChange={(e) => handleDetailByMember(e.target.value)}>
                <option value="">Semua Member</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.nama}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tabel menampilkan data peminjaman */}
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>Nama Member</th>
                <th>Judul Buku</th>
                <th>Tanggal Pinjam</th>
                <th>Tanggal Kembali</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {/* Jika data kosong */}
              {loans.length === 0 ? (
                <tr><td colSpan={6}>Tidak ada data</td></tr>
              ) : (
                loans.map((item, index) => (
                  <tr key={index}>
                    <td>{item.nama_member}</td>
                    <td>{item.judul_buku}</td>
                    <td>{dayjs(item.tgl_pinjam).format("DD/MM/YYYY")}</td>
                    <td>{item.tgl_pengembalian ? dayjs(item.tgl_pengembalian).format("DD/MM/YYYY") : "-"}</td>
                    <td className={
                      item.status === "Dikembalikan" ? "text-secondary" :
                        item.status === "Terlambat" ? "text-danger" : "text-success"
                    }>
                      {item.status}
                    </td>
                    <td className="d-flex justify-content-center">
                      {/* Tombol kembalikan buku */}
                      <button className="btn btn-sm btn-success" onClick={() => handleReturn(item.id)}>Kembalikan</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
