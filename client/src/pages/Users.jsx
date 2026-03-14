import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, PlusCircle, Edit2, Trash2, X, Users as UsersIcon, Shield, Mail, Key, UserCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import DeleteModal from '../components/DeleteModal';
import SearchBar from '../components/SearchBar';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Delete Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [formData, setFormData] = useState({
    loginId: '',
    name: '',
    email: '',
    password: '',
    role: 'Inventory Manager'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/users');
      setUsers(data);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        loginId: user.loginId,
        name: user.name,
        email: user.email,
        password: '',
        role: user.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        loginId: '',
        name: '',
        email: '',
        password: '',
        role: 'Inventory Manager'
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
        toast.success('User updated successfully');
      } else {
        await api.post('/users', formData);
        toast.success('User created successfully');
      }
      closeModal();
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving user');
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      await api.delete(`/users/${deleteTarget._id}`);
      toast.success('User deleted successfully');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error deleting user');
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.loginId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="users-page" style={{ color: '#f8fafc' }}>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <UsersIcon size={32} color="#6366f1" /> User Management
          </h1>
          <p style={{ color: '#94a3b8', margin: '0.5rem 0 0 0' }}>Manage system access roles and credentials.</p>
        </div>
        <button className="btn-primary" onClick={() => openModal()} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={18} /> Add New User
        </button>
      </div>

      <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
        <SearchBar 
           value={searchTerm}
           onChange={setSearchTerm}
           onClear={() => setSearchTerm('')}
           placeholder="Search users by name, email, or ID..."
        />
      </div>

      <div className="table-container" style={{ 
        background: 'rgba(30, 41, 59, 0.4)', 
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>User</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Logind ID</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Role</th>
              <th style={{ padding: '1rem', textAlign: 'left', color: '#94a3b8', fontWeight: 600 }}>Joined</th>
              <th style={{ padding: '1rem', textAlign: 'center', color: '#94a3b8', fontWeight: 600 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No users found.</td></tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ 
                        width: '36px', height: '36px', background: '#6366f1', 
                        borderRadius: '50%', display: 'flex', alignItems: 'center', 
                        justifyContent: 'center', fontWeight: 700, color: 'white' 
                      }}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '1rem', color: '#cbd5e1' }}>{user.loginId}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.25rem 0.6rem', background: user.role === 'Admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: user.role === 'Admin' ? '#f87171' : '#4ade80', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: '#94a3b8', fontSize: '0.85rem' }}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                      <button className="btn-ghost" onClick={() => openModal(user)} style={{ padding: '0.4rem' }}>
                        <Edit2 size={16} />
                      </button>
                      <button className="btn-ghost" onClick={() => setDeleteTarget(user)} style={{ padding: '0.4rem', color: '#f87171' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
            padding: '2.5rem', borderRadius: '24px', width: '100%', maxWidth: '550px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {editingUser ? <Edit2 color="#6366f1" /> : <PlusCircle color="#6366f1" />}
                {editingUser ? 'Edit User' : 'New System User'}
              </h2>
              <button onClick={closeModal} className="btn-ghost" style={{ padding: '0.5rem' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <UserCheck size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 40px', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} 
                  />
                </div>
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>Login ID</label>
                <input required value={formData.loginId} onChange={e => setFormData({...formData, loginId: e.target.value})}
                  style={{ width: '100%', padding: '0.75rem', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} 
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>System Role</label>
                <div style={{ position: 'relative' }}>
                  <Shield size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 40px', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white', appearance: 'none' }}>
                    <option value="Admin">Administrator</option>
                    <option value="Inventory Manager">Inventory Manager</option>
                    <option value="Warehouse Staff">Warehouse Staff</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 40px', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} 
                  />
                </div>
              </div>

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: '#94a3b8' }}>
                  {editingUser ? 'New Password (Leave blank to keep current)' : 'Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Key size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input type="password" required={!editingUser} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 40px', background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: 'white' }} 
                  />
                </div>
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={closeModal} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>{editingUser ? 'Update User' : 'Create User'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <DeleteModal 
          isOpen={true}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDelete}
          title="Delete User"
          message={`Are you sure you want to delete ${deleteTarget.name}? This action cannot be undone.`}
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default Users;
