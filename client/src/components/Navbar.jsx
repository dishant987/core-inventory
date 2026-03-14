import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Package, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleLogoutConfirm = () => {
    logout();
    setLogoutModalOpen(false);
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav style={{
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      background: 'rgba(30, 41, 59, 0.7)',
      padding: '1rem 2rem',
      borderRadius: '16px',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <Package color="#a855f7" />
            <h1 style={{margin: 0, fontSize: '1.25rem', fontWeight: 600}}>Inventory System</h1>
          </div>
        </Link>
        <div style={{ display: 'flex', gap: '1.5rem', marginLeft: '1rem' }}>
          <Link to="/products" style={{ textDecoration: 'none', color: '#cbd5e1', fontWeight: 500, transition: 'color 0.2s' }} 
            onMouseOver={(e) => e.target.style.color = 'white'} 
            onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Products</Link>
          <Link to="/categories" style={{ textDecoration: 'none', color: '#cbd5e1', fontWeight: 500, transition: 'color 0.2s' }} 
            onMouseOver={(e) => e.target.style.color = 'white'} 
            onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Categories</Link>
        </div>
      </div>
      
      <div style={{display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative'}} ref={dropdownRef}>
        <div 
          onClick={() => setDropdownOpen(!dropdownOpen)}
          style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.5rem 1rem',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <div style={{
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: 'white'
          }}>
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <span style={{color: '#f8fafc', fontWeight: 500, fontSize: '0.95rem'}}>
            {user?.name}
          </span>
          <ChevronDown size={16} color="#94a3b8" style={{marginLeft: '0.25rem'}} />
        </div>

        {dropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            right: 0,
            background: 'rgba(30, 41, 59, 0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '0.5rem',
            width: '200px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <div style={{
              padding: '0.5rem 1rem',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              marginBottom: '0.25rem'
            }}>
              <p style={{margin: 0, fontSize: '0.85rem', color: '#94a3b8'}}>Signed in as</p>
              <p style={{margin: 0, fontWeight: 600, fontSize: '0.95rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'}}>
                {user?.email}
              </p>
            </div>
            
            <Link to="/profile" style={{ textDecoration: 'none' }} onClick={() => setDropdownOpen(false)}>
              <button style={{
                width: '100%',
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'transparent',
                color: '#f8fafc',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <User size={16} color="#a855f7" /> My Profile
              </button>
            </Link>

            <button 
              onClick={() => {
                setDropdownOpen(false);
                setLogoutModalOpen(true);
              }}
              style={{
                width: '100%',
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                background: 'transparent',
                color: '#ef4444',
                border: 'none',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                fontSize: '0.95rem'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {logoutModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--card-bg, rgba(30, 41, 59, 0.95))',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px',
            padding: '2rem',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            textAlign: 'center',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{
              width: '64px', height: '64px',
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: '#ef4444'
            }}>
              <LogOut size={32} />
            </div>
            
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.5rem', color: '#f8fafc' }}>
              Confirm Logout
            </h3>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: '1.5' }}>
              Are you sure you want to sign out of your account? You will need to login again to access your inventory.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button 
                onClick={() => setLogoutModalOpen(false)}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  color: '#f8fafc',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
              >
                Cancel
              </button>
              <button 
                onClick={handleLogoutConfirm}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(239, 68, 68, 0.39)';
                }}
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
