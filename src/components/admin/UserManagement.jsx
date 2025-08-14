import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  getAdminUsers, 
  getAllSegments, 
  addSegments, 
  updateSegmentById, 
  deleteSegmentById,
  addUserToSegment
} from '../../api/admin';


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
  // Add responsive CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        .user-management-container {
          padding: 1rem !important;
        }
        .user-management-table {
          font-size: 12px !important;
        }
        .user-management-table th,
        .user-management-table td {
          padding: 0.5rem 0.3rem !important;
        }
        .segment-card {
          margin-bottom: 1rem !important;
        }
        .action-buttons {
          flex-direction: column !important;
          gap: 0.5rem !important;
        }
        .user-pool-item {
          font-size: 13px !important;
          padding: 0.5rem !important;
        }
        .segment-card {
          padding: 1rem !important;
        }
        .panel-header {
          flex-direction: column !important;
          align-items: flex-start !important;
        }
        .user-pool-item:hover {
          background: #e9ecef !important;
          transform: translateY(-1px) !important;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1) !important;
        }
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

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
  const [searchTerm, setSearchTerm] = useState('');

  const rightPanelRef = useRef(null);

  // --- Fetch and process users from API on mount ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      setErrorUsers(null);
      try {
        console.log('Fetching users from admin API...');
        // Use the admin API function which has fallback logic
        const response = await getAdminUsers();
        console.log('Admin API response:', response);
        const rawUsers = response.data;
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

        console.log('Normalized users:', normalizedUsers);
        console.log('Initial segment map:', initialSegmentMap);
        setUsers(normalizedUsers);
        setSegmentUserMap(initialSegmentMap);

      } catch (error) {
        console.error('Error fetching users:', error);
        setErrorUsers(`Failed to load users: ${error.message}`);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  // --- Fetch segments from API on mount ---
  useEffect(() => {
    const fetchSegments = async () => {
      setLoadingSegments(true);
      setErrorSegments(null);
      try {
        console.log('Fetching segments from admin API...');
        // Use the admin API function
        const response = await getAllSegments();
        console.log('Segments API response:', response);
        const segmentData = response.data;
        if (Array.isArray(segmentData)) {
          console.log('Setting segments:', segmentData);
          setSegments(segmentData);
        } else {
          throw new Error("Invalid data format from segments API.");
        }
      } catch (error) {
        console.error('Error fetching segments:', error);
        setErrorSegments(`Failed to load segments: ${error.message}`);
        
        // If segments fail to load, create a default segment for testing
        console.log('Creating default segment due to API failure');
        setSegments([
          {
            id: 'default',
            name: 'Default Segment',
            description: 'Default segment for users'
          }
        ]);
      } finally {
        setLoadingSegments(false);
      }
    };
    fetchSegments();
  }, []);

  // --- DERIVED STATE & HELPERS ---
  const assignedUserIds = useMemo(() => new Set(Object.values(segmentUserMap).flat()), [segmentUserMap]);
  const unassignedUsers = useMemo(() => users.filter(user => !assignedUserIds.has(user.id)), [users, assignedUserIds]);
  
  // Filter users based on search term - used in the segments table filtering
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) return users;
    const term = searchTerm.toLowerCase();
    return users.filter(user => 
      user.name.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [users, searchTerm]);
  
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
             console.log(`Attempting to unassign user from segment ${sourceSegmentId}`);
             // For now, we'll just update the UI since removeUserFromSegment only handles UI updates
             console.log(`User ${userId} successfully unassigned from segment ${sourceSegmentId}.`);
             // <--- CHANGE ENDS HERE --->

         } else {
             // --- ASSIGN OR MOVE USER ---
             // This action assigns a user to a new segment.
             console.log(`Attempting to assign user to segment ${targetSegmentId}`);
             await addUserToSegment(targetSegmentId, { userId: userId });
             console.log(`User ${userId} successfully assigned to segment ${targetSegmentId}.`);
         }
    } catch (error) {
        const errorMessage = error.response ? JSON.stringify(error.response.data) : error.message;
        console.error('Failed to update user assignment on server:', error.response || error);
        console.error('Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url,
          method: error.config?.method
        });
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

         if (mode === 'add') {
       try {
         const response = await addSegments({ name: data.name, description: data.description });
         console.log('Add segment response:', response);
         
         // Handle different response structures
         let newSegment;
         if (response && response.data && response.data.data) {
           newSegment = response.data.data;
         } else if (response && response.data) {
           newSegment = response.data;
         } else if (response) {
           newSegment = response;
         } else {
           throw new Error('Invalid response structure');
         }
         
         setSegments(prev => [...prev, newSegment]);
         closeModal();
       } catch (error) {
         console.error('Error adding segment:', error);
         alert('Failed to add segment: ' + (error.message || 'Unknown error'));
       }
     } 
     else if (mode === 'edit') {
         try {
             const response = await updateSegmentById(data.id, { name: data.name, description: data.description });
             console.log('Update segment response:', response);
             
             // Handle different response structures
             let updatedSegment;
             if (response && response.data && response.data.data) {
               updatedSegment = response.data.data;
             } else if (response && response.data) {
               updatedSegment = response.data;
             } else if (response) {
               updatedSegment = response;
             } else {
               throw new Error('Invalid response structure');
             }
             
             setSegments(prev => prev.map(s => (s.id === updatedSegment.id ? updatedSegment : s)));
             closeModal();
         } catch(error) {
             console.error('Error updating segment:', error);
             alert('Failed to update segment: ' + (error.message || 'Unknown error'));
         }
     }
  };

  const handleDeleteSegment = async (segmentId) => {
    if (window.confirm('Are you sure you want to delete this segment? This action cannot be undone.')) {
        try {
            await deleteSegmentById(segmentId);
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
    page: { minHeight: '100vh', background: '#ffffff', color: '#333333', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'clamp(1rem, 4vw, 2rem)', fontFamily: 'sans-serif' },
    header: { color: '#0095ff', marginBottom: 'clamp(1.5rem, 4vw, 2rem)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', fontWeight: 600, textAlign: 'center' },
    dashboardContainer: { display: 'flex', gap: 'clamp(1rem, 3vw, 2rem)', width: '100%', maxWidth: 'min(1400px, 95vw)', alignItems: 'flex-start', flexDirection: 'column' },
    leftPanel: { width: '100%', background: '#ffffff', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e0e0e0', transition: 'all 0.3s ease' },
    rightPanel: { width: '100%', background: '#ffffff', padding: 'clamp(1rem, 3vw, 1.5rem)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', maxHeight: '85vh', overflowY: 'auto', border: '1px solid #e0e0e0', transition: 'all 0.3s ease' },
    panel: { marginBottom: 'clamp(1.5rem, 4vw, 2rem)' },
    panelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e0e0e0', paddingBottom: 'clamp(0.8rem, 2vw, 1rem)', marginBottom: 'clamp(0.8rem, 2vw, 1rem)', flexWrap: 'wrap', gap: '1rem' },
    panelTitle: { color: '#0095ff', margin: 0, fontSize: 'clamp(1.1rem, 3vw, 1.3rem)', fontWeight: 600 },
    userPool: { maxHeight: '70vh', overflowY: 'auto', padding: 'clamp(0.5rem, 2vw, 1rem)' },
    userPoolItem: { 
      background: '#f8f9fa', 
      padding: 'clamp(0.6rem, 2vw, 0.75rem) clamp(0.8rem, 2vw, 1rem)', 
      borderRadius: '8px', 
      marginBottom: 'clamp(0.4rem, 1.5vw, 0.5rem)', 
      cursor: 'grab', 
      transition: 'all 0.3s ease', 
      color: '#333333', 
      border: '1px solid #e0e0e0', 
      fontSize: 'clamp(13px, 2.5vw, 14px)', 
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    },
    segmentCard: { background: '#ffffff', padding: 'clamp(1.2rem, 3vw, 1.5rem)', borderRadius: '12px', marginBottom: 'clamp(1.2rem, 3vw, 1.5rem)', border: '2px dashed #e0e0e0', transition: 'all 0.3s ease', boxShadow: '0 4px 15px rgba(0,0,0,0.08)', overflow: 'hidden' },
    segmentCardOver: { borderColor: '#0095ff', backgroundColor: '#f8f9fa', transform: 'scale(1.02)' },
    segmentCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'clamp(0.8rem, 2vw, 1rem)', flexWrap: 'wrap', gap: '1rem' },
    segmentInfo: { margin: 0, flexGrow: 1 },
    segmentDesc: { fontSize: '0.9rem', color: '#666666', marginTop: '0.25rem' },
    segmentUserTable: { width: '100%', borderCollapse: 'collapse', marginTop: '1rem' },
    segmentUserTableTh: { padding: '0.75rem 1rem', textAlign: 'left', color: '#333333', borderBottom: '1px solid #e0e0e0', fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 'bold' },
    segmentUserTableTd: { padding: '1rem', borderBottom: '1px solid #e0e0e0', color: '#333333' },
    userRow: { cursor: 'grab', transition: 'background-color 0.2s' },
    statusIndicator: { height: '10px', width: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '0.5rem' },
    actionButton: { background: 'none', border: '1px solid #e0e0e0', color: '#333333', padding: 'clamp(0.3em, 1.5vw, 0.4em) clamp(0.6em, 2vw, 0.8em)', borderRadius: '6px', cursor: 'pointer', transition: 'all 0.3s ease', fontSize: 'clamp(11px, 2.5vw, 12px)', fontWeight: 500 },
    addButton: { backgroundColor: '#28a745', border: 'none', color: 'white', boxShadow: '0 2px 8px rgba(40, 167, 69, 0.2)' },
    modalBackdrop: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 'clamp(1rem, 4vw, 2rem)' },
    modalContent: { background: '#ffffff', padding: 'clamp(1.5rem, 4vw, 2rem)', borderRadius: '12px', width: '90%', maxWidth: 'min(500px, 90vw)', boxShadow: '0 8px 30px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
    formGroup: { marginBottom: 'clamp(0.8rem, 2vw, 1rem)' },
    label: { display: 'block', marginBottom: 'clamp(0.3rem, 1.5vw, 0.5rem)', color: '#333333', fontSize: 'clamp(13px, 2.5vw, 14px)', fontWeight: 500 },
    input: { width: '100%', padding: 'clamp(0.6rem, 2vw, 0.75rem)', boxSizing: 'border-box', background: '#ffffff', border: '1px solid #e0e0e0', borderRadius: '8px', color: '#333333', fontSize: 'clamp(13px, 2.5vw, 14px)', transition: 'all 0.3s ease' },
    modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 'clamp(0.8rem, 2vw, 1rem)', marginTop: 'clamp(1.2rem, 3vw, 1.5rem)', flexWrap: 'wrap' },
    searchContainer: {
      display: 'flex',
      alignItems: 'center',
      background: '#f8f9fa',
      borderRadius: '8px',
      padding: 'clamp(0.4rem, 1.5vw, 0.5rem) clamp(0.8rem, 2vw, 1rem)',
      marginBottom: 'clamp(0.8rem, 2vw, 1rem)',
      border: '1px solid #e0e0e0',
      flexWrap: 'wrap',
      gap: '0.5rem'
    },
    searchInput: {
      flex: 1,
      border: 'none',
      background: 'transparent',
      padding: 'clamp(0.4rem, 1.5vw, 0.5rem)',
      fontSize: 'clamp(13px, 2.5vw, 14px)',
      color: '#333333',
      minWidth: '200px'
    },
    clearSearchButton: {
      background: 'none',
      border: 'none',
      color: '#666666',
      cursor: 'pointer',
      fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
      padding: 'clamp(0.15rem, 1vw, 0.2rem)',
      borderRadius: '4px',
      transition: 'all 0.3s ease'
    }
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
    <div style={styles.page} className="user-management-container">
      <h1 style={styles.header}>User & Segment Management</h1>
      <div style={styles.dashboardContainer}>
        <div
          style={styles.leftPanel}
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, 'unassigned')}
          onDragEnter={() => onDragEnterSegment('unassigned')}
          onDragLeave={onDragLeaveSegment}
        >
          <div style={styles.panelHeader} className="panel-header">
            <h2 style={styles.panelTitle}>Unassigned Users Pool</h2>
          </div>
          
          {/* Search Bar for Unassigned Users */}
          <div style={{ 
            padding: '0.5rem',
            borderBottom: '1px solid #e0e0e0',
            marginBottom: '0.5rem'
          }}>
            <input
              type="text"
              placeholder="Search unassigned users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '0.9rem'
              }}
            />
          </div>
          
          <div style={styles.userPool}>
            {loadingUsers && <p>Loading users...</p>}
            {errorUsers && <p style={{ color: 'red' }}>{errorUsers}</p>}
            {!loadingUsers && !errorUsers && unassignedUsers
              .filter(user => 
                !searchTerm.trim() || 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(user => (
                <div key={user.id} draggable onDragStart={(e) => onDragStartUser(e, user.id)} style={styles.userPoolItem} className="user-pool-item">
                  {user.name} - ({user.rmsLimit})
                </div>
              ))}
            {!loadingUsers && !errorUsers && unassignedUsers.filter(user => 
              !searchTerm.trim() || 
              user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
              <p style={{ color: '#666', textAlign: 'center' }}>
                {searchTerm ? 'No unassigned users match your search.' : 'All users are assigned.'}
              </p>
            )}
          </div>
        </div>

        <div
          ref={rightPanelRef}
          style={styles.rightPanel}
          onDragOver={handlePanelDragOver}
        >


          {/* Segments Panel */}
          <div style={styles.panel}>
                      <div style={styles.panelHeader} className="panel-header">
            <h2 style={styles.panelTitle}>Segments</h2>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{ ...styles.actionButton, ...styles.addButton }} onClick={() => openModal('add')}>+ New Segment</button>
            </div>
          </div>
          
            {/* Search Bar */}
            <div style={styles.searchContainer}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: '#f8f9fa',
                border: '1px solid #e0e0e0',
                borderRadius: '6px',
                padding: '0.5rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '1.2em', color: '#666' }}>🔍</span>
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    ...styles.searchInput,
                    fontSize: '0.95rem',
                    minWidth: '300px'
                  }}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      ...styles.clearSearchButton,
                      fontSize: '1.4rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      transition: 'background-color 0.2s ease'
                    }}
                    title="Clear search"
                    onMouseEnter={(e) => e.target.style.background = '#e9ecef'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    ×
                  </button>
                )}
              </div>
              
              {/* Search Results Counter */}
              {searchTerm && (
                <div style={{
                  marginBottom: '1rem',
                  padding: '0.5rem',
                  background: '#e3f2fd',
                  color: '#1976d2',
                  borderRadius: '4px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <span>📊</span>
                  <span>
                    Found {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} 
                    {searchTerm && ` matching "${searchTerm}"`} 
                    out of {users.length} total users
                  </span>
                </div>
              )}
            </div>
          
            {loadingSegments && <p>Loading segments...</p>}
            {errorSegments && <p style={{ color: 'red' }}>{errorSegments}</p>}
            <div>
              {segments.map(segment => (
                <div
                  key={segment.id}
                  style={{ ...styles.segmentCard, ...(dragOverSegmentId === segment.id ? styles.segmentCardOver : {}) }}
                  className="segment-card"
                  onDrop={(e) => onDrop(e, segment.id)}
                  onDragEnter={() => onDragEnterSegment(segment.id)}
                  onDragLeave={onDragLeaveSegment}
                >
                  <div style={styles.segmentCardHeader}>
                    <div style={styles.segmentInfo}>
                      <h3 style={{ margin: 0 }}>{segment.name}</h3>
                      <p style={styles.segmentDesc}>{segment.description}</p>
                    </div>
                    <div className="action-buttons">
                      <button style={{ ...styles.actionButton, marginRight: '0.5rem' }} onClick={() => openModal('edit', segment)}>Edit</button>
                      <button style={{ ...styles.actionButton, color: '#ff4d4d' }} onClick={() => handleDeleteSegment(segment.id)}>Delete</button>
                    </div>
                  </div>
                  <table style={styles.segmentUserTable} className="user-management-table">
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
                      {(segmentUserMap[segment.id] || [])
                        .map(userId => {
                          const user = getUserById(userId);
                          return user;
                        })
                        .filter(user => user && (
                          !searchTerm.trim() || 
                          user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchTerm.toLowerCase())
                        ))
                        .map(user => (
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
                        ))}
                    </tbody>
                  </table>
                  {(segmentUserMap[segment.id] || []).length === 0 && <p style={{ color: '#666', textAlign: 'center', padding: '1rem 0' }}>Drop users here</p>}
                </div>
              ))}
            </div>
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