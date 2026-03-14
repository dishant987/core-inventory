import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Filter } from 'lucide-react';
import toast from 'react-hot-toast';

const Locations = () => {
  const [locations, setLocations] = useState([]);
  const [allLocations, setAllLocations] = useState([]); // Used for parent selection dropdown
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const [formData, setFormData] = useState({
    name: '', type: 'Internal', parentId: '', isActive: true
  });

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        status: statusFilter,
        type: typeFilter
      });
      const { data } = await api.get(`/locations?${params.toString()}`);
      setLocations(data);
      
      // Also fetch active locations for parent dropdown if not already fetching active ones
      if (statusFilter !== 'deleted') {
          setAllLocations(data.filter(l => l.isActive));
      } else {
         const activeRes = await api.get('/locations?status=active');
         setAllLocations(activeRes.data);
      }
      
    } catch (error) {
      console.error('Failed to fetch locations', error);
      toast.error('Failed to load locations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [statusFilter, typeFilter]);

  const handleOpenModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setFormData({
        name: location.name,
        type: location.type,
        parentId: location.parentId?._id || '',
        isActive: location.isActive,
      });
    } else {
      setEditingLocation(null);
      setFormData({ name: '', type: 'Internal', parentId: '', isActive: true });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingLocation(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await api.put(`/locations/${editingLocation._id}`, formData);
        toast.success(`Location updated successfully!`);
      } else {
        await api.post('/locations', formData);
        toast.success(`Location created successfully!`);
      }
      fetchLocations();
      closeModal();
    } catch (error) {
       console.error('Failed to save location', error);
       toast.error(error.response?.data?.message || 'Failed to save location');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      try {
        await api.delete(`/locations/${id}`);
        toast.success('Location deleted successfully!');
        fetchLocations();
      } catch (error) {
        console.error('Failed to delete location', error);
        toast.error('Failed to delete location');
      }
    }
  };

  return (
    <div style={{ color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

      <div style={{
        background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
        padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>Warehouses & Locations</h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>Manage physical and virtual stock locations.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Type Filter */}
            <div style={{ position: 'relative' }}>
               <Filter size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
               <select
                 value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}
                 style={{
                    padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', appearance: 'none', minWidth: '160px', cursor: 'pointer'
                 }}
               >
                 <option value="all">All Types</option>
                 <option value="Internal">Internal (Warehouses)</option>
                 <option value="View">View (Routing/Folders)</option>
                 <option value="Vendor">Vendor</option>
                 <option value="Customer">Customer</option>
                 <option value="Inventory Loss">Inventory Loss</option>
                 <option value="Production">Production</option>
               </select>
            </div>

            {/* Status Filter */}
            <div style={{ position: 'relative' }}>
               <select
                 value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                 style={{
                    padding: '0.75rem 1rem', borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', cursor: 'pointer'
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
                boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)', transition: 'transform 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Plus size={18} /> New Location
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Location Name</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Parent Location</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center' }}>Loading locations...</td></tr>
              ) : locations.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No locations found.</td></tr>
              ) : (
                locations.map(loc => (
                  <tr key={loc._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{loc.name}</td>
                    <td style={{ padding: '1rem', color: '#a855f7', fontWeight: 500 }}>{loc.type}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{loc.parentId?.name || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600,
                        background: loc.isDeleted ? 'rgba(100, 116, 139, 0.2)' : loc.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: loc.isDeleted ? '#94a3b8' : loc.isActive ? '#4ade80' : '#f87171'
                      }}>
                        {loc.isDeleted ? 'Deleted' : loc.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {loc.isDeleted ? (
                          <button 
                            onClick={async () => {
                              try {
                                await api.put(`/locations/${loc._id}`, { ...loc, isDeleted: false, isActive: true });
                                toast.success('Location restored!');
                                fetchLocations();
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
                              onClick={() => handleOpenModal(loc)}
                              style={{
                                background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none',
                                padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                              }}
                            >
                              <Edit2 size={16} />
                            </button>
                            <button 
                              onClick={() => handleDelete(loc._id)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none',
                                padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                              }}
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
            background: 'rgba(30, 41, 59, 1)', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                {editingLocation ? 'Edit Location' : 'New Location'}
              </h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Location Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Location Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                >
                 <option value="Internal">Internal (Warehouses)</option>
                 <option value="View">View (Routing/Folders)</option>
                 <option value="Vendor">Vendor</option>
                 <option value="Customer">Customer</option>
                 <option value="Inventory Loss">Inventory Loss</option>
                 <option value="Production">Production</option>
                </select>
                <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                   Internal: Racks, shelves. View: Main warehouse name. Vendor/Customer/Loss: Virtual tracking locations.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Parent Location (Optional)</label>
                <select 
                  value={formData.parentId}
                  onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                >
                  <option value="">None (Top Level)</option>
                  {allLocations.filter(loc => loc._id !== editingLocation?._id).map(loc => (
                    <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '0.5rem' }}>
                <input 
                  type="checkbox" id="isActive" checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginRight: '0.5rem' }}
                />
                <label htmlFor="isActive" style={{ fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer' }}>Location is Active</label>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" onClick={closeModal}
                  style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Locations;
