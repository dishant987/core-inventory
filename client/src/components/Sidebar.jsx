import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Package, LayoutDashboard, Database, Tags, MapPin, 
  ArrowLeftRight, History, Settings, User, LogOut, 
  ChevronRight, Warehouse
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Products', path: '/products', icon: <Package size={20} /> },
    { name: 'Categories', path: '/categories', icon: <Tags size={20} /> },
    { name: 'Locations', path: '/locations', icon: <MapPin size={20} /> },
    { name: 'Operations', path: '/operations', icon: <ArrowLeftRight size={20} /> },
    { name: 'Move History', path: '/operations/history', icon: <History size={20} /> },
  ];

  const settingsItems = [
    { name: 'Warehouse', path: '/locations', icon: <Warehouse size={20} /> },
  ];

  const handleLogoutConfirm = () => {
    logout();
    setLogoutModalOpen(false);
    navigate('/login');
  };

  const NavItem = ({ item }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link to={item.path} style={{ textDecoration: 'none' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '0.875rem 1.25rem',
          margin: '0.25rem 0.75rem',
          borderRadius: '12px',
          color: isActive ? 'white' : '#94a3b8',
          background: isActive ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)' : 'transparent',
          border: isActive ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid transparent',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
          fontWeight: isActive ? 600 : 500
        }}
        onMouseOver={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = 'white';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }
        }}
        onMouseOut={(e) => {
          if (!isActive) {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.background = 'transparent';
          }
        }}
        >
          {item.icon}
          <span style={{ flex: 1 }}>{item.name}</span>
          {isActive && <ChevronRight size={14} />}
        </div>
      </Link>
    );
  };

  return (
    <div style={{
      width: '280px',
      height: '100vh',
      background: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.05)',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '36px', height: '36px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Package color="white" size={20} />
        </div>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>StockFlow IMS</h2>
      </div>

      {/* Navigation Groups */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
        <p style={{ padding: '0 1.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Main Menu</p>
        {menuItems.map(item => <NavItem key={item.path} item={item} />)}

        <p style={{ padding: '0 1.75rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginTop: '2rem', marginBottom: '0.75rem' }}>Setup</p>
        {settingsItems.map(item => <NavItem key={item.name} item={item} />)}
      </div>

      {/* Profile Section (Left Sidebar Menu) */}
      <div style={{ 
        padding: '1.5rem', 
        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
        background: 'rgba(30, 41, 59, 0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
           <div style={{
             width: '40px', height: '40px', borderRadius: '12px',
             background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             fontWeight: 700, color: 'white'
           }}>
             {user?.name?.charAt(0).toUpperCase()}
           </div>
           <div style={{ overflow: 'hidden' }}>
             <p style={{ margin: 0, fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</p>
             <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</p>
           </div>
        </div>

        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <button style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
            background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '10px', color: '#cbd5e1', cursor: 'pointer', marginBottom: '0.5rem', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)'}
          >
            <User size={16} /> <span style={{fontSize: '0.9rem'}}>Profile</span>
          </button>
        </Link>
        <button 
          onClick={() => setLogoutModalOpen(true)}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem',
            background: 'transparent', border: 'none', borderRadius: '10px', color: '#ef4444', 
            cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.9rem'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
          onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>

      {/* Logout Modal */}
      {logoutModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 1)', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px', padding: '2rem', width: '90%', maxWidth: '350px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', textAlign: 'center'
          }}>
            <h3 style={{ color: 'white', margin: '0 0 1rem 0' }}>Confirm Logout</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>Are you sure you want to exit?</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => setLogoutModalOpen(false)}
                style={{ flex: 1, padding: '0.6rem', background: 'transparent', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer' }}
              >Cancel</button>
              <button 
                onClick={handleLogoutConfirm}
                style={{ flex: 1, padding: '0.6rem', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
              >Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
