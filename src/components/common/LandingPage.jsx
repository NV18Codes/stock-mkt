import React from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaShieldAlt, FaRocket, FaUsers, FaMobileAlt, FaDesktop, FaTabletAlt } from 'react-icons/fa';

const LandingPage = () => {
  return (
    <div style={{ overflowX: 'hidden' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.9)',
        backdropFilter: 'blur(10px)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '2rem', color: '#007bff' }}>📈</span>
          <span style={{ color: '#fff', fontSize: '1.5rem', fontWeight: 'bold' }}>TradePro</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login" style={{
            color: '#fff',
            textDecoration: 'none',
            padding: '0.5rem 1rem',
            borderRadius: '5px',
            transition: 'all 0.3s ease'
          }}>Login</Link>
          <Link to="/signup" style={{
            background: '#007bff',
            color: '#fff',
            textDecoration: 'none',
            padding: '0.5rem 1.5rem',
            borderRadius: '5px',
            transition: 'all 0.3s ease'
          }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ 
        padding: '8rem 2rem 4rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Animation */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          animation: 'float 20s ease-in-out infinite'
        }} />
        
        <h1 style={{ 
          color: '#fff',
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          marginBottom: '1rem',
          maxWidth: '900px',
          fontWeight: 'bold',
          lineHeight: 1.2,
          zIndex: 2,
          position: 'relative'
        }}>
          Trade Smarter with Our
          <span style={{ 
            color: '#fff', 
            display: 'block',
            background: 'linear-gradient(45deg, #fff, #f0f8ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Advanced Trading Portal
          </span>
        </h1>
        
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)',
          fontSize: 'clamp(1rem, 2.5vw, 1.3rem)',
          maxWidth: '700px',
          margin: '0 auto 3rem',
          lineHeight: 1.6,
          zIndex: 2,
          position: 'relative'
        }}>
          Connect multiple broker accounts, track your portfolio performance,
          and make informed trading decisions with real-time market data.
        </p>

        <div style={{ 
          display: 'flex', 
          gap: '1rem', 
          justifyContent: 'center',
          flexWrap: 'wrap',
          zIndex: 2,
          position: 'relative'
        }}>
          <Link to="/signup" style={{ 
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            background: '#fff',
            color: '#667eea',
            textDecoration: 'none',
            borderRadius: '50px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            Get Started Free
          </Link>
          <Link to="/login" style={{ 
            padding: '1rem 2.5rem',
            fontSize: '1.1rem',
            background: 'transparent',
            color: '#fff',
            textDecoration: 'none',
            borderRadius: '50px',
            border: '2px solid #fff',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}>
            Login
          </Link>
        </div>

        {/* Floating Elements */}
        <div style={{
          position: 'absolute',
          top: '20%',
          left: '10%',
          fontSize: '3rem',
          opacity: 0.1,
          animation: 'float 6s ease-in-out infinite'
        }}>📊</div>
        <div style={{
          position: 'absolute',
          top: '30%',
          right: '15%',
          fontSize: '2.5rem',
          opacity: 0.1,
          animation: 'float 8s ease-in-out infinite'
        }}>💹</div>
        <div style={{
          position: 'absolute',
          bottom: '20%',
          left: '15%',
          fontSize: '2rem',
          opacity: 0.1,
          animation: 'float 7s ease-in-out infinite'
        }}>📈</div>
      </section>

      {/* Features Section */}
      <section style={{ 
        padding: '6rem 2rem', 
        background: '#f8f9fa'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ 
            color: '#333',
            textAlign: 'center',
            marginBottom: '1rem',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold'
          }}>
            Why Choose Our Platform?
          </h2>
          <p style={{
            textAlign: 'center',
            color: '#666',
            fontSize: '1.2rem',
            marginBottom: '4rem',
            maxWidth: '600px',
            margin: '0 auto 4rem'
          }}>
            Experience the future of trading with our comprehensive platform
          </p>

          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '2rem'
          }}>
            <div style={{ 
              background: '#fff',
              padding: '2.5rem',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: '#fff'
              }}>
                <FaChartLine />
              </div>
              <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Multi-Broker Integration
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>
                Connect and manage multiple broker accounts from a single dashboard.
                Supported brokers include Angel One, Zerodha, Groww, and Upstox.
              </p>
            </div>

            <div style={{ 
              background: '#fff',
              padding: '2.5rem',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: '#fff'
              }}>
                <FaChartLine />
              </div>
              <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Real-Time Portfolio Tracking
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>
                Monitor your investments, track P&L, and analyze portfolio performance
                with interactive charts and detailed analytics.
              </p>
            </div>

            <div style={{ 
              background: '#fff',
              padding: '2.5rem',
              borderRadius: '15px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              textAlign: 'center',
              transition: 'transform 0.3s ease',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
                fontSize: '2rem',
                color: '#fff'
              }}>
                <FaRocket />
              </div>
              <h3 style={{ color: '#333', marginBottom: '1rem', fontSize: '1.5rem' }}>
                Advanced Trading Tools
              </h3>
              <p style={{ color: '#666', lineHeight: 1.6 }}>
                Access technical indicators, option chain analysis, and market scanners
                to make informed trading decisions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Model Section */}
      <section style={{
        padding: '5rem 2rem',
        background: '#fff',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ color: '#2c3e50', fontWeight: 700, fontSize: 'clamp(2rem, 4vw, 2.7rem)', marginBottom: '2rem' }}>
            Subscription Model
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: '2.5rem',
            justifyContent: 'center',
            alignItems: 'stretch',
            margin: '0 auto',
            maxWidth: 900
          }}>
            {/* Starter Plan */}
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: 15,
              padding: '2.5em 1.5em',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <h3 style={{ color: '#007bff', fontWeight: 700, fontSize: '1.3em', marginBottom: 8 }}>Starter</h3>
              <div style={{ color: '#2c3e50', fontWeight: 700, fontSize: '2.1em', marginBottom: 8 }}>₹499</div>
              <div style={{ color: '#6c757d', fontSize: 15, marginBottom: 12 }}>per month</div>
              <ul style={{ color: '#2c3e50', fontSize: 15, textAlign: 'left', margin: 0, padding: 0, listStyle: 'none' }}>
                <li>✔️ Basic Trading Tools</li>
                <li>✔️ Email Support</li>
                <li>✔️ 1 Broker Account</li>
              </ul>
            </div>
            {/* Pro Plan */}
            <div style={{
              background: '#f8f9fa',
              border: '2px solid #007bff',
              borderRadius: 15,
              padding: '2.5em 1.5em',
              boxShadow: '0 2px 8px rgba(0,123,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <div style={{
                position: 'absolute',
                top: '-1.5em',
                left: 0,
                right: 0,
                textAlign: 'center',
                fontWeight: 700,
                color: '#fff',
                background: '#007bff',
                borderRadius: '15px 15px 0 0',
                fontSize: 14,
                padding: '0.3em 0'
              }}>Most Popular</div>
              <h3 style={{ color: '#007bff', fontWeight: 700, fontSize: '1.3em', marginBottom: 8, marginTop: 16 }}>Pro</h3>
              <div style={{ color: '#2c3e50', fontWeight: 700, fontSize: '2.1em', marginBottom: 8 }}>₹1,499</div>
              <div style={{ color: '#6c757d', fontSize: 15, marginBottom: 12 }}>per month</div>
              <ul style={{ color: '#2c3e50', fontSize: 15, textAlign: 'left', margin: 0, padding: 0, listStyle: 'none' }}>
                <li>✔️ All Starter Features</li>
                <li>✔️ Advanced Analytics</li>
                <li>✔️ Priority Email & Chat Support</li>
                <li>✔️ Up to 3 Broker Accounts</li>
              </ul>
            </div>
            {/* Enterprise Plan */}
            <div style={{
              background: '#f8f9fa',
              border: '1px solid #e0e0e0',
              borderRadius: 15,
              padding: '2.5em 1.5em',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <h3 style={{ color: '#007bff', fontWeight: 700, fontSize: '1.3em', marginBottom: 8 }}>Enterprise</h3>
              <div style={{ color: '#2c3e50', fontWeight: 700, fontSize: '2.1em', marginBottom: 8 }}>₹4,999</div>
              <div style={{ color: '#6c757d', fontSize: 15, marginBottom: 12 }}>per month</div>
              <ul style={{ color: '#2c3e50', fontSize: 15, textAlign: 'left', margin: 0, padding: 0, listStyle: 'none' }}>
                <li>✔️ All Pro Features</li>
                <li>✔️ Dedicated Account Manager</li>
                <li>✔️ API Access</li>
                <li>✔️ Unlimited Broker Accounts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Responsive Design Section */}
      <section style={{ 
        padding: '6rem 2rem', 
        background: '#fff'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ 
            color: '#333',
            marginBottom: '1rem',
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            fontWeight: 'bold'
          }}>
            Trade Anywhere, Anytime
          </h2>
          <p style={{
            color: '#666',
            marginBottom: '4rem',
            fontSize: '1.2rem',
            maxWidth: '600px',
            margin: '0 auto 4rem'
          }}>
            Our platform works seamlessly across all your devices
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '3rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                color: '#667eea'
              }}>
                <FaDesktop />
              </div>
              <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Desktop</h3>
              <p style={{ color: '#666' }}>Full-featured trading experience</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                color: '#667eea'
              }}>
                <FaTabletAlt />
              </div>
              <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Tablet</h3>
              <p style={{ color: '#666' }}>Optimized for touch interaction</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '4rem',
                marginBottom: '1rem',
                color: '#667eea'
              }}>
                <FaMobileAlt />
              </div>
              <h3 style={{ color: '#333', marginBottom: '0.5rem' }}>Mobile</h3>
              <p style={{ color: '#666' }}>Trade on the go</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '6rem 2rem',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          color: '#fff',
          marginBottom: '1rem',
          fontSize: 'clamp(2rem, 4vw, 3rem)',
          fontWeight: 'bold'
        }}>
          Ready to Start Trading?
        </h2>
        
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.9)',
          marginBottom: '3rem',
          fontSize: '1.2rem',
          maxWidth: '600px',
          margin: '0 auto 3rem'
        }}>
          Join thousands of traders who have already chosen our platform
          for their trading journey.
        </p>

        <Link to="/signup" style={{ 
          padding: '1.2rem 3rem',
          fontSize: '1.2rem',
          background: '#fff',
          color: '#667eea',
          textDecoration: 'none',
          borderRadius: '50px',
          fontWeight: 'bold',
          transition: 'all 0.3s ease',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          display: 'inline-block'
        }}>
          Create Free Account
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        background: '#333',
        color: '#fff',
        padding: '3rem 2rem',
        textAlign: 'center'
      }}>
        <p style={{ marginBottom: '1rem' }}>© 2024 TradePro. All rights reserved.</p>
        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>
          Trade smarter, not harder
        </p>
      </footer>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @media (max-width: 768px) {
          nav {
            padding: 1rem;
          }
          
          nav > div:first-child span:last-child {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage; 