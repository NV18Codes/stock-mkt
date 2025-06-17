import React from 'react';
import { Outlet } from 'react-router-dom';

const UserLayout = () => {
  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* You can add a user-specific sidebar or header here if needed */}
      <Outlet />
    </div>
  );
};

export default UserLayout; 