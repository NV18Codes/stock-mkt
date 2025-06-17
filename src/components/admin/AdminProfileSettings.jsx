import React, { useState } from 'react';

const AdminProfileSettings = () => {
  const [admin, setAdmin] = useState({ name: 'Admin', email: 'admin@example.com' });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setAdmin({ ...admin, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => setSaving(false), 1000); // Dummy save
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <h1 style={{ color: '#007bff' }}>Admin Profile Settings</h1>
      <form className="card" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input name="name" value={admin.name} onChange={handleChange} required />
        </div>
        <div>
          <label>Email</label>
          <input name="email" value={admin.email} onChange={handleChange} required />
        </div>
        <button className="btn" type="submit" style={{ width: '100%' }} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
      </form>
    </div>
  );
};

export default AdminProfileSettings; 