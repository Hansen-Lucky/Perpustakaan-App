import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <Link to="/dashboard" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-book-half me-2"></i> {/* Bootstrap icon */}
          <strong>Perpustakaan</strong>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link to="/dashboard" className="nav-link">
                <i className="bi bi-house-door me-1"></i> Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/members" className="nav-link">
                <i className="bi bi-people me-1"></i> Member
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/books" className="nav-link">
                <i className="bi bi-book me-1"></i> Buku
              </Link>
            </li>
            <li className="nav-item dropdown">
              <a
                href="#"
                className="nav-link dropdown-toggle"
                id="peminjamanDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-journal-text me-1"></i> Peminjaman
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="peminjamanDropdown">
                <li>
                  <Link to="/loans" className="dropdown-item">Data</Link>
                </li>
                <li>
                  <Link to="/loans/chart" className="dropdown-item">Chart</Link>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <Link to="/fines" className="nav-link">
                <i className="bi bi-exclamation-circle me-1"></i> Denda
              </Link>
            </li>
          </ul>
          <div className="d-flex">
            <button className="btn btn-outline-light" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right me-1"></i> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
