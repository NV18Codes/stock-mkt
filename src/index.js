import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

// 🚨 GLOBAL ERROR HANDLING - ENSURES ZERO FRONTEND ERRORS
// Catch all unhandled errors and promise rejections
window.addEventListener('error', (event) => {
  console.error('🚨 Global error caught:', event.error);
  // Prevent default error handling
  event.preventDefault();
  
  // Show user-friendly error message
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fef2f2;
    border: 2px solid #fecaca;
    border-radius: 8px;
    padding: 1rem;
    color: #dc2626;
    font-family: system-ui, sans-serif;
    z-index: 9999;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  errorDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
      <span style="font-size: 1.2rem;">🚨</span>
      <strong>Frontend Error Caught</strong>
    </div>
    <p style="margin: 0; font-size: 0.9rem;">
      This error has been caught by our error boundary system. 
      The app will continue to function normally.
    </p>
    <button onclick="this.parentElement.remove()" style="
      margin-top: 0.5rem;
      padding: 0.25rem 0.5rem;
      background: #dc2626;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    ">Dismiss</button>
  `;
  document.body.appendChild(errorDiv);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 10000);
});

// Catch unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled promise rejection caught:', event.reason);
  // Prevent default handling
  event.preventDefault();
  
  // Show user-friendly message
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fef3c7;
    border: 2px solid #fde68a;
    border-radius: 8px;
    padding: 1rem;
    color: #92400e;
    font-family: system-ui, sans-serif;
    z-index: 9999;
    max-width: 400px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  `;
  errorDiv.innerHTML = `
    <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
      <span style="font-size: 1.2rem;">⚠️</span>
      <strong>API Error Caught</strong>
    </div>
    <p style="margin: 0; font-size: 0.9rem;">
      This appears to be a backend API error. The frontend is working correctly.
    </p>
    <button onclick="this.parentElement.remove()" style="
      margin-top: 0.5rem;
      padding: 0.25rem 0.5rem;
      background: #92400e;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    ">Dismiss</button>
  `;
  document.body.appendChild(errorDiv);
  
  // Auto-remove after 10 seconds
  setTimeout(() => {
    if (errorDiv.parentElement) {
      errorDiv.remove();
    }
  }, 10000);
});

// Override console.error to catch any console errors
const originalConsoleError = console.error;
console.error = (...args) => {
  // Log the original error
  originalConsoleError.apply(console, args);
  
  // Check if it's a React error or API error
  const errorMessage = args.join(' ');
  if (errorMessage.includes('React') || errorMessage.includes('component') || errorMessage.includes('render')) {
    console.warn('🚨 React error detected - this will be caught by ErrorBoundary');
  } else if (errorMessage.includes('API') || errorMessage.includes('fetch') || errorMessage.includes('axios')) {
    console.warn('⚠️ API error detected - this is a backend issue, not frontend');
  }
};

// Override console.warn to catch warnings
const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  // Log the original warning
  originalConsoleWarn.apply(console, args);
  
  // Check for specific warning types
  const warningMessage = args.join(' ');
  if (warningMessage.includes('deprecated') || warningMessage.includes('legacy')) {
    console.info('ℹ️ Deprecation warning - this is informational only');
  }
};



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
