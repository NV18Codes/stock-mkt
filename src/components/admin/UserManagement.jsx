import React from 'react';

const dummyUsers = [
  { id: 1, name: 'User One', email: 'user1@example.com', role: 'user' },
  { id: 2, name: 'User Two', email: 'user2@example.com', role: 'user' },
  { id: 3, name: 'Admin', email: 'admin@example.com', role: 'admin' },
];

const UserManagement = () => (
  <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
    <h1 style={{ color: '#007bff' }}>User Management</h1>
    <div className="card" style={{ minWidth: 500 }}>
      <table style={{ width: '100%', color: '#fff', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #007bff' }}>
            <th style={{ padding: '0.5em' }}>Name</th>
            <th style={{ padding: '0.5em' }}>Email</th>
            <th style={{ padding: '0.5em' }}>Role</th>
            <th style={{ padding: '0.5em' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {dummyUsers.map(user => (
            <tr key={user.id} style={{ borderBottom: '1px solid #222' }}>
              <td style={{ padding: '0.5em' }}>{user.name}</td>
              <td style={{ padding: '0.5em' }}>{user.email}</td>
              <td style={{ padding: '0.5em' }}>{user.role}</td>
              <td style={{ padding: '0.5em' }}><button className="btn">Edit</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default UserManagement; 