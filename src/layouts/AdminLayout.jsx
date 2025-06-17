import React from 'react';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* You can add an admin-specific sidebar or header here if needed */}
      <Outlet />
    </div>
  );
};

export default AdminLayout; 