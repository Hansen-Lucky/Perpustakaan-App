// src/pages/fines/Index.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";


export default function FinesIndex() {
  const navigate = useNavigate();
  const [fines, setFines] = useState([]);
  const [members, setMembers] = useState([]);
  const [books, setBooks] = useState([]);
  const [filteredFines, setFilteredFines] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState("");
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("list");
  const [selectedFine, setSelectedFine] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    id_member: "",
    id_buku: "",
    jumlah_denda: "",
    jenis_denda: "terlambat",
    deskripsi: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchAll();
  }, []);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [fineRes, memberRes, bookRes] = await Promise.all([
        axios.get(`${API_URL}/denda`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/member`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/buku`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const fineData = fineRes.data.data || fineRes.data;
      const memberData = memberRes.data.data || memberRes.data;
      const bookData = bookRes.data.data || bookRes.data;

      const enriched = fineData.map((fine) => {
        const member = memberData.find((m) => m.id === fine.id_member);
        const book = bookData.find((b) => b.id === fine.id_buku);
        return {
          ...fine,
          nama_member: member?.nama || "Tidak ditemukan",
          judul_buku: book?.judul || "Tidak ditemukan",
        };
      });

      setFines(enriched);
      setMembers(memberData);
      setBooks(bookData);

    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");  
      } else {
        setError("Gagal memuat data denda");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, val]) => formData.append(key, val));

      await axios.post(`${API_URL}/denda`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setAlert("Denda berhasil ditambahkan.");
      setForm({ id_member: "", id_buku: "", jumlah_denda: "", jenis_denda: "terlambat", deskripsi: "" });
      setMode("list");
      fetchAll();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Gagal menambahkan denda.");
      }
    }
  };


  const openDeleteModal = (fine) => {
    setSelectedFine(fine);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/denda/${selectedFine.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlert("Denda berhasil dihapus.");
      setIsModalOpen(false);
      fetchAll();
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Gagal menghapus denda.");
      }
    }
  };

  const handleViewDetail = (memberId) => {
    const finesByMember = fines.filter(f => f.id_member === memberId);
    setSelectedMember(memberId);
    setFilteredFines(finesByMember);
    setMode("detail");
  };

  return (
    <div>
      {alert && (
        <div className="alert alert-success alert-dismissible fade show" role="alert">
          {alert}
          <button type="button" className="btn-close" onClick={() => setAlert("")} />
        </div>
      )}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)} />
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Data Denda</h3>
        {mode !== "form" && (
          <button className="btn btn-primary" onClick={() => setMode("form")}>Tambah Denda</button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : mode === "form" ? (
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label>Member</label>
            <select name="id_member" className="form-control" value={form.id_member} onChange={handleChange} required>
              <option value="">-- Pilih Member --</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.nama}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>Buku</label>
            <select name="id_buku" className="form-control" value={form.id_buku} onChange={handleChange} required>
              <option value="">-- Pilih Buku --</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.judul}</option>
              ))}
            </select>
          </div>
          <div className="mb-3">
            <label>Jumlah Denda</label>
            <input type="number" name="jumlah_denda" className="form-control" value={form.jumlah_denda} onChange={handleChange} required />
          </div>
          <div className="mb-3">
            <label>Jenis Denda</label>
            <select name="jenis_denda" className="form-control" value={form.jenis_denda} onChange={handleChange} required>
              <option value="terlambat">Terlambat</option>
              <option value="kerusakan">Kerusakan</option>
              <option value="lainnya">Lainnya</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Deskripsi</label>
            <input name="deskripsi" className="form-control" value={form.deskripsi} onChange={handleChange} />
          </div>
          <button className="btn btn-primary me-2" type="submit">Simpan</button>
          <button className="btn btn-secondary" type="button" onClick={() => setMode("list")}>Batal</button>
        </form>
      ) : mode === "detail" ? (
        <div>
          <h5>Detail Denda untuk Member: {members.find(m => m.id === selectedMember)?.nama || "-"}</h5>
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th>Judul Buku</th>
                <th>Jumlah Denda</th>
                <th>Jenis Denda</th>
                <th>Deskripsi</th>
              </tr>
            </thead>
            <tbody>
              {filteredFines.length === 0 ? (
                <tr><td colSpan={4}>Tidak ada denda untuk member ini</td></tr>
              ) : (
                filteredFines.map((f) => (
                  <tr key={f.id}>
                    <td>{f.judul_buku}</td>
                    <td>Rp{f.jumlah_denda}</td>
                    <td>{f.jenis_denda}</td>
                    <td>{f.deskripsi}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <button className="btn btn-secondary" onClick={() => setMode("list")}>Kembali</button>
        </div>
      ) : (
        <table className="table table-bordered text-center">
          <thead>
            <tr>
              <th>Nama Member</th>
              <th>Judul Buku</th>
              <th>Jumlah Denda</th>
              <th>Jenis Denda</th>
              <th>Deskripsi</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {fines.length === 0 ? (
              <tr><td colSpan={6}>Tidak ada data</td></tr>
            ) : (
              fines.map((f) => (
                <tr key={f.id}>
                  <td>{f.nama_member}</td>
                  <td>{f.judul_buku}</td>
                  <td>Rp{f.jumlah_denda}</td>
                  <td>{f.jenis_denda}</td>
                  <td>{f.deskripsi}</td>
                  <td>
                    <td className="d-flex justify-content-center">
                      <button className="btn btn-info btn-sm me-2" onClick={() => handleViewDetail(f.id_member)}>Detail</button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(f)}>Hapus</button>
                    </td>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Hapus Denda">
        <p>Yakin ingin menghapus denda ini?</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-danger" onClick={handleDelete}>Ya, Hapus</button>
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
        </div>
      </Modal>
    </div>
  );
}
