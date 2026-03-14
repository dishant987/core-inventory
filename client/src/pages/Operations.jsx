import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { Plus, Check, Clock, Edit2, Archive, Trash2, X, PlusCircle, MinusCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Operations = () => {
  const [operations, setOperations] = useState([]);
  const [locations, setLocations] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [modalOpen, setModalOpen] = useState(false);
  const [viewingOperation, setViewingOperation] = useState(null); // Used to view/edit
  const [loading, setLoading] = useState(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Form State
  const [formData, setFormData] = useState({
    type: 'Receipt',
    sourceLocation: '',
    destinationLocation: '',
    items: [],
    notes: '',
  });

  const fetchDependencies = async () => {
    try {
      const [locRes, prodRes] = await Promise.all([
        api.get('/locations?status=active'),
        api.get('/products?status=active&limit=1000') // Adjusting limit just to load for dropdowns
      ]);
      setLocations(locRes.data);
      setProducts(prodRes.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load dependency data');
    }
  };

  const fetchOperations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(locationFilter !== 'all' && { location: locationFilter })
      });
      const { data } = await api.get(`/operations?${params.toString()}`);
      setOperations(data.data);
      setTotalPages(data.pages);
    } catch (error) {
      console.error('Failed to fetch operations', error);
      toast.error('Failed to load operations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDependencies();
  }, []);

  useEffect(() => {
    fetchOperations();
  }, [typeFilter, statusFilter, locationFilter, page]);

  const handleOpenModal = (operation = null) => {
    if (operation) {
      // Editing Mode
      setViewingOperation(operation);
      setFormData({
        type: operation.type,
        sourceLocation: operation.sourceLocation?._id || '',
        destinationLocation: operation.destinationLocation?._id || '',
        items: operation.items.map(i => ({ product: i.product._id, quantity: i.quantity })),
        notes: operation.notes || ''
      });
    } else {
      // Create Mode
      setViewingOperation(null);
      setFormData({
        type: 'Receipt',
        sourceLocation: '',
        destinationLocation: '',
        items: [{ product: '', quantity: 1 }],
        notes: ''
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setViewingOperation(null);
  };

  const addItemRow = () => {
    setFormData({ ...formData, items: [...formData.items, { product: '', quantity: 1 }] });
  };

  const removeItemRow = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Filter out rows where product isn't selected
    const validItems = formData.items.filter(i => i.product && i.quantity > 0);
    if (validItems.length === 0) {
      toast.error('You must add at least one valid item.');
      return;
    }

    try {
      const payload = { ...formData, items: validItems };
      if (!payload.sourceLocation) delete payload.sourceLocation;
      if (!payload.destinationLocation) delete payload.destinationLocation;

      if (viewingOperation) {
        await api.put(`/operations/${viewingOperation._id}`, payload);
        toast.success(`Operation updated successfully!`);
      } else {
        await api.post('/operations', payload);
        toast.success(`Operation created successfully!`);
      }
      fetchOperations();
      closeModal();
    } catch (err) {
       console.error('Failed to save operation', err);
       toast.error(err.response?.data?.message || 'Failed to save operation');
    }
  };

  const handleValidate = async (id) => {
    if (window.confirm("Are you sure you want to validate this operation? This will permanently move stock via the Ledger.")) {
      try {
        await api.post(`/operations/${id}/validate`);
        toast.success('Operation validated & stock moved!');
        fetchOperations();
      } catch (error) {
        console.error('Failed to validate', error);
        toast.error(error.response?.data?.message || 'Failed to validate operation');
      }
    }
  };

  const getStatusBadgeOptions = (status) => {
    switch(status) {
      case 'Draft': return { bg: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8' };
      case 'Waiting': return { bg: 'rgba(234, 179, 8, 0.2)', color: '#facc15' };
      case 'Ready': return { bg: 'rgba(99, 102, 241, 0.2)', color: '#818cf8' };
      case 'Done': return { bg: 'rgba(34, 197, 94, 0.2)', color: '#4ade80' };
      case 'Canceled': return { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171' };
      default: return { bg: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8' };
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
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>Inventory Operations</h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>Transfer, adjust, receipt, and deliver goods.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Type Filter */}
            <div style={{ position: 'relative' }}>
               <select
                 value={typeFilter} onChange={(e) => {setTypeFilter(e.target.value); setPage(1);}}
                 style={{
                    padding: '0.75rem 1rem', borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', cursor: 'pointer'
                 }}
               >
                 <option value="all">All Types</option>
                 <option value="Receipt">Receipts</option>
                 <option value="Delivery">Deliveries</option>
                 <option value="Internal Transfer">Internal Transfers</option>
                 <option value="Adjustment">Adjustments</option>
               </select>
            </div>

            {/* Status Filter */}
            <div style={{ position: 'relative' }}>
                <select
                  value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
                  style={{
                     padding: '0.75rem 1rem', borderRadius: '12px',
                     background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                     color: 'white', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="all">Any Status</option>
                  <option value="Draft">Draft</option>
                  <option value="Waiting">Waiting</option>
                  <option value="Ready">Ready</option>
                  <option value="Done">Done</option>
                  <option value="Canceled">Canceled</option>
                </select>
             </div>

             {/* Location Filter */}
             <div style={{ position: 'relative' }}>
                <select
                  value={locationFilter} onChange={(e) => {setLocationFilter(e.target.value); setPage(1);}}
                  style={{
                     padding: '0.75rem 1rem', borderRadius: '12px',
                     background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                     color: 'white', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="all">Every Warehouse/Loc</option>
                  {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
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
              <Plus size={18} /> New Operation
            </button>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Reference</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Type</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>From Location</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>To Location</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading operations...</td></tr>
              ) : operations.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No operations found.</td></tr>
              ) : operations.map(op => {
                  const badge = getStatusBadgeOptions(op.status);
                  return (
                  <tr key={op._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: 600, color: '#a855f7' }}>{op.referenceNumber}</td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{op.type}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{op.sourceLocation?.name || '-'}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{op.destinationLocation?.name || '-'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600,
                        background: badge.bg, color: badge.color
                      }}>
                        {op.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {/* The provided snippet is syntactically incorrect and cannot be inserted as is. */}
                        {/* If this was intended to be part of a conditional block, please provide the full, correct JSX. */}
                        {/* For now, I will skip inserting the malformed snippet to maintain syntactical correctness. */}
                        
                        {op.status === 'Draft' && (
                          <button 
                            title="Mark as Waiting"
                            onClick={async () => {
                               try { await api.put(`/operations/${op._id}`, { status: 'Waiting' }); toast.success('Status updated to Waiting'); fetchOperations(); } 
                               catch(err) { toast.error('Failed to update status'); }
                            }}
                            style={{ background: 'rgba(234, 179, 8, 0.1)', color: '#facc15', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            <Clock size={16} />
                          </button>
                        )}

                        {op.status === 'Waiting' && (
                          <button 
                            title="Mark as Ready"
                            onClick={async () => {
                               try { await api.put(`/operations/${op._id}`, { status: 'Ready' }); toast.success('Status updated to Ready'); fetchOperations(); } 
                               catch(err) { toast.error('Failed to update status'); }
                            }}
                            style={{ background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                          >
                            <PlusCircle size={16} />
                          </button>
                        )}

                        {op.status === 'Ready' && (
                          <button 
                            title="Validate & Commit"
                            onClick={() => handleValidate(op._id)}
                            style={{
                              background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: 'none',
                              padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                            }}
                          >
                            <Check size={16} />
                          </button>
                        )}
                        
                        {/* Always can View the summary by Editing, though if Done it disables inputs basically */}
                        <button 
                          onClick={() => handleOpenModal(op)}
                          style={{
                            background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none',
                            padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                          }}
                        >
                          {op.status === 'Done' || op.status === 'Canceled' ? <Archive size={16} /> : <Edit2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem', gap: '0.5rem' }}>
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: page === 1 ? 'transparent' : 'rgba(15, 23, 42, 0.5)',
                color: page === 1 ? '#475569' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ padding: '0.5rem 1rem', color: '#94a3b8' }}>
              Page {page} of {totalPages}
            </span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              style={{
                padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)',
                background: page === totalPages ? 'transparent' : 'rgba(15, 23, 42, 0.5)',
                color: page === totalPages ? '#475569' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        )}
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
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '800px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                {viewingOperation && (viewingOperation.status === 'Done' || viewingOperation.status === 'Canceled') 
                  ? `Viewing Operation ${viewingOperation.referenceNumber}` 
                  : viewingOperation ? `Editing Operation ${viewingOperation.referenceNumber}` : 'Draft New Operation'}
              </h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Operation Type</label>
                <select 
                  value={formData.type}
                  onChange={(e) => {
                     const newType = e.target.value;
                     setFormData({ ...formData, type: newType, sourceLocation: '', destinationLocation: '' });
                  }}
                  disabled={!!viewingOperation && (viewingOperation.status === 'Done' || viewingOperation.status === 'Canceled')}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                >
                  <option value="Receipt">Receipt (Vendor -&gt; Internal)</option>
                  <option value="Delivery">Delivery (Internal -&gt; Customer)</option>
                  <option value="Internal Transfer">Internal Transfer (Internal -&gt; Internal)</option>
                  <option value="Adjustment">Inventory Adjustment (Fix Lost/Found)</option>
                </select>
              </div>

              {/* Source Location */}
              {formData.type !== 'Receipt' && (
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>From Location</label>
                  <select 
                    required value={formData.sourceLocation}
                    onChange={(e) => setFormData({ ...formData, sourceLocation: e.target.value })}
                    disabled={!!viewingOperation && (viewingOperation.status === 'Done' || viewingOperation.status === 'Canceled')}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Destination Location */}
              {formData.type !== 'Delivery' && (
                <div style={{ gridColumn: formData.type === 'Receipt' ? 'span 2' : 'span 1' }}>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>To Location</label>
                  <select 
                    required value={formData.destinationLocation}
                    onChange={(e) => setFormData({ ...formData, destinationLocation: e.target.value })}
                    disabled={!!viewingOperation && (viewingOperation.status === 'Done' || viewingOperation.status === 'Canceled')}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                  >
                    <option value="">Select Location</option>
                    {locations.map(loc => (
                      <option key={loc._id} value={loc._id}>{loc.name} ({loc.type})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Items Table */}
              <div style={{ gridColumn: 'span 2', background: 'rgba(15, 23, 42, 0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                 <h4 style={{ margin: '0 0 1rem 0', color: '#f8fafc' }}>Products / Items</h4>
                 {formData.items.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '1rem' }}>
                       <div style={{ flex: 1 }}>
                         <select 
                           required value={item.product}
                           onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                           disabled={!!viewingOperation && (viewingOperation.status === 'Done' || viewingOperation.status === 'Canceled')}
                           style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                         >
                           <option value="">Select Product...</option>
                           {products.map(p => <option key={p._id} value={p._id}>[{p.sku}] {p.name}</option>)}
                         </select>
                       </div>
                       <div style={{ width: '120px' }}>
                         <input 
                           type="number" min="0.01" step="0.01" required value={item.quantity}
                           onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                           disabled={!!viewingOperation && (viewingOperation.status === 'Done' || viewingOperation.status === 'Canceled')}
                           style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                         />
                       </div>
                       {(!viewingOperation || (viewingOperation.status !== 'Done' && viewingOperation.status !== 'Canceled')) && (
                          <button type="button" onClick={() => removeItemRow(index)} style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', padding: '0.5rem' }}>
                            <MinusCircle size={20} />
                          </button>
                       )}
                    </div>
                 ))}
                 
                 {(!viewingOperation || (viewingOperation.status !== 'Done' && viewingOperation.status !== 'Canceled')) && (
                   <button 
                     type="button" onClick={addItemRow}
                     style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent',
                        color: '#818cf8', border: 'none', padding: '0.5rem 0', cursor: 'pointer', fontWeight: 500
                     }}
                   >
                     <PlusCircle size={18} /> Add another item
                   </button>
                 )}
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  disabled={!!viewingOperation && (viewingOperation.status === 'Done' || viewingOperation.status === 'Canceled')}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', minHeight: '80px', boxSizing: 'border-box' }}
                />
              </div>

              {(!viewingOperation || (viewingOperation.status !== 'Done' && viewingOperation.status !== 'Canceled')) && (
                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                  <button 
                    type="button" onClick={closeModal}
                    style={{ flex: 1, padding: '0.75rem', background: 'transparent', color: '#f8fafc', border: '1px solid rgba(255, 255, 255, 0.2)', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Cancel
                  </button>
                  {viewingOperation && viewingOperation.status === 'Draft' && (
                    <button 
                      type="button"
                      onClick={async () => {
                        try { await api.put(`/operations/${viewingOperation._id}`, { status: 'Waiting' }); toast.success('Marked as Waiting'); fetchOperations(); closeModal(); } 
                        catch(err) { toast.error('Failed'); }
                      }}
                      style={{ flex: 1, padding: '0.75rem', background: 'rgba(234, 179, 8, 0.2)', color: '#facc15', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Mark Waiting
                    </button>
                  )}
                  {viewingOperation && viewingOperation.status === 'Waiting' && (
                    <button 
                      type="button"
                      onClick={async () => {
                        try { await api.put(`/operations/${viewingOperation._id}`, { status: 'Ready' }); toast.success('Marked as Ready'); fetchOperations(); closeModal(); } 
                        catch(err) { toast.error('Failed'); }
                      }}
                      style={{ flex: 1, padding: '0.75rem', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Mark Ready
                    </button>
                  )}
                  {viewingOperation && viewingOperation.status === 'Ready' && (
                    <button 
                      type="button"
                      onClick={() => { handleValidate(viewingOperation._id); closeModal(); }}
                      style={{ flex: 1, padding: '0.75rem', background: 'rgba(34, 197, 94, 0.2)', color: '#4ade80', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      Validate Now
                    </button>
                  )}
                  <button 
                    type="submit"
                    style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', boxShadow: '0 4px 14px 0 rgba(99, 102, 241, 0.39)' }}
                  >
                    {viewingOperation ? 'Save Changes' : 'Draft Operation'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Operations;
