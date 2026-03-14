import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Plus, Edit2, Trash2, X, Search, Filter, Layers, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import DeleteModal from '../components/DeleteModal';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Stock Modal State
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [viewingStockProduct, setViewingStockProduct] = useState(null);
  const [productStock, setProductStock] = useState([]);
  const [productLedger, setProductLedger] = useState([]);
  const [loadingStock, setLoadingStock] = useState(false);

  // Delete Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const { user } = useAuth();
  const canEdit = user?.role === 'Admin' || user?.role === 'Inventory Manager';

  // Pagination & Filters State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Form State
  const [formData, setFormData] = useState({
    name: '', sku: '', categoryId: '',    salePrice: 0,
    uom: 'pcs',
    reorderPoint: 0,
    reorderQty: 0,
    description: '',
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit,
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter && { category: categoryFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const [prodRes, catRes] = await Promise.all([
        api.get(`/products?${params.toString()}`),
        api.get('/categories')
      ]);
      setProducts(prodRes.data.data);
      setTotalPages(prodRes.data.pages);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly or just fetch on filter changes
    const timer = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter, statusFilter, page]);

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku,
        categoryId: product.categoryId?._id || '',
        description: product.description || '',
        uom: product.uom || 'pcs',
        salePrice: product.salePrice,
        uom: product.uom,
        reorderPoint: product.reorderPoint || 0,
        reorderQty: product.reorderQty || 0,
        description: product.description,
        isActive: product.isActive,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', categoryId: '', costPrice: 0, salePrice: 0, uom: 'pcs', reorderPoint: 0, reorderQty: 0, description: '', isActive: true });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, formData);
        toast.success(`Product updated successfully!`);
      } else {
        await api.post('/products', formData);
        toast.success(`Product created successfully!`);
      }
      fetchData();
      closeModal();
    } catch (error) {
       console.error('Failed to save product', error);
       toast.error(error.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/products/${deleteTarget._id}`);
      toast.success('Product deleted successfully!');
      fetchData();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Failed to delete product', error);
      toast.error('Failed to delete product');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleOpenStockModal = async (product) => {
    setViewingStockProduct(product);
    setStockModalOpen(true);
    setLoadingStock(true);
    try {
      const [stockRes, ledgerRes] = await Promise.all([
         api.get(`/stock?product=${product._id}`),
         api.get(`/stock/ledger?product=${product._id}&limit=10`)
      ]);
      setProductStock(stockRes.data);
      setProductLedger(ledgerRes.data);
    } catch (err) {
       console.error(err);
       toast.error('Failed to load stock details');
    } finally {
       setLoadingStock(false);
    }
  };

  const closeStockModal = () => {
    setStockModalOpen(false);
    setViewingStockProduct(null);
    setProductStock([]);
    setProductLedger([]);
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
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0' }}>Products Inventory</h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>Manage your entire catalog items.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
            
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" placeholder="Search name or SKU..."
                value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setPage(1);}}
                style={{
                  padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px',
                  background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white', outline: 'none', width: '220px'
                }}
                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            {/* Category Filter */}
            <div style={{ position: 'relative' }}>
               <Filter size={18} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
               <select
                 value={categoryFilter}
                 onChange={(e) => {setCategoryFilter(e.target.value); setPage(1);}}
                 style={{
                    padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '12px',
                    background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)',
                    color: 'white', outline: 'none', appearance: 'none', minWidth: '160px', cursor: 'pointer'
                 }}
               >
                 <option value="">All Categories</option>
                 {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
               </select>
            </div>

            {/* Status Filter */}
            <div style={{ position: 'relative' }}>
               <select
                 value={statusFilter}
                 onChange={(e) => {setStatusFilter(e.target.value); setPage(1);}}
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
            
            {canEdit && (
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
                <Plus size={18} /> Add Product
              </button>
            )}
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>SKU</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Name</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Price</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Status</th>
                <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center' }}>Loading products...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="6" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No products found.</td></tr>
              ) : (
                products.map(product => (
                  <tr key={product._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    <td style={{ padding: '1rem', fontWeight: 500, color: '#a855f7' }}>{product.sku}</td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{product.name}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>{product.categoryId?.name || '-'}</td>
                    <td style={{ padding: '1rem', color: '#cbd5e1' }}>₹{product.salePrice.toFixed(2)}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 600,
                        background: product.isDeleted ? 'rgba(100, 116, 139, 0.2)' : product.isActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: product.isDeleted ? '#94a3b8' : product.isActive ? '#4ade80' : '#f87171'
                      }}>
                        {product.isDeleted ? 'Deleted' : product.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {product.isDeleted ? (
                          <>
                            {canEdit && (
                              <button 
                                onClick={async () => {
                                  try {
                                    await api.put(`/products/${product._id}`, { ...product, isDeleted: false, isActive: true });
                                    toast.success('Product restored!');
                                    fetchData();
                                  } catch (err) { console.error(err); toast.error('Failed to restore'); }
                                }}
                                style={{
                                  background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', border: 'none',
                                  padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s', fontWeight: 600
                                }}
                              >
                                Restore
                              </button>
                            )}
                          </>
                        ) : (
                          <>
                            <button 
                              title="View Stock"
                              onClick={() => handleOpenStockModal(product)}
                              style={{
                                background: 'rgba(168, 85, 247, 0.1)', color: '#d8b4fe', border: 'none',
                                padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                              }}
                            >
                              <Layers size={16} />
                            </button>
                            {canEdit && (
                              <button 
                                onClick={() => handleOpenModal(product)}
                                style={{
                                  background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', border: 'none',
                                  padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                                }}
                              >
                                <Edit2 size={16} />
                              </button>
                            )}
                            {canEdit && (
                              <button 
                                onClick={() => setDeleteTarget(product)}
                                style={{
                                  background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'none',
                                  padding: '0.5rem', borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
                                }}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
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
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '750px',
            maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Product Name</label>
                <input 
                  type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>SKU</label>
                <input 
                  type="text" required value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value.toUpperCase() })}
                  disabled={!!editingProduct}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: editingProduct ? '#94a3b8' : 'white', boxSizing: 'border-box', cursor: editingProduct ? 'not-allowed' : 'text' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Category</label>
                <select 
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Cost Price</label>
                <input 
                  type="number" min="0" step="0.01" value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Sale Price</label>
                <input 
                  type="number" min="0" step="0.01" value={formData.salePrice}
                  onChange={(e) => setFormData({ ...formData, salePrice: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Unit of Measure</label>
                <select 
                  value={formData.uom}
                  onChange={(e) => setFormData({ ...formData, uom: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                >
                  <option value="pcs">Pieces (pcs)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="g">Gram (g)</option>
                  <option value="ltr">Liter (ltr)</option>
                  <option value="ml">Milliliter (ml)</option>
                  <option value="box">Box</option>
                  <option value="pack">Pack</option>
                  <option value="set">Set</option>
                  <option value="m">Meter (m)</option>
                  <option value="cm">Centimeter (cm)</option>
                  <option value="ft">Feet (ft)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Reorder Point (Low Stock Alert)</label>
                <input 
                  type="number" min="0" value={formData.reorderPoint}
                  onChange={(e) => setFormData({ ...formData, reorderPoint: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Reorder Quantity</label>
                <input 
                  type="number" min="0" value={formData.reorderQty}
                  onChange={(e) => setFormData({ ...formData, reorderQty: Number(e.target.value) })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingTop: '1.5rem' }}>
                <input 
                  type="checkbox" id="p_isActive" checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer', marginRight: '0.5rem' }}
                />
                <label htmlFor="p_isActive" style={{ fontSize: '0.9rem', color: '#cbd5e1', cursor: 'pointer' }}>Product is Active for Sales</label>
              </div>

              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: '#cbd5e1' }}>Description</label>
                <textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(15, 23, 42, 0.5)', color: 'white', minHeight: '80px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '1rem' }}>
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {stockModalOpen && viewingStockProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)',
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
              <h3 style={{ margin: 0, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers color="#a855f7" /> 
                {viewingStockProduct.name} - Stock Details
              </h3>
              <button onClick={closeStockModal} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            {loadingStock ? (
               <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>Loading inventory logic...</div>
            ) : (
               <div style={{ display: 'grid', gap: '2rem' }}>
                 
                 {/* Physical On-Hand Quantities by Location */}
                 <div>
                   <h4 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem' }}>Physical Quantities & Locations</h4>
                   {productStock.length === 0 ? (
                      <p style={{ margin: 0, color: '#94a3b8', background: 'rgba(15,23,42,0.4)', padding: '1rem', borderRadius: '8px' }}>No physical stock exists for this item.</p>
                   ) : (
                      <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead style={{ background: 'rgba(15,23,42,0.8)' }}>
                               <tr>
                                  <th style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontWeight: 600 }}>Location Name</th>
                                  <th style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontWeight: 600 }}>Type</th>
                                  <th style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontWeight: 600, textAlign: 'right' }}>On Hand</th>
                               </tr>
                            </thead>
                            <tbody>
                               {productStock.map(s => (
                                  <tr key={s._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                     <td style={{ padding: '0.75rem 1rem', fontWeight: 500 }}>{s.location?.name || 'Unknown'}</td>
                                     <td style={{ padding: '0.75rem 1rem', color: '#a855f7' }}>{s.location?.type || '-'}</td>
                                     <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600, color: '#4ade80' }}>
                                        {s.quantity} {viewingStockProduct.uom}
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   )}
                 </div>

                 {/* History of this product matching Operations Engine */}
                 <div>
                   <h4 style={{ margin: '0 0 1rem 0', color: '#f8fafc', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                     <Clock size={16} /> Recent Stock Ledger
                   </h4>
                   {productLedger.length === 0 ? (
                      <p style={{ margin: 0, color: '#94a3b8', background: 'rgba(15,23,42,0.4)', padding: '1rem', borderRadius: '8px' }}>No movements recorded in ledger yet.</p>
                   ) : (
                      <div style={{ background: 'rgba(15,23,42,0.4)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
                         <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                            <thead style={{ background: 'rgba(15,23,42,0.8)' }}>
                               <tr>
                                  <th style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontWeight: 600 }}>Date</th>
                                  <th style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontWeight: 600 }}>Operation</th>
                                  <th style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontWeight: 600 }}>From &#8594; To</th>
                                  <th style={{ padding: '0.75rem 1rem', color: '#cbd5e1', fontWeight: 600, textAlign: 'right' }}>Quantity</th>
                               </tr>
                            </thead>
                            <tbody>
                               {productLedger.map(l => (
                                  <tr key={l._id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                     <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>
                                        {new Date(l.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                     </td>
                                     <td style={{ padding: '0.75rem 1rem', fontWeight: 500, color: '#818cf8' }}>
                                        {l.operation?.referenceNumber || 'System API'} <br/>
                                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{l.operation?.type}</span>
                                     </td>
                                     <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>
                                        {l.fromLocation ? l.fromLocation.name : <span style={{color: '#64748b'}}>Ext. Source</span>}
                                        <span style={{ margin: '0 0.5rem', color: '#475569' }}>&#8594;</span>
                                        {l.toLocation ? l.toLocation.name : <span style={{color: '#64748b'}}>Ext. Destination</span>}
                                     </td>
                                     <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>
                                        {l.quantity} {viewingStockProduct.uom}
                                     </td>
                                  </tr>
                               ))}
                            </tbody>
                         </table>
                      </div>
                   )}
                 </div>

               </div>
            )}
          </div>
        </div>
      )}

      <DeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        itemName={deleteTarget ? `[${deleteTarget.sku}] ${deleteTarget.name}` : ''}
        description="This will soft-delete the product. You can restore it from the Deleted filter."
        loading={deleteLoading}
      />
    </div>
  );
};

export default Products;
