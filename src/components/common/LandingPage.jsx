import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, TrendingUp, Shield, Zap, Users, BarChart3 } from 'lucide-react';
import v4Logo from '../../assets/logo-V4.png';

const LandingPage = () => {
  const features = [
    {
      icon: <TrendingUp size={32} />,
      title: "Advanced Analytics",
      description: "Real-time insights with powerful trading analytics and market data visualization."
    },
    {
      icon: <Shield size={32} />,
      title: "Bank-Grade Security",
      description: "Enterprise-level security and encryption protocols protect your data."
    },
    {
      icon: <Zap size={32} />,
      title: "Lightning Fast",
      description: "Execute trades instantly with high-performance trading engine."
    },
    {
      icon: <Users size={32} />,
      title: "Expert Community",
      description: "Connect with professional traders in our exclusive community."
    },
    {
      icon: <BarChart3 size={32} />,
      title: "Portfolio Management",
      description: "Track and manage investments with comprehensive analytics."
    },
    {
      icon: <Shield size={32} />,
      title: "Premium Support",
      description: "24/7 dedicated support from trading experts and professionals."
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "₹999",
      period: "per month",
      features: [
        "Basic Trading Tools",
        "Email Support",
        "1 Broker Account",
        "Portfolio Tracking",
        "Basic Analytics"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "₹1,999",
      period: "per month",
      features: [
        "All Starter Features",
        "Advanced Analytics",
        "Priority Support",
        "Up to 3 Broker Accounts",
        "Real-time Alerts",
        "Custom Watchlists"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "₹4,999",
      period: "per month",
      features: [
        "All Pro Features",
        "Dedicated Manager",
        "API Access",
        "Unlimited Accounts",
        "Custom Integrations",
        "White-label Options"
      ],
      popular: false
    }
  ];

  return (
    <div style={{ overflowX: 'hidden', background: '#ffffff' }}>
      {/* Navigation */}
      <motion.nav 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid #e2e8f0',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <motion.div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          whileHover={{ scale: 1.02 }}
        >
          <img 
            src={v4Logo} 
            alt="V4 Fintech Solutions" 
            style={{ 
              height: '70px', 
              width: 'auto',
              borderRadius: '12px',
              background: 'white',
              padding: '8px'
            }}
          />
        </motion.div>
        
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
      </motion.nav>

      {/* Hero Section */}
      <section style={{
        padding: '8rem 2rem 6rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={{ maxWidth: '1000px', margin: '0 auto' }}
        >
          <h1 style={{ 
            color: '#0f172a',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            fontWeight: '800',
            marginBottom: '1.5rem',
            letterSpacing: '-0.025em',
            lineHeight: '1.2'
          }}>
            Trade Smarter with
            <br />
            <span style={{ 
              color: '#00d4aa'
            }}>
              Professional Tools
            </span>
          </h1>
          
          <p style={{ 
            color: '#475569',
            fontSize: '1.25rem',
            maxWidth: '600px',
            margin: '0 auto 3rem',
            lineHeight: '1.6',
            fontWeight: '400'
          }}>
            Join thousands of traders who trust V4 Fintech Solutions for their trading journey. 
            Experience the future of trading with our advanced platform.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '4rem' }}>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/signup" style={{ 
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: '#00d4aa',
                color: '#ffffff',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#00b894';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#00d4aa';
              }}>
                Start Trading Free
                <ArrowRight size={20} />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link to="/login" style={{ 
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: 'transparent',
                color: '#00d4aa',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                border: '2px solid #00d4aa',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#00d4aa';
                e.target.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#00d4aa';
              }}>
                View Demo
              </Link>
            </motion.div>
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '2rem',
              maxWidth: '800px',
              margin: '0 auto'
            }}
          >
            {[
              { number: '50K+', label: 'Active Traders' },
              { number: '₹100Cr+', label: 'Trading Volume' },
              { number: '99.9%', label: 'Uptime' },
              { number: '24/7', label: 'Support' }
            ].map((stat, index) => (
              <div key={index} style={{ textAlign: 'center' }}>
                <div style={{ 
                  color: '#00d4aa',
                  fontSize: '2.5rem',
                  fontWeight: '800',
                  marginBottom: '0.5rem'
                }}>
                  {stat.number}
                </div>
                <div style={{ 
                  color: '#64748b',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </motion.div>
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
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#0f172a'
            }}>
              Why Choose V4 Fintech Solutions?
            </h2>
            <p style={{ 
              color: '#64748b',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Experience the perfect blend of technology and expertise for your trading success
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '2rem'
          }}>
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{
                  background: '#ffffff',
                  padding: '2rem',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  textAlign: 'center'
                }}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = '#00d4aa';
                  e.target.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = '#e2e8f0';
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: '#f1f5f9',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 1.5rem',
                  color: '#00d4aa'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  marginBottom: '1rem',
                  color: '#0f172a'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: '#64748b',
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        padding: '6rem 2rem',
        background: '#f8fafc'
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
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '700',
              marginBottom: '1rem',
              color: '#0f172a'
            }}>
              Choose Your Plan
            </h2>
            <p style={{ 
              color: '#64748b',
              fontSize: '1.1rem',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Start with our free plan and upgrade as you grow
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem',
            alignItems: 'start'
          }}>
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                style={{
                  background: plan.popular ? '#00d4aa' : '#ffffff',
                  padding: '2rem',
                  borderRadius: '12px',
                  border: plan.popular ? 'none' : '1px solid #e2e8f0',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  transform: plan.popular ? 'scale(1.02)' : 'scale(1)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = plan.popular ? 'scale(1.03)' : 'scale(1.01)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = plan.popular ? 'scale(1.02)' : 'scale(1)';
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#ffffff',
                    color: '#00d4aa',
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: '600'
                  }}>
                    Most Popular
                  </div>
                )}
                
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ 
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: plan.popular ? '#ffffff' : '#0f172a'
                  }}>
                    {plan.name}
                  </h3>
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ 
                      fontSize: '2.5rem',
                      fontWeight: '800',
                      color: plan.popular ? '#ffffff' : '#0f172a'
                    }}>
                      {plan.price}
                    </span>
                    <span style={{ 
                      fontSize: '0.9rem',
                      color: plan.popular ? 'rgba(255, 255, 255, 0.8)' : '#64748b'
                    }}>
                      /{plan.period}
                    </span>
                  </div>
                </div>
                
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0' }}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      color: plan.popular ? '#ffffff' : '#374151',
                      fontSize: '0.9rem'
                    }}>
                      <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: plan.popular ? '#ffffff' : '#00d4aa',
                        flexShrink: 0
                      }} />
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link to="/signup" style={{ 
                    width: '100%',
                    padding: '0.75rem 1.5rem',
                    fontSize: '0.95rem',
                    background: plan.popular ? '#ffffff' : '#00d4aa',
                    color: plan.popular ? '#00d4aa' : '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '600',
                    display: 'inline-block',
                    textAlign: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.opacity = '1';
                  }}>
                    Get Started
                  </Link>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '6rem 2rem',
        background: '#00d4aa',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          style={{ maxWidth: '800px', margin: '0 auto' }}
        >
          <h2 style={{ 
            color: '#ffffff',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            fontWeight: '700',
            marginBottom: '1.5rem'
          }}>
            Ready to Start Trading?
          </h2>
          
          <p style={{ 
            color: '#ffffff',
            fontSize: '1.1rem',
            maxWidth: '600px',
            margin: '0 auto 2rem',
            lineHeight: '1.6',
            opacity: 0.9
          }}>
            Join thousands of traders who have already chosen V4 Fintech Solutions
            for their trading journey.
          </p>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to="/signup" style={{ 
              padding: '1rem 2rem',
              fontSize: '1.1rem',
              background: '#ffffff',
              color: '#00d4aa',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.opacity = '0.9';
            }}
            onMouseLeave={(e) => {
              e.target.style.opacity = '1';
            }}>
              Create Free Account
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#1e293b',
        borderTop: '1px solid #334155',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            marginBottom: '1rem'
          }}>
            <img 
              src={v4Logo} 
              alt="V4 Fintech Solutions" 
              style={{ 
                height: '60px', 
                width: 'auto',
                borderRadius: '8px',
                background: 'white',
                padding: '6px'
              }}
            />
          </div>
          <p style={{ 
            color: '#cbd5e1', 
            marginBottom: '0.5rem',
            fontSize: '0.95rem'
          }}>
            © 2024 V4 Fintech Solutions. All rights reserved.
          </p>
          <p style={{ 
            color: '#94a3b8', 
            fontSize: '0.875rem'
          }}>
            Where Investment Meets Innovation
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 