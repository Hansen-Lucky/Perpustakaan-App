import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateLogin = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/dashboard" /> : children;
};

export default PrivateLogin;
