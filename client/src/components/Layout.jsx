import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '280px', // Matches sidebar width
        padding: '2rem',
        minHeight: '100vh',
        boxSizing: 'border-box'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
