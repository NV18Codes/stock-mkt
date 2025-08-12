import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { updateProfile, getUserProfile } from '../../api/auth';
import { 
  addBrokerAccount, 
  fetchMyBrokerProfile, 
  clearBrokerConnection 
} from '../../api/auth';
import { verifyBrokerTOTP } from '../../api/broker';
import { useAuth } from '../../context/AuthContext';
import { 
  X, 
  Plus,
  Trash2,
  Eye,
  EyeOff
} from 'lucide-react';

const AdminProfileSettings = () => {
  const { role } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    email: '',
    phone: ''
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
    totp: '',
    showHashedDetails: false
  });
  
  const [brokerProfile, setBrokerProfile] = useState(null);
  const [showBrokerForm, setShowBrokerForm] = useState(false);
  const [brokerStep, setBrokerStep] = useState(1);

  const [brokerLoading, setBrokerLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Utility function to hash sensitive data
  const hashSensitiveData = (value) => {
    if (!value) return '';
    if (value.length <= 4) return '*'.repeat(value.length);
    return '*'.repeat(value.length - 4) + value.slice(-4);
  };

  useEffect(() => {
    fetchAdminProfile();
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
    if (!window.confirm('Are you sure you want to disconnect your broker account? This action cannot be undone.')) {
      return;
    }
    
    try {
      const result = await clearBrokerConnection();
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
      totp: '',
      showHashedDetails: false
    });
    setBrokerStep(1);
    setError('');
  };

  const fetchAdminProfile = async () => {
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
      console.error('Error fetching admin profile:', error);
      setError('Failed to fetch admin profile');
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

  const InputField = ({ label, name, type = 'text', required = false, placeholder }) => (
    <div style={{ marginBottom: 'clamp(1.2em, 3vw, 1.5em)' }}>
      <label style={{ 
        color: '#495057', 
        fontWeight: 500, 
        display: 'block', 
        marginBottom: '0.5em', 
        fontSize: 'clamp(13px, 2.5vw, 14px)'
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
          padding: 'clamp(0.7em, 2vw, 0.8em)', 
          border: '1px solid #e0e0e0', 
          borderRadius: '8px', 
          fontSize: 'clamp(13px, 2.5vw, 14px)', 
          background: '#fff',
          transition: 'all 0.3s ease',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#007bff';
          e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = '#e0e0e0';
          e.target.style.boxShadow = 'none';
        }}
      />
    </div>
  );

  const SensitiveInputField = ({ label, name, type = 'text', required = false, placeholder }) => (
    <div style={{ marginBottom: 'clamp(1.2em, 3vw, 1.5em)' }}>
      <label style={{ 
        color: '#495057', 
        fontWeight: 500, 
        display: 'block', 
        marginBottom: '0.5em', 
        fontSize: 'clamp(13px, 2.5vw, 14px)'
      }}>
        {label} {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={type}
          name={name}
          value={brokerData.showHashedDetails ? brokerData[name] : hashSensitiveData(brokerData[name])}
          onChange={handleBrokerChange}
          placeholder={placeholder}
          style={{ 
            width: '100%', 
            padding: 'clamp(0.7em, 2vw, 0.8em)', 
            paddingRight: '3.5em',
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            fontSize: 'clamp(13px, 2.5vw, 14px)', 
            background: '#fff',
            transition: 'all 0.3s ease',
            boxSizing: 'border-box',
            fontFamily: brokerData.showHashedDetails ? 'inherit' : 'monospace',
            letterSpacing: brokerData.showHashedDetails ? 'normal' : '0.1em'
          }}
          required
          onFocus={(e) => {
            e.target.style.borderColor = '#007bff';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.boxShadow = 'none';
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
            color: '#6c757d',
            cursor: 'pointer',
            padding: '0.3em',
            borderRadius: '4px',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => {
            e.target.style.background = '#f8f9fa';
            e.target.style.color = '#495057';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'none';
            e.target.style.color = '#6c757d';
          }}
          title={brokerData.showHashedDetails ? 'Hide sensitive data' : 'Show sensitive data'}
        >
          {brokerData.showHashedDetails ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: 'clamp(2em, 5vw, 3em)',
        background: '#ffffff',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div className="loading-spinner" style={{
          width: 'clamp(40px, 8vw, 50px)',
          height: 'clamp(40px, 8vw, 50px)',
          border: '4px solid #e3e3e3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: 'clamp(1em, 3vw, 1.5em)'
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
      maxWidth: 'min(1200px, 95vw)', 
      margin: '0 auto', 
      padding: 'clamp(1em, 3vw, 2em)', 
      background: '#f8f9fa', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ 
        color: '#2c3e50', 
        marginBottom: 'clamp(1.2em, 3vw, 1.5em)', 
        textAlign: 'center', 
        fontWeight: 600, 
        fontSize: 'clamp(1.5em, 4vw, 2.2em)'
      }}>
        Admin Profile Settings
      </h1>
      
      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '12px', 
          marginBottom: 'clamp(1.2em, 3vw, 1.5em)', 
          border: '1px solid #f5c6cb', 
          fontSize: 'clamp(13px, 2.5vw, 14px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em',
          boxShadow: '0 2px 8px rgba(220, 53, 69, 0.1)'
        }}>
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}
      
      {success && (
        <div style={{ 
          background: '#d4edda', 
          color: '#155724', 
          padding: 'clamp(0.8em, 2vw, 1em)', 
          borderRadius: '12px', 
          marginBottom: 'clamp(1.2em, 3vw, 1.5em)', 
          border: '1px solid #c3e6cb', 
          fontSize: 'clamp(13px, 2.5vw, 14px)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5em',
          boxShadow: '0 2px 8px rgba(40, 167, 69, 0.1)'
        }}>
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      <div style={{ 
        display: 'grid', 
        gap: 'clamp(1.5em, 4vw, 2em)', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))' 
      }}>
        {/* Personal Information */}
        <div style={{ 
          padding: 'clamp(1.5em, 4vw, 2em)', 
          background: '#fff', 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          border: '1px solid #e9ecef',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: 'clamp(1.2em, 3vw, 1.5em)', 
            fontWeight: 600, 
            fontSize: 'clamp(1.2em, 3vw, 1.4em)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <span>👤</span>
            Personal Information
          </h2>

          {/* Role Display Section */}
          <div style={{ 
            padding: 'clamp(0.8em, 2vw, 1em)', 
            background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)', 
            borderRadius: '12px', 
            border: '1px solid #bbdefb',
            marginBottom: 'clamp(1.2em, 3vw, 1.5em)',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.1)'
          }}>
            <div style={{ marginBottom: '0.5em' }}>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 'clamp(11px, 2.5vw, 12px)' }}>Role: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 'clamp(11px, 2.5vw, 12px)', textTransform: 'capitalize' }}>{role || 'Admin'}</span>
            </div>
            
            <div style={{ marginBottom: '0.5em' }}>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 'clamp(11px, 2.5vw, 12px)' }}>Account Type: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 'clamp(11px, 2.5vw, 12px)' }}>Administrator Account</span>
            </div>
            
            <div>
              <span style={{ color: '#495057', fontWeight: 500, fontSize: 'clamp(11px, 2.5vw, 12px)' }}>Access Level: </span>
              <span style={{ color: '#1976d2', fontWeight: 600, fontSize: 'clamp(11px, 2.5vw, 12px)' }}>Full System Access</span>
            </div>
          </div>

          {/* Password Management Section */}
          <div style={{ 
            padding: 'clamp(0.8em, 2vw, 1em)', 
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)', 
            borderRadius: '12px', 
            border: '1px solid #ffeaa7',
            marginBottom: 'clamp(1.2em, 3vw, 1.5em)',
            boxShadow: '0 2px 8px rgba(133, 100, 4, 0.1)'
          }}>
            <h3 style={{ 
              color: '#856404', 
              marginBottom: '0.5em', 
              fontWeight: 600, 
              fontSize: 'clamp(0.9em, 2.5vw, 1em)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5em'
            }}>
              <span>🔐</span>
              Password Management
            </h3>
            <div style={{ display: 'flex', gap: 'clamp(0.8em, 2vw, 1em)', flexWrap: 'wrap' }}>
              <Link to="/reset-password" style={{
                padding: 'clamp(0.4em, 1.5vw, 0.5em) clamp(0.8em, 2vw, 1em)',
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                color: '#fff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontSize: 'clamp(11px, 2.5vw, 12px)',
                fontWeight: 500,
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 8px rgba(40, 167, 69, 0.2)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(40, 167, 69, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 2px 8px rgba(40, 167, 69, 0.2)';
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
                padding: 'clamp(0.8em, 2vw, 1em)',
                background: saving ? '#6c757d' : 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: 'clamp(14px, 2.5vw, 16px)',
                fontWeight: 600,
                cursor: saving ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                marginTop: 'clamp(1em, 2.5vw, 1.2em)',
                boxShadow: saving ? 'none' : '0 4px 15px rgba(0, 123, 255, 0.3)'
              }}
              onMouseEnter={(e) => {
                if (!saving) {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(0, 123, 255, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!saving) {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 15px rgba(0, 123, 255, 0.3)';
                }
              }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Broker Account Section */}
        <div style={{ 
          padding: 'clamp(1.5em, 4vw, 2em)', 
          background: '#fff', 
          borderRadius: '16px', 
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
          border: '1px solid #e9ecef',
          transition: 'all 0.3s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        }}>
          <h2 style={{ 
            color: '#2c3e50', 
            marginBottom: 'clamp(1.2em, 3vw, 1.5em)', 
            fontWeight: 600, 
            fontSize: 'clamp(1.2em, 3vw, 1.4em)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <span>🏦</span>
            Broker Account
          </h2>

          {brokerProfile && (
            <div style={{ 
              padding: 'clamp(1.2em, 3vw, 1.5em)', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: '12px', 
              border: '1px solid #e9ecef',
              marginBottom: 'clamp(1.2em, 3vw, 1.5em)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'grid', gap: 'clamp(0.8em, 2vw, 1em)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#495057', fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>Broker:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 600, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{brokerProfile.brokerName}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#495057', fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>Account ID:</span>
                  <span style={{ color: '#2c3e50', fontWeight: 600, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>{brokerProfile.accountId}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#495057', fontWeight: 500, fontSize: 'clamp(12px, 2.5vw, 13px)' }}>Status:</span>
                  <span style={{ 
                    color: brokerProfile.status === 'Active' ? '#28a745' : '#dc3545', 
                    fontWeight: 600,
                    background: brokerProfile.status === 'Active' ? 'linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%)' : 'linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%)',
                    padding: 'clamp(0.15em, 1vw, 0.2em) clamp(0.4em, 1.5vw, 0.6em)',
                    borderRadius: '20px',
                    fontSize: 'clamp(11px, 2.5vw, 12px)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {brokerProfile.status}
                  </span>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: 'clamp(0.8em, 2vw, 1em)', 
                marginTop: 'clamp(1.2em, 3vw, 1.5em)',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={() => setShowBrokerForm(true)}
                  style={{
                    padding: 'clamp(0.5em, 1.5vw, 0.6em) clamp(1em, 2.5vw, 1.2em)',
                    background: 'linear-gradient(135deg, #007bff 0%, #0056b3 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: 'clamp(12px, 2.5vw, 14px)',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5em',
                    boxShadow: '0 2px 8px rgba(0, 123, 255, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(0, 123, 255, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(0, 123, 255, 0.2)';
                  }}
                >
                  <Plus size={16} />
                  {brokerProfile.brokerName === 'No Broker Connected' ? 'Connect Broker' : 'Change Broker'}
                </button>
                
                {brokerProfile.brokerName !== 'No Broker Connected' && (
                  <button
                    onClick={handleClearBroker}
                    style={{
                      padding: 'clamp(0.5em, 1.5vw, 0.6em) clamp(1em, 2.5vw, 1.2em)',
                      background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: 'clamp(12px, 2.5vw, 14px)',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5em',
                      boxShadow: '0 2px 8px rgba(220, 53, 69, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(220, 53, 69, 0.3)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(220, 53, 69, 0.2)';
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
              padding: 'clamp(1.2em, 3vw, 1.5em)', 
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
              borderRadius: '12px', 
              border: '1px solid #e9ecef',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'clamp(1.2em, 3vw, 1.5em)'
              }}>
                <h3 style={{ 
                  color: '#2c3e50', 
                  margin: 0, 
                  fontWeight: 600, 
                  fontSize: 'clamp(1em, 2.5vw, 1.2em)'
                }}>
                  {brokerStep === 1 ? 'Step 1: Enter Broker Details' : 'Step 2: Enter TOTP'}
                </h3>
                <div style={{ display: 'flex', gap: '0.5em', alignItems: 'center' }}>
                  {brokerStep === 1 && (
                    <button
                      type="button"
                      onClick={() => setBrokerData(prev => ({ ...prev, showHashedDetails: !prev.showHashedDetails }))}
                      style={{
                        padding: 'clamp(0.3em, 1vw, 0.4em) clamp(0.6em, 1.5vw, 0.8em)',
                        background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: 'clamp(10px, 2.5vw, 12px)',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.3em',
                        boxShadow: '0 2px 6px rgba(23, 162, 184, 0.2)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 10px rgba(23, 162, 184, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 6px rgba(23, 162, 184, 0.2)';
                      }}
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
                      fontSize: 'clamp(1.2em, 3vw, 1.5em)',
                      cursor: 'pointer',
                      color: '#6c757d',
                      padding: '0.2em',
                      borderRadius: '4px',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = '#f8f9fa';
                      e.target.style.color = '#495057';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'none';
                      e.target.style.color = '#6c757d';
                    }}
                  >
                    <X />
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddBroker}>
                {brokerStep === 1 ? (
                  <>
                    <SensitiveInputField
                      label="Broker Client ID"
                      name="broker_client_id"
                      required
                      placeholder="Enter your broker client ID"
                    />
                    
                    <SensitiveInputField
                      label="API Key"
                      name="broker_api_key"
                      required
                      placeholder="Enter your API key"
                    />
                    
                    <SensitiveInputField
                      label="API Secret"
                      name="broker_api_secret"
                      required
                      placeholder="Enter your API secret"
                    />
                    
                    <SensitiveInputField
                      label="Angel One Token"
                      name="angelone_token"
                      required
                      placeholder="Enter your Angel One token"
                    />
                    
                    <SensitiveInputField
                      label="MPIN"
                      name="mpin"
                      type="password"
                      required
                      placeholder="Enter your MPIN"
                    />
                  </>
                ) : (
                  <div style={{ marginBottom: 'clamp(1.2em, 3vw, 1.5em)' }}>
                    <label style={{ 
                      color: '#495057', 
                      fontWeight: 500, 
                      display: 'block', 
                      marginBottom: '0.5em', 
                      fontSize: 'clamp(13px, 2.5vw, 14px)' 
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
                        padding: 'clamp(0.7em, 2vw, 0.8em)', 
                        border: '1px solid #e0e0e0', 
                        borderRadius: '8px', 
                        fontSize: 'clamp(13px, 2.5vw, 14px)', 
                        background: '#fff',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box'
                      }}
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#007bff';
                        e.target.style.boxShadow = '0 0 0 3px rgba(0, 123, 255, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e0e0e0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={brokerLoading}
                  style={{
                    width: '100%',
                    padding: 'clamp(0.8em, 2vw, 1em)',
                    background: brokerLoading ? '#6c757d' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: 'clamp(14px, 2.5vw, 16px)',
                    fontWeight: 600,
                    cursor: brokerLoading ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: brokerLoading ? 'none' : '0 4px 15px rgba(40, 167, 69, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!brokerLoading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!brokerLoading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
                    }
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

export default AdminProfileSettings; 