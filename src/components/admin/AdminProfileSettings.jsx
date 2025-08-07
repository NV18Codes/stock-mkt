import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  CreditCard, 
  CheckCircle, 
  X, 
  Plus,
  Shield,
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { updateProfile, getUserProfile } from '../../api/auth';
import { 
  addBrokerAccount, 
  fetchMyBrokerProfile, 
  clearBrokerProfile 
} from '../../api/auth';
import { verifyBrokerTOTP, verifyBrokerMPIN } from '../../api/broker';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios'; // Added axios import

const AdminProfileSettings = () => {
  const { role } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    employeeId: '',
    designation: '',
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
  
  // Broker connection states
  const [brokerData, setBrokerData] = useState({
    broker: 'Angel One',
    broker_name: 'angelone',
    broker_client_id: '',
    broker_api_key: '',
    broker_api_secret: '',
    angelone_token: '',
    password: '',
    mpin: '',
    totp: ''
  });
  
  const [brokerProfile, setBrokerProfile] = useState(null);
  const [showBrokerForm, setShowBrokerForm] = useState(false);
  const [brokerStep, setBrokerStep] = useState(1);
  const [brokerSessionId, setBrokerSessionId] = useState(null);
  const [brokerLoading, setBrokerLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
         // Step 1: Send API credentials and get session ID for TOTP verification
         response = await addBrokerAccount({
           broker: brokerData.broker,
           broker_name: brokerData.broker_name,
           broker_client_id: brokerData.broker_client_id,
           broker_api_key: brokerData.broker_api_key,
           broker_api_secret: brokerData.broker_api_secret,
           angelone_token: brokerData.angelone_token
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
             broker_name: 'angelone',
             broker_client_id: '',
             broker_api_key: '',
             broker_api_secret: '',
             angelone_token: '',
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
      broker_name: 'angelone',
      broker_client_id: '',
      broker_api_key: '',
      broker_api_secret: '',
      angelone_token: '',
      password: '',
      mpin: '',
      totp: ''
    });
    setError('');
    setSuccess('');
  };

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch from API
      let userData;
        try {
          const response = await getUserProfile();
          userData = response.data;
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          // Try alternative endpoint
          try {
            const altResponse = await axios.get('/api/auth/me');
            userData = altResponse.data.data || altResponse.data;
          } catch (altError) {
            console.error('Alternative profile fetch failed:', altError);
            // Use fallback data
            userData = {
              name: 'Demo User',
              email: 'demo@example.com',
              phone: '+91 98765 43210',
              role: 'admin',
              employee_id: 'EMP001'
            };
          }
        }
      
      // Update form data with fetched user data
      setFormData({
        name: userData.name || userData.full_name || userData.first_name || '',
        email: userData.email || userData.email_address || '',
        phone: userData.phone || userData.phone_number || '',
        role: userData.role || userData.user_role || 'admin',
        employeeId: userData.employee_id || userData.employeeId || ''
      });
      
    } catch (err) {
      console.error('Error in fetchAdminProfile:', err);
      setError('Failed to fetch profile data');
      
      // Set fallback data
      setFormData({
        name: 'Demo User',
        email: 'demo@example.com',
        phone: '+91 98765 43210',
        role: 'admin',
        employeeId: 'EMP001'
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
      console.log('Submitting profile data:', formData);
      const response = await updateProfile(formData);
      console.log('Profile update response:', response);
      
      // Handle different response formats
      if (response && (response.success || response.message)) {
        setSuccess(response.message || 'Profile updated successfully!');
        

      } else {
        setSuccess('Profile updated successfully!');
      }
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      console.error('Error updating profile:', err);
      
      // Handle different error formats
      let errorMessage = 'Failed to update profile';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Please check your permissions.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Profile update endpoint not found.';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      }
      
      setError(errorMessage);
      
      // Clear error message after 5 seconds
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaving(false);
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
          
          {/* Password Management Section */}
          <div style={{ 
            padding: '1em', 
            background: '#fff3cd', 
            borderRadius: '6px', 
            border: '1px solid #ffeaa7',
            marginBottom: '1.5em'
          }}>
            <h3 style={{ 
              color: '#856404', 
              marginBottom: '0.5em', 
              fontWeight: 600, 
              fontSize: '1em',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <span>🔐</span>
              Password Management
            </h3>
            <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
              <Link to="/forgot-password" style={{
                padding: '0.5em 1em',
                background: '#007bff',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#0056b3';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#007bff';
              }}>
                Forgot Password
              </Link>
              <Link to="/reset-password" style={{
                padding: '0.5em 1em',
                background: '#28a745',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: 12,
                fontWeight: 500,
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#1e7e34';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#28a745';
              }}>
                Reset Password
              </Link>
            </div>
          </div>

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
                cursor: 'pointer',
                marginBottom: '1em'
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
                          {step === 1 ? 'API Credentials' : step === 2 ? 'TOTP Verification' : 'MPIN Verification'}
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

                  {/* Step 1: API Credentials */}
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
                       Broker Client ID *
                     </label>
                     <input
                       type="text"
                       name="broker_client_id"
                       value={brokerData.broker_client_id}
                       onChange={handleBrokerChange}
                       placeholder="Enter your Broker Client ID (e.g., Y69925)"
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

                   <div style={{ marginBottom: '1.5em' }}>
                     <label style={{ 
                       color: 'var(--text-primary)', 
                       fontWeight: 600, 
                       display: 'block', 
                       marginBottom: '0.5em', 
                       fontSize: 'clamp(12px, 2.5vw, 14px)' 
                     }}>
                       Broker API Key *
                     </label>
                     <input
                       type="text"
                       name="broker_api_key"
                       value={brokerData.broker_api_key}
                       onChange={handleBrokerChange}
                       placeholder="Enter your Broker API Key (e.g., lY8ntMyP)"
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

                   <div style={{ marginBottom: '1.5em' }}>
                     <label style={{ 
                       color: 'var(--text-primary)', 
                       fontWeight: 600, 
                       display: 'block', 
                       marginBottom: '0.5em', 
                       fontSize: 'clamp(12px, 2.5vw, 14px)' 
                     }}>
                       Broker API Secret *
                     </label>
                     <input
                       type="password"
                       name="broker_api_secret"
                       value={brokerData.broker_api_secret}
                       onChange={handleBrokerChange}
                       placeholder="Enter your Broker API Secret (e.g., Smarttest@123)"
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

                   <div style={{ marginBottom: '1.5em' }}>
                     <label style={{ 
                       color: 'var(--text-primary)', 
                       fontWeight: 600, 
                       display: 'block', 
                       marginBottom: '0.5em', 
                       fontSize: 'clamp(12px, 2.5vw, 14px)' 
                     }}>
                       Angel One Token *
                     </label>
                     <input
                       type="text"
                       name="angelone_token"
                       value={brokerData.angelone_token}
                       onChange={handleBrokerChange}
                       placeholder="Enter your Angel One Token (e.g., VXJB7SPIYYNI6CRUNCUZYWJFTA)"
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

        {/* Admin Information Section */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ 
            marginTop: '2em',
            padding: 'clamp(1em, 3vw, 1.5em)', 
            background: 'white', 
            borderRadius: '12px', 
            boxShadow: 'var(--shadow-md)', 
            border: '1px solid var(--border-color)',
            color: 'var(--text-primary)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5em', gap: '0.5em' }}>
            <User size={24} />
            <h2 style={{ 
              color: 'var(--text-primary)', 
              margin: 0, 
              fontWeight: 600, 
              fontSize: 'clamp(1.2em, 3vw, 1.4em)' 
            }}>
              Admin Information
            </h2>
          </div>

          <div style={{ 
            padding: '1em', 
            background: '#e3f2fd', 
            borderRadius: '6px', 
            border: '1px solid #bbdefb' 
          }}>
            <div style={{ marginBottom: '0.5em' }}>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Role: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12, textTransform: 'capitalize' }}>{role || formData.role}</span>
            </div>
            
            <div style={{ marginBottom: '0.5em' }}>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Employee ID: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12 }}>{formData.employeeId || 'Not set'}</span>
            </div>
            
            <div>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Access Level: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12 }}>Full Administrative Access</span>
            </div>
          </div>
        </motion.div>
      </div>


    </motion.div>
  );
};

export default AdminProfileSettings; 