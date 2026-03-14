import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/categories?status=${statusFilter}`);
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [statusFilter]);

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        isActive: category.isActive,
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', description: '', isActive: true });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingCategory(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData);
        toast.success(`Category updated successfully!`);
      } else {
        await api.post('/categories', formData);
        toast.success(`Category created successfully!`);
      }
      fetchCategories();
      closeModal();
    } catch (error) {
       console.error('Failed to save category', error);
       toast.error(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/categories/${id}`);
        toast.success('Category deleted successfully!');
        fetchCategories();
      } catch (err) {
        console.error('Failed to delete category', err);
        toast.error('Failed to delete category');
      }
    }
  };

  return (
    <div style={{ color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

      <div style={{
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>Categories Management</h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>View and manage product categories.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ position: 'relative' }}>
               <Filter size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
               <select
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
                 style={{
                    padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', appearance: 'none', minWidth: '160px', cursor: 'pointer'
                 }}
               >
                 <option value="all">Any Status</option>
                 <option value="active">Active Only</option>
                 <option value="inactive">Inactive Only</option>
                 <option value="deleted">Deleted (Trash)</option>
               </select>
            </div>
            <button 
              onClick={() => handleOpenModal()}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                color: 'white', border: 'none', padding: '0.75rem 1.25rem',
                borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)',
                transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={18} /> New Category
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Description</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center' }}>Loading categories...</td></tr>
              ) : categories.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No categories found.</td></tr>
              ) : (
                categories.map(category => (
                  <tr key={category._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{category.name}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{category.description || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600,
                        background: category.isDeleted ? 'rgba(100, 116, 139, 0.2)' : category.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: category.isDeleted ? '#94a3b8' : category.isActive ? '#4ade80' : '#f87171'
                      }}>
                        {category.isDeleted ? 'Deleted' : category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {category.isDeleted ? (
                          <button 
                            onClick={async () => {
                              try {
                                await api.put(`/categories/${category._id}`, { ...category, isDeleted: false, isActive: true });
                                toast.success('Category restored!');
                                fetchCategories();
                              } catch (err) { toast.error('Failed to restore'); console.error(err); }
                            }}
                            style={{
                              background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: 'none',
                              padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontWeight: 600
                            }}
                          >
                            Restore
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleOpenModal(category)}
                              style={{
                                background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none',
                                padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.2)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)'}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(category._id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none',
                                padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'}
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.7)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h3>
              <button 
                onClick={closeModal}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Name</label>
                <input 
                  type="text" required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15, 23, 42, 0.5)', color: 'white', outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(15, 23, 42, 0.5)', color: 'white', minHeight: '100px', outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                  onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input 
                  type="checkbox" id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer' }}>Category is Active</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" onClick={closeModal}
                  style={{
                    flex: 1, padding: '0.75rem', background: 'transparent', color: '#f8fafc',
                    border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{
                    flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                    color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                    boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)'
                  }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
