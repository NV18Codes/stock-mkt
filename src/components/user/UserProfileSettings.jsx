import React, { useState, useEffect } from 'react';
import { updateProfile, getUserProfile } from '../../api/auth';
import { 
  addBrokerAccount, 
  fetchMyBrokerProfile, 
  clearBrokerProfile 
} from '../../api/auth';
import { verifyBrokerTOTP } from '../../api/broker';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  X, 
  Plus,
  Trash2
} from 'lucide-react';

const UserProfileSettings = () => {
  const { role } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
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
          brokerName: response.data.broker_name || response.data.brokerName || 'No Broker Connected',
          accountId: response.data.broker_client_id || response.data.accountId || 'N/A',
          status: response.data.is_active_for_trading ? 'Active' : 'Inactive',
          exchanges: response.data.exchanges || [],
          products: response.data.products || [],
          // Add other fields as needed
          ...response.data
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
          angelone_mpin: brokerData.mpin,
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
    try {
      const result = await clearBrokerProfile();
      if (result && result.success) {
        setSuccess('Broker connection cleared successfully');
        setBrokerProfile({
          brokerName: 'No Broker Connected',
          accountId: 'N/A',
          status: 'Inactive',
          exchanges: [],
          products: []
        });
      } else {
        setError('Failed to clear broker connection');
      }
    } catch (err) {
      console.error('Error clearing broker profile:', err);
      setError('Failed to clear broker connection');
    }
  };

  const resetBrokerForm = () => {
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
    setBrokerStep(1);
    setError('');
  };

  const fetchUserProfile = async () => {
    try {
      const response = await getUserProfile();
      if (response && response.success && response.data) {
        setFormData({
          name: response.data.name || '',
          fullName: response.data.fullName || response.data.name || '',
          email: response.data.email || '',
          phone: response.data.phone || ''
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
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
      const response = await updateProfile(formData);
      if (response && response.success) {
        setSuccess('Profile updated successfully!');
      } else {
        setError(response?.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
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
              label="Name"
              name="name"
              required
              placeholder="Enter your name"
            />
            
            <InputField
              label="Full Name"
              name="fullName"
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

          {brokerProfile && (
            <div style={{ 
              padding: '1.5em', 
              background: '#f8f9fa', 
              borderRadius: '8px', 
              border: '1px solid #e9ecef',
              marginBottom: '1.5em'
            }}>
              <div style={{ display: 'grid', gap: '1em' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#495057', fontWeight: 500 }}>Broker:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 600 }}>{brokerProfile.brokerName}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#495057', fontWeight: 500 }}>Account ID:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 600 }}>{brokerProfile.accountId}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '1em', 
                marginTop: '1.5em',
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
                  {brokerProfile.brokerName === 'No Broker Connected' ? 'Connect Broker' : 'Change Broker'}
                </button>
                
                {brokerProfile.brokerName !== 'No Broker Connected' && (
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
                )}
              </div>
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
                      <input
                        type="text"
                        name="broker_client_id"
                        value={brokerData.broker_client_id}
                        onChange={handleBrokerChange}
                        placeholder="Enter your broker client ID"
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
                      <input
                        type="text"
                        name="broker_api_key"
                        value={brokerData.broker_api_key}
                        onChange={handleBrokerChange}
                        placeholder="Enter your API key"
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
                      <input
                        type="text"
                        name="broker_api_secret"
                        value={brokerData.broker_api_secret}
                        onChange={handleBrokerChange}
                        placeholder="Enter your API secret"
                        style={{ 
                          width: '100%', 
                          padding: '1em', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '6px', 
                          fontSize: 14, 
                          background: '#fff' 
                        }}
                        required
                      />
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
                      <input
                        type="text"
                        name="angelone_token"
                        value={brokerData.angelone_token}
                        onChange={handleBrokerChange}
                        placeholder="Enter your Angel One token"
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
                      <input
                        type="password"
                        name="mpin"
                        value={brokerData.mpin}
                        onChange={handleBrokerChange}
                        placeholder="Enter your MPIN"
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
        </div>
      </div>
    </div>
  );
};

export default UserProfileSettings; 