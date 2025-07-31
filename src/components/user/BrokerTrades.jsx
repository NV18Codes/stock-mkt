import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Trash2,
  Edit,
  Calendar,
  DollarSign,
  Package
} from 'lucide-react';
import { getUserBrokerTrades, getUserBrokerOrderBook, getOrderDetails, cancelOrder } from '../../api/broker';

const BrokerTrades = () => {
  const [trades, setTrades] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('trades');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tradesResponse, ordersResponse] = await Promise.all([
        getUserBrokerTrades(),
        getUserBrokerOrderBook()
      ]);

      if (tradesResponse.success) {
        setTrades(tradesResponse.data || []);
      }

      if (ordersResponse.success) {
        setOrders(ordersResponse.data || []);
      }
    } catch (error) {
      console.error('Error fetching broker data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const response = await getOrderDetails(orderId);
      if (response.success) {
        setOrderDetails(response.data);
        setShowOrderModal(true);
      }
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        const response = await cancelOrder(orderId);
        if (response.success) {
          // Refresh the data
          fetchData();
        }
      } catch (error) {
        console.error('Error canceling order:', error);
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETE':
        return <CheckCircle size={16} color="var(--success-color)" />;
      case 'PENDING':
        return <Clock size={16} color="var(--warning-color)" />;
      case 'CANCELLED':
        return <XCircle size={16} color="var(--danger-color)" />;
      default:
        return <AlertTriangle size={16} color="var(--warning-color)" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETE':
        return 'var(--success-color)';
      case 'PENDING':
        return 'var(--warning-color)';
      case 'CANCELLED':
        return 'var(--danger-color)';
      default:
        return 'var(--text-secondary)';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw size={32} color="var(--primary-color)" />
        </motion.div>
      </motion.div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}
      >
        <h2 style={{ 
          color: 'var(--text-primary)', 
          fontSize: 'clamp(1.5rem, 3vw, 2rem)',
          fontWeight: '700',
          margin: 0
        }}>
          Broker Activity
        </h2>
        <motion.button
          onClick={fetchData}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          style={{
            background: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <RefreshCw size={16} />
          Refresh
        </motion.button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid var(--border-color)'
        }}
      >
        {[
          { key: 'trades', label: 'Trades', icon: TrendingUp, count: trades.length },
          { key: 'orders', label: 'Orders', icon: Package, count: orders.length }
        ].map((tab) => (
          <motion.button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            style={{
              background: activeTab === tab.key ? 'var(--primary-color)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              border: 'none',
              padding: '1rem 1.5rem',
              borderRadius: '8px 8px 0 0',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
          >
            <tab.icon size={18} />
            {tab.label}
            <span style={{
              background: activeTab === tab.key ? 'rgba(255,255,255,0.2)' : 'var(--background-color)',
              color: activeTab === tab.key ? 'white' : 'var(--text-secondary)',
              padding: '0.25rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {tab.count}
            </span>
          </motion.button>
        ))}
      </motion.div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'trades' && (
          <motion.div
            key="trades"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--background-color)'
              }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  Recent Trades
                </h3>
              </div>
              
              {trades.length === 0 ? (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <TrendingUp size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No trades found</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{
                        background: 'var(--background-color)',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Symbol
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Type
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Quantity
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Price
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Value
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {trades.map((trade, index) => (
                        <motion.tr
                          key={trade.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'all 0.2s ease'
                          }}
                          whileHover={{
                            background: 'var(--background-color)'
                          }}
                        >
                          <td style={{
                            padding: '1rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                          }}>
                            {trade.symbol}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center'
                          }}>
                            <span style={{
                              background: trade.transactionType === 'BUY' ? 'var(--success-color)' : 'var(--danger-color)',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {trade.transactionType}
                            </span>
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                          }}>
                            {trade.quantity}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'right',
                            color: 'var(--text-primary)'
                          }}>
                            {formatCurrency(trade.price)}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                          }}>
                            {formatCurrency(trade.tradeValue)}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center',
                            color: 'var(--text-secondary)',
                            fontSize: '0.875rem'
                          }}>
                            {formatDate(trade.tradeDate)}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div
            key="orders"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div style={{
              background: 'white',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{
                padding: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--background-color)'
              }}>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  margin: 0,
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  Order Book
                </h3>
              </div>
              
              {orders.length === 0 ? (
                <div style={{
                  padding: '3rem',
                  textAlign: 'center',
                  color: 'var(--text-secondary)'
                }}>
                  <Package size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p>No orders found</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse'
                  }}>
                    <thead>
                      <tr style={{
                        background: 'var(--background-color)',
                        borderBottom: '1px solid var(--border-color)'
                      }}>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Order ID
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'left',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Symbol
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Type
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Quantity
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'right',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Price
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Status
                        </th>
                        <th style={{
                          padding: '1rem',
                          textAlign: 'center',
                          fontWeight: '600',
                          color: 'var(--text-primary)',
                          fontSize: '0.875rem'
                        }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order, index) => (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          style={{
                            borderBottom: '1px solid var(--border-color)',
                            transition: 'all 0.2s ease'
                          }}
                          whileHover={{
                            background: 'var(--background-color)'
                          }}
                        >
                          <td style={{
                            padding: '1rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)',
                            fontSize: '0.875rem'
                          }}>
                            {order.id}
                          </td>
                          <td style={{
                            padding: '1rem',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                          }}>
                            {order.symbol}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center'
                          }}>
                            <span style={{
                              background: order.transactionType === 'BUY' ? 'var(--success-color)' : 'var(--danger-color)',
                              color: 'white',
                              padding: '0.25rem 0.75rem',
                              borderRadius: '12px',
                              fontSize: '0.75rem',
                              fontWeight: '600'
                            }}>
                              {order.transactionType}
                            </span>
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'right',
                            fontWeight: '600',
                            color: 'var(--text-primary)'
                          }}>
                            {order.quantity}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'right',
                            color: 'var(--text-primary)'
                          }}>
                            {formatCurrency(order.price)}
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem'
                            }}>
                              {getStatusIcon(order.status)}
                              <span style={{
                                color: getStatusColor(order.status),
                                fontSize: '0.875rem',
                                fontWeight: '600'
                              }}>
                                {order.status}
                              </span>
                            </div>
                          </td>
                          <td style={{
                            padding: '1rem',
                            textAlign: 'center'
                          }}>
                            <div style={{
                              display: 'flex',
                              gap: '0.5rem',
                              justifyContent: 'center'
                            }}>
                              <motion.button
                                onClick={() => handleViewOrder(order.id)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                style={{
                                  background: 'var(--primary-color)',
                                  color: 'white',
                                  border: 'none',
                                  padding: '0.5rem',
                                  borderRadius: '6px',
                                  cursor: 'pointer'
                                }}
                                title="View Details"
                              >
                                <Eye size={14} />
                              </motion.button>
                              
                              {order.status === 'PENDING' && (
                                <>
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                      background: 'var(--warning-color)',
                                      color: 'white',
                                      border: 'none',
                                      padding: '0.5rem',
                                      borderRadius: '6px',
                                      cursor: 'pointer'
                                    }}
                                    title="Edit Order"
                                  >
                                    <Edit size={14} />
                                  </motion.button>
                                  
                                  <motion.button
                                    onClick={() => handleCancelOrder(order.id)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    style={{
                                      background: 'var(--danger-color)',
                                      color: 'white',
                                      border: 'none',
                                      padding: '0.5rem',
                                      borderRadius: '6px',
                                      cursor: 'pointer'
                                    }}
                                    title="Cancel Order"
                                  >
                                    <Trash2 size={14} />
                                  </motion.button>
                                </>
                              )}
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Order Details Modal */}
      <AnimatePresence>
        {showOrderModal && orderDetails && (
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
              zIndex: 1000,
              padding: '1rem'
            }}
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '2rem',
                maxWidth: '600px',
                width: '100%',
                maxHeight: '80vh',
                overflow: 'auto'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem'
              }}>
                <h3 style={{
                  color: 'var(--text-primary)',
                  margin: 0,
                  fontSize: '1.5rem',
                  fontWeight: '700'
                }}>
                  Order Details
                </h3>
                <button
                  onClick={() => setShowOrderModal(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '1.5rem',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)'
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
              }}>
                <div style={{
                  background: 'var(--background-color)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Order ID
                  </div>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    {orderDetails.id}
                  </div>
                </div>

                <div style={{
                  background: 'var(--background-color)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Symbol
                  </div>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    {orderDetails.symbol}
                  </div>
                </div>

                <div style={{
                  background: 'var(--background-color)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Status
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    {getStatusIcon(orderDetails.status)}
                    <span style={{
                      color: getStatusColor(orderDetails.status),
                      fontWeight: '600'
                    }}>
                      {orderDetails.status}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: 'var(--background-color)',
                  padding: '1rem',
                  borderRadius: '8px'
                }}>
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem',
                    marginBottom: '0.5rem'
                  }}>
                    Total Value
                  </div>
                  <div style={{
                    color: 'var(--text-primary)',
                    fontWeight: '600'
                  }}>
                    {formatCurrency(orderDetails.totalValue)}
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex',
                gap: '1rem',
                justifyContent: 'flex-end'
              }}>
                <motion.button
                  onClick={() => setShowOrderModal(false)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    background: 'var(--text-secondary)',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '8px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrokerTrades; 