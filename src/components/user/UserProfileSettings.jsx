import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateProfile, getUserProfile, changeEmail, fetchMyBrokerProfile } from '../../api/auth';
import { 
  addBrokerAccount, 
  clearBrokerConnection 
} from '../../api/auth';
import { verifyBrokerTOTP } from '../../api/broker';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Plus,
  Trash2,
  Eye,
  EyeOff,
  User
} from 'lucide-react';

const UserProfileSettings = () => {
  const { role, user, refreshUser } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
  
  // Broker connection states
  const [brokerData, setBrokerData] = useState({
    broker_name: 'angelone',
    broker_client_id: '',
    broker_api_key: '',
    broker_api_secret: '',
    angelone_token: '',
    angelone_mpin: '',
    totp: '',
    showHashedDetails: false
  });
  
  const [brokerProfile, setBrokerProfile] = useState(null);
  const [showBrokerForm, setShowBrokerForm] = useState(false);
  const [brokerStep, setBrokerStep] = useState(1);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [brokerLoading, setBrokerLoading] = useState(false);
  const [intentionallyDisconnected, setIntentionallyDisconnected] = useState(false);

  // Hash sensitive data for display
  const hashSensitiveData = (data) => {
    if (!data || data.trim() === '') return '';
    const length = data.length;
    if (length <= 4) return '*'.repeat(length);
    return '*'.repeat(length - 4) + data.slice(-4);
  };

  useEffect(() => {
    fetchUserProfile();
    fetchBrokerProfile();
  }, []);



  const fetchBrokerProfile = async () => {
    try {
      // Use the proper API function instead of direct fetch
      const response = await fetchMyBrokerProfile();
      
      if (response && response.success && response.data) {
        const data = response.data;
        // Map the API response fields to the expected frontend fields
        const mappedBrokerProfile = {
            brokerName: data.broker_name || data.brokerName || 'No Broker Connected',
            accountId: data.broker_client_id || data.accountId || 'N/A',
            status: data.is_active_for_trading ? 'Active' : 'Inactive',
            exchanges: data.exchanges || [],
            products: data.products || [],
          // Add other fields as needed
            ...data
        };
        
        setBrokerProfile(mappedBrokerProfile);
      } else {
        // If no broker profile data, set to "No Broker Connected" state
        setBrokerProfile({
          brokerName: 'No Broker Connected',
          accountId: 'N/A',
          status: 'Inactive',
          exchanges: [],
          products: []
        });
      }
    } catch (error) {
      console.error('Error fetching broker profile:', error);
      setBrokerProfile({
        brokerName: 'No Broker Connected',
        accountId: 'N/A',
        status: 'Inactive',
        exchanges: [],
        products: []
      });
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
    
    try {
      if (brokerStep === 1) {
        // Step 1: Add broker account with MPIN
        const brokerPayload = {
          broker_name: brokerData.broker_name,
          broker_client_id: brokerData.broker_client_id,
          broker_api_key: brokerData.broker_api_key,
          broker_api_secret: brokerData.broker_api_secret,
          angelone_mpin: brokerData.angelone_mpin,
          angelone_token: brokerData.angelone_token
        };

        const response = await addBrokerAccount(brokerPayload);
        
        if (response && response.success) {
          setBrokerStep(2);
          setSuccess('Broker account added successfully! Please enter TOTP to complete verification.');
        } else {
          setError(response?.message || 'Failed to add broker account');
        }
      } else if (brokerStep === 2) {
        // Step 2: Verify TOTP
        const totpPayload = {
          totp: brokerData.totp
        };

        const response = await verifyBrokerTOTP(totpPayload);
        
        if (response && response.success) {
          setSuccess('Broker account verified successfully!');
          setShowBrokerForm(false);
          setBrokerStep(1);
          setIntentionallyDisconnected(false); // Reset the disconnected flag
          resetBrokerForm();
          fetchBrokerProfile(); // Refresh broker profile
        } else {
          setError(response?.message || 'TOTP verification failed');
        }
      }
    } catch (error) {
      console.error('Error in broker setup:', error);
      setError(error.message || 'An error occurred during broker setup');
    } finally {
      setBrokerLoading(false);
    }
  };

  const handleClearBroker = async () => {
    if (window.confirm('Are you sure you want to disconnect your broker account? This action cannot be undone.')) {
      setBrokerLoading(true);
      try {
        const response = await clearBrokerConnection();
        if (response && response.success) {
          setSuccess('Broker account disconnected successfully!');
          
          // Clear broker profile immediately
          setBrokerProfile(null);
          
          // Mark as intentionally disconnected to prevent auto-reconnection
          setIntentionallyDisconnected(true);
          
          // Show the broker connection form after disconnecting
          setShowBrokerForm(true);
          
          // Reset broker step to 1
          setBrokerStep(1);
          
          // Clear broker data
          setBrokerData({
            broker_name: 'angelone',
            broker_client_id: '',
            broker_api_key: '',
            broker_api_secret: '',
            angelone_token: '',
            angelone_mpin: '',
            totp: '',
            showHashedDetails: false
          });
          
          // Refresh both broker profile and user profile
          await fetchBrokerProfile();
          await fetchUserProfile();
          
          // Force a re-render by updating the form data
          setFormData(prev => ({
            ...prev,
            lastUpdated: Date.now()
          }));
        } else {
          setError(response?.message || 'Failed to disconnect broker account.');
        }
      } catch (error) {
        console.error('Error disconnecting broker account:', error);
        setError('Failed to disconnect broker account. Please try again.');
      } finally {
        setBrokerLoading(false);
      }
    }
  };

  const resetBrokerForm = () => {
    setBrokerData({
      broker_name: 'angelone',
      broker_client_id: '',
      broker_api_key: '',
      broker_api_secret: '',
      angelone_token: '',
      angelone_mpin: '',
      totp: '',
      showHashedDetails: false
    });
    setBrokerStep(1);
    setError('');
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Check localStorage first for persisted data
      const persistedName = localStorage.getItem('userFullName');
      const persistedPhone = localStorage.getItem('userPhone');
      
      // Use current user data from auth context first
      if (user) {
        // Ensure we have the name field properly mapped
        const userName = persistedName || user.fullName || user.name || '';
        const userPhone = persistedPhone || user.phone || user.phone_number || '';
        const userEmail = user.email || '';
        
        setFormData({
          fullName: userName,
          email: userEmail,
          phone: userPhone
        });
      }
      
      // Try to fetch additional details from API
      try {
        const response = await getUserProfile();
        if (response && response.success && response.data) {
          setFormData(prev => {
            const newData = {
              ...prev,
              fullName: response.data.fullname || response.data.fullName || response.data.name || response.data.full_name || persistedName || prev.fullName,
              phone: response.data.phone_number || response.data.phone || persistedPhone || prev.phone
            };
            return newData;
          });
        }
      } catch (apiError) {
        // API profile fetch failed, using auth context data
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) {
      errors.fullName = 'Full name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      errors.phone = 'Phone number must be 10 digits';
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
      return;
    }
    
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      // Only allow updating fullName and phone, keep email static
      const updateData = {
        fullname: formData.fullName, // Changed from fullName to fullname to match API
        phone_number: formData.phone // Changed from phone to phone_number to match API
      };

      const response = await updateProfile(updateData);
      
      if (response && response.success) {
        setSuccess('Profile updated successfully!');
        
        // Update form data with response data if available
        if (response.data) {
          setFormData(prev => ({
            ...prev,
            fullName: response.data.fullname || response.data.fullName || response.data.name || response.data.full_name || prev.fullName,
            phone: response.data.phone_number || response.data.phone || prev.phone
          }));
        }
        
        // Store the updated name in localStorage for persistence
        const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const updatedUserData = {
          ...currentUserData,
          fullName: formData.fullName,
          name: formData.fullName
        };
        localStorage.setItem('currentUser', JSON.stringify(updatedUserData));
        
        // Also update the token with user info if possible
        const token = localStorage.getItem('token');
        if (token) {
          try {
            // Store user info in localStorage for immediate access
            localStorage.setItem('userFullName', formData.fullName);
            localStorage.setItem('userPhone', formData.phone);
          } catch (localStorageError) {
            console.warn('Could not update localStorage:', localStorageError);
          }
        }
        
        // Refresh the user data in the auth context to ensure consistency
        try {
          await refreshUser();
        } catch (refreshError) {
          // Error refreshing user context
        }
      } else {
        setError(response?.message || 'Failed to update profile. Please try again.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangeEmail = async () => {
    const newEmail = prompt('Enter your new email address:');
    if (!newEmail) return;
    
    if (!newEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      const response = await changeEmail({ 
        newEmail: newEmail,
        currentPassword: prompt('Enter your current password:') || ''
      });
      
      if (response && response.success) {
        setSuccess('Email updated successfully! Please check your new email for verification.');
        // Update the form data with new email
        setFormData(prev => ({
          ...prev,
          email: newEmail
        }));
        // Update current user context if needed
        if (user) {
          // Note: We can't directly modify the user object from context
          // The email will be updated when refreshUser() is called
        }
        
        // Refresh the user data in the auth context to ensure consistency
        try {
          await refreshUser();
        } catch (refreshError) {
          // Error refreshing user context after email change
        }
      } else {
        setError(response?.message || 'Failed to update email. Please try again.');
      }
    } catch (error) {
      console.error('Error changing email:', error);
      setError(error.response?.data?.message || 'Failed to update email. Please try again.');
    }
  };

  const InputField = ({ label, name, type = 'text', required = false, placeholder, disabled = false, value, onChange }) => (
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
        value={value || formData[name] || ''}
        onChange={onChange || handleChange}
        placeholder={placeholder}
        disabled={disabled}
        style={{ 
          width: '100%', 
          padding: '0.8em', 
          border: validationErrors[name] ? '1px solid #dc3545' : '1px solid #e0e0e0', 
          borderRadius: '6px', 
          fontSize: 14, 
          background: disabled ? '#f8f9fa' : '#fff',
          color: disabled ? '#6c757d' : '#495057',
          cursor: disabled ? 'not-allowed' : 'text',
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
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: 'clamp(1em, 3vw, 2em)',
      fontFamily: 'var(--font-family)'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: 'clamp(1.5em, 4vw, 2.5em)',
        textAlign: 'center'
    }}>
      <h1 style={{ 
          fontSize: 'clamp(1.8em, 4vw, 2.5em)',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '0.5em'
      }}>
        Profile Settings
      </h1>
        <p style={{
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          color: 'var(--text-muted)',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          Manage your profile information and broker account settings
        </p>
        </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'clamp(1.5em, 4vw, 2em)' }}>
        {/* Profile Information */}
        <div style={{ 
          background: 'white',
          padding: 'clamp(1.5em, 4vw, 2em)',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          border: '1px solid var(--border-color)'
        }}>
          <h2 style={{ 
            fontSize: 'clamp(1.3em, 3vw, 1.6em)',
            fontWeight: 600, 
            color: 'var(--text-primary)',
            marginBottom: 'clamp(1em, 3vw, 1.5em)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <User size={24} />
            Profile Information
          </h2>

          <form onSubmit={handleSubmit}>
            <InputField
              label="Full Name"
              name="fullName"
              required
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={(e) => handleChange(e)}
            />
            
            <InputField
              label="Email Address"
              name="email"
              type="email"
              required
              placeholder="Enter your email address"
              disabled
              value={formData.email}
              onChange={(e) => handleChange(e)}
            />
            
            <InputField
              label="Phone Number"
              name="phone"
              required
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => handleChange(e)}
            />
            
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(0.8em, 2vw, 1em)',
              marginTop: 'clamp(1.5em, 4vw, 2em)',
              flexWrap: 'wrap'
            }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                  background: 'var(--primary-color)',
                  color: 'white',
                border: 'none',
                  padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
                borderRadius: '8px',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  fontWeight: 500,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                  opacity: saving ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.2)';
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>

              <Link
                to="/forgot-password"
                style={{
                  background: 'var(--secondary-color)',
                  color: 'white',
                  textDecoration: 'none',
                  padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
                  borderRadius: '8px',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  fontWeight: 500,
                  transition: 'all 0.3s ease',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(108, 117, 125, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(108, 117, 125, 0.2)';
                }}
              >
                Reset Password
              </Link>

              <button
                type="button"
                onClick={handleChangeEmail}
                style={{
                  background: 'var(--warning-color)',
                  color: 'white',
                  border: 'none',
                  padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
                  borderRadius: '8px',
                  fontSize: 'clamp(14px, 2.5vw, 16px)',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 4px 12px rgba(255, 193, 7, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 8px rgba(255, 193, 7, 0.2)';
                }}
              >
                Change Email
              </button>
            </div>
          </form>
        </div>

        {/* Broker Account Section */}
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
            Broker Account
          </h2>

                      {brokerProfile && !showBrokerForm && !intentionallyDisconnected && (
            <div style={{
              padding: '1.5em',
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef',
              marginBottom: '1.5em'
            }}>
              {brokerProfile.brokerName === 'No Broker Connected' ? (
                // No broker connected state
                <div style={{ textAlign: 'center', padding: '1em' }}>
                  <p style={{ color: '#6c757d', marginBottom: '1em' }}>
                    {intentionallyDisconnected ? 'Broker account was disconnected. Connect a new broker account below.' : 'No broker account connected'}
                  </p>
                  <button
                    onClick={() => setShowBrokerForm(true)}
                    style={{
                      padding: '0.6em 1.2em',
                      background: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5em',
                      margin: '0 auto'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#0056b3';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = '#007bff';
                    }}
                  >
                    <Plus size={16} />
                    Connect Broker
                  </button>
                </div>
              ) : (
                // Broker connected state - simplified display
                <div style={{ display: 'grid', gap: '1em' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '0.8em',
                    background: '#e8f5e8',
                    borderRadius: '6px',
                    border: '1px solid #c3e6cb'
                  }}>
                    <span style={{ color: '#155724', fontWeight: 600, fontSize: '1.1em' }}>
                      🏦 Broker Connected: {brokerProfile.brokerName}
                    </span>
                <span style={{ 
                      color: brokerProfile.status === 'Active' ? '#28a745' : '#dc3545', 
                  fontWeight: 600, 
                      background: brokerProfile.status === 'Active' ? '#d4edda' : '#f8d7da',
                      padding: '0.3em 0.8em',
                      borderRadius: '12px',
                      fontSize: '0.85em'
                    }}>
                      {brokerProfile.status}
                </span>
              </div>
              
              <div style={{ 
                    display: 'flex', 
                gap: '1em',
                    marginTop: '0.5em',
                    flexWrap: 'wrap'
                  }}>
                <button
                  onClick={() => setShowBrokerForm(true)}
                  style={{
                        padding: '0.6em 1.2em',
                        background: '#007bff',
                        color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                        fontSize: 14,
                        fontWeight: 500,
                    cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5em'
                  }}
                  onMouseEnter={(e) => {
                        e.target.style.background = '#0056b3';
                  }}
                  onMouseLeave={(e) => {
                        e.target.style.background = '#007bff';
                  }}
                >
                      <Plus size={16} />
                  Change Broker
                </button>
                
                <button
                      onClick={handleClearBroker}
                  style={{
                        padding: '0.6em 1.2em',
                        background: '#dc3545',
                        color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                        fontSize: 14,
                        fontWeight: 500,
                    cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5em'
                  }}
                  onMouseEnter={(e) => {
                        e.target.style.background = '#c82333';
                  }}
                  onMouseLeave={(e) => {
                        e.target.style.background = '#dc3545';
                  }}
                >
                      <Trash2 size={16} />
                      Disconnect
                </button>
              </div>
            </div>
              )}
            </div>
          )}

          {/* Show connection form message when form is open */}
          {showBrokerForm && (
            <div style={{
              padding: '1em',
              background: 'rgba(0,212,170,0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(0,212,170,0.2)',
              marginBottom: '1.5em',
              textAlign: 'center'
            }}>
              <p style={{ color: '#00d4aa', margin: 0, fontSize: '14px' }}>
                Broker connection form is open below
              </p>
            </div>
          )}

          {/* Broker Connection Form */}
          {showBrokerForm && (
            <div style={{
              padding: '1.5em',
              background: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginBottom: '1.5em'
              }}>
                <h3 style={{ 
                  color: '#2c3e50', 
                  margin: 0, 
                  fontWeight: 600, 
                  fontSize: '1.2em'
                }}>
                  {brokerStep === 1 ? 'Step 1: Enter Broker Details' : 'Step 2: Enter TOTP'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
                  {brokerStep === 1 && (
                    <button
                      type="button"
                      onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                  style={{
                        padding: '0.4em 0.8em',
                        background: '#17a2b8',
                        color: '#fff',
                    border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                    cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                        gap: '0.3em'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#138496'}
                      onMouseLeave={(e) => e.target.style.background = '#17a2b8'}
                    >
                      {brokerData.showHashedDetails ? <EyeOff size={14} /> : <Eye size={14} />}
                      {brokerData.showHashedDetails ? 'Hide Details' : 'View Details'}
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowBrokerForm(false);
                      resetBrokerForm();
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '1.5em',
                      cursor: 'pointer',
                      color: '#6c757d',
                      padding: '0.2em'
                    }}
                  >
                    <X />
                  </button>
                    </div>
                  </div>

              <form onSubmit={handleAddBroker}>
                {brokerStep === 1 ? (
                    <>
                    <div style={{ marginBottom: '1em' }}>
                        <label style={{ 
                        color: '#495057', 
                        fontWeight: 500, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                        fontSize: 14 
                        }}>
                        Broker Client ID
                        </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="broker_client_id"
                          value={brokerData.showHashedDetails ? brokerData.broker_client_id : hashSensitiveData(brokerData.broker_client_id)}
                          onChange={handleBrokerChange}
                          placeholder="Enter your broker client ID"
                          style={{ 
                            width: '100%', 
                            padding: '0.8em', 
                            paddingRight: '3em',
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: 14, 
                            background: '#fff',
                            fontFamily: brokerData.showHashedDetails ? 'inherit' : 'monospace'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#007bff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {brokerData.showHashedDetails ? 'Hide' : 'View'}
                        </button>
                      </div>
                      </div>

                    <div style={{ marginBottom: '1em' }}>
                        <label style={{ 
                        color: '#495057', 
                        fontWeight: 500, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                        fontSize: 14 
                        }}>
                        API Key
                        </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="broker_api_key"
                          value={brokerData.showHashedDetails ? brokerData.broker_api_key : hashSensitiveData(brokerData.broker_api_key)}
                          onChange={handleBrokerChange}
                          placeholder="Enter your API key"
                          style={{ 
                            width: '100%', 
                            padding: '0.8em', 
                            paddingRight: '3em',
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: 14, 
                            background: '#fff',
                            fontFamily: brokerData.showHashedDetails ? 'inherit' : 'monospace'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#007bff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {brokerData.showHashedDetails ? 'Hide' : 'View'}
                        </button>
                      </div>
                      </div>

                    <div style={{ marginBottom: '1em' }}>
                        <label style={{ 
                        color: '#495057', 
                        fontWeight: 500, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                        fontSize: 14 
                        }}>
                        API Secret
                        </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="broker_api_secret"
                          value={brokerData.showHashedDetails ? brokerData.broker_api_secret : hashSensitiveData(brokerData.broker_api_secret)}
                          onChange={handleBrokerChange}
                          placeholder="Enter your API secret"
                          style={{ 
                            width: '100%', 
                            padding: '0.8em', 
                            paddingRight: '3em',
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: 14, 
                            background: '#fff',
                            fontFamily: brokerData.showHashedDetails ? 'inherit' : 'monospace'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#007bff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {brokerData.showHashedDetails ? 'Hide' : 'View'}
                        </button>
                      </div>
                      </div>

                    <div style={{ marginBottom: '1em' }}>
                        <label style={{ 
                        color: '#495057', 
                        fontWeight: 500, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                        fontSize: 14 
                        }}>
                        Angel One Token
                        </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="text"
                          name="angelone_token"
                          value={brokerData.showHashedDetails ? brokerData.angelone_token : hashSensitiveData(brokerData.angelone_token)}
                          onChange={handleBrokerChange}
                          placeholder="Enter your Angel One token"
                          style={{ 
                            width: '100%', 
                            padding: '0.8em', 
                            paddingRight: '3em',
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: 14, 
                            background: '#fff',
                            fontFamily: brokerData.showHashedDetails ? 'inherit' : 'monospace'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#007bff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {brokerData.showHashedDetails ? 'Hide' : 'View'}
                        </button>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1.5em' }}>
                        <label style={{ 
                        color: '#495057', 
                        fontWeight: 500, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                        fontSize: 14 
                        }}>
                        MPIN
                        </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type="password"
                          name="angelone_mpin"
                          value={brokerData.showHashedDetails ? brokerData.angelone_mpin : hashSensitiveData(brokerData.angelone_mpin)}
                          onChange={handleBrokerChange}
                          placeholder="Enter your MPIN"
                          style={{ 
                            width: '100%', 
                            padding: '0.8em', 
                            paddingRight: '3em',
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: 14, 
                            background: '#fff',
                            fontFamily: brokerData.showHashedDetails ? 'inherit' : 'monospace'
                          }}
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#007bff',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s ease'
                          }}
                          onMouseEnter={(e) => e.target.style.background = '#f0f0f0'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {brokerData.showHashedDetails ? 'Hide' : 'View'}
                        </button>
                      </div>
                      </div>
                    </>
                ) : (
                  <div style={{ marginBottom: '1.5em' }}>
                        <label style={{ 
                      color: '#495057', 
                      fontWeight: 500, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                      fontSize: 14 
                        }}>
                      TOTP Code
                        </label>
                        <input
                      type="text"
                      name="totp"
                      value={brokerData.totp}
                          onChange={handleBrokerChange}
                      placeholder="Enter TOTP from your authenticator app"
                          style={{ 
                            width: '100%', 
                        padding: '0.8em', 
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                        fontSize: 14, 
                        background: '#fff' 
                      }}
                      required
                    />
                      </div>
                  )}

                <button
                      type="submit"
                      disabled={brokerLoading}
                      style={{
                    width: '100%',
                    padding: '1em',
                    background: brokerLoading ? '#6c757d' : '#28a745',
                    color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                    fontSize: 16,
                        fontWeight: 600,
                        cursor: brokerLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {brokerLoading ? 'Processing...' : (brokerStep === 1 ? 'Add Broker Account' : 'Verify TOTP')}
                </button>
              </form>
            </div>
          )}

          {/* Broker Details Popup */}
          {showDetailsPopup && (
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
              zIndex: 1000,
              padding: '1em'
            }}>
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '2em',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflowY: 'auto',
                position: 'relative'
              }}>
                <button
                  onClick={() => setShowDetailsPopup(false)}
                  style={{
                    position: 'absolute',
                    top: '1em',
                    right: '1em',
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5em',
                    cursor: 'pointer',
                    color: '#6c757d',
                    padding: '0.2em'
                  }}
                >
                  <X />
                </button>
                
                <h3 style={{
                  color: '#2c3e50',
                  marginBottom: '1.5em',
                  fontWeight: 600,
                  fontSize: '1.3em',
                  textAlign: 'center'
                }}>
                  🏦 Broker Account Details
                </h3>
                
                <div style={{ display: 'grid', gap: '1em' }}>
                  <div style={{
                    padding: '1em',
                    background: '#f8f9fa',
                        borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5em' }}>
                      <span style={{ color: '#495057', fontWeight: 500 }}>Broker Name:</span>
                      <span style={{ color: '#2c3e50', fontWeight: 600 }}>{brokerProfile.brokerName}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5em' }}>
                      <span style={{ color: '#495057', fontWeight: 500 }}>Account ID:</span>
                      <span style={{ color: '#2c3e50', fontWeight: 600 }}>{brokerProfile.accountId}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5em' }}>
                      <span style={{ color: '#495057', fontWeight: 500 }}>Status:</span>
                      <span style={{
                        color: brokerProfile.status === 'Active' ? '#28a745' : '#dc3545',
                        fontWeight: 600,
                        background: brokerProfile.status === 'Active' ? '#d4edda' : '#f8d7da',
                        padding: '0.2em 0.6em',
                        borderRadius: '12px',
                        fontSize: '0.85em'
                      }}>
                        {brokerProfile.status}
                      </span>
                    </div>
                    
                    {brokerProfile.exchanges && brokerProfile.exchanges.length > 0 && (
                      <div style={{ marginTop: '1em' }}>
                        <span style={{ color: '#495057', fontWeight: 500 }}>Exchanges: </span>
                        <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                          {brokerProfile.exchanges.join(', ')}
                        </span>
                      </div>
                    )}
                    
                    {brokerProfile.products && brokerProfile.products.length > 0 && (
                      <div style={{ marginTop: '0.5em' }}>
                        <span style={{ color: '#495057', fontWeight: 500 }}>Products: </span>
                        <span style={{ color: '#2c3e50', fontWeight: 600 }}>
                          {brokerProfile.products.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div style={{ textAlign: 'center', marginTop: '1em' }}>
                    <button
                      onClick={() => setShowDetailsPopup(false)}
                      style={{
                        padding: '0.6em 1.2em',
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = '#5a6268';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = '#6c757d';
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings; 