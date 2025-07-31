import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Settings, 
  CreditCard, 
  Building2,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Plus,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { 
  updateProfile, 
  forgotPassword, 
  resetPassword, 
  getUserProfile,
  addBrokerAccount,
  fetchMyBrokerProfile,
  clearBrokerProfile,
  verifyBrokerConnection
} from '../../api/auth';
import { verifyBrokerTOTP, verifyBrokerMPIN } from '../../api/broker';
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

  // Broker account states
  const [brokerData, setBrokerData] = useState({
    broker: 'Angel One',
    apiKey: '',
    secretKey: '',
    clientId: '',
    password: '',
    mpin: '',
    totp: ''
  });
  const [showBrokerForm, setShowBrokerForm] = useState(false);
  const [brokerProfile, setBrokerProfile] = useState(null);
  const [brokerLoading, setBrokerLoading] = useState(false);
  const [brokerStep, setBrokerStep] = useState(1); // 1: Basic Info, 2: TOTP, 3: MPIN
  const [brokerSessionId, setBrokerSessionId] = useState(null);
  
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
    fetchBrokerProfile();
  }, []);

  const fetchBrokerProfile = async () => {
    try {
      const response = await fetchMyBrokerProfile();
      if (response && response.success && response.data) {
        setBrokerProfile(response.data);
      }
    } catch (error) {
      console.error('Error fetching broker profile:', error);
    }
  };

  const handleBrokerChange = (e) => {
    const { name, value } = e.target;
    setBrokerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddBroker = async (e) => {
    e.preventDefault();
    setBrokerLoading(true);
    setError('');
    setSuccess('');
    
    try {
      let response;
      
      if (brokerStep === 1) {
        // Step 1: Send basic credentials and get session ID for TOTP
        response = await addBrokerAccount({
          broker: brokerData.broker,
          clientId: brokerData.clientId,
          password: brokerData.password
        });
        
        if (response && response.success) {
          // Store session ID for next step
          setBrokerSessionId(response.data?.sessionId || response.sessionId);
          setBrokerStep(2);
          setSuccess('Please enter your TOTP to continue');
        }
      } else if (brokerStep === 2) {
        // Step 2: Send TOTP
        response = await verifyBrokerTOTP({
          sessionId: brokerSessionId,
          totp: brokerData.totp
        });
        
        if (response && response.success) {
          setBrokerStep(3);
          setSuccess('Please enter your MPIN to complete the connection');
        }
      } else if (brokerStep === 3) {
        // Step 3: Send MPIN and complete connection
        response = await verifyBrokerMPIN({
          sessionId: brokerSessionId,
          mpin: brokerData.mpin
        });
        
        if (response && response.success) {
          setSuccess('Broker account connected successfully!');
          setShowBrokerForm(false);
          setBrokerStep(1);
          setBrokerSessionId(null);
          setBrokerData({
            broker: 'Angel One',
            apiKey: '',
            secretKey: '',
            clientId: '',
            password: '',
            mpin: '',
            totp: ''
          });
          await fetchBrokerProfile();
        }
      }
    } catch (err) {
      console.error('Error in broker connection step:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          'Failed to connect broker account';
      setError(errorMessage);
      
      // Reset to step 1 if there's a critical error
      if (err.response?.status === 400 || err.response?.status === 401) {
        setBrokerStep(1);
        setBrokerSessionId(null);
      }
    } finally {
      setBrokerLoading(false);
    }
  };

  const handleClearBroker = async () => {
    if (window.confirm('Are you sure you want to disconnect your broker account?')) {
      try {
        await clearBrokerProfile();
        setBrokerProfile(null);
        setSuccess('Broker account disconnected successfully!');
      } catch (err) {
        console.error('Error clearing broker profile:', err);
        setError('Failed to disconnect broker account');
      }
    }
  };

  const resetBrokerForm = () => {
    setBrokerStep(1);
    setBrokerSessionId(null);
    setShowBrokerForm(false);
    setBrokerData({
      broker: 'Angel One',
      apiKey: '',
      secretKey: '',
      clientId: '',
      password: '',
      mpin: '',
      totp: ''
    });
    setError('');
    setSuccess('');
  };

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
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: 'clamp(1em, 3vw, 1.5em)', 
        background: 'var(--background-color)',
        minHeight: '100vh'
      }}
    >
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        style={{ 
          color: 'var(--text-primary)', 
          marginBottom: '2em', 
          textAlign: 'center', 
          fontWeight: 700, 
          fontSize: 'clamp(1.8em, 4vw, 2.5em)',
          letterSpacing: '-0.025em'
        }}
      >
        <Settings size={32} style={{ marginRight: '0.5em', verticalAlign: 'middle' }} />
        Admin Profile Settings
      </motion.h1>
      
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ 
              background: 'linear-gradient(135deg, #ff6b6b, #ee5a52)', 
              color: '#ffffff', 
              padding: '1em', 
              borderRadius: '12px', 
              marginBottom: '1.5em', 
              border: 'none', 
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
          >
            <AlertCircle size={20} />
            {error}
          </motion.div>
        )}
        
        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{ 
              background: 'linear-gradient(135deg, #00b894, #00a085)', 
              color: '#ffffff', 
              padding: '1em', 
              borderRadius: '12px', 
              marginBottom: '1.5em', 
              border: 'none', 
              fontSize: 'clamp(12px, 2.5vw, 14px)',
              boxShadow: '0 4px 12px rgba(0, 184, 148, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
          >
            <CheckCircle size={20} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ 
        display: 'grid', 
        gap: 'clamp(1em, 3vw, 1.5em)', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' 
      }}>
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

        {/* Broker Account Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ 
            padding: 'clamp(1em, 3vw, 1.5em)', 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: 'var(--shadow-md)', 
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5em', gap: '0.5em' }}>
            <CreditCard size={24} />
            <h2             style={{ 
              color: 'var(--text-primary)', 
              margin: 0, 
              fontWeight: 600, 
              fontSize: 'clamp(1.2em, 3vw, 1.4em)' 
            }}>
              Broker Account
            </h2>
          </div>

          {brokerProfile ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'var(--background-color)',
                padding: '1.5em',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5em', gap: '0.5em' }}>
                <CheckCircle size={20} color="var(--success-color)" />
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  color: 'var(--text-primary)'
                }}>
                  Connected to {brokerProfile.brokerName}
                </span>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1em',
                marginBottom: '2em'
              }}>
                <div style={{ 
                  background: 'white', 
                  padding: '1em', 
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem',
                    marginBottom: '0.25em'
                  }}>
                    Account ID
                  </div>
                  <div style={{ 
                    color: 'var(--text-primary)', 
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    {brokerProfile.accountId}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'white', 
                  padding: '1em', 
                  borderRadius: '8px',
                  border: '1px solid var(--border-color)'
                }}>
                  <div style={{ 
                    color: 'var(--text-secondary)', 
                    fontSize: '0.875rem',
                    marginBottom: '0.25em'
                  }}>
                    Status
                  </div>
                  <div style={{ 
                    color: 'var(--success-color)', 
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    {brokerProfile.status}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '1em',
                flexWrap: 'wrap'
              }}>
                <motion.button
                  onClick={handleClearBroker}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'var(--danger-color)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75em 1.5em',
                    borderRadius: '8px',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5em',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Trash2 size={16} />
                  Disconnect Broker
                </motion.button>
                
                <motion.button
                  onClick={() => setShowBrokerForm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75em 1.5em',
                    borderRadius: '8px',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5em',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <RefreshCw size={16} />
                  Change Broker
                </motion.button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'var(--background-color)',
                padding: '1.5em',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1em', 
                gap: '0.5em' 
              }}>
                <CreditCard size={20} color="var(--text-secondary)" />
                <span style={{ 
                  color: 'var(--text-primary)', 
                  fontWeight: '600',
                  fontSize: 'clamp(14px, 2.5vw, 16px)'
                }}>
                  No Broker Connected
                </span>
              </div>
              
              <p style={{ 
                color: 'var(--text-secondary)', 
                marginBottom: '1.5em',
                fontSize: 'clamp(12px, 2.5vw, 14px)',
                lineHeight: '1.5'
              }}>
                Connect your broker account to enable trading functionality and access advanced features.
              </p>
              
              {!showBrokerForm ? (
                <motion.button
                  onClick={() => setShowBrokerForm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    padding: '0.8em 1.5em',
                    borderRadius: '8px',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5em',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                >
                  <Plus size={16} />
                  Connect Broker Account
                </motion.button>
              ) : (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddBroker}
                  style={{ marginTop: '1em' }}
                >
                  {/* Progress Indicator */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '2rem',
                    position: 'relative'
                  }}>
                    {[1, 2, 3].map((step) => (
                      <div key={step} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        flex: 1
                      }}>
                        <div style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: brokerStep >= step ? 'var(--primary-color)' : 'var(--border-color)',
                          color: brokerStep >= step ? 'white' : 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '0.875rem',
                          marginBottom: '0.5rem'
                        }}>
                          {brokerStep > step ? '✓' : step}
                        </div>
                        <span style={{
                          fontSize: '0.75rem',
                          color: brokerStep >= step ? 'var(--text-primary)' : 'var(--text-secondary)',
                          fontWeight: '500',
                          textAlign: 'center'
                        }}>
                          {step === 1 ? 'Credentials' : step === 2 ? 'TOTP' : 'MPIN'}
                        </span>
                      </div>
                    ))}
                    {/* Progress Line */}
                    <div style={{
                      position: 'absolute',
                      top: '20px',
                      left: '20px',
                      right: '20px',
                      height: '2px',
                      background: 'var(--border-color)',
                      zIndex: -1
                    }}>
                      <div style={{
                        width: `${((brokerStep - 1) / 2) * 100}%`,
                        height: '100%',
                        background: 'var(--primary-color)',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Step 1: Basic Credentials */}
                  {brokerStep === 1 && (
                    <>
                      <div style={{ marginBottom: '1.5em' }}>
                        <label style={{ 
                          color: 'var(--text-primary)', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: 'clamp(12px, 2.5vw, 14px)' 
                        }}>
                          Select Broker *
                        </label>
                        <select
                          name="broker"
                          value={brokerData.broker}
                          onChange={handleBrokerChange}
                          required
                          style={{ 
                            width: '100%', 
                            padding: '0.75em', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            fontSize: 'clamp(12px, 2.5vw, 14px)', 
                            background: 'white',
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s ease'
                          }}
                    >
                      <option value="Angel One">Angel One</option>
                      <option value="Zerodha">Zerodha</option>
                      <option value="Upstox">Upstox</option>
                      <option value="ICICI Direct">ICICI Direct</option>
                    </select>
                  </div>

                  <div style={{ marginBottom: '1.5em' }}>
                    <label style={{ 
                      color: 'var(--text-primary)', 
                      fontWeight: 600, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(12px, 2.5vw, 14px)' 
                    }}>
                      Client ID *
                    </label>
                    <input
                      type="text"
                      name="clientId"
                      value={brokerData.clientId}
                      onChange={handleBrokerChange}
                      placeholder="Enter your Client ID"
                      required
                      style={{ 
                        width: '100%', 
                        padding: '0.75em', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(12px, 2.5vw, 14px)', 
                        background: 'white',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: '2em' }}>
                    <label style={{ 
                      color: 'var(--text-primary)', 
                      fontWeight: 600, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(12px, 2.5vw, 14px)' 
                    }}>
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={brokerData.password}
                      onChange={handleBrokerChange}
                      placeholder="Enter your password"
                      required
                      style={{ 
                        width: '100%', 
                        padding: '0.75em', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(12px, 2.5vw, 14px)', 
                        background: 'white',
                        color: 'var(--text-primary)',
                        transition: 'all 0.2s ease'
                      }}
                    />
                  </div>
                    </>
                  )}

                  {/* Step 2: TOTP Verification */}
                  {brokerStep === 2 && (
                    <>
                      <div style={{ marginBottom: '2em' }}>
                        <label style={{ 
                          color: 'var(--text-primary)', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: 'clamp(12px, 2.5vw, 14px)' 
                        }}>
                          TOTP Code *
                        </label>
                        <input
                          type="text"
                          name="totp"
                          value={brokerData.totp}
                          onChange={handleBrokerChange}
                          placeholder="Enter 6-digit TOTP from your authenticator app"
                          maxLength="6"
                          pattern="[0-9]{6}"
                          required
                          style={{ 
                            width: '100%', 
                            padding: '0.75em', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            fontSize: 'clamp(12px, 2.5vw, 14px)', 
                            background: 'white',
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s ease',
                            textAlign: 'center',
                            letterSpacing: '0.5em'
                          }}
                        />
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          marginTop: '0.5rem',
                          textAlign: 'center'
                        }}>
                          Enter the 6-digit code from your authenticator app
                        </p>
                      </div>
                    </>
                  )}

                  {/* Step 3: MPIN Verification */}
                  {brokerStep === 3 && (
                    <>
                      <div style={{ marginBottom: '2em' }}>
                        <label style={{ 
                          color: 'var(--text-primary)', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: 'clamp(12px, 2.5vw, 14px)' 
                        }}>
                          MPIN *
                        </label>
                        <input
                          type="password"
                          name="mpin"
                          value={brokerData.mpin}
                          onChange={handleBrokerChange}
                          placeholder="Enter your 4-digit MPIN"
                          maxLength="4"
                          pattern="[0-9]{4}"
                          required
                          style={{ 
                            width: '100%', 
                            padding: '0.75em', 
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            fontSize: 'clamp(12px, 2.5vw, 14px)', 
                            background: 'white',
                            color: 'var(--text-primary)',
                            transition: 'all 0.2s ease',
                            textAlign: 'center',
                            letterSpacing: '0.5em'
                          }}
                        />
                        <p style={{
                          color: 'var(--text-secondary)',
                          fontSize: '0.75rem',
                          marginTop: '0.5rem',
                          textAlign: 'center'
                        }}>
                          Enter your 4-digit MPIN for broker authentication
                        </p>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '1em', marginTop: '1.5em' }}>
                    <motion.button
                      type="submit"
                      disabled={brokerLoading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        background: 'var(--primary-color)',
                        color: 'white',
                        border: 'none',
                        padding: '0.75em 1em',
                        borderRadius: '8px',
                        fontSize: 'clamp(12px, 2.5vw, 14px)',
                        fontWeight: 600,
                        cursor: brokerLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5em',
                        boxShadow: 'var(--shadow-sm)',
                        opacity: brokerLoading ? 0.7 : 1
                      }}
                    >
                      {brokerLoading ? (
                        <>
                          <RefreshCw size={16} className="spin" />
                          {brokerStep === 1 ? 'Verifying...' : brokerStep === 2 ? 'Verifying TOTP...' : 'Verifying MPIN...'}
                        </>
                      ) : (
                        <>
                          <CheckCircle size={16} />
                          {brokerStep === 1 ? 'Continue' : brokerStep === 2 ? 'Verify TOTP' : 'Complete Connection'}
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={brokerStep === 1 ? () => setShowBrokerForm(false) : () => setBrokerStep(brokerStep - 1)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      style={{
                        flex: 1,
                        background: 'white',
                        color: 'var(--text-primary)',
                        border: '2px solid var(--border-color)',
                        padding: '0.75em 1em',
                        borderRadius: '8px',
                        fontSize: 'clamp(12px, 2.5vw, 14px)',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {brokerStep === 1 ? 'Cancel' : 'Back'}
                    </motion.button>
                  </div>
                </motion.form>
              )}
            </motion.div>
          )}
        </motion.div>

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
    </motion.div>
  );
};

export default AdminProfileSettings; 