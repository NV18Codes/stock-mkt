import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  return (
    <div>
      {/* Hero Section */}
      <section style={{ 
        padding: '4em 2em',
        background: 'linear-gradient(135deg, #111 0%, #000 100%)',
        textAlign: 'center',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <h1 style={{ 
          color: '#fff',
          fontSize: '3em',
          marginBottom: '0.5em',
          maxWidth: '800px'
        }}>
          Trade Smarter with Our
          <span style={{ color: '#007bff', display: 'block' }}>
            Advanced Trading Portal
          </span>
        </h1>
        
        <p style={{ 
          color: '#cce3ff',
          fontSize: '1.2em',
          maxWidth: '600px',
          margin: '0 auto 2em'
        }}>
          Connect multiple broker accounts, track your portfolio performance,
          and make informed trading decisions with real-time market data.
        </p>

        <div style={{ display: 'flex', gap: '1em', justifyContent: 'center' }}>
          <Link to="/signup" className="btn" style={{ 
            padding: '1em 2em',
            fontSize: '1.1em',
            background: '#007bff'
          }}>
            Get Started
          </Link>
          <Link to="/login" className="btn" style={{ 
            padding: '1em 2em',
            fontSize: '1.1em',
            background: 'transparent',
            border: '2px solid #007bff'
          }}>
            Login
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4em 2em', background: '#111' }}>
        <h2 style={{ 
          color: '#fff',
          textAlign: 'center',
          marginBottom: '2em'
        }}>
          Why Choose Our Platform?
        </h2>

        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2em',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          <div className="card" style={{ padding: '2em' }}>
            <h3 style={{ color: '#007bff', marginBottom: '1em' }}>
              Multi-Broker Integration
            </h3>
            <p style={{ color: '#cce3ff' }}>
              Connect and manage multiple broker accounts from a single dashboard.
              Supported brokers include Angel One, Zerodha, Groww, and Upstox.
            </p>
          </div>

          <div className="card" style={{ padding: '2em' }}>
            <h3 style={{ color: '#007bff', marginBottom: '1em' }}>
              Real-Time Portfolio Tracking
            </h3>
            <p style={{ color: '#cce3ff' }}>
              Monitor your investments, track P&L, and analyze portfolio performance
              with interactive charts and detailed analytics.
            </p>
          </div>

          <div className="card" style={{ padding: '2em' }}>
            <h3 style={{ color: '#007bff', marginBottom: '1em' }}>
              Advanced Trading Tools
            </h3>
            <p style={{ color: '#cce3ff' }}>
              Access technical indicators, option chain analysis, and market scanners
              to make informed trading decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section style={{ 
        padding: '4em 2em',
        background: 'linear-gradient(135deg, #000 0%, #111 100%)'
      }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2em',
          maxWidth: '1000px',
          margin: '0 auto',
          textAlign: 'center'
        }}>
          <div>
            <h3 style={{ color: '#007bff', fontSize: '2.5em', marginBottom: '0.2em' }}>
              10K+
            </h3>
            <p style={{ color: '#cce3ff' }}>Active Traders</p>
          </div>

          <div>
            <h3 style={{ color: '#007bff', fontSize: '2.5em', marginBottom: '0.2em' }}>
              ₹100Cr+
            </h3>
            <p style={{ color: '#cce3ff' }}>Daily Trading Volume</p>
          </div>

          <div>
            <h3 style={{ color: '#007bff', fontSize: '2.5em', marginBottom: '0.2em' }}>
              4
            </h3>
            <p style={{ color: '#cce3ff' }}>Supported Brokers</p>
          </div>

          <div>
            <h3 style={{ color: '#007bff', fontSize: '2.5em', marginBottom: '0.2em' }}>
              99.9%
            </h3>
            <p style={{ color: '#cce3ff' }}>Uptime</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{ 
        padding: '4em 2em',
        background: '#111',
        textAlign: 'center'
      }}>
        <h2 style={{ 
          color: '#fff',
          marginBottom: '1em',
          maxWidth: '600px',
          margin: '0 auto 1em'
        }}>
          Ready to Start Trading?
        </h2>
        
        <p style={{ 
          color: '#cce3ff',
          marginBottom: '2em',
          maxWidth: '500px',
          margin: '0 auto 2em'
        }}>
          Join thousands of traders who have already chosen our platform
          for their trading journey.
        </p>

        <Link to="/signup" className="btn" style={{ 
          padding: '1em 3em',
          fontSize: '1.1em',
          background: '#007bff'
        }}>
          Create Free Account
        </Link>
      </section>
    </div>
  );
};

export default LandingPage; 