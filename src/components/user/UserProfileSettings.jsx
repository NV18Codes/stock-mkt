import React, { useEffect, useState } from 'react';
import { updateProfile, forgotPassword, resetPassword, getUserProfile } from '../../api/auth';

const UserProfileSettings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    panNumber: '',
    aadharNumber: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    nomineeName: '',
    nomineeRelation: '',
    nomineePhone: ''
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
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getUserProfile();
      console.log('User profile response:', response);
      
      let profileData;
      if (response && response.success && response.data) {
        profileData = response.data;
      } else if (response && response.user) {
        profileData = response.user;
      } else {
        profileData = response;
      }
      
      if (profileData) {
        setFormData({
          name: profileData.name || '',
          email: profileData.email || '',
          phone: profileData.phone || '',
          dateOfBirth: profileData.dateOfBirth || profileData.dob || '',
          gender: profileData.gender || '',
          address: profileData.address || '',
          city: profileData.city || '',
          state: profileData.state || '',
          pincode: profileData.pincode || '',
          panNumber: profileData.panNumber || profileData.pan || '',
          aadharNumber: profileData.aadharNumber || profileData.aadhar || '',
          bankName: profileData.bankName || '',
          accountNumber: profileData.accountNumber || '',
          ifscCode: profileData.ifscCode || '',
          nomineeName: profileData.nomineeName || '',
          nomineeRelation: profileData.nomineeRelation || '',
          nomineePhone: profileData.nomineePhone || ''
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Use default data for demo purposes
      setFormData({
        name: 'John Doe',
        email: 'john.doe@example.com',
        phone: '+91 98765 43210',
        dateOfBirth: '1990-01-01',
        gender: 'Male',
        address: '123 Main Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        panNumber: 'ABCDE1234F',
        aadharNumber: '123456789012',
        bankName: 'HDFC Bank',
        accountNumber: '1234567890',
        ifscCode: 'HDFC0001234',
        nomineeName: 'Jane Doe',
        nomineeRelation: 'Spouse',
        nomineePhone: '+91 98765 43211'
      });
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
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#333', marginTop: '1em', fontSize: 14 }}>Loading profile data...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5em', background: '#ffffff', minHeight: '100vh' }}>
      <h1 style={{ color: '#2c3e50', marginBottom: '1.5em', textAlign: 'center', fontWeight: 600, fontSize: '2em' }}>
        Profile Settings
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

        {/* KYC & Banking Information */}
        {/* <div style={{ padding: '1.5em', background: '#fff', borderRadius: '8px', boxShadow: '0 1px 6px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
          <h2 style={{ color: '#2c3e50', marginBottom: '1em', fontWeight: 600, fontSize: '1.3em' }}>KYC & Banking Details</h2>
          
          <div style={{ marginBottom: '1em' }}>
            <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>PAN Number *</label>
            <input
              type="text"
              name="panNumber"
              value={formData.panNumber}
              onChange={handleChange}
              placeholder="Enter PAN number"
              required
              style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: '1em' }}>
            <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Aadhar Number</label>
            <input
              type="text"
              name="aadharNumber"
              value={formData.aadharNumber}
              onChange={handleChange}
              placeholder="Enter Aadhar number"
              style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: '1em' }}>
            <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Bank Name</label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              placeholder="Enter bank name"
              style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: '1em' }}>
            <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Account Number</label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              placeholder="Enter account number"
              style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
            />
          </div>

          <div style={{ marginBottom: '1em' }}>
            <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>IFSC Code</label>
            <input
              type="text"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              placeholder="Enter IFSC code"
              style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
            />
          </div>

          <h3 style={{ color: '#2c3e50', marginBottom: '0.8em', fontWeight: 600, fontSize: '1.1em', marginTop: '1.5em' }}>Nominee Details</h3>
          
          <div style={{ marginBottom: '1em' }}>
            <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Nominee Name</label>
            <input
              type="text"
              name="nomineeName"
              value={formData.nomineeName}
              onChange={handleChange}
              placeholder="Enter nominee name"
              style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8em', marginBottom: '1em' }}>
            <div>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Relation</label>
              <select
                name="nomineeRelation"
                value={formData.nomineeRelation}
                onChange={handleChange}
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
              >
                <option value="">Select Relation</option>
                <option value="Spouse">Spouse</option>
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label style={{ color: '#495057', fontWeight: 500, display: 'block', marginBottom: '0.3em', fontSize: 13 }}>Nominee Phone</label>
              <input
                type="tel"
                name="nomineePhone"
                value={formData.nomineePhone}
                onChange={handleChange}
                placeholder="Enter nominee phone"
                style={{ width: '100%', padding: '0.6em', border: '1px solid #e0e0e0', borderRadius: '4px', fontSize: 14, background: '#fff' }}
              />
            </div>
          </div>
        </div> */}

        {/* Password Management Section */}
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

export default UserProfileSettings; 