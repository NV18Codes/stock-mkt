import React from 'react';
import { Link } from 'react-router-dom';

const plans = [
  { name: 'Basic', price: 499, features: ['Real-time Data', 'Basic Support', 'Portfolio Tracking'] },
  { name: 'Pro', price: 1499, features: ['All Basic Features', 'Advanced Analytics', 'Priority Support', 'Broker Integration'] },
  { name: 'Elite', price: 2999, features: ['All Pro Features', 'Dedicated Account Manager', 'Early Access to New Features'] },
];

const LandingPage = () => (
  <div style={{ minHeight: '100vh', background: '#000', color: '#fff', fontFamily: 'Segoe UI, Arial, sans-serif' }}>
    {/* Hero Section */}
    <div style={{ padding: '3em 1em 2em 1em', textAlign: 'center', background: 'linear-gradient(90deg, #000 60%, #007bff 100%)' }}>
      <div style={{ fontSize: '3rem', fontWeight: 700, color: '#fff', letterSpacing: 2, marginBottom: '0.2em' }}>
        <span role="img" aria-label="logo" style={{ marginRight: 12 }}>📈</span> Stock Trading Portal
      </div>
      <div style={{ fontSize: '1.3rem', color: '#cce3ff', marginBottom: '1.5em' }}>
        Empowering Indian traders with seamless, secure, and smart trading solutions.
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '1em', marginBottom: '1.5em' }}>
        <Link to="/login"><button className="btn">Login</button></Link>
        <Link to="/signup"><button className="btn" style={{ background: '#fff', color: '#007bff' }}>Sign Up</button></Link>
      </div>
    </div>

    {/* About Company & Trading */}
    <div style={{ maxWidth: 1000, margin: '2em auto', display: 'flex', flexWrap: 'wrap', gap: '2em', justifyContent: 'center' }}>
      <div style={{ flex: 1, minWidth: 280 }}>
        <h2 style={{ color: '#007bff' }}>About Us</h2>
        <p style={{ color: '#fff', lineHeight: 1.7 }}>
          Stock Trading Portal is a next-generation platform designed for Indian investors and traders. We provide real-time data, advanced analytics, and seamless broker integration to help you make smarter trading decisions. Our mission is to democratize access to financial markets with technology and transparency.
        </p>
      </div>
      <div style={{ flex: 1, minWidth: 280 }}>
        <h2 style={{ color: '#007bff' }}>About Trading</h2>
        <p style={{ color: '#fff', lineHeight: 1.7 }}>
          Trading in the stock market can be rewarding and exciting. With our platform, you can access live market data, analyze trends, and execute trades with ease. Whether you are a beginner or a pro, our tools are built to support your journey.
        </p>
      </div>
    </div>

    {/* Subscription Models */}
    <div style={{ background: '#111', padding: '2em 0' }}>
      <h2 style={{ color: '#007bff', textAlign: 'center', marginBottom: '1em' }}>Subscription Plans</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2em', flexWrap: 'wrap' }}>
        {plans.map(plan => (
          <div key={plan.name} className="card" style={{ minWidth: 240, maxWidth: 300, background: '#181c24', border: '1px solid #007bff', borderRadius: 12, padding: '2em 1.5em', textAlign: 'center', boxShadow: '0 2px 12px #0006' }}>
            <h3 style={{ color: '#fff', marginBottom: 8 }}>{plan.name}</h3>
            <div style={{ fontSize: '2em', color: '#007bff', marginBottom: 8 }}>₹{plan.price} <span style={{ fontSize: '0.5em', color: '#fff' }}>/mo</span></div>
            <ul style={{ color: '#cce3ff', textAlign: 'left', margin: '1em 0', paddingLeft: 18 }}>
              {plan.features.map(f => <li key={f}>{f}</li>)}
            </ul>
            <button className="btn" style={{ width: '100%', marginTop: 10 }}>Subscribe</button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default LandingPage; 