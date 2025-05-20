import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";
import { useNavigate } from "react-router-dom";


export default function BooksIndex() {
  const navigate = useNavigate();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [mode, setMode] = useState("list");
  const [selectedBook, setSelectedBook] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState("");

  const [form, setForm] = useState({
    no_rak: "",
    judul: "",
    pengarang: "",
    penerbit: "",
    tahun_terbit: "",
    stok: "",
    detail: "",
  });

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchBooks();
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

  async function fetchBooks() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/buku`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setBooks(res.data.data || res.data);
    } catch (err) {
      handleUnauthorized(err);
      setError("Gagal mengambil data buku.");
    } finally {
      setLoading(false);
    }
  }

  const handleUnauthorized = (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      navigate("/login");
    }
  };


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openForm = (book = null) => {
    if (book) {
      setForm({
        no_rak: book.no_rak,
        judul: book.judul,
        pengarang: book.pengarang,
        penerbit: book.penerbit,
        tahun_terbit: book.tahun_terbit,
        stok: book.stok,
        detail: book.detail,
      });
      setSelectedBook(book);
    } else {
      setForm({
        no_rak: "",
        judul: "",
        pengarang: "",
        penerbit: "",
        tahun_terbit: "",
        stok: "",
        detail: "",
      });
      setSelectedBook(null);
    }
    setMode("form");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const bodyForm = new FormData();
      Object.entries(form).forEach(([k, v]) => bodyForm.append(k, v));

      if (selectedBook) {
        bodyForm.append("_method", "PUT");
        await axios.post(`${API_URL}/buku/${selectedBook.id}`, bodyForm, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setAlert("Buku berhasil diupdate.");
      } else {
        await axios.post(`${API_URL}/buku`, bodyForm, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setAlert("Buku berhasil ditambahkan.");
      }

      fetchBooks();
      setMode("list");
    } catch (err) {
      handleUnauthorized(err);
      setError(err.response?.data?.message || "Gagal menyimpan buku.");
    }
  };

  const openDetail = (book) => {
    setSelectedBook(book);
    setMode("detail");
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/buku/${selectedBook.id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setAlert("Berhasil menghapus buku.");
      setIsModalOpen(false);
      fetchBooks();
      setMode("list");
    } catch (err) {
      handleUnauthorized(err);
      setError("Gagal menghapus buku.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <>
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

      {mode === "list" && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3>Daftar Buku</h3>
            <button className="btn btn-primary" onClick={() => openForm()}>
              Tambah Buku
            </button>
          </div>
          <table className="table table-bordered">
            <thead>
              <tr>
                <th className="text-center">No Rak</th>
                <th className="text-center">Judul</th>
                <th className="text-center">Pengarang</th>
                <th className="text-center">Penerbit</th>
                <th className="text-center">Tahun Terbit</th>
                <th className="text-center">Stok</th>
                <th className="text-center">Detail</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {books.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center">Tidak ada data</td>
                </tr>
              ) : (
                books.map((b) => (
                  <tr key={b.id}>
                    <td className="text-center">{b.no_rak}</td>
                    <td className="text-center">{b.judul}</td>
                    <td className="text-center">{b.pengarang}</td>
                    <td className="text-center">{b.penerbit}</td>
                    <td className="text-center">{b.tahun_terbit}</td>
                    <td className="text-center">{b.stok}</td>
                    <td className="text-center">{b.detail}</td>
                    <td className="text-center">
                      <button className="btn btn-info btn-sm me-2" onClick={() => openDetail(b)}>Detail</button>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => openForm(b)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(b)}>Hapus</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </>
      )}

      {mode === "form" && (
        <>
          <h3>{selectedBook ? "Edit Buku" : "Tambah Buku"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>No Rak</label>
              <input
                name="no_rak"
                className="form-control"
                value={form.no_rak}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label>Judul</label>
              <input
                name="judul"
                className="form-control"
                value={form.judul}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label>Pengarang</label>
              <input
                name="pengarang"
                className="form-control"
                value={form.pengarang}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label>Penerbit</label>
              <input
                name="penerbit"
                className="form-control"
                value={form.penerbit}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label>Tahun Terbit</label>
              <input
                type="number"
                name="tahun_terbit"
                className="form-control"
                value={form.tahun_terbit}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label>Stok</label>
              <input
                type="number"
                name="stok"
                className="form-control"
                value={form.stok}
                onChange={handleChange}
                required
              />
            </div>
            <div className="mb-3">
              <label>Detail</label>
              <textarea
                name="detail"
                className="form-control"
                value={form.detail}
                onChange={handleChange}
              />
            </div>
            <button className="btn btn-primary me-2" type="submit">
              {selectedBook ? "Update" : "Simpan"}
            </button>
            <button className="btn btn-secondary" onClick={() => setMode("list")} type="button">
              Batal
            </button>
          </form>
        </>
      )}

      {mode === "detail" && selectedBook && (
        <>
          <h3>Detail Buku</h3>
          <p><strong>No Rak:</strong> {selectedBook.no_rak}</p>
          <p><strong>Judul:</strong> {selectedBook.judul}</p>
          <p><strong>Pengarang:</strong> {selectedBook.pengarang}</p>
          <p><strong>Penerbit:</strong> {selectedBook.penerbit}</p>
          <p><strong>Tahun Terbit:</strong> {selectedBook.tahun_terbit}</p>
          <p><strong>Stok:</strong> {selectedBook.stok}</p>
          <p><strong>Detail:</strong> {selectedBook.detail}</p>
          <button className="btn btn-secondary" onClick={() => setMode("list")}>Kembali</button>
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Hapus Buku">
        <p>Yakin ingin menghapus buku <strong>{selectedBook?.judul}</strong>?</p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-danger" onClick={handleDelete}>Ya, Hapus</button>
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Batal</button>
        </div>
      </Modal>
    </>
  );
}
