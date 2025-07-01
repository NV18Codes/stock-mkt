import React from 'react';

const segments = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'];

const SegmentSelection = ({ selected, onSelectSegment }) => (
  <div style={{ 
    margin: '1em 0',
    padding: 'clamp(0.8em, 2vw, 1em)',
    background: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  }}>
    <label style={{ 
      color: '#2c3e50', 
      marginRight: '1em',
      fontSize: 'clamp(12px, 2.5vw, 14px)',
      fontWeight: 500
    }}>
      Select Segment:
    </label>
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
        cursor: 'pointer'
      }}
    >
      {segments.map(seg => (
        <option key={seg} value={seg}>{seg}</option>
      ))}
    </select>
  </div>
);

export default SegmentSelection; 