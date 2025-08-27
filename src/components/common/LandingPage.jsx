import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Zap, Users, BarChart3, Menu, X } from 'lucide-react';
import v4Logo from '../../assets/Logo-updated-removebg-preview.png';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const features = [
    {
      icon: <TrendingUp size={32} />,
      title: 'Advanced Trading',
      description: 'Professional-grade trading tools with real-time market data and advanced charting capabilities.'
    },
    {
      icon: <Shield size={32} />,
      title: 'Secure & Reliable',
      description: 'Bank-level security with encrypted connections and secure authentication protocols.'
    },
    {
      icon: <Zap size={32} />,
      title: 'Lightning Fast',
      description: 'Ultra-low latency execution with high-frequency trading capabilities.'
    },
    {
      icon: <Users size={32} />,
      title: 'Expert Support',
      description: '24/7 customer support from trading experts and dedicated account managers.'
    },
    {
      icon: <BarChart3 size={32} />,
      title: 'Analytics & Insights',
      description: 'Comprehensive analytics, performance tracking, and market insights.'
    }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--gradient-bg)' }}>
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-primary)',
          padding: '1rem 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <motion.div 
          whileHover={{ scale: 1.05 }}
          style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}
        >
                     <img 
             src={v4Logo} 
             alt="V4 Fintech Solutions" 
             style={{ height: '120px', width: 'auto' }}
           />
        </motion.div>

        {/* Mobile Menu Toggle - Always visible on mobile */}
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: 'var(--secondary-color)',
              border: '2px solid white',
              borderRadius: '12px',
              padding: '1rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-lg)',
              minWidth: '56px',
              minHeight: '56px',
              fontSize: '1.2rem'
            }}
            title={isMobileMenuOpen ? 'Close Menu' : 'Open Menu'}
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        )}

        {/* Desktop Navigation */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link to="/login" style={{
              color: 'var(--text-muted)',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = 'var(--primary-color)';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = 'var(--text-muted)';
            }}>
              Sign In
            </Link>
            <Link to="/signup" style={{
              color: 'var(--text-inverse)',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              background: 'var(--primary-color)',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = 'var(--primary-hover)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = 'var(--primary-color)';
            }}>
              Get Started
            </Link>
          </div>
        )}

        {/* Mobile Menu Overlay */}
        {isMobile && isMobileMenuOpen && (
                     <div style={{
             position: 'fixed',
             top: '100%',
             left: 0,
             right: 0,
             background: 'rgba(255, 255, 255, 0.98)',
             backdropFilter: 'blur(20px)',
             borderBottom: '1px solid var(--border-primary)',
             padding: '2rem',
             display: 'flex',
             flexDirection: 'column',
             gap: '1.5rem',
             zIndex: 999,
             boxShadow: 'var(--shadow-lg)',
             borderTop: '1px solid var(--border-primary)'
           }}>
                         <h3 style={{ 
               fontSize: '1.5rem', 
               fontWeight: '600', 
               color: 'var(--text-primary)',
               marginBottom: '1rem',
               textAlign: 'center'
             }}>
              Navigation
            </h3>
                         <Link to="/login" style={{
               color: 'var(--text-muted)',
               textDecoration: 'none',
               padding: '1rem 1.5rem',
               borderRadius: '12px',
               fontWeight: '600',
               textAlign: 'center',
               border: '2px solid var(--border-primary)',
               transition: 'all 0.3s ease',
               fontSize: '1.1rem'
             }}
             onMouseEnter={(e) => {
               e.target.style.borderColor = 'var(--primary-color)';
               e.target.style.color = 'var(--primary-color)';
             }}
             onMouseLeave={(e) => {
               e.target.style.borderColor = 'var(--border-primary)';
               e.target.style.color = 'var(--text-muted)';
             }}>
              Sign In
            </Link>
                         <Link to="/signup" style={{
               color: 'var(--text-inverse)',
               borderRadius: '12px',
               padding: '1rem 1.5rem',
               background: 'var(--primary-color)',
               textDecoration: 'none',
               fontWeight: '600',
               textAlign: 'center',
               fontSize: '1.1rem',
               transition: 'all 0.3s ease',
               boxShadow: 'var(--shadow-md)'
             }}
             onMouseEnter={(e) => {
               e.target.style.transform = 'translateY(-2px)';
               e.target.style.boxShadow = 'var(--shadow-xl)';
             }}
             onMouseLeave={(e) => {
               e.target.style.transform = 'translateY(0)';
               e.target.style.boxShadow = 'var(--shadow-md)';
             }}>
              Get Started
            </Link>
          </div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section style={{
        padding: isMobile ? '6rem 1rem 4rem' : '8rem 2rem 6rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
                     <h1 style={{ 
             fontSize: isMobile ? '2.5rem' : '4rem',
             fontWeight: '800',
             color: 'var(--text-primary)',
             marginBottom: '1.5rem',
             lineHeight: '1.1',
             maxWidth: '800px'
           }}>
             The Future of{' '}
             <span style={{ 
               background: 'var(--gradient-primary)',
               WebkitBackgroundClip: 'text',
               WebkitTextFillColor: 'transparent',
               backgroundClip: 'text'
             }}>
               Stock Trading
             </span>
             {' '}is Here
           </h1>
          
                     <p style={{ 
             color: 'var(--text-muted)',
             fontSize: isMobile ? '1rem' : '1.25rem',
             maxWidth: '600px',
             margin: '0 auto 3rem',
             lineHeight: '1.6',
             fontWeight: '400',
             padding: isMobile ? '0 1rem' : '0'
           }}>
            Join thousands of traders who trust V4 Fintech Solutions for their trading journey. 
            Experience the future of trading with our advanced platform.
          </p>

          <div style={{ 
            display: 'flex', 
            gap: isMobile ? '0.5rem' : '1rem', 
            justifyContent: 'center', 
            flexWrap: 'wrap', 
            marginBottom: '4rem',
            padding: isMobile ? '0 1rem' : '0'
          }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                             <Link to="/signup" style={{ 
                 padding: '1rem 2rem',
                 background: 'var(--gradient-primary)',
                 color: 'white',
                 textDecoration: 'none',
                 borderRadius: '12px',
                 fontWeight: '600',
                 fontSize: '1.1rem',
                 display: 'inline-block',
                 boxShadow: 'var(--shadow-md)',
                 transition: 'all 0.3s ease'
               }}
               onMouseEnter={(e) => {
                 e.target.style.transform = 'translateY(-2px)';
                 e.target.style.boxShadow = 'var(--shadow-xl)';
               }}
               onMouseLeave={(e) => {
                 e.target.style.transform = 'translateY(0)';
                 e.target.style.boxShadow = 'var(--shadow-md)';
               }}>
                Start Trading Now
                <ArrowRight size={20} style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                           <Link to="/login" style={{ 
               padding: '1rem 2rem',
               background: 'transparent',
               color: 'var(--text-muted)',
               textDecoration: 'none',
               borderRadius: '12px',
               fontWeight: '600',
               fontSize: '1.1rem',
               display: 'inline-block',
               border: '2px solid var(--border-primary)',
               transition: 'all 0.3s ease'
             }}
             onMouseEnter={(e) => {
               e.target.style.borderColor = 'var(--primary-color)';
               e.target.style.color = 'var(--primary-color)';
             }}
             onMouseLeave={(e) => {
               e.target.style.borderColor = 'var(--border-primary)';
               e.target.style.color = 'var(--text-muted)';
             }}>
                Sign In
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: '6rem 2rem',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
                         <h2 style={{ 
               fontSize: '2.5rem', 
               fontWeight: '700', 
               color: 'var(--text-primary)',
               marginBottom: '1rem'
             }}>
               Why Choose V4 Fintech?
             </h2>
             <p style={{ 
               fontSize: '1.1rem', 
               color: 'var(--text-muted)', 
               maxWidth: '600px', 
               margin: '0 auto',
               lineHeight: '1.6'
             }}>
              Experience the most advanced trading platform with cutting-edge technology and unparalleled support.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                style={{
                  background: 'var(--bg-card)',
                  padding: '2rem',
                  borderRadius: '16px',
                  border: '1px solid var(--border-primary)',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <div style={{
                  background: 'var(--gradient-primary)',
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: 'white'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '600', 
                  color: 'var(--text-primary)',
                  marginBottom: '1rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: 'var(--text-muted)', 
                  lineHeight: '1.6',
                  fontSize: '1rem'
                }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'var(--gradient-bg)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              marginBottom: '1rem'
            }}>
              Why Choose Our Trading Platform?
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--text-muted)', 
              maxWidth: '600px', 
              margin: '0 auto 3rem',
              lineHeight: '1.6'
            }}>
              Experience the next generation of trading with our cutting-edge technology and comprehensive features.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {/* Advanced Analytics */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              style={{
                background: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{
                background: 'var(--gradient-primary)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <BarChart3 size={32} color="white" />
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                Advanced Analytics
              </h3>
              <p style={{ 
                color: 'var(--text-muted)', 
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                Get deep insights into market trends with our advanced analytics and AI-powered predictions.
              </p>
              <Link to="/signup" style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: 'var(--primary-color)',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '2px solid var(--primary-color)',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--primary-color)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--primary-color)';
              }}>
                Learn More
              </Link>
            </motion.div>

            {/* Real-time Trading */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              style={{
                background: 'var(--gradient-primary)',
                padding: '2rem',
                borderRadius: '16px',
                color: 'white',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-xl)',
                position: 'relative',
                transform: 'scale(1.05)'
              }}
            >
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                backdropFilter: 'blur(10px)'
              }}>
                <TrendingUp size={32} color="white" />
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                marginBottom: '1rem'
              }}>
                Real-time Trading
              </h3>
              <p style={{ 
                opacity: 0.9, 
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                Execute trades with lightning-fast speed and real-time market data from global exchanges.
              </p>
              <Link to="/signup" style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'white',
                color: 'var(--primary-color)',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-md)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                Start Trading
              </Link>
            </motion.div>

            {/* Security & Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              style={{
                background: 'var(--bg-card)',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid var(--border-primary)',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div style={{
                background: 'var(--gradient-primary)',
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                boxShadow: 'var(--shadow-lg)'
              }}>
                <Shield size={32} color="white" />
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: 'var(--text-primary)',
                marginBottom: '1rem'
              }}>
                Security & Compliance
              </h3>
              <p style={{ 
                color: 'var(--text-muted)', 
                lineHeight: '1.6',
                marginBottom: '1.5rem'
              }}>
                Bank-level security with SOC 2 compliance and encrypted connections for your peace of mind.
              </p>
              <Link to="/signup" style={{
                display: 'inline-block',
                padding: '0.75rem 1.5rem',
                background: 'transparent',
                color: 'var(--primary-color)',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '2px solid var(--primary-color)',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'var(--primary-color)';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'var(--primary-color)';
              }}>
                Learn More
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'var(--gradient-primary)',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 style={{ 
              fontSize: '2.5rem', 
              fontWeight: '700', 
              color: 'white',
              marginBottom: '1.5rem'
            }}>
              Ready to Start Your Trading Journey?
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'rgba(255, 255, 255, 0.9)', 
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Join thousands of successful traders who trust our platform for their investment needs.
            </p>
            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <Link to="/signup" style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: 'white',
                color: 'var(--primary-color)',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                boxShadow: 'var(--shadow-lg)'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = 'var(--shadow-xl)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'var(--shadow-lg)';
              }}>
                Get Started Free
              </Link>
              <Link to="/demo" style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: 'transparent',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.1rem',
                border: '2px solid white',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'white';
                e.target.style.color = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = 'white';
              }}>
                Try Demo
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1e293b',
        color: 'white',
        padding: '4rem 2rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '2rem',
            marginBottom: '3rem',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: isMobile ? 'center' : 'flex-start', marginBottom: '1rem' }}>
                                 <img 
                   src={v4Logo} 
                   alt="Trading Platform Logo" 
                   style={{ height: '120px', width: 'auto' }}
                 />
              </div>
              <p style={{ 
                color: 'var(--text-muted)', 
                lineHeight: '1.6',
                maxWidth: '300px',
                margin: isMobile ? '0 auto' : '0'
              }}>
                Empowering traders with cutting-edge technology and unparalleled support for successful trading journeys.
              </p>
            </div>

            <div>
              <h4 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: 'white'
              }}>
                Quick Links
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/about" style={{ color: '#94a3b8', textDecoration: 'none' }}>About Us</Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Features</Link>
                </li>

                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none' }}>Contact</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: 'white'
              }}>
                Support
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/help" style={{ color: '#94a3b8', textDecoration: 'none' }}>Help Center</Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/docs" style={{ color: '#94a3b8', textDecoration: 'none' }}>Documentation</Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/api" style={{ color: '#94a3b8', textDecoration: 'none' }}>API Reference</Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/status" style={{ color: '#94a3b8', textDecoration: 'none' }}>System Status</Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 style={{ 
                fontSize: '1.2rem', 
                fontWeight: '600', 
                marginBottom: '1rem',
                color: 'white'
              }}>
                Legal
              </h4>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none' }}>Terms of Service</Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/security" style={{ color: '#94a3b8', textDecoration: 'none' }}>Security</Link>
                </li>
                <li style={{ marginBottom: '0.5rem' }}>
                  <Link to="/compliance" style={{ color: '#94a3b8', textDecoration: 'none' }}>Compliance</Link>
                </li>
              </ul>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #334155',
            paddingTop: '2rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              © 2024 Trading Platform. All rights reserved. | 
              <Link to="/privacy" style={{ color: '#94a3b8', textDecoration: 'none', marginLeft: '0.5rem' }}>Privacy</Link> | 
              <Link to="/terms" style={{ color: '#94a3b8', textDecoration: 'none', marginLeft: '0.5rem' }}>Terms</Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 