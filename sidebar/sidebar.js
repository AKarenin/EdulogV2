import React from 'react';
import { Link } from 'react-router-dom';

function Sidebar() {
  return (
    <div style={{
      position: 'fixed',
      bottom: 20,
      left: 20,
      backgroundColor: '#f8f9fa',
      padding: '10px 15px',
      borderRadius: '5px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    }}>
      <Link to="/updates" style={{ display: 'block', marginBottom: '10px', textDecoration: 'none', color: '#007bff' }}>
        Updates
      </Link>
      <Link to="/faq" style={{ display: 'block', marginBottom: '10px', textDecoration: 'none', color: '#007bff' }}>
        FAQ
      </Link>
      <button
        onClick={() => {
          console.log('Logout Clicked');
        }}
        style={{
          display: 'block',
          background: '#f44336',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          cursor: 'pointer',
          borderRadius: '5px',
          width: '100%',
        }}
      >
        Logout
      </button>
    </div>
  );
}

export default Sidebar;
