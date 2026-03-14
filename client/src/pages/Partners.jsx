import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Search, Users, Phone, Mail, MapPin, Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchBar from '../components/SearchBar';

const Partners = () => {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    type: 'Vendor',
    email: '',
    phone: '',
    address: '',
    gstNumber: ''
  });

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/partners?search=${searchTerm}`);
      setPartners(data);
    } catch (error) {
      toast.error('Failed to load partners');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchPartners, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleOpenModal = (partner = null) => {
    if (partner) {
      setEditingPartner(partner);
      setFormData({
        name: partner.name,
        type: partner.type,
        email: partner.email || '',
        phone: partner.phone || '',
        address: partner.address || '',
        gstNumber: partner.gstNumber || ''
      });
    } else {
      setEditingPartner(null);
      setFormData({ name: '', type: 'Vendor', email: '', phone: '', address: '', gstNumber: '' });
    }
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        await api.put(`/partners/${editingPartner._id}`, formData);
        toast.success('Partner updated!');
      } else {
        await api.post('/partners', formData);
        toast.success('Partner created!');
      }
      fetchPartners();
      setModalOpen(false);
    } catch (error) {
      toast.error('Failed to save partner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      await api.delete(`/partners/${id}`);
      toast.success('Partner deleted');
      fetchPartners();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div style={{ color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
        padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Users color="#6366f1" /> Business Partners
            </h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>Manage your Vendors (Suppliers) and Customers.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <SearchBar 
              value={searchTerm} 
              onChange={setSearchTerm} 
              placeholder="Search partner..." 
            />
            <button 
              onClick={() => handleOpenModal()}
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white', border: 'none', padding: '0.75rem 1.5rem',
                borderRadius: '12px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.5rem'
              }}
            >
              <Plus size={18} /> Add Partner
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {loading ? (
             <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading partners...</div>
          ) : partners.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>No partners found.</div>
          ) : (
            partners.map(p => (
              <div key={p._id} style={{
                background: 'rgba(15, 23, 42, 0.4)', borderRadius: '20px', padding: '1.5rem',
                border: '1px solid rgba(255,255,255,0.05)', position: 'relative'
              }}>
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => handleOpenModal(p)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
                  <div style={{ 
                    width: '48px', height: '48px', borderRadius: '12px', 
                    background: p.type === 'Vendor' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                    color: p.type === 'Vendor' ? '#818cf8' : '#4ade80', fontWeight: 700
                  }}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{p.name}</h3>
                    <span style={{ 
                      fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '99px',
                      background: p.type === 'Vendor' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                      color: p.type === 'Vendor' ? '#818cf8' : '#4ade80'
                    }}>
                      {p.type}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {p.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}><Phone size={14} /> {p.phone}</div>}
                  {p.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}><Mail size={14} /> {p.email}</div>}
                  {p.address && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}><MapPin size={14} /> {p.address}</div>}
                  {p.gstNumber && <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}><Hash size={14} /> GST: {p.gstNumber}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '1rem'
        }} onClick={() => setModalOpen(false)}>
          <div style={{
            background: '#1e293b', width: '100%', maxWidth: '500px', borderRadius: '24px',
            padding: '2rem', border: '1px solid rgba(255,255,255,0.1)', position: 'relative'
          }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setModalOpen(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ margin: '0 0 1.5rem 0' }}>{editingPartner ? 'Edit Partner' : 'Add New Partner'}</h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Partner Name</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Partner Type</label>
                <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }}>
                  <option value="Vendor">Vendor (Supplier)</option>
                  <option value="Customer">Customer</option>
                  <option value="Both">Both</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Email</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Phone</label>
                  <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>Address</label>
                <textarea rows="2" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none', resize: 'none' }} />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#94a3b8' }}>GST Number</label>
                <input value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', outline: 'none' }} />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary" style={{ flex: 1, justifyContent: 'center' }}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  {editingPartner ? 'Update Partner' : 'Create Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Partners;
