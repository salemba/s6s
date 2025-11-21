import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export const PrivateRoute: React.FC = () => {
  const token = localStorage.getItem('access_token');

  return token ? <Outlet /> : <Navigate to="/login" replace />;
};
