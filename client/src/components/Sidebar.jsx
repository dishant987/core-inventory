import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Package, LayoutDashboard, Tags, MapPin,
  ArrowLeftRight, History, User, LogOut,
  ChevronRight, Warehouse, Menu, X, Users, Layers
} from 'lucide-react';
import './Sidebar.css';

const menuItems = [
  { name: 'Dashboard',    path: '/',                  icon: LayoutDashboard },
  { name: 'Inventory (Stock Levels)', path: '/inventory', icon: Layers },
  { name: 'Products',     path: '/products',           icon: Package },
  { name: 'Categories',   path: '/categories',         icon: Tags },
  { name: 'Operations (All)',   path: '/operations',         icon: ArrowLeftRight },
  { name: 'Stock Ledger', path: '/operations/history', icon: History },
];

const setupItems = [
  { name: 'Warehouse / Locations', path: '/locations', icon: Warehouse },
  { name: 'Partners (Vendors/Customers)', path: '/partners', icon: Users },
];

const adminItems = [
  { name: 'Manage Users', path: '/users', icon: Users },
];

const Sidebar = ({ mobileOpen, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [logoutModal, setLogoutModal] = useState(false);

  // Close drawer on route change (mobile)
  useEffect(() => { onClose?.(); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    setLogoutModal(false);
    navigate('/login');
  };

  const NavItem = ({ item }) => {
    const Icon = item.icon;
    const active = location.pathname === item.path;
    return (
      <Link to={item.path} className={`nav-item ${active ? 'active' : ''}`}>
        <Icon size={20} className="nav-icon" />
        <span className="nav-label">{item.name}</span>
        {active && <ChevronRight size={14} className="nav-chevron" />}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        {/* Brand */}
        <div className="sidebar-brand">
          <div className="brand-logo">
            <Package color="white" size={20} />
          </div>
          <h2 className="brand-name">CoreInventory</h2>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <p className="nav-section-label">Main Menu</p>
          {menuItems.map(item => <NavItem key={item.path} item={item} />)}

          <p className="nav-section-label" style={{ marginTop: '2rem' }}>Setup</p>
          {setupItems.map(item => <NavItem key={item.name} item={item} />)}

          {user?.role === 'Admin' && (
            <>
              <p className="nav-section-label" style={{ marginTop: '2rem' }}>Administration</p>
              {adminItems.map(item => <NavItem key={item.name} item={item} />)}
            </>
          )}
        </nav>

        {/* Profile footer */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
          </div>

          <Link to="/profile" className="footer-btn">
            <User size={16} /> <span>Profile</span>
          </Link>
          <button className="footer-btn danger" onClick={() => setLogoutModal(true)}>
            <LogOut size={16} /> <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Logout confirm modal */}
      {logoutModal && (
        <div className="logout-backdrop">
          <div className="logout-modal">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="logout-actions">
              <button className="btn-cancel" onClick={() => setLogoutModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleLogout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
