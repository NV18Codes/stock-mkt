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
  User,
  Building,
  CheckCircle,
  BarChart3,
  Package
} from 'lucide-react';
import { motion } from 'framer-motion';

const AdminProfileSettings = () => {
  const { role, user: currentUser, refreshUser } = useAuth();
  const [brokerProfile, setBrokerProfile] = useState(null);
  const [showBrokerForm, setShowBrokerForm] = useState(false);
  const [brokerLoading, setBrokerLoading] = useState(false);
  const [showBrokerDetails, setShowBrokerDetails] = useState(false);
  const [intentionallyDisconnected, setIntentionallyDisconnected] = useState(false);

  // Add missing state variables
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  
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

  const [brokerStep, setBrokerStep] = useState(1);

  // Hash sensitive data for display
  const hashSensitiveData = (data) => {
    if (!data || data.trim() === '') return '';
    const length = data.length;
    if (length <= 4) return '*'.repeat(length);
    return '*'.repeat(length - 4) + data.slice(-4);
  };

  useEffect(() => {
    fetchAdminProfile();
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
            brokerName: data.broker_name || data.brokerName || 'Angel One',
            accountId: data.broker_client_id || data.accountId || 'N/A',
            status: data.is_active_for_trading ? 'Active' : 'Inactive',
            exchanges: data.exchanges || [],
            products: data.products || [],
          // Add other fields as needed
            ...data
        };
        setBrokerProfile(mappedBrokerProfile);
      } else {
        setBrokerProfile(null);
      }
    } catch (error) {
      console.error('Error fetching broker profile:', error);
      setBrokerProfile(null);
    }
  };

  const handleBrokerInputChange = (field, value) => {
    setBrokerData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBrokerSubmit = async (e) => {
    e.preventDefault();
    setBrokerLoading(true);
    setError('');
    setSuccess('');
    
    try {
             if (brokerStep === 1) {
        // Step 1: Add broker account with MPIN
        const brokerPayload = {
          broker_name: brokerData.broker_name || 'angelone',
           broker_client_id: brokerData.broker_client_id,
           broker_api_key: brokerData.broker_api_key,
           broker_api_secret: brokerData.broker_api_secret,
          angelone_token: brokerData.angelone_token,
          angelone_mpin: brokerData.angelone_mpin
        };

        const response = await addBrokerAccount(brokerPayload);
        
        if (response && response.success) {
          setBrokerStep(2);
          setSuccess('Broker account added successfully! Please enter TOTP to complete verification.');
        } else {
          setError(response?.message || 'Failed to add broker account. Please check your credentials.');
        }
      } else if (brokerStep === 2) {
        // Step 2: Verify TOTP
        const totpResponse = await verifyBrokerTOTP({
          totp: brokerData.totp
        });
        
        if (totpResponse && totpResponse.success) {
          setSuccess('Broker account connected successfully!');
          setShowBrokerForm(false);
          setBrokerStep(1);
          setIntentionallyDisconnected(false); // Reset the disconnected flag
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
          fetchBrokerProfile();
        } else {
          setError(totpResponse?.message || 'TOTP verification failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error adding broker account:', error);
      setError('Failed to add broker account. Please try again.');
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
          
          // Refresh both broker profile and admin profile
          await fetchBrokerProfile();
          await fetchAdminProfile();
          
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

  const fetchAdminProfile = async () => {
    try {
      setLoading(true);
      
      // Use current user data from auth context first
      if (currentUser) {
        console.log('Setting form data from currentUser:', currentUser);
      setFormData({
          fullName: currentUser.fullName || currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || ''
        });
      }
      
      // Try to fetch additional details from API
      try {
        console.log('Calling getUserProfile API...');
        const response = await getUserProfile();
        console.log('getUserProfile response:', response);
        if (response && response.success && response.data) {
          console.log('API profile data received:', response.data);
          setFormData(prev => {
            const newData = {
              ...prev,
              fullName: response.data.fullname || response.data.fullName || response.data.name || response.data.full_name || prev.fullName,
              email: response.data.email || prev.email,
              phone: response.data.phone_number || response.data.phone || prev.phone
            };
            console.log('Form data updated from API:', newData);
            return newData;
          });
        }
      } catch (apiError) {
        console.log('API fetch failed, using context data only:', apiError);
      }
    } catch (error) {
      console.error('Error fetching admin profile:', error);
      setError('Failed to load profile data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Submitting profile update with data:', {
        fullName: formData.fullName,
        phone: formData.phone
      });
      
      const response = await updateProfile({
        fullname: formData.fullName, // Changed from fullName to fullname to match API
        phone_number: formData.phone // Changed from phone to phone_number to match API
      });

      console.log('Profile update response:', response);
      
      if (response && response.success) {
        setSuccess('Profile updated successfully!');
        
        // Immediately update the form data with the new values
        if (response.data) {
          console.log('Updating form data with response data:', response.data);
          console.log('Response data keys:', Object.keys(response.data));
          console.log('Response data values:', response.data);
          
          setFormData(prev => {
            const newData = {
              ...prev,
              fullName: response.data.fullname || response.data.fullName || response.data.name || response.data.full_name || prev.fullName,
              phone: response.data.phone_number || response.data.phone || response.data.phone_number || prev.phone,
              lastUpdated: Date.now() // Force re-render
            };
            console.log('New form data:', newData);
            return newData;
          });
        }
        
        // Don't call fetchAdminProfile here as it might overwrite the updated data
        // The form data is already updated with the response data above
        console.log('Profile update completed successfully');
        
        // Refresh the user data in the auth context to ensure consistency
        try {
          await refreshUser();
          console.log('User context refreshed successfully');
        } catch (refreshError) {
          console.error('Error refreshing user context:', refreshError);
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

  const [showChangeEmailForm, setShowChangeEmailForm] = useState(false);
  const [changeEmailData, setChangeEmailData] = useState({
    newEmail: '',
    currentPassword: ''
  });
  const [changeEmailLoading, setChangeEmailLoading] = useState(false);

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!changeEmailData.newEmail || !changeEmailData.currentPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (!changeEmailData.newEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setChangeEmailLoading(true);
      
      const response = await changeEmail({ 
        newEmail: changeEmailData.newEmail,
        currentPassword: changeEmailData.currentPassword
      });
      
      if (response && response.success) {
        setSuccess('Email updated successfully! Please check your new email for verification.');
        // Update the form data with new email
        setFormData(prev => ({
          ...prev,
          email: changeEmailData.newEmail
        }));
        // Update current user context if needed
        if (currentUser) {
          currentUser.email = changeEmailData.newEmail;
        }
        
        // Refresh the user data in the auth context to ensure consistency
        try {
          await refreshUser();
          console.log('User context refreshed after email change');
        } catch (refreshError) {
          console.error('Error refreshing user context after email change:', refreshError);
        }
        
        // Reset form and hide it
        setChangeEmailData({ newEmail: '', currentPassword: '' });
        setShowChangeEmailForm(false);
      } else {
        setError(response?.message || 'Failed to update email. Please try again.');
      }
    } catch (error) {
      console.error('Error changing email:', error);
      setError(error.response?.data?.message || 'Failed to update email. Please try again.');
    } finally {
      setChangeEmailLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    console.log(`handleInputChange called: ${field} = ${value}`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };
      console.log(`Form data updated:`, newData);
      return newData;
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px',
        fontSize: 'clamp(14px, 2.5vw, 16px)'
      }}>
        Loading profile...
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

          {/* Debug: Show current form data */}
          <div style={{ 
            background: '#f8f9fa', 
            padding: '1em', 
            marginBottom: '1em', 
            borderRadius: '8px', 
            fontSize: '12px',
            fontFamily: 'monospace'
          }}>
            <strong>Debug - Current Form Data:</strong><br/>
            Full Name: {formData.fullName || 'undefined'}<br/>
            Phone: {formData.phone || 'undefined'}<br/>
            Last Updated: {formData.lastUpdated ? new Date(formData.lastUpdated).toLocaleTimeString() : 'never'}
          </div>

          <form onSubmit={handleSubmit}>
            <InputField
              label="Full Name"
              name="fullName"
                required
              placeholder="Enter your full name"
              value={formData.fullName || ''}
              onChange={(e) => handleInputChange('fullName', e.target.value)}
            />

            <InputField
              label="Email Address"
                name="email"
              type="email"
                required
              placeholder="Enter your email address"
              disabled
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />

                        <InputField
              label="Phone Number"
                name="phone"
                required
              placeholder="Enter your phone number"
              value={formData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
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


            </div>
          </form>
          </div>

        {/* Change Email Section */}
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
            Change Email Address
          </h2>

          <div style={{ 
            background: '#f8f9fa', 
            padding: '1em', 
            marginBottom: '1em', 
            borderRadius: '8px', 
            fontSize: '14px',
            color: 'var(--text-muted)'
          }}>
            <strong>Note:</strong> You will need to verify your new email address after the change.
            </div>

          {!showChangeEmailForm ? (
            <div style={{ 
              display: 'flex', 
              gap: 'clamp(0.8em, 2vw, 1em)',
              marginTop: 'clamp(1.5em, 4vw, 2em)',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => setShowChangeEmailForm(true)}
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
                Change Email Address
              </button>
            </div>
          ) : (
            <form onSubmit={handleChangeEmail} style={{ marginTop: 'clamp(1.5em, 4vw, 2em)' }}>
            <div style={{ marginBottom: '1em' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5em', 
                  fontWeight: 500, 
                  color: '#2c3e50',
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  New Email Address:
                </label>
              <input
                type="email"
                  value={changeEmailData.newEmail}
                  onChange={(e) => setChangeEmailData(prev => ({ ...prev, newEmail: e.target.value }))}
                  placeholder="Enter new email address"
                required
                  style={{
                    width: '100%',
                    padding: '0.8em',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    background: '#fff'
                  }}
              />
            </div>

            <div style={{ marginBottom: '1em' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '0.5em', 
                  fontWeight: 500, 
                  color: '#2c3e50',
                  fontSize: 'clamp(12px, 2.5vw, 14px)'
                }}>
                  Current Password:
                </label>
              <input
                  type="password"
                  value={changeEmailData.currentPassword}
                  onChange={(e) => setChangeEmailData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  placeholder="Enter your current password"
                required
                  style={{
                    width: '100%',
                    padding: '0.8em',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    background: '#fff'
                  }}
              />
            </div>

              <div style={{ 
                display: 'flex', 
                gap: 'clamp(0.8em, 2vw, 1em)',
                flexWrap: 'wrap'
              }}>
            <button 
              type="submit" 
                  disabled={changeEmailLoading}
              style={{ 
                    background: 'var(--warning-color)',
                    color: 'white',
                border: 'none',
                    padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
                    borderRadius: '8px',
                    fontSize: 'clamp(14px, 2.5vw, 16px)',
                    fontWeight: 500,
                    cursor: changeEmailLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    opacity: changeEmailLoading ? 0.7 : 1
                  }}
                >
                  {changeEmailLoading ? 'Updating...' : 'Update Email'}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowChangeEmailForm(false);
                    setChangeEmailData({ newEmail: '', currentPassword: '' });
                    setError('');
                  }}
                  style={{
                    background: 'var(--secondary-color)',
                    color: 'white',
                    border: 'none',
                    padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
                    borderRadius: '8px',
                    fontSize: 'clamp(14px, 2.5vw, 16px)',
                    fontWeight: 500,
                cursor: 'pointer',
                    transition: 'all 0.3s ease'
              }}
            >
                  Cancel
            </button>
              </div>
          </form>
          )}
        </div>

        {/* Broker Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ 
            background: 'white', 
            padding: 'clamp(1.2em, 3vw, 1.5em)',
            borderRadius: '12px', 
            boxShadow: 'var(--shadow-md)', 
            border: '1px solid var(--border-color)',
            marginBottom: '2em'
          }}
        >
          <motion.h3
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            style={{
              color: 'var(--text-primary)', 
              marginBottom: '1.5em',
              fontSize: 'clamp(1.1em, 3vw, 1.3em)',
              fontWeight: 600, 
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}
          >
            <Building size={20} />
              Broker Account
          </motion.h3>

                      {brokerProfile && !showBrokerForm && !intentionallyDisconnected ? (
            // Broker is connected and form is not shown - show status and details
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1em, 2.5vw, 1.5em)' }}>
              <div style={{
                background: 'rgba(211, 80, 63, 0.1)',
                padding: 'clamp(0.8em, 2vw, 1em)',
                borderRadius: '8px',
                border: '1px solid rgba(211, 80, 63, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                  <CheckCircle size={20} color="var(--primary-color)" />
                  <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Status:</span>
                                      <div style={{ color: 'var(--primary-color)', fontWeight: 500 }}>Connected</div>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(211, 80, 63, 0.1)',
                padding: 'clamp(0.8em, 2vw, 1em)',
                borderRadius: '8px',
                border: '1px solid rgba(211, 80, 63, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                  <Building size={20} color="var(--primary-color)" />
                  <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Broker:</span>
                  <div style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                    {brokerProfile.broker_name || brokerProfile.brokerName || 'Angel One'}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                background: 'rgba(211, 80, 63, 0.1)',
                padding: 'clamp(0.8em, 2vw, 1em)',
                borderRadius: '8px',
                border: '1px solid rgba(211, 80, 63, 0.2)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em' }}>
                  <User size={20} color="var(--primary-color)" />
                  <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Client ID:</span>
                  <div style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                    {brokerProfile.broker_client_id || brokerProfile.accountId || 'N/A'}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1em', marginTop: '1em' }}>
                <button
                  type="button"
                  onClick={handleClearBroker}
                  disabled={brokerLoading}
                  style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    padding: '0.8em 1.5em',
                    borderRadius: '8px',
                    cursor: brokerLoading ? 'not-allowed' : 'pointer',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    fontWeight: 500,
                    opacity: brokerLoading ? 0.6 : 1,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => !brokerLoading && (e.target.style.background = '#c82333')}
                  onMouseLeave={(e) => !brokerLoading && (e.target.style.background = '#dc3545')}
                >
                  {brokerLoading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </div>
            </div>
          ) : (
            // Broker is not connected OR form is shown - show connection form
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1em, 2.5vw, 1.5em)' }}>
              <div style={{ 
                background: 'rgba(255,193,7,0.1)',
                padding: 'clamp(0.8em, 2vw, 1em)',
                borderRadius: '8px',
                border: '1px solid rgba(255,193,7,0.2)',
                textAlign: 'center'
              }}>
                <div style={{ color: '#856404', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                  {intentionallyDisconnected ? 'Broker account was disconnected. Connect a new broker account below.' : 
                   brokerProfile ? 'Broker connection form is open below' : 'No broker account connected'}
                </div>
              </div>
              
              {!showBrokerForm && !brokerProfile && (
                <button
                  type="button"
                  onClick={() => setShowBrokerForm(true)}
                  style={{
                    background: 'var(--primary-color)',
                    color: 'white',
                    border: 'none',
                    padding: 'clamp(0.8em, 2vw, 1em)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    fontWeight: 500,
                    transition: 'all 0.3s ease',
                    alignSelf: 'center'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--primary-dark)'}
                  onMouseLeave={(e) => e.target.style.background = 'var(--primary-color)'}
                >
                  Connect Broker Account
                </button>
              )}
              </div>
          )}
            </motion.div>

          {/* Broker Connection Form */}
          {showBrokerForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              style={{
                background: 'white',
                padding: 'clamp(1.2em, 3vw, 1.5em)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--border-color)',
                marginBottom: '2em'
              }}
            >
              <div style={{ 
                display: 'flex', 
                    justifyContent: 'space-between',
                alignItems: 'center', 
                marginBottom: 'clamp(1em, 2.5vw, 1.5em)'
              }}>
                <h3 style={{
                  color: 'var(--text-primary)', 
                  fontSize: 'clamp(1.1em, 3vw, 1.3em)',
                  fontWeight: 600,
                  margin: 0
                }}>
                  {brokerStep === 1 ? 'Connect Broker Account' : 'Verify TOTP'}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowBrokerForm(false);
                    setBrokerStep(1);
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
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '0.2em'
                  }}
                >
                  ×
                </button>
                  </div>

              <form onSubmit={handleBrokerSubmit}>
                {brokerStep === 1 ? (
                  <>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                      gap: 'clamp(1em, 2.5vw, 1.5em)',
                      marginBottom: 'clamp(1em, 2.5vw, 1.5em)'
                    }}>
                      {/* Broker Name */}
                      <div>
                         <label style={{ 
                           display: 'block', 
                           marginBottom: '0.5em', 
                          color: 'var(--text-primary)',
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500
                         }}>
                          Broker Name
                         </label>
                        <input
                          type="text"
                          name="broker_name"
                          value={brokerData.broker_name}
                          onChange={(e) => handleBrokerInputChange('broker_name', e.target.value)}
                           required
                          placeholder="angelone"
                           style={{ 
                             width: '100%', 
                            padding: 'clamp(0.8em, 2vw, 1em)',
                             border: '1px solid var(--border-color)', 
                             borderRadius: '8px', 
                             fontSize: 'clamp(12px, 2.5vw, 14px)', 
                            background: '#f8f9fa'
                          }}
                          disabled
                        />
                   </div>

                      {/* Client ID */}
                      <div>
                     <label style={{ 
                       display: 'block', 
                       marginBottom: '0.5em', 
                          color: 'var(--text-primary)',
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500
                     }}>
                          Client ID
                     </label>
                        <div style={{ position: 'relative' }}>
                     <input
                       type="text"
                       name="broker_client_id"
                            value={brokerData.showHashedDetails ? brokerData.broker_client_id : hashSensitiveData(brokerData.broker_client_id)}
                            onChange={(e) => handleBrokerInputChange('broker_client_id', e.target.value)}
                       required
                            placeholder="Enter broker client ID"
                       style={{ 
                         width: '100%', 
                              padding: 'clamp(0.8em, 2vw, 1em)',
                              paddingRight: '3em',
                         border: '1px solid var(--border-color)', 
                         borderRadius: '8px', 
                         fontSize: 'clamp(12px, 2.5vw, 14px)', 
                              background: brokerData.showHashedDetails ? 'white' : '#f8f9fa'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                            style={{
                              position: 'absolute',
                              right: '0.5em',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.2em'
                            }}
                          >
                            {brokerData.showHashedDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                   </div>

                      {/* API Key */}
                      <div>
                     <label style={{ 
                       display: 'block', 
                       marginBottom: '0.5em', 
                          color: 'var(--text-primary)',
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500
                     }}>
                          API Key
                     </label>
                        <div style={{ position: 'relative' }}>
                     <input
                       type="text"
                       name="broker_api_key"
                            value={brokerData.showHashedDetails ? brokerData.broker_api_key : hashSensitiveData(brokerData.broker_api_key)}
                            onChange={(e) => handleBrokerInputChange('broker_api_key', e.target.value)}
                       required
                            placeholder="Enter API key"
                       style={{ 
                         width: '100%', 
                              padding: 'clamp(0.8em, 2vw, 1em)',
                              paddingRight: '3em',
                         border: '1px solid var(--border-color)', 
                         borderRadius: '8px', 
                         fontSize: 'clamp(12px, 2.5vw, 14px)', 
                              background: brokerData.showHashedDetails ? 'white' : '#f8f9fa'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                            style={{
                              position: 'absolute',
                              right: '0.5em',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.2em'
                            }}
                          >
                            {brokerData.showHashedDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                   </div>

                      {/* API Secret */}
                      <div>
                     <label style={{ 
                       display: 'block', 
                       marginBottom: '0.5em', 
                          color: 'var(--text-primary)',
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500
                     }}>
                          API Secret
                     </label>
                        <div style={{ position: 'relative' }}>
                     <input
                       type="password"
                       name="broker_api_secret"
                            value={brokerData.showHashedDetails ? brokerData.broker_api_secret : hashSensitiveData(brokerData.broker_api_secret)}
                            onChange={(e) => handleBrokerInputChange('broker_api_secret', e.target.value)}
                       required
                            placeholder="Enter API secret"
                       style={{ 
                         width: '100%', 
                              padding: 'clamp(0.8em, 2vw, 1em)',
                              paddingRight: '3em',
                         border: '1px solid var(--border-color)', 
                         borderRadius: '8px', 
                         fontSize: 'clamp(12px, 2.5vw, 14px)', 
                              background: brokerData.showHashedDetails ? 'white' : '#f8f9fa'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                            style={{
                              position: 'absolute',
                              right: '0.5em',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.2em'
                            }}
                          >
                            {brokerData.showHashedDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                   </div>

                      {/* Angel One Token */}
                      <div>
                     <label style={{ 
                       display: 'block', 
                       marginBottom: '0.5em', 
                          color: 'var(--text-primary)',
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500
                     }}>
                          Angel One Token
                     </label>
                        <div style={{ position: 'relative' }}>
                     <input
                       type="text"
                       name="angelone_token"
                            value={brokerData.showHashedDetails ? brokerData.angelone_token : hashSensitiveData(brokerData.angelone_token)}
                            onChange={(e) => handleBrokerInputChange('angelone_token', e.target.value)}
                       required
                            placeholder="Enter Angel One token"
                       style={{ 
                         width: '100%', 
                              padding: 'clamp(0.8em, 2vw, 1em)',
                              paddingRight: '3em',
                         border: '1px solid var(--border-color)', 
                         borderRadius: '8px', 
                         fontSize: 'clamp(12px, 2.5vw, 14px)', 
                              background: brokerData.showHashedDetails ? 'white' : '#f8f9fa'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                            style={{
                              position: 'absolute',
                              right: '0.5em',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.2em'
                            }}
                          >
                            {brokerData.showHashedDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                   </div>
                      </div>

                      {/* MPIN */}
                      <div>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          color: 'var(--text-primary)',
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500
                        }}>
                          MPIN
                        </label>
                        <div style={{ position: 'relative' }}>
                        <input
                            type="password"
                            name="angelone_mpin"
                            value={brokerData.showHashedDetails ? brokerData.angelone_mpin : hashSensitiveData(brokerData.angelone_mpin)}
                            onChange={(e) => handleBrokerInputChange('angelone_mpin', e.target.value)}
                          required
                            placeholder="Enter MPIN"
                          style={{ 
                            width: '100%', 
                              padding: 'clamp(0.8em, 2vw, 1em)',
                              paddingRight: '3em',
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                            fontSize: 'clamp(12px, 2.5vw, 14px)', 
                              background: brokerData.showHashedDetails ? 'white' : '#f8f9fa'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                            style={{
                              position: 'absolute',
                              right: '0.5em',
                              top: '50%',
                              transform: 'translateY(-50%)',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '0.2em'
                            }}
                          >
                            {brokerData.showHashedDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 'clamp(1em, 2.5vw, 1.5em)'
                    }}>
                      <button
                        type="button"
                        onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                        style={{
                          background: 'var(--secondary-color)',
                          color: 'white',
                          border: 'none',
                          padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--secondary-dark)'}
                        onMouseLeave={(e) => e.target.style.background = 'var(--secondary-color)'}
                      >
                        {brokerData.showHashedDetails ? 'Hide Details' : 'View Details'}
                      </button>

                      <button
                        type="submit"
                        disabled={brokerLoading}
                        style={{
                          background: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
                          borderRadius: '8px',
                          cursor: brokerLoading ? 'not-allowed' : 'pointer',
                          fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500,
                          opacity: brokerLoading ? 0.6 : 1,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => !brokerLoading && (e.target.style.background = 'var(--primary-dark)')}
                        onMouseLeave={(e) => !brokerLoading && (e.target.style.background = 'var(--primary-color)')}
                      >
                        {brokerLoading ? 'Connecting...' : 'Connect Broker'}
                      </button>
                      </div>
                    </>
                ) : (
                  <>
                    <div style={{
                      background: 'rgba(211, 80, 63, 0.1)',
                      padding: 'clamp(1em, 2.5vw, 1.5em)',
                      borderRadius: '8px',
                      border: '1px solid rgba(211, 80, 63, 0.2)',
                      marginBottom: 'clamp(1em, 2.5vw, 1.5em)'
                    }}>
                      <div style={{ color: 'var(--primary-color)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>
                        Please check your Angel One app and enter the TOTP code to complete the connection.
                      </div>
                    </div>

                    <div style={{ marginBottom: 'clamp(1em, 2.5vw, 1.5em)' }}>
                        <label style={{ 
                          display: 'block', 
                          marginBottom: '0.5em', 
                        color: 'var(--text-primary)',
                        fontSize: 'clamp(12px, 2.5vw, 14px)',
                        fontWeight: 500
                        }}>
                        TOTP Code
                        </label>
                        <input
                        type="text"
                        name="totp"
                        value={brokerData.totp}
                        onChange={(e) => handleBrokerInputChange('totp', e.target.value)}
                          required
                        placeholder="Enter TOTP code"
                          style={{ 
                            width: '100%', 
                          padding: 'clamp(0.8em, 2vw, 1em)',
                            border: '1px solid var(--border-color)', 
                            borderRadius: '8px', 
                          fontSize: 'clamp(12px, 2.5vw, 14px)'
                        }}
                      />
                      </div>

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <button
                        type="button"
                        onClick={() => setBrokerStep(1)}
                      style={{
                          background: 'var(--secondary-color)',
                        color: 'white',
                        border: 'none',
                          padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
                        borderRadius: '8px',
                          cursor: 'pointer',
                        fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'var(--secondary-dark)'}
                        onMouseLeave={(e) => e.target.style.background = 'var(--secondary-color)'}
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={brokerLoading}
                      style={{
                          background: 'var(--primary-color)',
                          color: 'white',
                          border: 'none',
                          padding: 'clamp(0.8em, 2vw, 1em) clamp(1.5em, 3vw, 2em)',
                        borderRadius: '8px',
                          cursor: brokerLoading ? 'not-allowed' : 'pointer',
                        fontSize: 'clamp(12px, 2.5vw, 14px)',
                          fontWeight: 500,
                          opacity: brokerLoading ? 0.6 : 1,
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => !brokerLoading && (e.target.style.background = 'var(--primary-dark)')}
                        onMouseLeave={(e) => !brokerLoading && (e.target.style.background = 'var(--primary-color)')}
                      >
                        {brokerLoading ? 'Verifying...' : 'Verify TOTP'}
                      </button>
                  </div>
                  </>
              )}
              </form>
            </motion.div>
          )}

        {/* Broker Details Popup Modal */}
        {showBrokerDetails && (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000
            }}
            onClick={() => setShowBrokerDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
            background: 'white', 
                padding: 'clamp(1.5em, 4vw, 2em)',
                borderRadius: '16px',
                boxShadow: 'var(--shadow-lg)',
                maxWidth: '90vw',
                maxHeight: '90vh',
                overflow: 'auto',
                position: 'relative'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'clamp(1em, 3vw, 1.5em)'
              }}>
            <h2 style={{ 
                  fontSize: 'clamp(1.3em, 3vw, 1.6em)',
              fontWeight: 600, 
                  color: 'var(--text-primary)',
                  margin: 0
            }}>
                  Broker Account Details
            </h2>
                <button
                  type="button"
                  onClick={() => setShowBrokerDetails(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '0.2em'
                  }}
                >
                  ×
                </button>
          </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1em, 2.5vw, 1.5em)' }}>
          <div style={{ 
                  background: 'rgba(211, 80, 63, 0.1)',
                  padding: 'clamp(1em, 2.5vw, 1.5em)',
                  borderRadius: '12px',
                  border: '1px solid rgba(211, 80, 63, 0.2)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em', marginBottom: '0.5em' }}>
                    <Building size={20} color="var(--primary-color)" />
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Broker Information</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1em' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Broker Name:</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {brokerProfile?.broker_name || brokerProfile?.brokerName || 'Angel One'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Client ID:</span>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {brokerProfile?.broker_client_id || brokerProfile?.accountId || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: 'clamp(12px, 2.5vw, 14px)' }}>Status:</span>
                      <div style={{ color: 'var(--primary-color)', fontWeight: 500 }}>
                        {brokerProfile?.is_active_for_trading ? 'Active for Trading' : 'Inactive'}
                      </div>
                    </div>
                  </div>
            </div>
            
                {brokerProfile?.exchanges && brokerProfile.exchanges.length > 0 && (
                  <div style={{
                    background: 'rgba(211, 80, 63, 0.1)',
                    padding: 'clamp(1em, 2.5vw, 1.5em)',
                    borderRadius: '12px',
                    border: '1px solid rgba(211, 80, 63, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em', marginBottom: '0.5em' }}>
                      <BarChart3 size={20} color="var(--primary-color)" />
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Exchanges</span>
            </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em' }}>
                      {brokerProfile.exchanges.map((exchange, index) => (
                        <span
                          key={index}
                          style={{
                            background: 'var(--primary-color)',
                            color: 'white',
                            padding: '0.3em 0.8em',
                            borderRadius: '20px',
                            fontSize: 'clamp(11px, 2.5vw, 13px)',
                            fontWeight: 500
                          }}
                        >
                          {exchange}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {brokerProfile?.products && brokerProfile.products.length > 0 && (
                  <div style={{
                    background: 'rgba(211, 80, 63, 0.1)',
                    padding: 'clamp(1em, 2.5vw, 1.5em)',
                    borderRadius: '12px',
                    border: '1px solid rgba(211, 80, 63, 0.2)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8em', marginBottom: '0.5em' }}>
                      <Package size={20} color="var(--primary-color)" />
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Products</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em' }}>
                      {brokerProfile.products.map((product, index) => (
                        <span
                          key={index}
                          style={{
                            background: 'var(--primary-color)',
                            color: 'white',
                            padding: '0.3em 0.8em',
                            borderRadius: '20px',
                            fontSize: 'clamp(11px, 2.5vw, 13px)',
                            fontWeight: 500
                          }}
                        >
                          {product}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginTop: 'clamp(1em, 2.5vw, 1.5em)'
                }}>
                  <button
                    type="button"
                    onClick={() => setShowBrokerDetails(false)}
                    style={{
                      background: 'var(--primary-color)',
                      color: 'white',
                      border: 'none',
                      padding: 'clamp(0.8em, 2vw, 1em) clamp(2em, 4vw, 3em)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: 'clamp(12px, 2.5vw, 14px)',
                      fontWeight: 500,
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'var(--primary-dark)'}
                    onMouseLeave={(e) => e.target.style.background = 'var(--primary-color)'}
                  >
                    Close
                  </button>
            </div>
          </div>
        </motion.div>
          </motion.div>
        )}
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#f8d7da',
          color: '#721c24',
          padding: 'clamp(1em, 2.5vw, 1.5em)',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '400px',
          fontSize: 'clamp(14px, 2.5vw, 16px)'
        }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#d4edda',
          color: '#155724',
          padding: 'clamp(1em, 2.5vw, 1.5em)',
          borderRadius: '8px',
          border: '1px solid #c3e6cb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '400px',
          fontSize: 'clamp(14px, 2.5vw, 16px)'
        }}>
          {success}
        </div>
      )}
    </div>
  );
};

// InputField component
const InputField = ({ label, name, type = 'text', required, placeholder, disabled = false, value, onChange }) => {
  return (
    <div style={{ marginBottom: 'clamp(1em, 3vw, 1.5em)' }}>
      <label style={{
        display: 'block',
        marginBottom: '0.5em',
        fontWeight: 500,
        color: 'var(--text-primary)',
        fontSize: 'clamp(14px, 2.5vw, 16px)'
      }}>
        {label} {required && <span style={{ color: 'var(--danger-color)' }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: 'clamp(0.8em, 2vw, 1em)',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          fontSize: 'clamp(14px, 2.5vw, 16px)',
          background: disabled ? '#f8f9fa' : 'white',
          color: disabled ? '#6c757d' : 'var(--text-primary)',
          cursor: disabled ? 'not-allowed' : 'text'
        }}
        onFocus={(e) => {
          if (!disabled) {
            e.target.style.borderColor = 'var(--primary-color)';
            e.target.style.boxShadow = '0 0 0 2px rgba(0, 123, 255, 0.25)';
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'var(--border-color)';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );
};

// Remove the context creation since we don't need it
// const AdminProfileSettingsContext = React.createContext();

export default AdminProfileSettings; 