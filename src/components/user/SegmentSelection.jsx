import React from 'react';

const segments = ['NIFTY', 'BANKNIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX'];

const SegmentSelection = ({ selected, onSelectSegment }) => (
  <div style={{ margin: '1em 0' }}>
    <label style={{ color: '#fff', marginRight: '1em' }}>Select Segment:</label>
    <select
      value={selected}
      onChange={e => onSelectSegment(e.target.value)}
      style={{ background: '#111', color: '#fff', border: '1px solid #007bff', borderRadius: 4, padding: '0.5em' }}
    >
      {segments.map(seg => (
        <option key={seg} value={seg}>{seg}</option>
      ))}
    </select>
  </div>
);

export default SegmentSelection; 