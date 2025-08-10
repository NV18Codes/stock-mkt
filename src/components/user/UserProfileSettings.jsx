import React, { useEffect, useState } from 'react';
import { updateProfile, getUserProfile } from '../../api/auth';
import { 
  addBrokerAccount, 
  fetchMyBrokerProfile, 
  clearBrokerProfile 
} from '../../api/auth';
import { verifyBrokerTOTP, verifyBrokerMPIN } from '../../api/broker';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserProfileSettings = () => {
  const { user, role } = useAuth();
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

  useEffect(() => {
    fetchUserProfile();
    fetchBrokerProfile();
  }, []);

  const fetchBrokerProfile = async () => {
    try {
      const response = await fetchMyBrokerProfile();
      if (response && response.success && response.data) {
        // Map the API response fields to the expected frontend fields
        const mappedBrokerProfile = {
          brokerName: response.data.broker_name || response.data.brokerName || 'Angel One',
          accountId: response.data.broker_client_id || response.data.accountId || 'N/A',
          status: response.data.is_active_for_trading ? 'Active' : 'Inactive',
          exchanges: response.data.exchanges || [],
          products: response.data.products || [],
          // Add other fields as needed
          ...response.data
        };
        setBrokerProfile(mappedBrokerProfile);
      }
    } catch (error) {
      console.error('Error fetching broker profile:', error);
      setError('Failed to load broker profile data. Please try again later.');
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
      setError('Failed to load profile data. Please try again later.');
      throw err; // Re-throw the error instead of setting fallback data
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

          {/* Role Display Section */}
          <div style={{ 
            padding: '1em', 
            background: '#e3f2fd', 
            borderRadius: '6px', 
            border: '1px solid #bbdefb',
            marginBottom: '1.5em'
          }}>
            <div style={{ marginBottom: '0.5em' }}>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Role: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12, textTransform: 'capitalize' }}>{role || 'User'}</span>
            </div>
            
            <div style={{ marginBottom: '0.5em' }}>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Account Type: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12 }}>Trading Account</span>
            </div>
            
            <div>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 12 }}>Access Level: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 12 }}>Standard Trading Access</span>
            </div>
          </div>

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

          {brokerProfile ? (
            <div style={{
              background: '#e8f5e8',
              padding: '1.5em',
              borderRadius: '8px',
              border: '1px solid #c8e6c9',
              marginBottom: '1.5em'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1em', gap: '0.5em' }}>
                <span style={{ color: '#2e7d32', fontSize: '1.2em' }}>✅</span>
                <span style={{ 
                  fontWeight: 600, 
                  fontSize: '1.1em',
                  color: '#2e7d32'
                }}>
                  Connected to {brokerProfile.brokerName || 'Angel One'}
                </span>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1em',
                marginBottom: '1.5em'
              }}>
                <div style={{ 
                  background: 'white', 
                  padding: '1em', 
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '0.875rem',
                    marginBottom: '0.25em'
                  }}>
                    Account ID
                  </div>
                  <div style={{ 
                    color: '#2c3e50', 
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    {brokerProfile.accountId || 'N/A'}
                  </div>
                </div>
                
                <div style={{ 
                  background: 'white', 
                  padding: '1em', 
                  borderRadius: '6px',
                  border: '1px solid #e0e0e0'
                }}>
                  <div style={{ 
                    color: '#666', 
                    fontSize: '0.875rem',
                    marginBottom: '0.25em'
                  }}>
                    Status
                  </div>
                  <div style={{ 
                    color: '#2e7d32', 
                    fontWeight: '600',
                    fontSize: '0.95rem'
                  }}>
                    {brokerProfile.status || 'Active'}
                  </div>
                </div>

                {brokerProfile.exchanges && brokerProfile.exchanges.length > 0 && (
                  <div style={{ 
                    background: 'white', 
                    padding: '1em', 
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ 
                      color: '#666', 
                      fontSize: '0.875rem',
                      marginBottom: '0.25em'
                    }}>
                      Exchanges
                    </div>
                    <div style={{ 
                      color: '#2c3e50', 
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      {brokerProfile.exchanges.join(', ')}
                    </div>
                  </div>
                )}

                {brokerProfile.products && brokerProfile.products.length > 0 && (
                  <div style={{ 
                    background: 'white', 
                    padding: '1em', 
                    borderRadius: '6px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <div style={{ 
                      color: '#666', 
                      fontSize: '0.875rem',
                      marginBottom: '0.25em'
                    }}>
                      Products
                    </div>
                    <div style={{ 
                      color: '#2c3e50', 
                      fontWeight: '600',
                      fontSize: '0.95rem'
                    }}>
                      {brokerProfile.products.join(', ')}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display: 'flex', gap: '1em', flexWrap: 'wrap' }}>
                <button
                  onClick={handleClearBroker}
                  style={{
                    background: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '0.75em 1.5em',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#d32f2f';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f44336';
                  }}
                >
                  Disconnect Broker
                </button>
                
                <button
                  onClick={() => setShowBrokerForm(true)}
                  style={{
                    background: '#2196f3',
                    color: 'white',
                    border: 'none',
                    padding: '0.75em 1.5em',
                    borderRadius: '6px',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#1976d2';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#2196f3';
                  }}
                >
                  Change Broker
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              background: '#fff3cd',
              padding: '1.5em',
              borderRadius: '8px',
              border: '1px solid #ffeaa7',
              marginBottom: '1.5em'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                marginBottom: '1em', 
                gap: '0.5em' 
              }}>
                <span style={{ color: '#856404', fontSize: '1.2em' }}>⚠️</span>
                <span style={{ 
                  color: '#856404', 
                  fontWeight: '600',
                  fontSize: '1.1em'
                }}>
                  No Broker Connected
                </span>
              </div>
              
              <p style={{ 
                color: '#856404', 
                marginBottom: '1.5em',
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                Connect your broker account to enable trading functionality and access advanced features.
              </p>
              
              {!showBrokerForm ? (
                <button
                  onClick={() => setShowBrokerForm(true)}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '0.8em 1.5em',
                    borderRadius: '6px',
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#0056b3';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#007bff';
                  }}
                >
                  Connect Broker Account
                </button>
              ) : (
                <form onSubmit={handleAddBroker} style={{ marginTop: '1em' }}>
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
                          background: brokerStep >= step ? '#007bff' : '#e0e0e0',
                          color: brokerStep >= step ? 'white' : '#666',
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
                          color: brokerStep >= step ? '#2c3e50' : '#666',
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
                      background: '#e0e0e0',
                      zIndex: -1
                    }}>
                      <div style={{
                        width: `${((brokerStep - 1) / 2) * 100}%`,
                        height: '100%',
                        background: '#007bff',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                  </div>

                  {/* Step 1: API Credentials */}
                  {brokerStep === 1 && (
                    <>
                      <div style={{ marginBottom: '1.5em' }}>
                        <label style={{ 
                          color: '#2c3e50', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: '0.9rem' 
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
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: '0.9rem', 
                            background: 'white',
                            color: '#2c3e50'
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
                          color: '#2c3e50', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: '0.9rem' 
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
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: '0.9rem', 
                            background: 'white',
                            color: '#2c3e50'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '1.5em' }}>
                        <label style={{ 
                          color: '#2c3e50', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: '0.9rem' 
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
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: '0.9rem', 
                            background: 'white',
                            color: '#2c3e50'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '1.5em' }}>
                        <label style={{ 
                          color: '#2c3e50', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: '0.9rem' 
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
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: '0.9rem', 
                            background: 'white',
                            color: '#2c3e50'
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: '2em' }}>
                        <label style={{ 
                          color: '#2c3e50', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: '0.9rem' 
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
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: '0.9rem', 
                            background: 'white',
                            color: '#2c3e50'
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
                          color: '#2c3e50', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: '0.9rem' 
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
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: '0.9rem', 
                            background: 'white',
                            color: '#2c3e50',
                            textAlign: 'center',
                            letterSpacing: '0.5em'
                          }}
                        />
                        <p style={{
                          color: '#666',
                          fontSize: '0.8rem',
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
                          color: '#2c3e50', 
                          fontWeight: 600, 
                          display: 'block', 
                          marginBottom: '0.5em', 
                          fontSize: '0.9rem' 
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
                            border: '1px solid #e0e0e0', 
                            borderRadius: '6px', 
                            fontSize: '0.9rem', 
                            background: 'white',
                            color: '#2c3e50',
                            textAlign: 'center',
                            letterSpacing: '0.5em'
                          }}
                        />
                        <p style={{
                          color: '#666',
                          fontSize: '0.8rem',
                          marginTop: '0.5rem',
                          textAlign: 'center'
                        }}>
                          Enter your 4-digit MPIN for broker authentication
                        </p>
                      </div>
                    </>
                  )}

                  <div style={{ display: 'flex', gap: '1em', marginTop: '1.5em' }}>
                    <button
                      type="submit"
                      disabled={brokerLoading}
                      style={{
                        flex: 1,
                        background: brokerLoading ? '#ccc' : '#007bff',
                        color: 'white',
                        border: 'none',
                        padding: '0.75em 1em',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: brokerLoading ? 'not-allowed' : 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {brokerLoading ? (
                        'Processing...'
                      ) : (
                        brokerStep === 1 ? 'Continue' : brokerStep === 2 ? 'Verify TOTP' : 'Complete Connection'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={brokerStep === 1 ? () => setShowBrokerForm(false) : () => setBrokerStep(brokerStep - 1)}
                      style={{
                        flex: 1,
                        background: 'white',
                        color: '#2c3e50',
                        border: '2px solid #e0e0e0',
                        padding: '0.75em 1em',
                        borderRadius: '6px',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      {brokerStep === 1 ? 'Cancel' : 'Back'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

      </div>


    </div>
  );
};

export default UserProfileSettings; 