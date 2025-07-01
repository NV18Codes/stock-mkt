import React, { useEffect, useState } from 'react';
import { updateProfile, forgotPassword, resetPassword, getUserProfile } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const AdminProfileSettings = () => {
  const { user: currentUser, refreshUser } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'Admin',
    department: '',
    employeeId: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Password reset states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetData, setResetData] = useState({
    email: '',
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching admin profile...');
      const response = await getUserProfile();
      console.log('Admin profile response:', response);
      
      let profileData;
      if (response && response.data) {
        profileData = response.data;
      } else if (response && response.user) {
        profileData = response.user;
      } else {
        profileData = response;
      }
      
      console.log('Profile data to use:', profileData);
      
      if (profileData) {
        setFormData({
          name: profileData.name || profileData.full_name || profileData.first_name || '',
          email: profileData.email || profileData.email_address || '',
          phone: profileData.phone || profileData.phone_number || '',
          role: profileData.role || profileData.user_role || 'Admin',
          department: profileData.department || '',
          employeeId: profileData.employee_id || profileData.employeeId || '',
          dateOfBirth: profileData.date_of_birth || profileData.dob || profileData.dateOfBirth || '',
          gender: profileData.gender || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          pincode: profileData.pincode || ''
        });
      } else {
        // Use current user data as fallback
        if (currentUser) {
          setFormData({
            name: currentUser.name || currentUser.full_name || currentUser.first_name || '',
            email: currentUser.email || currentUser.email_address || '',
            phone: currentUser.phone || currentUser.phone_number || '',
            role: currentUser.role || currentUser.user_role || 'Admin',
            department: currentUser.department || '',
            employeeId: currentUser.employee_id || currentUser.employeeId || '',
            dateOfBirth: currentUser.date_of_birth || currentUser.dob || currentUser.dateOfBirth || '',
            gender: currentUser.gender || '',
            address: currentUser.address || '',
            city: currentUser.city || '',
            state: currentUser.state || '',
            pincode: currentUser.pincode || ''
          });
        }
      }
    } catch (err) {
      console.error('Error fetching admin profile:', err);
      // Use current user data as fallback
      if (currentUser) {
        setFormData({
          name: currentUser.name || currentUser.full_name || currentUser.first_name || '',
          email: currentUser.email || currentUser.email_address || '',
          phone: currentUser.phone || currentUser.phone_number || '',
          role: currentUser.role || currentUser.user_role || 'Admin',
          department: currentUser.department || '',
          employeeId: currentUser.employee_id || currentUser.employeeId || '',
          dateOfBirth: currentUser.date_of_birth || currentUser.dob || currentUser.dateOfBirth || '',
          gender: currentUser.gender || '',
          address: currentUser.address || '',
          city: currentUser.city || '',
          state: currentUser.state || '',
          pincode: currentUser.pincode || ''
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      // Refresh user data in context
      if (refreshUser) {
        await refreshUser();
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setPasswordLoading(true);
    setError('');
    setSuccess('');
    try {
      await forgotPassword({ email: forgotEmail });
      setSuccess('Password reset link sent to your email!');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (err) {
      console.error('Error sending forgot password:', err);
      setError(err.response?.data?.message || 'Failed to send reset link');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.newPassword !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    setError('');
    setSuccess('');
    try {
      await resetPassword({
        email: resetData.email,
        token: resetData.token,
        newPassword: resetData.newPassword
      });
      setSuccess('Password reset successfully!');
      setShowResetPassword(false);
      setResetData({ email: '', token: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Error resetting password:', err);
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '1.5em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#333', marginTop: '0.5em', fontSize: 14 }}>Loading admin profile data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5em', background: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '1.5em', textAlign: 'center', fontWeight: 600, fontSize: '2em' }}>
        Admin Profile Settings
      </h1>
      
      {error && (
        <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.8em', borderRadius: '6px', marginBottom: '1em', border: '1px solid #f5c6cb', fontSize: 14 }}>
          {error}
        </div>
      )}
      
      {success && (
        <div style={{ background: '#d4edda', color: '#155724', padding: '0.8em', borderRadius: '6px', marginBottom: '1em', border: '1px solid #c3e6cb', fontSize: 14 }}>
          {success}
        </div>
      )}

      <div style={{ display: 'grid', gap: '1.5em', gridTemplateColumns: '1fr 1fr' }}>
        {/* Personal Information */}
        <div style={{ padding: '1.5em', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '1em', fontWeight: 600, fontSize: '1.3em' }}>Personal Information</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                required
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8em', marginBottom: '1em' }}>
              <div>
                <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  placeholder="Admin"
                  readOnly
                  style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#f8f9fa', color: '#6c757d' }}
                />
              </div>
              <div>
                <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Employee ID</label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  placeholder="Enter employee ID"
                  style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="Enter department"
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
              />
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Address</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter your address"
                rows="3"
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8em', marginBottom: '1em' }}>
              <div>
                <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="City"
                  style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
                />
              </div>
              <div>
                <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="State"
                  style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5em' }}>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Pincode</label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                placeholder="Enter pincode"
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
              />
            </div>

            <button 
              type="submit" 
              disabled={saving}
              style={{ 
                width: '100%', 
                padding: '0.8em',
                background: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {saving ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password Management Section */}
        <div>
          <div style={{ marginTop: '2em', padding: '1em', background: '#f8f9fa', borderRadius: '6px', border: '1px solid #e9ecef' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '0.8em', fontWeight: 600, fontSize: '1.1em' }}>Password Management</h3>
            
            <div style={{ display: 'flex', gap: '0.8em', marginBottom: '0.8em' }}>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  flex: 1,
                  padding: '0.6em',
                  background: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Forgot Password
              </button>
              
              <button
                type="button"
                onClick={() => setShowResetPassword(true)}
                style={{
                  flex: 1,
                  padding: '0.6em',
                  background: '#ffc107',
                  color: '#212529',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reset Password
              </button>
            </div>

            <p style={{ color: '#6c757d', margin: 0, fontSize: 12 }}>
              Use "Forgot Password" to receive a reset link via email, or "Reset Password" if you already have a reset token.
            </p>
          </div>
          <div style={{ marginTop: '1.5em', padding: '1em', background: '#e3f2fd', borderRadius: '6px', border: '1px solid #bbdefb' }}>
            <h3 style={{ color: '#1976d2', marginBottom: '0.8em', fontWeight: 600, fontSize: '1.1em' }}>Admin Information</h3>
            
            <div style={{ marginBottom: '0.5em' }}>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Role: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12 }}>{formData.role}</span>
            </div>
            
            <div style={{ marginBottom: '0.5em' }}>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Employee ID: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12 }}>{formData.employeeId || 'Not set'}</span>
            </div>
            
            <div style={{ marginBottom: '0.5em' }}>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Department: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12 }}>{formData.department || 'Not set'}</span>
            </div>
            
            <div>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Access Level: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12 }}>Full Administrative Access</span>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5em', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1em', fontWeight: 600, fontSize: '1.2em' }}>Forgot Password</h3>
            <form onSubmit={handleForgotPassword}>
              <div style={{ marginBottom: '1em' }}>
                <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Email Address</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.8em' }}>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    flex: 1,
                    padding: '0.6em',
                    background: '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {passwordLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  style={{
                    flex: 1,
                    padding: '0.6em',
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {showResetPassword && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '1.5em', maxWidth: '400px', width: '90%' }}>
            <h3 style={{ color: '#2c3e50', marginBottom: '1em', fontWeight: 600, fontSize: '1.2em' }}>Reset Password</h3>
            <form onSubmit={handleResetPassword}>
              <div style={{ marginBottom: '0.8em' }}>
                <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Email Address</label>
                <input type="email" value={resetData.email} onChange={(e) => setResetData({...resetData, email: e.target.value})} placeholder="Enter your email" required style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: '0.8em' }}>
                <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Reset Token</label>
                <input type="text" value={resetData.token} onChange={(e) => setResetData({...resetData, token: e.target.value})} placeholder="Enter reset token" required style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: '0.8em' }}>
                <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>New Password</label>
                <input type="password" value={resetData.newPassword} onChange={(e) => setResetData({...resetData, newPassword: e.target.value})} placeholder="Enter new password" required style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14 }} />
              </div>
              <div style={{ marginBottom: '1em' }}>
                <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Confirm Password</label>
                <input type="password" value={resetData.confirmPassword} onChange={(e) => setResetData({...resetData, confirmPassword: e.target.value})} placeholder="Confirm new password" required style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14 }} />
              </div>
              <div style={{ display: 'flex', gap: '0.8em' }}>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    flex: 1,
                    padding: '0.6em',
                    background: '#28a745',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  {passwordLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  style={{
                    flex: 1,
                    padding: '0.6em',
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProfileSettings; 