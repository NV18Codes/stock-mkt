import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  Smartphone, 
  Monitor, 
  Tablet,
  ArrowRight,
  CheckCircle,
  Star,
  BarChart3,
  Globe,
  Lock
} from 'lucide-react';

const LandingPage = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const features = [
    {
      icon: <BarChart3 size={32} />,
      title: "Multi-Broker Integration",
      description: "Connect Angel One, Zerodha, Upstox, and more from a single dashboard"
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Real-Time Analytics",
      description: "Advanced charts, technical indicators, and portfolio tracking"
    },
    {
      icon: <Shield size={32} />,
      title: "Secure & Reliable",
      description: "Bank-grade security with 256-bit encryption and 2FA protection"
    },
    {
      icon: <Zap size={32} />,
      title: "Lightning Fast",
      description: "Ultra-low latency execution with real-time market data"
    },
    {
      icon: <Globe size={32} />,
      title: "Cross-Platform",
      description: "Trade seamlessly across desktop, tablet, and mobile devices"
    },
    {
      icon: <Users size={32} />,
      title: "Community Support",
      description: "Join thousands of traders in our active community"
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "₹499",
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
      price: "₹1,499",
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
    <div style={{ overflowX: 'hidden', background: 'var(--background-color)' }}>
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
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <motion.div 
          style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
          whileHover={{ scale: 1.05 }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            background: 'var(--primary-color)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '18px'
          }}>
            T
          </div>
          <span style={{ 
            color: 'var(--text-primary)', 
            fontSize: '1.5rem', 
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>
            TradePro
          </span>
        </motion.div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Link to="/login" style={{
            color: 'var(--text-secondary)',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            fontWeight: '500',
            transition: 'all 0.2s ease'
          }}>
            Sign In
          </Link>
          <Link to="/signup" style={{
            background: 'var(--primary-color)',
            color: 'white',
            textDecoration: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: '600',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            Get Started
            <ArrowRight size={16} />
          </Link>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '8rem 2rem 6rem',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Background Pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%232563eb' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.5
        }} />
        
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          style={{ position: 'relative', zIndex: 2 }}
        >
          <motion.h1 
            style={{ 
              color: 'var(--text-primary)',
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: '800',
              lineHeight: '1.1',
              marginBottom: '1.5rem',
              letterSpacing: '-0.025em'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Trade Smarter with
            <span style={{ 
              color: 'var(--primary-color)',
              display: 'block'
            }}>
              Professional Tools
            </span>
          </motion.h1>
          
          <motion.p 
            style={{ 
              color: 'var(--text-secondary)',
              fontSize: 'clamp(1.1rem, 2.5vw, 1.3rem)',
              maxWidth: '700px',
              margin: '0 auto 3rem',
              lineHeight: '1.6'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Connect multiple broker accounts, track your portfolio performance,
            and make informed trading decisions with real-time market data and advanced analytics.
          </motion.p>

          <motion.div 
            style={{ 
              display: 'flex', 
              gap: '1rem', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/signup" style={{ 
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: 'var(--primary-color)',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: 'var(--shadow-lg)'
              }}>
                Start Trading Free
                <ArrowRight size={18} />
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link to="/login" style={{ 
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                background: 'white',
                color: 'var(--text-primary)',
                textDecoration: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                border: '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                View Demo
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          style={{
            display: 'flex',
            gap: '3rem',
            marginTop: '4rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}
        >
          {[
            { number: '50K+', label: 'Active Traders' },
            { number: '₹500Cr+', label: 'Trading Volume' },
            { number: '99.9%', label: 'Uptime' },
            { number: '24/7', label: 'Support' }
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              style={{ textAlign: 'center' }}
            >
              <div style={{
                fontSize: '2rem',
                fontWeight: '800',
                color: 'var(--primary-color)',
                marginBottom: '0.5rem'
              }}>
                {stat.number}
              </div>
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}>
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: '6rem 2rem', 
        background: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 style={{ 
              color: 'var(--text-primary)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              marginBottom: '1rem',
              letterSpacing: '-0.025em'
            }}>
              Why Choose TradePro?
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.2rem',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Experience the future of trading with our comprehensive platform designed for professionals
            </p>
          </motion.div>

          <motion.div 
            style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '2rem'
            }}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                style={{ 
                  background: 'white',
                  padding: '2.5rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'var(--primary-color)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem',
                  color: 'white'
                }}>
                  {feature.icon}
                </div>
                <h3 style={{ 
                  color: 'var(--text-primary)', 
                  marginBottom: '1rem', 
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  {feature.title}
                </h3>
                <p style={{ 
                  color: 'var(--text-secondary)', 
                  lineHeight: '1.6',
                  fontSize: '0.95rem'
                }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section style={{
        padding: '6rem 2rem',
        background: 'var(--background-color)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '4rem' }}
          >
            <h2 style={{ 
              color: 'var(--text-primary)',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: '700',
              marginBottom: '1rem',
              letterSpacing: '-0.025em'
            }}>
              Choose Your Plan
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '1.2rem',
              maxWidth: '600px',
              margin: '0 auto',
              lineHeight: '1.6'
            }}>
              Start with our free trial and upgrade as you grow
            </p>
          </motion.div>

          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              maxWidth: '1000px',
              margin: '0 auto'
            }}
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {plans.map((plan, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                style={{
                  background: plan.popular ? 'white' : 'white',
                  border: plan.popular ? '2px solid var(--primary-color)' : '1px solid var(--border-color)',
                  borderRadius: '16px',
                  padding: '2.5rem',
                  position: 'relative',
                  boxShadow: plan.popular ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
                  transition: 'all 0.3s ease'
                }}
              >
                {plan.popular && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--primary-color)',
                    color: 'white',
                    padding: '0.5rem 1.5rem',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '600'
                  }}>
                    Most Popular
                  </div>
                )}
                
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                  <h3 style={{ 
                    color: 'var(--text-primary)', 
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    marginBottom: '1rem'
                  }}>
                    {plan.name}
                  </h3>
                  <div style={{
                    fontSize: '3rem',
                    fontWeight: '800',
                    color: 'var(--primary-color)',
                    marginBottom: '0.5rem'
                  }}>
                    {plan.price}
                  </div>
                  <div style={{
                    color: 'var(--text-secondary)',
                    fontSize: '1rem'
                  }}>
                    {plan.period}
                  </div>
                </div>

                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: '0 0 2rem 0'
                }}>
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      marginBottom: '1rem',
                      color: 'var(--text-secondary)',
                      fontSize: '0.95rem'
                    }}>
                      <CheckCircle size={18} color="var(--success-color)" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to="/signup" style={{
                  width: '100%',
                  padding: '1rem',
                  background: plan.popular ? 'var(--primary-color)' : 'white',
                  color: plan.popular ? 'white' : 'var(--primary-color)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  textAlign: 'center',
                  display: 'block',
                  border: plan.popular ? 'none' : '2px solid var(--primary-color)',
                  transition: 'all 0.2s ease'
                }}>
                  Get Started
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%)',
        textAlign: 'center'
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 style={{ 
            color: 'white',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: '700',
            marginBottom: '1rem',
            letterSpacing: '-0.025em'
          }}>
            Ready to Start Trading?
          </h2>
          
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.9)',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto 3rem',
            lineHeight: '1.6'
          }}>
            Join thousands of traders who have already chosen TradePro
            for their trading journey.
          </p>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link to="/signup" style={{ 
              padding: '1.2rem 3rem',
              fontSize: '1.2rem',
              background: 'white',
              color: 'var(--primary-color)',
              textDecoration: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.75rem',
              boxShadow: 'var(--shadow-xl)'
            }}>
              Create Free Account
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{
        background: 'white',
        borderTop: '1px solid var(--border-color)',
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
            <div style={{
              width: '32px',
              height: '32px',
              background: 'var(--primary-color)',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px'
            }}>
              T
            </div>
            <span style={{ 
              color: 'var(--text-primary)', 
              fontSize: '1.25rem', 
              fontWeight: '700'
            }}>
              TradePro
            </span>
          </div>
          <p style={{ 
            color: 'var(--text-secondary)', 
            marginBottom: '1rem',
            fontSize: '0.95rem'
          }}>
            © 2024 TradePro. All rights reserved.
          </p>
          <p style={{ 
            color: 'var(--text-muted)', 
            fontSize: '0.875rem'
          }}>
            Trade smarter, not harder
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 