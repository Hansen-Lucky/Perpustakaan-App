import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_URL } from "../../constant";
import Modal from "../../components/Modal";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

export default function MembersIndex() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mode, setMode] = useState("list");
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alert, setAlert] = useState("");
  const [form, setForm] = useState({
    no_ktp: "",
    nama: "",
    alamat: "",
    tgl_lahir: "",
  });
  const [search, setSearch] = useState(""); // 🔍 State search input

  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchMembers();
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

  async function fetchMembers() {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/member`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setMembers(res.data.data || res.data);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Gagal mengambil data member.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openForm = (member = null) => {
    if (member) {
      setForm({
        no_ktp: member.no_ktp,
        nama: member.nama,
        alamat: member.alamat,
        tgl_lahir: member.tgl_lahir,
      });
      setSelectedMember(member);
    } else {
      setForm({
        no_ktp: "",
        nama: "",
        alamat: "",
        tgl_lahir: "",
      });
      setSelectedMember(null);
    }
    setMode("form");
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.no_ktp.length !== 16 || isNaN(Number(form.no_ktp))) {
      setError("No KTP harus terdiri dari 16 digit angka.");
      return;
    }
    try {
      const bodyForm = new FormData();
      Object.entries(form).forEach(([k, v]) => bodyForm.append(k, v));

      if (selectedMember) {
        bodyForm.append("_method", "PUT");
        await axios.post(`${API_URL}/member/${selectedMember.id}`, bodyForm, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setAlert("Member berhasil diupdate.");
      } else {
        await axios.post(`${API_URL}/member`, bodyForm, {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        setAlert("Member berhasil ditambahkan.");
      }
      fetchMembers();
      setMode("list");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError(err.response?.data?.message || "Gagal menyimpan member.");
      }
    }
  };

  const openDetail = (member) => {
    setSelectedMember(member);
    setMode("detail");
  };

  const openDeleteModal = (member) => {
    setSelectedMember(member);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API_URL}/member/${selectedMember.id}`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setAlert("Berhasil menghapus member.");
      setIsModalOpen(false);
      fetchMembers();
      setMode("list");
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setError("Gagal menghapus member.");
      }
    }
  };

  const filteredMembers = members.filter((m) =>
    m.nama.toLowerCase().includes(search.toLowerCase())
  );

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
            <h3>Daftar Member</h3>
            <div className="d-flex gap-2">
              <input
                type="text"
                className="form-control"
                placeholder="Cari nama..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => openForm()}>
                Tambah Member
              </button>
            </div>
          </div>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th className="text-center">No KTP</th>
                <th className="text-center">Nama</th>
                <th className="text-center">Alamat</th>
                <th className="text-center">Tanggal Lahir</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                filteredMembers.map((m) => (
                  <tr key={m.id}>
                    <td className="text-center">{m.no_ktp}</td>
                    <td className="text-center">{m.nama}</td>
                    <td className="text-center">{m.alamat}</td>
                    <td className="text-center">{dayjs(m.tgl_lahir).format("DD/MM/YYYY")}</td>
                    <td className="d-flex justify-content-center">
                      <button className="btn btn-info btn-sm me-2" onClick={() => openDetail(m)}>
                        Detail
                      </button>
                      <button className="btn btn-warning btn-sm me-2" onClick={() => openForm(m)}>
                        Edit
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => openDeleteModal(m)}>
                        Hapus
                      </button>
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
          <h3>{selectedMember ? "Edit Member" : "Tambah Member"}</h3>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>No KTP</label>
              <input
                name="no_ktp"
                className="form-control"
                value={form.no_ktp}
                onChange={handleChange}
                required
                maxLength={16}
                pattern="\d*"
                inputMode="numeric"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/\D/g, "").slice(0, 16);
                }}
              />
            </div>
            <div className="mb-3">
              <label>Nama</label>
              <input name="nama" className="form-control" value={form.nama} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label>Alamat</label>
              <textarea name="alamat" className="form-control" value={form.alamat} onChange={handleChange} required />
            </div>
            <div className="mb-3">
              <label>Tanggal Lahir</label>
              <input
                type="date"
                name="tgl_lahir"
                className="form-control"
                value={form.tgl_lahir}
                onChange={handleChange}
                required
              />
            </div>
            <button className="btn btn-primary me-2" type="submit">
              {selectedMember ? "Update" : "Simpan"}
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setMode("list")}>
              Batal
            </button>
          </form>
        </>
      )}

      {mode === "detail" && selectedMember && (
        <>
          <h3>Detail Member</h3>
          <p><strong>No KTP:</strong> {selectedMember.no_ktp}</p>
          <p><strong>Nama:</strong> {selectedMember.nama}</p>
          <p><strong>Alamat:</strong> {selectedMember.alamat}</p>
          <p><strong>Tanggal Lahir:</strong> {dayjs(selectedMember.tgl_lahir).format("DD/MM/YYYY")}</p>
          <button className="btn btn-secondary" onClick={() => setMode("list")}>Kembali</button>
        </>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Hapus Member">
        <p>
          Yakin ingin menghapus member <strong>{selectedMember?.nama}</strong>?
        </p>
        <div className="d-flex justify-content-end gap-2">
          <button className="btn btn-danger" onClick={handleDelete}>
            Ya, Hapus
          </button>
          <button className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
            Batal
          </button>
        </div>
      </Modal>
    </>
  );
}
