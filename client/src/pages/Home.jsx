import React from 'react';
import Navbar from '../components/Navbar';

const Home = () => {
  return (
    <div style={{
      minHeight: '100vh', 
      padding: '2rem', 
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
      color: '#f8fafc',
      fontFamily: "'Inter', sans-serif"
    }}>
      <Navbar />

      <div style={{
        background: 'rgba(30, 41, 59, 0.4)',
        padding: '3rem',
        borderRadius: '20px',
        border: '1px solid rgba(255,255,255,0.05)',
        textAlign: 'center'
      }}>
        <h2 style={{fontSize: '2rem', marginBottom: '1rem'}}>Dashboard</h2>
        <p style={{color: '#94a3b8', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6'}}>
          You are successfully authenticated. This is the main dashboard of the inventory system. Here you would normally see analytics, latest products, and stock status.
        </p>
      </div>
    </div>
  );
};

export default Home;
