import React, { useState, useEffect } from 'react';
import { getAllSegments } from '../../api/admin';

const SegmentSelection = ({ selected, onSelectSegment }) => {
  const [segments, setSegments] = useState(['All Segments']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState('');

  const testAPICall = async () => {
    try {
      console.log('SegmentSelection: Manual API test...');
      setApiStatus('Testing API...');
      const response = await getAllSegments();
      console.log('SegmentSelection: Manual test response:', response);
      setApiStatus(`API Success: ${JSON.stringify(response, null, 2)}`);
      
      // If API call succeeds, update segments
      if (response && response.success && Array.isArray(response.data)) {
        const segmentOptions = ['All Segments', ...response.data.map(seg => seg.name)];
        setSegments(segmentOptions);
        setError('');
      } else if (response && Array.isArray(response)) {
        const segmentOptions = ['All Segments', ...response.map(seg => seg.name)];
        setSegments(segmentOptions);
        setError('');
      }
    } catch (err) {
      console.error('SegmentSelection: Manual test error:', err);
      setApiStatus(`API Error: ${err.message}`);
      
      // If API call fails, use fallback segments
      const fallbackSegments = ['All Segments', 'NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'];
      setSegments(fallbackSegments);
      setError('Using fallback segments due to API access restriction');
    }
  };

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        setLoading(true);
        console.log('SegmentSelection: Starting to fetch segments...');
        const response = await getAllSegments();
        console.log('SegmentSelection: Raw API response:', response);
        
        if (response && response.success && Array.isArray(response.data)) {
          console.log('SegmentSelection: API returned success with data array:', response.data);
          // Add "All Segments" as the first option
          const segmentOptions = ['All Segments', ...response.data.map(seg => seg.name)];
          console.log('SegmentSelection: Final segment options:', segmentOptions);
          setSegments(segmentOptions);
          setError('');
        } else if (response && Array.isArray(response)) {
          // Handle case where response is directly an array
          console.log('SegmentSelection: API returned direct array:', response);
          const segmentOptions = ['All Segments', ...response.map(seg => seg.name)];
          console.log('SegmentSelection: Final segment options (direct array):', segmentOptions);
          setSegments(segmentOptions);
          setError('');
        } else {
          console.log('SegmentSelection: API response structure unexpected:', response);
          // Fallback to default segments if API fails
          const fallbackSegments = ['All Segments', 'NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'];
          setSegments(fallbackSegments);
          setError('Using fallback segments - API response structure unexpected');
        }
      } catch (err) {
        console.error('SegmentSelection: Error fetching segments:', err);
        // Check if it's a permission/authentication error
        if (err.response?.status === 401 || err.response?.status === 403) {
          setError('Access denied - segments require admin privileges. Using fallback segments.');
        } else {
          setError('Failed to load segments from server. Using fallback segments.');
        }
        // Fallback to default segments
        const fallbackSegments = ['All Segments', 'NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'];
        setSegments(fallbackSegments);
      } finally {
        setLoading(false);
      }
    };

    fetchSegments();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        margin: '1em 0',
        padding: 'clamp(0.8em, 2vw, 1em)',
        background: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <span style={{ color: '#6c757d' }}>Loading segments...</span>
        <button 
          onClick={testAPICall}
          style={{
            marginLeft: '1em',
            padding: '0.3em 0.6em',
            background: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Test API
        </button>
      </div>
    );
  }

  return (
  <div style={{ 
    margin: '1em 0',
    padding: 'clamp(0.8em, 2vw, 1em)',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5em' }}>
    <label style={{ 
      color: '#2c3e50', 
      marginRight: '1em',
      fontSize: 'clamp(12px, 2.5vw, 14px)',
      fontWeight: 500
    }}>
      Select Segment:
    </label>
        <button 
          onClick={testAPICall}
          style={{
            padding: '0.3em 0.6em',
            background: '#6c757d',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '12px',
            cursor: 'pointer'
          }}
        >
          Test API
        </button>
      </div>
      
      {error && (
        <div style={{ 
          marginBottom: '0.5em',
          padding: '0.5em',
          background: '#fff3cd',
          color: '#856404',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          {error}
        </div>
      )}
      
      {apiStatus && (
        <div style={{ 
          marginBottom: '0.5em',
          padding: '0.5em',
          background: apiStatus.includes('Success') ? '#d4edda' : '#f8d7da',
          color: apiStatus.includes('Success') ? '#155724' : '#721c24',
          border: `1px solid ${apiStatus.includes('Success') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px',
          fontSize: '12px',
          wordBreak: 'break-word'
        }}>
          {apiStatus}
        </div>
      )}
      
    <select
      value={selected}
      onChange={e => onSelectSegment(e.target.value)}
      style={{ 
        background: '#ffffff', 
        color: '#2c3e50', 
        border: '1px solid #007bff', 
        borderRadius: '4px', 
        padding: 'clamp(0.4em, 1.5vw, 0.5em)',
        fontSize: 'clamp(12px, 2.5vw, 14px)',
        fontWeight: 500,
          cursor: 'pointer',
          width: '100%'
      }}
    >
      {segments.map(seg => (
        <option key={seg} value={seg}>{seg}</option>
      ))}
    </select>
      <div style={{ marginTop: '0.5em', fontSize: '12px', color: '#6c757d' }}>
        Available segments: {segments.length - 1} (excluding "All Segments")
      </div>
  </div>
);
};

export default SegmentSelection; 