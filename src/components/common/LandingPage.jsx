import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Zap, Users, BarChart3, Menu, X } from 'lucide-react';
import v4Logo from '../../assets/logo-V4.png';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768;
      console.log('LandingPage Mobile check:', { width: window.innerWidth, mobile });
      setIsMobile(mobile);
      if (mobile) {
        setIsMobileMenuOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Debug mobile state
  useEffect(() => {
    console.log('LandingPage Mobile state changed:', { isMobile, isMobileMenuOpen });
  }, [isMobile, isMobileMenuOpen]);

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
          borderBottom: '1px solid #e2e8f0',
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
            style={{ height: '40px', width: 'auto' }}
          />
          <span style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            V4 Fintech
          </span>
        </motion.div>

        {/* Mobile Menu Toggle - Always visible on mobile */}
        {isMobile && (
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              background: '#2563eb',
              border: '2px solid white',
              borderRadius: '12px',
              padding: '1rem',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
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
              color: '#475569',
              textDecoration: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              fontWeight: '500',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.color = '#00d4aa';
            }}
            onMouseLeave={(e) => {
              e.target.style.color = '#475569';
            }}>
              Sign In
            </Link>
            <Link to="/signup" style={{
              color: '#ffffff',
              borderRadius: '8px',
              padding: '0.75rem 1.5rem',
              background: '#00d4aa',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.2s ease',
              fontSize: '0.95rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#00b894';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#00d4aa';
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
            borderBottom: '1px solid #e2e8f0',
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
            zIndex: 999,
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
            borderTop: '1px solid #e2e8f0'
          }}>
            <h3 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600', 
              color: '#0f172a',
              marginBottom: '1rem',
              textAlign: 'center'
            }}>
              Navigation
            </h3>
            <Link to="/login" style={{
              color: '#475569',
              textDecoration: 'none',
              padding: '1rem 1.5rem',
              borderRadius: '12px',
              fontWeight: '600',
              textAlign: 'center',
              border: '2px solid #e2e8f0',
              transition: 'all 0.3s ease',
              fontSize: '1.1rem'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#00d4aa';
              e.target.style.color = '#00d4aa';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e2e8f0';
              e.target.style.color = '#475569';
            }}>
              Sign In
            </Link>
            <Link to="/signup" style={{
              color: '#ffffff',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              background: '#00d4aa',
              textDecoration: 'none',
              fontWeight: '600',
              textAlign: 'center',
              fontSize: '1.1rem',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 15px rgba(0, 212, 170, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(0, 212, 170, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 15px rgba(0, 212, 170, 0.3)';
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
            color: '#0f172a',
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
            color: '#475569',
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
                boxShadow: '0 4px 15px rgba(37, 99, 235, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(37, 99, 235, 0.3)';
              }}>
                Start Trading Now
                <ArrowRight size={20} style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }} />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/login" style={{ 
                padding: '1rem 2rem',
                background: 'transparent',
                color: '#475569',
                textDecoration: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                fontSize: '1.1rem',
                display: 'inline-block',
                border: '2px solid #e2e8f0',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#00d4aa';
                e.target.style.color = '#00d4aa';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.color = '#475569';
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
              color: '#0f172a',
              marginBottom: '1rem'
            }}>
              Why Choose V4 Fintech?
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#475569', 
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
                  background: '#ffffff',
                  padding: '2rem',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  textAlign: 'center',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
                  color: '#0f172a',
                  marginBottom: '1rem'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: '#475569', 
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

      {/* Subscription Model Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
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
              color: '#0f172a',
              marginBottom: '1rem'
            }}>
              Choose Your Trading Plan
            </h2>
            <p style={{ 
              fontSize: '1.1rem', 
              color: '#475569', 
              maxWidth: '600px', 
              margin: '0 auto 3rem',
              lineHeight: '1.6'
            }}>
              Start with our free plan and upgrade as you grow. No hidden fees, transparent pricing.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            marginTop: '3rem'
          }}>
            {/* Free Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#0f172a',
                marginBottom: '0.5rem'
              }}>
                Free Plan
              </h3>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                color: '#00d4aa',
                marginBottom: '1rem'
              }}>
                $0
                <span style={{ fontSize: '1rem', color: '#475569', fontWeight: '400' }}>/month</span>
              </div>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: '1.5rem 0',
                textAlign: 'left'
              }}>
                <li style={{ padding: '0.5rem 0', color: '#475569' }}>✓ Basic trading features</li>
                <li style={{ padding: '0.5rem 0', color: '#475569' }}>✓ Real-time market data</li>
                <li style={{ padding: '0.5rem 0', color: '#475569' }}>✓ Basic charting tools</li>
                <li style={{ padding: '0.5rem 0', color: '#475569' }}>✓ Community support</li>
              </ul>
              <Link to="/signup" style={{
                display: 'inline-block',
                width: '100%',
                padding: '1rem',
                background: 'transparent',
                color: '#00d4aa',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '2px solid #00d4aa',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#00d4aa';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#00d4aa';
              }}>
                Get Started Free
              </Link>
            </motion.div>

            {/* Pro Plan */}
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
                boxShadow: '0 8px 25px rgba(37, 99, 235, 0.3)',
                position: 'relative',
                transform: 'scale(1.05)'
              }}
            >
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#00d4aa',
                color: 'white',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}>
                Most Popular
              </div>
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600',
                marginBottom: '0.5rem'
              }}>
                Pro Plan
              </h3>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700',
                marginBottom: '1rem'
              }}>
                $29
                <span style={{ fontSize: '1rem', opacity: 0.8, fontWeight: '400' }}>/month</span>
              </div>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: '1.5rem 0',
                textAlign: 'left'
              }}>
                <li style={{ padding: '0.5rem 0', opacity: 0.9 }}>✓ Everything in Free</li>
                <li style={{ padding: '0.5rem 0', opacity: 0.9 }}>✓ Advanced charting</li>
                <li style={{ padding: '0.5rem 0', opacity: 0.9 }}>✓ Priority support</li>
                <li style={{ padding: '0.5rem 0', opacity: 0.9 }}>✓ Custom indicators</li>
                <li style={{ padding: '0.5rem 0', opacity: 0.9 }}>✓ API access</li>
              </ul>
              <Link to="/signup" style={{
                display: 'inline-block',
                width: '100%',
                padding: '1rem',
                background: 'white',
                color: '#2563eb',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}>
                Start Pro Trial
              </Link>
            </motion.div>

            {/* Enterprise Plan */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
              style={{
                background: '#ffffff',
                padding: '2rem',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              <h3 style={{ 
                fontSize: '1.5rem', 
                fontWeight: '600', 
                color: '#0f172a',
                marginBottom: '0.5rem'
              }}>
                Enterprise
              </h3>
              <div style={{ 
                fontSize: '2.5rem', 
                fontWeight: '700', 
                color: '#00d4aa',
                marginBottom: '1rem'
              }}>
                Custom
                <span style={{ fontSize: '1rem', color: '#475569', fontWeight: '400' }}>/month</span>
              </div>
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: '1.5rem 0',
                textAlign: 'left'
              }}>
                <li style={{ padding: '0.5rem 0', color: '#475569' }}>✓ Everything in Pro</li>
                <li style={{ padding: '0.5rem 0', color: '#475569' }}>✓ Dedicated support</li>
                <li style={{ padding: '0.5rem 0', color: '#475569' }}>✓ Custom integrations</li>
                <li style={{ padding: '0.5rem 0', color: '#475569' }}>✓ White-label options</li>
                <li style={{ padding: '0.5rem 0', color: '#475569' }}>✓ SLA guarantees</li>
              </ul>
              <Link to="/contact" style={{
                display: 'inline-block',
                width: '100%',
                padding: '1rem',
                background: 'transparent',
                color: '#00d4aa',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '2px solid #00d4aa',
                fontWeight: '600',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#00d4aa';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#00d4aa';
              }}>
                Contact Sales
              </Link>
            </motion.div>
          </div>
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
                  alt="V4 Fintech Solutions" 
                  style={{ height: '40px', width: 'auto' }}
                />
                <span style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  V4 Fintech
                </span>
              </div>
              <p style={{ 
                color: '#94a3b8', 
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
                  <Link to="/pricing" style={{ color: '#94a3b8', textDecoration: 'none' }}>Pricing</Link>
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
              © 2024 V4 Fintech Solutions. All rights reserved. | 
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