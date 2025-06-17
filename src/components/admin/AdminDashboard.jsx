import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios';

// const API = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const AdminDashboard = () => {
  // const [pl, setPL] = useState(null);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState('');

  // useEffect(() => {
  //   // Future: Fetch P/L and user stats from API
  // }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#007bff' }}>Admin Dashboard</h1>
      <div className="card" style={{ minWidth: 320, textAlign: 'center', marginBottom: '2em' }}>
        <h2>P/L Display</h2>
        {/* Future: Replace with real P/L data */}
        <p style={{ color: 'lightgreen', fontSize: '1.5em' }}>₹ 1,00,000</p>
      </div>
      <div style={{ display: 'flex', gap: '2em' }}>
        <Link to="/admin/profile"><button className="btn">Admin Profile Settings</button></Link>
        <Link to="/admin/users"><button className="btn">User Management</button></Link>
      </div>
    </div>
  );
};

export default AdminDashboard; 