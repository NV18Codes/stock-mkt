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
  const [validationErrors, setValidationErrors] = useState({});
  
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
      setFormData({
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
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Required fields validation
    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (formData.phone && !/^[0-9+\-\s()]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    // PAN validation
    if (formData.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) {
      errors.panNumber = 'Please enter a valid PAN number (e.g., ABCDE1234F)';
    }
    
    // Aadhar validation
    if (formData.aadharNumber && !/^[0-9]{12}$/.test(formData.aadharNumber)) {
      errors.aadharNumber = 'Please enter a valid 12-digit Aadhar number';
    }
    
    // Pincode validation
    if (formData.pincode && !/^[0-9]{6}$/.test(formData.pincode)) {
      errors.pincode = 'Please enter a valid 6-digit pincode';
    }
    
    // IFSC validation
    if (formData.ifscCode && !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifscCode)) {
      errors.ifscCode = 'Please enter a valid IFSC code';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setError('Please fix the validation errors below.');
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await updateProfile(formData);
      setSuccess('Profile updated successfully!');
      setValidationErrors({});
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail)) {
      setError('Please enter a valid email address');
      return;
    }
    
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
    
    // Validation
    if (!resetData.email || !resetData.token || !resetData.newPassword || !resetData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (resetData.newPassword !== resetData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (resetData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
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

  const InputField = ({ label, name, type = 'text', required = false, placeholder, validation }) => (
    <div style={{ marginBottom: '1.5em' }}>
      <label style={{ 
        color: '#495057', 
        fontWeight: 500, 
        display: 'block', 
        marginBottom: '0.5em', 
        fontSize: 14 
      }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        style={{ 
          width: '100%', 
          padding: '0.8em', 
          border: validationErrors[name] ? '1px solid #dc3545' : '1px solid #e0e0e0', 
          borderRadius: '6px', 
          fontSize: 14, 
          background: '#fff',
          transition: 'border-color 0.3s ease'
        }}
      />
      {validationErrors[name] && (
        <div style={{ 
          color: '#dc3545', 
          fontSize: 12, 
          marginTop: '0.3em' 
        }}>
          {validationErrors[name]}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '3em',
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-spinner" style={{
          width: '50px',
          height: '50px',
          border: '4px solid #e3e3e3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1em'
        }} />
        <p style={{ 
          color: '#2c3e50', 
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          fontWeight: 500
        }}>
          Loading your profile data...
        </p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: 1200, 
      margin: '0 auto', 
      padding: 'clamp(1.5em, 3vw, 2em)', 
      background: '#f8f9fa', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ 
        color: '#2c3e50', 
        marginBottom: '1.5em', 
        textAlign: 'center', 
        fontWeight: 600, 
        fontSize: 'clamp(1.8em, 4vw, 2.2em)'
      }}>
        Profile Settings
      </h1>
      
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1em', 
          borderRadius: '8px', 
          marginBottom: '1.5em', 
          border: '1px solid #f5c6cb', 
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: '1em', 
          borderRadius: '8px', 
          marginBottom: '1.5em', 
          border: '1px solid #c3e6cb', 
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em'
        }}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gap: '2em', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' 
      }}>
        {/* Personal Information */}
        <div style={{ 
          padding: '2em', 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '1.5em', 
            fontWeight: 600, 
            fontSize: '1.4em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <span>👤</span>
            Personal Information
          </h2>
          <form onSubmit={handleSubmit}>
            <InputField
              label="Full Name"
              name="name"
              required
              placeholder="Enter your full name"
            />
            
            <InputField
              label="Email Address"
              name="email"
              type="email"
              required
              placeholder="Enter your email address"
            />
            
            <InputField
              label="Phone Number"
              name="phone"
              required
              placeholder="Enter your phone number"
            />
            
            <InputField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              placeholder="Select your date of birth"
            />
            
            <div style={{ marginBottom: '1.5em' }}>
              <label style={{ 
                color: '#495057', 
                fontWeight: 500, 
                display: 'block', 
                marginBottom: '0.5em', 
                fontSize: 14 
              }}>
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                style={{ 
                  width: '100%', 
                  padding: '0.8em', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '6px', 
                  fontSize: 14, 
                  background: '#fff' 
                }}
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <InputField
              label="Address"
              name="address"
              placeholder="Enter your address"
            />
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1em' }}>
              <InputField
                label="City"
                name="city"
                placeholder="Enter city"
              />
              <InputField
                label="State"
                name="state"
                placeholder="Enter state"
              />
            </div>
            
            <InputField
              label="Pincode"
              name="pincode"
              placeholder="Enter 6-digit pincode"
            />
            
            <button
              type="submit"
              disabled={saving}
              style={{
                width: '100%',
                padding: '1em',
                background: saving ? '#6c757d' : '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: 16,
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: '1em'
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* KYC & Banking Information */}
        <div style={{ 
          padding: '2em', 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '1.5em', 
            fontWeight: 600, 
            fontSize: '1.4em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <span>🏦</span>
            KYC & Banking Details
          </h2>
          
          <InputField
            label="PAN Number"
            name="panNumber"
            placeholder="Enter PAN number (e.g., ABCDE1234F)"
          />
          
          <InputField
            label="Aadhar Number"
            name="aadharNumber"
            placeholder="Enter 12-digit Aadhar number"
          />
          
          <InputField
            label="Bank Name"
            name="bankName"
            placeholder="Enter bank name"
          />
          
          <InputField
            label="Account Number"
            name="accountNumber"
            placeholder="Enter account number"
          />
          
          <InputField
            label="IFSC Code"
            name="ifscCode"
            placeholder="Enter IFSC code"
          />
          
          <InputField
            label="Nominee Name"
            name="nomineeName"
            placeholder="Enter nominee name"
          />
          
          <InputField
            label="Nominee Relation"
            name="nomineeRelation"
            placeholder="Enter relation with nominee"
          />
          
          <InputField
            label="Nominee Phone"
            name="nomineePhone"
            placeholder="Enter nominee phone number"
          />
        </div>

        {/* Password Management */}
        <div style={{ 
          padding: '2em', 
          background: '#fff', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          border: '1px solid #e0e0e0' 
        }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: '1.5em', 
            fontWeight: 600, 
            fontSize: '1.4em',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <span>🔐</span>
            Password Management
          </h2>
          
          <div style={{ display: 'grid', gap: '1em', marginBottom: '1.5em' }}>
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              style={{
                width: '100%',
                padding: '1em',
                background: '#28a745',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Forgot Password
            </button>
            
            <button
              type="button"
              onClick={() => setShowResetPassword(true)}
              style={{
                width: '100%',
                padding: '1em',
                background: '#ffc107',
                color: '#212529',
                border: 'none',
                borderRadius: '8px',
                fontSize: 14,
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              Reset Password
            </button>
          </div>

          <p style={{ 
            color: '#6c757d', 
            margin: 0, 
            fontSize: 13,
            lineHeight: 1.5
          }}>
            Use "Forgot Password" to receive a reset link via email, or "Reset Password" if you already have a reset token.
          </p>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1em'
        }}>
          <div style={{
            background: '#fff',
            padding: '2em',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{ marginBottom: '1em', color: '#2c3e50' }}>Forgot Password</h3>
            <form onSubmit={handleForgotPassword}>
              <InputField
                label="Email Address"
                name="forgotEmail"
                type="email"
                required
                placeholder="Enter your email address"
              />
              <div style={{ display: 'flex', gap: '1em', marginTop: '1.5em' }}>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    flex: 1,
                    padding: '0.8em',
                    background: passwordLoading ? '#6c757d' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {passwordLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  style={{
                    flex: 1,
                    padding: '0.8em',
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
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
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1em'
        }}>
          <div style={{
            background: '#fff',
            padding: '2em',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '100%'
          }}>
            <h3 style={{ marginBottom: '1em', color: '#2c3e50' }}>Reset Password</h3>
            <form onSubmit={handleResetPassword}>
              <InputField
                label="Email Address"
                name="resetEmail"
                type="email"
                required
                placeholder="Enter your email address"
              />
              <InputField
                label="Reset Token"
                name="resetToken"
                required
                placeholder="Enter reset token from email"
              />
              <InputField
                label="New Password"
                name="newPassword"
                type="password"
                required
                placeholder="Enter new password"
              />
              <InputField
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm new password"
              />
              <div style={{ display: 'flex', gap: '1em', marginTop: '1.5em' }}>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    flex: 1,
                    padding: '0.8em',
                    background: passwordLoading ? '#6c757d' : '#007bff',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {passwordLoading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowResetPassword(false)}
                  style={{
                    flex: 1,
                    padding: '0.8em',
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
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