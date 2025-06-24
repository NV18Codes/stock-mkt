import React, { useState, useMemo, useRef, useEffect } from 'react';
import axios from 'axios';

// A helper function to format numbers as currency
const formatCurrency = (value) => {
  const num = parseFloat(value);
  if (isNaN(num)) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(num);
};


const UserManagement = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'https://apistocktrading-production.up.railway.app/api';

  // --- STATE MANAGEMENT ---
  const [users, setUsers] = useState([]);
  const [segments, setSegments] = useState([]);
  const [segmentUserMap, setSegmentUserMap] = useState({});
  const [modal, setModal] = useState({ isOpen: false, mode: null, data: null });
  const [dragOverSegmentId, setDragOverSegmentId] = useState(null);
  const [loadingSegments, setLoadingSegments] = useState(false);
  const [errorSegments, setErrorSegments] = useState(null);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [errorUsers, setErrorUsers] = useState(null);

  const rightPanelRef = useRef(null);

  // --- Fetch and process users from API on mount ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        const response = await axios.get(`${API_URL}/users/`);
        const rawUsers = response.data.data;
        if (!Array.isArray(rawUsers)) {
          throw new Error('Invalid data format from API.');
        }

        const initialSegmentMap = {};
        const normalizedUsers = rawUsers.map(rawUser => {
          const normalizedUser = {
            id: rawUser.id,
            name: rawUser.name || rawUser.email.split('@')[0],
            email: rawUser.email,
            brokerStatus: rawUser.is_broker_connected ? 'Connected' : 'Disconnected',
            isActive: rawUser.is_active_for_trading,
            rmsLimit: rawUser.rms_limit ? formatCurrency(rawUser.rms_limit.net) : '$0.00',
          };
          
          // MODIFIED: Use `current_segment_id` to match backend schema.
          const segmentId = rawUser.current_segment_id; 

          if (segmentId) {
            if (!initialSegmentMap[segmentId]) {
              initialSegmentMap[segmentId] = [];
            }
            initialSegmentMap[segmentId].push(normalizedUser.id);
          }
          return normalizedUser;
        });

        setUsers(normalizedUsers);
        setSegmentUserMap(initialSegmentMap);

      } catch (error) {
        console.error('Error fetching users:', error);
        setErrorUsers('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [API_URL]);

  // --- Fetch segments from API on mount ---
  useEffect(() => {
    const fetchSegments = async () => {
      setLoadingSegments(true);
      setErrorSegments(null);
      try {
        const response = await axios.get(`${API_URL}/admin/segments`);
        const segmentData = response.data.data;
        if (Array.isArray(segmentData)) {
          setSegments(segmentData);
        } else {
          throw new Error("Invalid data format from segments API.");
        }
      } catch (error) {
        console.error('Error fetching segments:', error);
        setErrorSegments('Failed to load segments');
      } finally {
        setLoadingSegments(false);
      }
    };
    fetchSegments();
  }, [API_URL]);

  // --- DERIVED STATE & HELPERS ---
  const assignedUserIds = useMemo(() => new Set(Object.values(segmentUserMap).flat()), [segmentUserMap]);
  const unassignedUsers = useMemo(() => users.filter(user => !assignedUserIds.has(user.id)), [users, assignedUserIds]);
  const getUserById = (id) => users.find(u => u.id === id);


  // --- **NEW & REFACTORED API HANDLER** ---
  // This function is updated to match the backend's upsert logic for user-segment assignments.
  const handleAssignUserToSegment = async (userId, targetSegmentId) => {
    let sourceSegmentId = null;
    // This loop correctly finds which segment the user is currently in.
    for (const segId in segmentUserMap) {
        if (segmentUserMap[segId].includes(userId)) {
            sourceSegmentId = segId;
            break;
        }
    }

    if (sourceSegmentId === targetSegmentId) return; // No change needed

    const originalSegmentUserMap = { ...segmentUserMap }; // Store original state for rollback

    // Optimistic UI update for a snappy user experience
    setSegmentUserMap(prevMap => {
        const newMap = JSON.parse(JSON.stringify(prevMap));

        // Remove user from the source segment, if any
        if (sourceSegmentId && newMap[sourceSegmentId]) {
            newMap[sourceSegmentId] = newMap[sourceSegmentId].filter(id => id !== userId);
        }
        
        // Add user to the target segment (unless they are being unassigned)
        if (targetSegmentId !== 'unassigned') {
            if (!newMap[targetSegmentId]) {
                newMap[targetSegmentId] = [];
            }
            if (!newMap[targetSegmentId].includes(userId)) {
                newMap[targetSegmentId].push(userId);
            }
        }
        return newMap;
    });

    try {
        if (targetSegmentId === 'unassigned') {
            // --- UNASSIGN USER ---
            // This action removes the user from any segment.
            
            //  <--- CHANGE STARTS HERE --->
            // We need the user's original segment ID to build the correct URL.
            if (!sourceSegmentId) {
                console.warn(`User ${userId} was not in any segment. No API call needed.`);
                return; // Nothing to do on the backend
            }
            
            // This is the corrected, segment-centric URL for un-assigning (deleting the association).
            const unassignUrl = `${API_URL}/admin/segments/${sourceSegmentId}/users/${userId}`;
            
            console.log(`Attempting to unassign user via: DELETE ${unassignUrl}`);
            await axios.delete(unassignUrl); // The payload is no longer needed for DELETE
            console.log(`User ${userId} successfully unassigned from segment ${sourceSegmentId}.`);
            // <--- CHANGE ENDS HERE --->

        } else {
            // --- ASSIGN OR MOVE USER ---
            // This action assigns a user to a new segment.
            const assignUrl = `${API_URL}/admin/segments/${targetSegmentId}/users`;
            const payload = { userId: userId }; 

            console.log(`Attempting to assign user via: POST ${assignUrl} with payload:`, payload);
            await axios.post(assignUrl, payload);
            console.log(`User ${userId} successfully assigned to segment ${targetSegmentId}.`);
        }
    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('Failed to update user assignment on server:', error.response || error);
        alert(`An error occurred while assigning the user. Reverting the change.\nError: ${errorMessage}`);
        
        // If the API call fails, revert the UI to its original state
        setSegmentUserMap(originalSegmentUserMap);
    }
  };


  // --- DRAG AND DROP HANDLERS ---
  const onDragStartUser = (e, userId) => {
    e.dataTransfer.setData('userId', userId);
    e.dataTransfer.effectAllowed = 'move';
  };
  const onDragOver = (e) => e.preventDefault();
  const onDragEnterSegment = (segmentId) => setDragOverSegmentId(segmentId);
  const onDragLeaveSegment = () => setDragOverSegmentId(null);
  
  const onDrop = (e, targetSegmentId) => {
    e.preventDefault();
    setDragOverSegmentId(null);
    const userId = e.dataTransfer.getData('userId');
    if (userId) {
      handleAssignUserToSegment(userId, targetSegmentId);
    }
  };

  const handlePanelDragOver = (e) => {
    e.preventDefault();
    const panel = rightPanelRef.current;
    if (!panel) return;
    const { top, bottom } = panel.getBoundingClientRect();
    const mouseY = e.clientY;
    const scrollThreshold = 60;
    const scrollSpeed = 10;
    if (mouseY < top + scrollThreshold) {
      panel.scrollTop -= scrollSpeed;
    } else if (mouseY > bottom - scrollThreshold) {
      panel.scrollTop += scrollSpeed;
    }
  };


  // --- CRUD & MODAL HANDLERS ---
  const removeUserFromSegment = (userId) => {
    handleAssignUserToSegment(userId, 'unassigned');
  };

  const openModal = (mode, data = { name: '', description: '' }) => setModal({ isOpen: true, mode, data });
  const closeModal = () => setModal({ isOpen: false, mode: null, data: null });
  const handleModalChange = (e) => setModal(prev => ({ ...prev, data: { ...prev.data, [e.target.name]: e.target.value } }));
  
  const handleModalSave = async () => {
    const { mode, data } = modal;
    if (!data.name || !data.name.trim()) {
        alert("Segment name cannot be empty.");
        return;
    }
    const SEGMENTS_ENDPOINT = `${API_URL}/admin/segments`;

    if (mode === 'add') {
      try {
        const response = await axios.post(SEGMENTS_ENDPOINT, { name: data.name, description: data.description });
        setSegments([...segments, response.data.data]);
        closeModal();
      } catch (error) {
        console.error('Error adding segment:', error);
        alert('Failed to add segment.');
      }
    } 
    else if (mode === 'edit') {
        try {
            const response = await axios.put(`${SEGMENTS_ENDPOINT}/${data.id}`, { name: data.name, description: data.description });
            setSegments(segments.map(s => (s.id === response.data.data.id ? response.data.data : s)));
            closeModal();
        } catch(error) {
            console.error('Error updating segment:', error);
            alert('Failed to update segment.');
        }
    }
  };

  const handleDeleteSegment = async (segmentId) => {
    if (window.confirm('Are you sure you want to delete this segment? This action cannot be undone.')) {
        try {
            await axios.delete(`${API_URL}/admin/segments/${segmentId}`);
            setSegments(prevSegments => prevSegments.filter(s => s.id !== segmentId));
            setSegmentUserMap(prevMap => {
                const newMap = { ...prevMap };
                delete newMap[segmentId];
                return newMap;
            });
        } catch (error) {
            console.error('Error deleting segment:', error);
            alert('Failed to delete segment. Please try again.');
        }
    }
  };

  // --- STYLING ---
  const styles = {
    page: { minHeight: '100vh', background: '#0f0f0f', color: '#e0e0e0', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', fontFamily: 'sans-serif' },
    header: { color: '#0095ff', marginBottom: '2rem' },
    dashboardContainer: { display: 'flex', gap: '2rem', width: '100%', maxWidth: '1400px', alignItems: 'flex-start' },
    leftPanel: { flex: 1, background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
    rightPanel: { flex: 2, background: '#1a1a1a', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', maxHeight: '85vh', overflowY: 'auto' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #333', paddingBottom: '1rem', marginBottom: '1rem' },
    panelTitle: { color: '#0095ff', margin: 0 },
    userPool: { maxHeight: '70vh', overflowY: 'auto' },
    userPoolItem: { background: '#2c2c2c', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '0.5rem', cursor: 'grab', transition: 'background-color 0.2s' },
    segmentCard: { background: '#222', padding: '1.5rem', borderRadius: '6px', marginBottom: '1.5rem', border: '2px dashed transparent', transition: 'border-color 0.2s, background-color 0.2s' },
    segmentCardOver: { borderColor: '#0095ff', backgroundColor: '#282828' },
    segmentCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
    segmentInfo: { margin: 0, flexGrow: 1 },
    segmentDesc: { fontSize: '0.9rem', color: '#999', marginTop: '0.25rem' },
    segmentUserTable: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    segmentUserTableTh: { padding: '0.75rem 1rem', textAlign: 'left', color: '#aaa', borderBottom: '1px solid #444', fontSize: '0.8rem', textTransform: 'uppercase' },
    segmentUserTableTd: { padding: '1rem', borderBottom: '1px solid #333' },
    userRow: { cursor: 'grab', transition: 'background-color 0.2s' },
    statusIndicator: { height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '0.5rem' },
    actionButton: { background: 'none', border: '1px solid #555', color: '#e0e0e0', padding: '0.4em 0.8em', borderRadius: '4px', cursor: 'pointer', transition: 'background-color 0.2s' },
    addButton: { backgroundColor: '#28a745', border: 'none', color: 'white' },
    modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { background: '#2c2c2c', padding: '2rem', borderRadius: '8px', width: '90%', maxWidth: '500px' },
    formGroup: { marginBottom: '1rem' },
    label: { display: 'block', marginBottom: '0.5rem', color: '#aaa' },
    input: { width: '100%', padding: '0.75rem', boxSizing: 'border-box', background: '#1a1a1a', border: '1px solid #555', borderRadius: '5px', color: '#e0e0e0', fontSize: '1rem' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' },
  };
  const getStatusStyle = (status) => {
    switch (status) {
      case 'Connected': return { backgroundColor: '#28a745' };
      case 'Pending': return { backgroundColor: '#ffc107' };
      default: return { backgroundColor: '#dc3545' };
    }
  };


  // --- JSX RENDER ---
  return (
    <div style={styles.page}>
      <h1 style={styles.header}>User & Segment Management</h1>
      <div style={styles.dashboardContainer}>
        <div
          style={styles.leftPanel}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, 'unassigned')}
          onDragEnter={() => onDragEnterSegment('unassigned')}
          onDragLeave={onDragLeaveSegment}
        >
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Unassigned Users Pool</h2>
          </div>
          <div style={styles.userPool}>
            {loadingUsers && <p>Loading users...</p>}
            {errorUsers && <p style={{ color: 'red' }}>{errorUsers}</p>}
            {!loadingUsers && !errorUsers && unassignedUsers.map(user => (
              <div key={user.id} draggable onDragStart={(e) => onDragStartUser(e, user.id)} style={styles.userPoolItem}>
                {user.name} - ({user.rmsLimit})
              </div>
            ))}
            {!loadingUsers && !errorUsers && unassignedUsers.length === 0 && <p style={{ color: '#666', textAlign: 'center' }}>All users are assigned.</p>}
          </div>
        </div>

        <div
          ref={rightPanelRef}
          style={styles.rightPanel}
          onDragOver={handlePanelDragOver}
        >
          <div style={styles.panelHeader}>
            <h2 style={styles.panelTitle}>Segments</h2>
            <button style={{ ...styles.actionButton, ...styles.addButton }} onClick={() => openModal('add')}>+ New Segment</button>
          </div>
          {loadingSegments && <p>Loading segments...</p>}
          {errorSegments && <p style={{ color: 'red' }}>{errorSegments}</p>}
          <div>
            {segments.map(segment => (
              <div
                key={segment.id}
                style={{ ...styles.segmentCard, ...(dragOverSegmentId === segment.id ? styles.segmentCardOver : {}) }}
                onDrop={(e) => onDrop(e, segment.id)}
                onDragEnter={() => onDragEnterSegment(segment.id)}
                onDragLeave={onDragLeaveSegment}
              >
                <div style={styles.segmentCardHeader}>
                  <div style={styles.segmentInfo}>
                    <h3 style={{ margin: 0 }}>{segment.name}</h3>
                    <p style={styles.segmentDesc}>{segment.description}</p>
                  </div>
                  <div>
                    <button style={{ ...styles.actionButton, marginRight: '0.5rem' }} onClick={() => openModal('edit', segment)}>Edit</button>
                    <button style={{ ...styles.actionButton, color: '#ff4d4d' }} onClick={() => handleDeleteSegment(segment.id)}>Delete</button>
                  </div>
                </div>
                <table style={styles.segmentUserTable}>
                  <thead>
                    <tr>
                      <th style={styles.segmentUserTableTh}>Name</th>
                      <th style={styles.segmentUserTableTh}>Broker Status</th>
                      <th style={styles.segmentUserTableTh}>Active for Trading</th>
                      <th style={styles.segmentUserTableTh}>RMS Limit</th>
                      <th style={styles.segmentUserTableTh}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(segmentUserMap[segment.id] || []).map(userId => {
                      const user = getUserById(userId);
                      return user ? (
                        <tr
                          key={user.id}
                          draggable
                          onDragStart={(e) => onDragStartUser(e, user.id)}
                          style={styles.userRow}
                        >
                          <td style={styles.segmentUserTableTd}>{user.name}</td>
                          <td style={styles.segmentUserTableTd}><span style={{ ...styles.statusIndicator, ...getStatusStyle(user.brokerStatus) }}></span>{user.brokerStatus}</td>
                          <td style={styles.segmentUserTableTd}><span style={{ ...styles.statusIndicator, backgroundColor: user.isActive ? '#28a745' : '#dc3545' }}></span>{user.isActive ? 'Active' : 'Inactive'}</td>
                          <td style={styles.segmentUserTableTd}>{user.rmsLimit}</td>
                          <td style={styles.segmentUserTableTd}><button style={{ ...styles.actionButton, color: '#ffc107' }} onClick={() => removeUserFromSegment(user.id)}>Remove</button></td>
                        </tr>
                      ) : null;
                    })}
                  </tbody>
                </table>
                {(segmentUserMap[segment.id] || []).length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '1rem 0' }}>Drop users here</p>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <div style={styles.modalBackdrop} onClick={closeModal}>
          <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#0095ff', marginTop: 0 }}>{modal.mode === 'add' ? 'Add New Segment' : 'Edit Segment'}</h3>
            <div style={styles.formGroup}>
              <label htmlFor="name" style={styles.label}>Segment Name</label>
              <input type="text" id="name" name="name" value={modal.data.name} onChange={handleModalChange} style={styles.input} />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="description" style={styles.label}>Description</label>
              <input type="text" id="description" name="description" value={modal.data.description} onChange={handleModalChange} style={styles.input} />
            </div>
            <div style={styles.modalActions}>
              <button style={styles.actionButton} onClick={closeModal}>Cancel</button>
              <button style={{ ...styles.actionButton, ...styles.addButton }} onClick={handleModalSave}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;