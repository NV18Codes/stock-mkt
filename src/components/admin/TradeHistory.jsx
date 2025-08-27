import React, { useState, useEffect } from 'react';
import { adminTradeHistory, singleTradeDetail } from '../../api/admin';

const TradeHistory = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [tradesPerPage] = useState(10);
  
  // Individual trade details state
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [tradeDetails, setTradeDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Filter trades based on search term
  const filteredTrades = trades.filter(trade => 
    trade.trading_symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.underlying_symbol?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.remarks?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchTrades();
  }, []);

  // Monitor tradeDetails changes for debugging
  useEffect(() => {
    if (tradeDetails) {
      console.log('=== TRADE DETAILS STATE CHANGED ===');
      console.log('New tradeDetails state:', tradeDetails);
      console.log('Status in state:', tradeDetails.status);
      console.log('Trading symbol in state:', tradeDetails.trading_symbol);
      console.log('Underlying symbol in state:', tradeDetails.underlying_symbol);
      console.log('Strike price in state:', tradeDetails.strike_price);
      console.log('Option type in state:', tradeDetails.option_type);
      console.log('Transaction type in state:', tradeDetails.transaction_type);
      console.log('Quantity in state:', tradeDetails.quantity);
      console.log('Lot size in state:', tradeDetails.lot_size);
      console.log('Total quantity in state:', tradeDetails.total_quantity);
      console.log('Target all active users in state:', tradeDetails.target_all_active_users);
      console.log('User trades count in state:', tradeDetails.user_trades_count);
      console.log('Remarks in state:', tradeDetails.remarks);
      console.log('Initiated at in state:', tradeDetails.initiated_at);
      console.log('Last processed at in state:', tradeDetails.last_processed_at);
      console.log('=== END STATE MONITORING ===');
    }
  }, [tradeDetails]);

  const fetchTrades = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminTradeHistory();
      console.log('Trade history response:', response);
      
      // Handle the specific response structure from the backend
      let tradesData = [];
      if (response && response.success && response.data && Array.isArray(response.data)) {
        tradesData = response.data;
      } else if (response && response.data && Array.isArray(response.data)) {
        tradesData = response.data;
      } else if (Array.isArray(response)) {
        tradesData = response;
      }
      
      setTrades(tradesData);
    } catch (err) {
      console.error('Error fetching trades:', err);
      setError('Failed to fetch trade history');
      // Set fallback data for demo
      setTrades([
        {
          id: '5055badf-53be-45b7-a662-d65b26a8173a',
          trading_symbol: 'NIFTY07AUG2522950CE',
          underlying_symbol: 'NIFTY',
          strike_price: 22950,
          option_type: 'CE',
          expiry_date: '2025-08-07',
          transaction_type: 'BUY',
          order_type: 'MARKET',
          quantity: 4,
          lot_size: 75,
          total_quantity: 300,
          limit_price: null,
          target_segment_ids: ['8c01b6a0-a500-444d-a5bc-9deed5a77a50'],
          target_all_active_users: false,
          status: 'FAILED_ALL_USERS',
          initiated_at: '2025-07-31T16:11:19.743+00:00',
          last_processed_at: '2025-07-31T16:11:21.217+00:00',
          remarks: 'Nifty looking bullish, entering market order.',
          user_trades_count: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTradeDetails = async (tradeId) => {
    setLoadingDetails(true);
    setError('');
    try {
      console.log('Fetching details for trade ID:', tradeId);
      console.log('Trade ID type:', typeof tradeId);
      console.log('Trade ID length:', tradeId ? tradeId.length : 'undefined');
      
      if (!tradeId) {
        throw new Error('Trade ID is required but was not provided');
      }
      
      const response = await singleTradeDetail(tradeId);
      console.log('Trade details response:', response);
      console.log('Response type:', typeof response);
      console.log('Response keys:', response ? Object.keys(response) : 'No response');
      
      // Add detailed response analysis
      if (response) {
        console.log('=== DETAILED RESPONSE ANALYSIS ===');
        console.log('Response structure:', JSON.stringify(response, null, 2));
        console.log('Response has success property:', 'success' in response);
        console.log('Response has data property:', 'data' in response);
        console.log('Response has trade property:', 'trade' in response);
        console.log('Response is array:', Array.isArray(response));
        console.log('Response is object:', typeof response === 'object');
        console.log('Response is string:', typeof response === 'string');
        console.log('=== END ANALYSIS ===');
      }
      
      // Handle different response structures and improve data processing
      let tradeData = null;
      
      // Based on the console output, the API seems to return the trade data directly
      if (response && typeof response === 'object' && response.id) {
        // If response has an id, it's likely the trade data itself
        tradeData = response;
        console.log('Using response directly as trade data (has ID):', tradeData);
      } else if (response && response.success && response.data) {
        tradeData = response.data;
        console.log('Using response.data:', tradeData);
      } else if (response && response.data) {
        tradeData = response.data;
        console.log('Using response.data (no success):', tradeData);
      } else if (response && response.success && response.trade) {
        tradeData = response.trade;
        console.log('Using response.trade:', tradeData);
      } else if (response && response.trade) {
        tradeData = response.trade;
        console.log('Using response.trade (no success):', tradeData);
      } else if (response && typeof response === 'object') {
        // If response is directly the trade data
        tradeData = response;
        console.log('Using response directly:', tradeData);
      }
      
      if (tradeData) {
        // Clean and process the trade data to ensure all fields are properly formatted
        const processedTradeData = {
          ...tradeData,
          // Ensure all required fields have proper values - use actual data first, then fallbacks
          id: tradeData.id || tradeId,
          trading_symbol: tradeData.trading_symbol || tradeData.symbol || 'Trading Symbol Not Available',
          underlying_symbol: tradeData.underlying_symbol || tradeData.underlying || 'Symbol Not Available',
          strike_price: tradeData.strike_price || tradeData.strike || null,
          option_type: tradeData.option_type || tradeData.type || 'Not Applicable',
          expiry_date: tradeData.expiry_date || tradeData.expiry || null,
          transaction_type: tradeData.transaction_type || tradeData.transaction || 'Type Not Specified',
          order_type: tradeData.order_type || tradeData.order || 'MARKET',
          quantity: tradeData.quantity || tradeData.lots || 0,
          lot_size: tradeData.lot_size || tradeData.lotSize || 0,
          total_quantity: tradeData.total_quantity || tradeData.totalQuantity || 0,
          limit_price: tradeData.limit_price || tradeData.limitPrice || null,
          status: tradeData.status || 'PENDING',
          initiated_at: tradeData.initiated_at || tradeData.initiatedAt || tradeData.created_at || null,
          last_processed_at: tradeData.last_processed_at || tradeData.lastProcessedAt || tradeData.updated_at || null,
          remarks: tradeData.remarks || tradeData.comment || tradeData.note || 'No specific remarks for this trade',
          target_all_active_users: tradeData.target_all_active_users || tradeData.targetAllActiveUsers || false,
          target_segment_ids: tradeData.target_segment_ids || tradeData.targetSegmentIds || [],
          user_trades_count: tradeData.user_trades_count || tradeData.userTradesCount || 0,
          user_trades: tradeData.user_trades || tradeData.userTrades || []
        };
        
        console.log('Processed trade data:', processedTradeData);
        console.log('Final trade data to display:', {
          id: processedTradeData.id,
          status: processedTradeData.status,
          trading_symbol: processedTradeData.trading_symbol,
          underlying_symbol: processedTradeData.underlying_symbol,
          strike_price: processedTradeData.strike_price,
          option_type: processedTradeData.option_type,
          expiry_date: processedTradeData.expiry_date,
          transaction_type: processedTradeData.transaction_type,
          quantity: processedTradeData.quantity,
          lot_size: processedTradeData.lot_size,
          total_quantity: processedTradeData.total_quantity,
          target_all_active_users: processedTradeData.target_all_active_users,
          user_trades_count: processedTradeData.user_trades_count,
          remarks: processedTradeData.remarks,
          initiated_at: processedTradeData.initiated_at,
          last_processed_at: processedTradeData.last_processed_at
        });
        
        // Verify the data is being set correctly
        console.log('=== VERIFICATION ===');
        console.log('Setting tradeDetails with:', processedTradeData);
        console.log('Status value:', processedTradeData.status);
        console.log('Trading symbol value:', processedTradeData.trading_symbol);
        console.log('Underlying symbol value:', processedTradeData.underlying_symbol);
        console.log('Strike price value:', processedTradeData.strike_price);
        console.log('Option type value:', processedTradeData.option_type);
        console.log('Transaction type value:', processedTradeData.transaction_type);
        console.log('Quantity value:', processedTradeData.quantity);
        console.log('Lot size value:', processedTradeData.lot_size);
        console.log('Total quantity value:', processedTradeData.total_quantity);
        console.log('Target all active users value:', processedTradeData.target_all_active_users);
        console.log('User trades count value:', processedTradeData.user_trades_count);
        console.log('Remarks value:', processedTradeData.remarks);
        console.log('Initiated at value:', processedTradeData.initiated_at);
        console.log('Last processed at value:', processedTradeData.last_processed_at);
        console.log('=== END VERIFICATION ===');
        
        setTradeDetails(processedTradeData);
        setShowDetailsModal(true);
      } else {
        console.error('No trade data found in response:', response);
        
        // Use the selected trade data as fallback with enhanced processing
        if (selectedTrade) {
          console.log('Using selected trade as fallback:', selectedTrade);
          const fallbackTradeData = {
            ...selectedTrade,
            // Ensure all fields have proper values
            id: selectedTrade.id || tradeId,
            trading_symbol: selectedTrade.trading_symbol || selectedTrade.symbol || 'Trading Symbol Not Available',
            underlying_symbol: selectedTrade.underlying_symbol || selectedTrade.underlying || 'Symbol Not Available',
            strike_price: selectedTrade.strike_price || selectedTrade.strike || null,
            option_type: selectedTrade.option_type || selectedTrade.type || 'Not Applicable',
            expiry_date: selectedTrade.expiry_date || selectedTrade.expiry || null,
            transaction_type: selectedTrade.transaction_type || selectedTrade.transaction || 'Type Not Specified',
            order_type: selectedTrade.order_type || selectedTrade.order || 'MARKET',
            quantity: selectedTrade.quantity || selectedTrade.lots || 0,
            lot_size: selectedTrade.lot_size || selectedTrade.lotSize || 0,
            total_quantity: selectedTrade.total_quantity || selectedTrade.totalQuantity || 0,
            limit_price: selectedTrade.limit_price || selectedTrade.limitPrice || null,
            status: selectedTrade.status || 'PENDING',
            initiated_at: selectedTrade.initiated_at || selectedTrade.initiatedAt || selectedTrade.created_at || null,
            last_processed_at: selectedTrade.last_processed_at || selectedTrade.lastProcessedAt || selectedTrade.updated_at || null,
            remarks: selectedTrade.remarks || selectedTrade.comment || selectedTrade.note || 'No specific remarks for this trade',
            target_all_active_users: selectedTrade.target_all_active_users || selectedTrade.targetAllActiveUsers || false,
            target_segment_ids: selectedTrade.target_segment_ids || selectedTrade.targetSegmentIds || [],
            user_trades_count: selectedTrade.user_trades_count || selectedTrade.userTradesCount || 0,
            user_trades: selectedTrade.user_trades || selectedTrade.userTrades || []
          };
          
          console.log('Using enhanced fallback trade data:', fallbackTradeData);
          setTradeDetails(fallbackTradeData);
          setShowDetailsModal(true);
        } else {
          setError('No trade details found in the response');
        }
      }
    } catch (err) {
      console.error('Error fetching trade details:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        url: err.config?.url
      });
      
      // Enhanced error handling with fallback
      if (selectedTrade) {
        console.log('API failed, using selected trade as fallback:', selectedTrade);
        const errorFallbackData = {
          ...selectedTrade,
          // Ensure all fields have proper values
          id: selectedTrade.id || tradeId,
          trading_symbol: selectedTrade.trading_symbol || selectedTrade.symbol || 'Trading Symbol Not Available',
          underlying_symbol: selectedTrade.underlying_symbol || selectedTrade.underlying || 'Symbol Not Available',
          strike_price: selectedTrade.strike_price || selectedTrade.strike || null,
          option_type: selectedTrade.option_type || selectedTrade.type || 'Not Applicable',
          expiry_date: selectedTrade.expiry_date || selectedTrade.expiry || null,
          transaction_type: selectedTrade.transaction_type || selectedTrade.transaction || 'Type Not Specified',
          order_type: selectedTrade.order_type || selectedTrade.order || 'MARKET',
          quantity: selectedTrade.quantity || selectedTrade.lots || 0,
          lot_size: selectedTrade.lot_size || selectedTrade.lotSize || 0,
          total_quantity: selectedTrade.total_quantity || selectedTrade.totalQuantity || 0,
          limit_price: selectedTrade.limit_price || selectedTrade.limitPrice || null,
          status: selectedTrade.status || 'PENDING',
          initiated_at: selectedTrade.initiated_at || selectedTrade.initiatedAt || selectedTrade.created_at || null,
          last_processed_at: selectedTrade.last_processed_at || selectedTrade.lastProcessedAt || selectedTrade.updated_at || null,
          remarks: selectedTrade.remarks || selectedTrade.comment || selectedTrade.note || 'No specific remarks for this trade',
          target_all_active_users: selectedTrade.target_all_active_users || selectedTrade.targetAllActiveUsers || false,
          target_segment_ids: selectedTrade.target_segment_ids || selectedTrade.targetSegmentIds || [],
          user_trades_count: selectedTrade.user_trades_count || selectedTrade.userTradesCount || 0,
          user_trades: selectedTrade.user_trades || selectedTrade.userTrades || []
        };
        
        console.log('Using error fallback trade data:', errorFallbackData);
        setTradeDetails(errorFallbackData);
        setShowDetailsModal(true);
        setError(`API Error: ${err.message}. Showing available trade data.`);
      } else {
        setError(`Failed to fetch trade details: ${err.message}`);
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleViewDetails = (trade) => {
    console.log('handleViewDetails called with trade:', trade);
    console.log('Trade ID:', trade.id);
    console.log('Trade object keys:', Object.keys(trade));
    console.log('Full trade object:', JSON.stringify(trade, null, 2));
    console.log('Will call API URL: https://y9tyscpumt.us-east-1.awsapprunner.com/api/admin/trades/' + trade.id);
    
    if (!trade.id) {
      console.error('Trade ID is missing! Trade object:', trade);
      alert('Error: Trade ID is missing. Please try again.');
      return;
    }
    
    setSelectedTrade(trade);
    fetchTradeDetails(trade.id);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTrade(null);
    setTradeDetails(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date Not Available';
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    if (!amount) return 'Amount Not Available';
    return `₹${parseFloat(amount).toLocaleString()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'COMPLETED_NO_USERS':
        return { bg: '#d4edda', color: '#155724', border: '#c3e6cb' };
      case 'QUEUED':
      case 'PENDING':
        return { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' };
      case 'FAILED_ALL_USERS':
      case 'FAILED':
        return { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' };
      case 'PROCESSING':
        return { bg: '#cce5ff', color: '#004085', border: '#b8daff' };
      default:
        return { bg: '#e2e3e5', color: '#383d41', border: '#d6d8db' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'COMPLETED_NO_USERS':
        return '✅';
      case 'QUEUED':
      case 'PENDING':
        return '⏳';
      case 'FAILED_ALL_USERS':
      case 'FAILED':
        return '❌';
      case 'PROCESSING':
        return '🔄';
      default:
        return '❓';
    }
  };

  // Get current trades for pagination
  const indexOfLastTrade = currentPage * tradesPerPage;
  const indexOfFirstTrade = indexOfLastTrade - tradesPerPage;
  const currentTrades = filteredTrades.slice(indexOfFirstTrade, indexOfLastTrade);

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Calculate total pages
  const totalPages = Math.ceil(filteredTrades.length / tradesPerPage);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2em' }}>
        <div className="loading-spinner" />
        <p style={{ color: '#333', marginTop: '1em' }}>Loading trade history...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '2em', background: '#ffffff', minHeight: '100vh' }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <h1 style={{ color: '#333', marginBottom: '1.5em', textAlign: 'center', fontWeight: '600' }}>
        Trade History
      </h1>

      {error && (
        <div style={{ 
          background: '#f8d7da', 
          color: '#721c24', 
          padding: '1em', 
          borderRadius: '8px', 
          marginBottom: '1em' 
        }}>
          {error}
        </div>
      )}



      {/* Search Bar */}
      <div style={{ 
        background: '#fff', 
        padding: '1.5em', 
        borderRadius: '12px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
        marginBottom: '1.5em',
        border: '1px solid #e9ecef'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1em',
          maxWidth: '500px'
        }}>
          <span style={{ fontSize: '1.2em' }}>🔍</span>
          <input 
            type="text" 
            placeholder="Search trades by symbol, status, or remarks..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              flex: 1, 
              padding: '0.8em', 
              border: '1px solid #e9ecef', 
              borderRadius: '6px', 
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      <div style={{ 
        background: '#fff', 
        borderRadius: '12px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
        overflow: 'hidden' 
      }}>
        <div style={{ 
          background: '#f8f9fa', 
          padding: '1.5em', 
          borderBottom: '1px solid #e9ecef' 
        }}>
          <h2 style={{ color: '#333', margin: 0, fontWeight: '600' }}>All Trades ({filteredTrades.length})</h2>
          <p style={{ color: '#6c757d', margin: '0.5em 0 0 0', fontSize: '0.9em' }}>
            💡 Click on any trade row to view detailed information
          </p>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Trade ID</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Symbol</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Strike/Type</th>
                <th style={{ padding: '1em', textAlign: 'left', color: '#495057', fontWeight: '600' }}>Transaction</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Quantity</th>
                <th style={{ padding: '1em', textAlign: 'right', color: '#495057', fontWeight: '600' }}>Total Qty</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Target</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Status</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>User Trades</th>
                <th style={{ padding: '1em', textAlign: 'center', color: '#495057', fontWeight: '600' }}>Initiated</th>
              </tr>
            </thead>
            <tbody>
              {currentTrades.map((trade, index) => {
                const statusStyle = getStatusColor(trade.status);
                return (
                  <tr 
                    key={trade.id || index} 
                    style={{ 
                      borderBottom: '1px solid #e9ecef',
                      transition: 'background-color 0.2s',
                      cursor: loadingDetails && selectedTrade?.id === trade.id ? 'wait' : 'pointer',
                      opacity: loadingDetails && selectedTrade?.id === trade.id ? 0.7 : 1
                    }}
                    onClick={() => !loadingDetails && handleViewDetails(trade)}
                    onMouseEnter={(e) => {
                      if (!loadingDetails || selectedTrade?.id !== trade.id) {
                        e.target.parentElement.style.backgroundColor = '#f8f9fa';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.target.parentElement.style.backgroundColor = 'transparent';
                    }}
                  >
                    <td style={{ padding: '1em', color: '#333', fontFamily: 'monospace', fontSize: '0.85em' }}>
                      {loadingDetails && selectedTrade?.id === trade.id ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5em' }}>
                          <div style={{ 
                            width: '12px', 
                            height: '12px', 
                            border: '2px solid #007bff', 
                            borderTop: '2px solid transparent', 
                            borderRadius: '50%', 
                            animation: 'spin 1s linear infinite' 
                          }} />
                          <span>Loading...</span>
                        </div>
                      ) : (
                        trade.id ? trade.id.substring(0, 8) + '...' : 'ID Not Available'
                      )}
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.underlying_symbol || 'Symbol'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>{trade.trading_symbol || 'Trading Symbol'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.strike_price ? `₹${trade.strike_price.toLocaleString()}` : 'Market'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>
                          {trade.option_type || 'Type'} • {trade.expiry_date ? new Date(trade.expiry_date).toLocaleDateString() : 'Expiry'}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600', color: trade.transaction_type === 'BUY' ? '#28a745' : '#dc3545' }}>
                          {trade.transaction_type || 'Type Not Specified'}
                        </div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>{trade.order_type || 'Market Order'}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                      <div>
                        <div style={{ fontWeight: '600' }}>{trade.quantity || '0'}</div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>lots</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'right', color: '#333' }}>
                      <div>
                        <div style={{ fontSize: '0.85em', color: '#6c757d' }}>units</div>
                        <div style={{ fontWeight: '600' }}>{trade.total_quantity || (trade.quantity && trade.lot_size ? trade.quantity * trade.lot_size : '0')}</div>
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center', color: '#333' }}>
                      <div style={{ fontSize: '0.85em' }}>
                        {trade.target_all_active_users ? (
                          <span style={{ color: '#007bff', fontWeight: '600' }}>All Active</span>
                        ) : trade.target_segment_ids && trade.target_segment_ids.length > 0 ? (
                          <span style={{ color: '#6f42c1', fontWeight: '600' }}>
                            {trade.target_segment_ids.length} Segment{trade.target_segment_ids.length > 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span style={{ color: '#6c757d' }}>No Segments</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center' }}>
                      <span style={{
                        padding: '0.25em 0.75em',
                        borderRadius: '1em',
                        fontSize: '0.85em',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.border}`,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25em'
                      }}>
                        {getStatusIcon(trade.status)} {trade.status || 'PENDING'}
                      </span>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center', color: '#333' }}>
                      <span style={{
                        padding: '0.25em 0.5em',
                        borderRadius: '0.5em',
                        fontSize: '0.85em',
                        backgroundColor: trade.user_trades_count > 0 ? '#d4edda' : '#e2e3e5',
                        color: trade.user_trades_count > 0 ? '#155724' : '#6c757d',
                        fontWeight: '600'
                      }}>
                        {trade.user_trades_count || 0}
                      </span>
                    </td>
                    <td style={{ padding: '1em', textAlign: 'center', color: '#6c757d', fontSize: '0.9em' }}>
                      {trade.initiated_at ? formatDate(trade.initiated_at) : 'Recently'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {trades.length === 0 && (
          <div style={{ textAlign: 'center', padding: '3em', color: '#6c757d' }}>
            <div style={{ fontSize: '3em', marginBottom: '1em' }}>📊</div>
            <h3 style={{ marginBottom: '0.5em' }}>No trades found</h3>
            <p>No trade history available at the moment.</p>
          </div>
        )}

        {/* Pagination */}
        {trades.length > 0 && (
          <div style={{ 
            padding: '1.5em', 
            borderTop: '1px solid #e9ecef',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '0.5em'
          }}>
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                padding: '0.5em 1em',
                border: '1px solid #dee2e6',
                background: currentPage === 1 ? '#f8f9fa' : '#fff',
                color: currentPage === 1 ? '#6c757d' : '#333',
                borderRadius: '4px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '0.9em'
              }}
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                style={{
                  padding: '0.5em 1em',
                  border: '1px solid #dee2e6',
                  background: currentPage === number ? '#007bff' : '#fff',
                  color: currentPage === number ? '#fff' : '#333',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  minWidth: '2.5em'
                }}
              >
                {number}
              </button>
            ))}
            
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                padding: '0.5em 1em',
                border: '1px solid #dee2e6',
                background: currentPage === totalPages ? '#f8f9fa' : '#fff',
                color: currentPage === totalPages ? '#6c757d' : '#333',
                borderRadius: '4px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '0.9em'
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Trade Details Modal */}
      {showDetailsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '1em',
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
            `}
          </style>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            maxWidth: '800px',
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            position: 'relative'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5em',
              borderBottom: '1px solid #e9ecef',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8f9fa'
            }}>
              <div>
                <h2 style={{ margin: 0, color: '#333', fontSize: '1.5em' }}>
                  📊 Trade Details
                </h2>
                {error && (
                  <p style={{ 
                    margin: '0.5em 0 0 0', 
                    color: '#dc3545', 
                    fontSize: '0.9em',
                    fontStyle: 'italic'
                  }}>
                    ⚠️ {error}
                  </p>
                )}
              </div>
              <button
                onClick={closeDetailsModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5em',
                  cursor: 'pointer',
                  color: '#6c757d',
                  padding: '0.5em',
                  borderRadius: '50%',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#e9ecef';
                  e.target.style.color = '#dc3545';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#6c757d';
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '1.5em' }}>
              {loadingDetails ? (
                <div style={{ textAlign: 'center', padding: '2em' }}>
                  <div className="loading-spinner" />
                  <p style={{ color: '#333', marginTop: '1em' }}>Loading trade details...</p>
                </div>
              ) : tradeDetails ? (
                <div style={{ display: 'grid', gap: '1.5em' }}>
                   
                   {/* Debug Info - Remove this after fixing */}
                   <div style={{
                     background: '#fff3cd',
                     padding: '1em',
                     borderRadius: '8px',
                     border: '1px solid #ffeaa7',
                     fontSize: '0.8em',
                     fontFamily: 'monospace'
                   }}>
                     <strong>DEBUG INFO:</strong>
                     <div>Status: {JSON.stringify(tradeDetails.status)}</div>
                     <div>Trading Symbol: {JSON.stringify(tradeDetails.trading_symbol)}</div>
                     <div>Underlying Symbol: {JSON.stringify(tradeDetails.underlying_symbol)}</div>
                     <div>Strike Price: {JSON.stringify(tradeDetails.strike_price)}</div>
                     <div>Option Type: {JSON.stringify(tradeDetails.option_type)}</div>
                     <div>Transaction Type: {JSON.stringify(tradeDetails.transaction_type)}</div>
                     <div>Quantity: {JSON.stringify(tradeDetails.quantity)}</div>
                     <div>Lot Size: {JSON.stringify(tradeDetails.lot_size)}</div>
                     <div>Total Quantity: {JSON.stringify(tradeDetails.total_quantity)}</div>
                     <div>Target All Active Users: {JSON.stringify(tradeDetails.target_all_active_users)}</div>
                     <div>User Trades Count: {JSON.stringify(tradeDetails.user_trades_count)}</div>
                     <div>Remarks: {JSON.stringify(tradeDetails.remarks)}</div>
                     <div>Initiated At: {JSON.stringify(tradeDetails.initiated_at)}</div>
                     <div>Last Processed At: {JSON.stringify(tradeDetails.last_processed_at)}</div>
                   </div>

                   {/* Basic Trade Information */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '1.5em',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h3 style={{ margin: '0 0 1em 0', color: '#333', fontSize: '1.2em' }}>Trade Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1em' }}>
                      <div>
                        <strong style={{ color: '#495057' }}>Trade ID:</strong>
                        <div style={{ fontFamily: 'monospace', fontSize: '0.9em', color: '#6c757d', marginTop: '0.25em' }}>
                          {tradeDetails.id || 'Trade ID Not Available'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Status:</strong>
                        <div style={{ marginTop: '0.25em' }}>
                          <span style={{
                            padding: '0.25em 0.75em',
                            borderRadius: '1em',
                            fontSize: '0.85em',
                            backgroundColor: getStatusColor(tradeDetails.status).bg,
                            color: getStatusColor(tradeDetails.status).color,
                            border: `1px solid ${getStatusColor(tradeDetails.status).border}`,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25em'
                          }}>
                            {getStatusIcon(tradeDetails.status)} {tradeDetails.status || 'PENDING'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Initiated:</strong>
                        <div style={{ color: '#6c757d', marginTop: '0.25em' }}>
                          {formatDate(tradeDetails.initiated_at)}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Last Processed:</strong>
                        <div style={{ color: '#6c757d', marginTop: '0.25em' }}>
                          {formatDate(tradeDetails.last_processed_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trading Details */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '1.5em',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h3 style={{ margin: '0 0 1em 0', color: '#333', fontSize: '1.2em' }}>Trading Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1em' }}>
                      <div>
                        <strong style={{ color: '#495057' }}>Symbol:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em' }}>
                          <div style={{ fontWeight: '600' }}>{tradeDetails.underlying_symbol || 'Symbol Not Available'}</div>
                          <div style={{ fontSize: '0.9em', color: '#6c757d' }}>{tradeDetails.trading_symbol || 'Trading Symbol Not Available'}</div>
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Strike Price:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.strike_price ? `₹${tradeDetails.strike_price.toLocaleString()}` : 'Market Order'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Option Type:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.option_type && tradeDetails.option_type !== 'N/A' ? tradeDetails.option_type : 'Not Applicable'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Expiry Date:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.expiry_date ? new Date(tradeDetails.expiry_date).toLocaleDateString() : 'Not Specified'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Transaction Type:</strong>
                        <div style={{ 
                          color: tradeDetails.transaction_type === 'BUY' ? '#28a745' : '#dc3545', 
                          marginTop: '0.25em', 
                          fontWeight: '600' 
                        }}>
                          {tradeDetails.transaction_type || 'Type Not Specified'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Order Type:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.order_type || 'Market Order'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Quantity (Lots):</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.quantity ? tradeDetails.quantity : 'Not Specified'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Lot Size:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.lot_size ? tradeDetails.lot_size : 'Standard Lot'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Total Quantity:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.total_quantity ? tradeDetails.total_quantity : 'Calculated from lots'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Limit Price:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.limit_price ? `₹${tradeDetails.limit_price.toLocaleString()}` : 'Market'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Target Information */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '1.5em',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h3 style={{ margin: '0 0 1em 0', color: '#333', fontSize: '1.2em' }}>Target Information</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1em' }}>
                      <div>
                        <strong style={{ color: '#495057' }}>Target All Active Users:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.target_all_active_users ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>Target Segments:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em' }}>
                          {tradeDetails.target_segment_ids && tradeDetails.target_segment_ids.length > 0 ? (
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5em' }}>
                              {tradeDetails.target_segment_ids.map((segmentId, index) => (
                                <span
                                  key={index}
                                  style={{
                                    padding: '0.25em 0.5em',
                                    background: '#6f42c1',
                                    color: 'white',
                                    borderRadius: '4px',
                                    fontSize: '0.8em',
                                    fontFamily: 'monospace'
                                  }}
                                >
                                  {segmentId.substring(0, 8)}...
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span style={{ color: '#6c757d' }}>No specific segments</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <strong style={{ color: '#495057' }}>User Trades Count:</strong>
                        <div style={{ color: '#333', marginTop: '0.25em', fontWeight: '600' }}>
                          {tradeDetails.user_trades_count || 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Remarks */}
                  <div style={{
                    background: '#f8f9fa',
                    padding: '1.5em',
                    borderRadius: '8px',
                    border: '1px solid #e9ecef'
                  }}>
                    <h3 style={{ margin: '0 0 1em 0', color: '#333', fontSize: '1.2em' }}>Remarks</h3>
                    <div style={{ color: '#333', lineHeight: '1.6' }}>
                      {tradeDetails.remarks && tradeDetails.remarks !== 'No specific remarks for this trade' ? tradeDetails.remarks : 'No specific remarks for this trade.'}
                    </div>
                  </div>

                  {/* User Trades Details - If Available */}
                  {tradeDetails.user_trades && Array.isArray(tradeDetails.user_trades) && tradeDetails.user_trades.length > 0 && (
                    <div style={{
                      background: '#f8f9fa',
                      padding: '1.5em',
                      borderRadius: '8px',
                      border: '1px solid #e9ecef'
                    }}>
                      <h3 style={{ margin: '0 0 1em 0', color: '#333', fontSize: '1.2em' }}>User Trade Responses</h3>
                      <div style={{ display: 'grid', gap: '1em' }}>
                        {tradeDetails.user_trades.map((userTrade, index) => (
                          <div
                            key={index}
                            style={{
                              background: 'white',
                              padding: '1em',
                              borderRadius: '6px',
                              border: '1px solid #e9ecef'
                            }}
                          >
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.5em' }}>
                              <div>
                                <strong style={{ color: '#495057', fontSize: '0.9em' }}>User:</strong>
                                <div style={{ color: '#333', fontSize: '0.9em' }}>
                                  {userTrade.user_name || userTrade.user_id || 'Unknown User'}
                                </div>
                              </div>
                              <div>
                                <strong style={{ color: '#495057', fontSize: '0.9em' }}>Status:</strong>
                                <div style={{ color: '#333', fontSize: '0.9em' }}>
                                  {userTrade.status || 'Unknown'}
                                </div>
                              </div>
                              <div>
                                <strong style={{ color: '#495057', fontSize: '0.9em' }}>Response:</strong>
                                <div style={{ color: '#333', fontSize: '0.9em' }}>
                                  {userTrade.response || 'No response'}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '2em', color: '#6c757d' }}>
                  <div style={{ fontSize: '3em', marginBottom: '1em' }}>❌</div>
                  <h3 style={{ marginBottom: '0.5em' }}>No Trade Details Available</h3>
                  <p>Unable to load trade details. Please try again.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '1em 1.5em',
              borderTop: '1px solid #e9ecef',
              background: '#f8f9fa',
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={closeDetailsModal}
                style={{
                  padding: '0.75em 1.5em',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = '#5a6268'}
                onMouseLeave={(e) => e.target.style.background = '#6c757d'}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradeHistory; 