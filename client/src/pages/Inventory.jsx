import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, MapPin, Tags, AlertTriangle, Search, Filter, Layers, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const Inventory = () => {
  const [stock, setStock] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
    category: 'all',
    location: 'all',
    status: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: 10,
        search: searchTerm,
        category: filters.category,
        location: filters.location,
        status: filters.status
      });

      const [stockRes, catRes, locRes] = await Promise.all([
        api.get(`/stock?${params.toString()}`),
        api.get('/categories'),
        api.get('/locations?status=active')
      ]);

      setStock(stockRes.data.data || []);
      setTotalPages(stockRes.data.pages || 1);
      setCategories(catRes.data || []);
      setLocations(locRes.data || []);
    } catch (error) {
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(fetchData, 300);
    return () => clearTimeout(timer);
  }, [page, searchTerm, filters]);

  const getStatusStyle = (qty, reorder) => {
    if (qty <= 0) return { color: '#ef4444', text: 'Out of Stock', bg: 'rgba(239, 68, 68, 0.1)' };
    if (qty <= reorder) return { color: '#fbbf24', text: 'Low Stock', bg: 'rgba(251, 191, 36, 0.1)' };
    return { color: '#4ade80', text: 'In Stock', bg: 'rgba(34, 197, 94, 0.1)' };
  };

  return (
    <div style={{ color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
        padding: '2rem', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Package color="#6366f1" /> Inventory Report
            </h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>Real-time stock availability across all locations.</p>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="SKU or Product Name..." />
          </div>
        </div>

        {/* Filters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
           <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Category</label>
              <select 
                value={filters.category} 
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              >
                <option value="all">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
           </div>
           <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Warehouse / Location</label>
              <select 
                value={filters.location} 
                onChange={(e) => setFilters({...filters, location: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              >
                <option value="all">All Locations</option>
                {locations.map(l => <option key={l._id} value={l._id}>{l.name}</option>)}
              </select>
           </div>
           <div className="filter-group">
              <label style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '0.5rem', display: 'block' }}>Stock Status</label>
              <select 
                value={filters.status} 
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                style={{ width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
              >
                <option value="">All Statuses</option>
                <option value="low">Low Stock (Alerts)</option>
                <option value="out">Out of Stock</option>
              </select>
           </div>
        </div>

        {/* Table Content */}
        <div style={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: 600 }}>Product Details</th>
                <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: 600 }}>Category</th>
                <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: 600 }}>Location</th>
                <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: 600 }}>Quantity</th>
                <th style={{ padding: '1.2rem', color: '#94a3b8', fontWeight: 600 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>Analyzing stock levels...</td></tr>
              ) : stock.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>No stock data found matching criteria.</td></tr>
              ) : (
                stock.map((item, idx) => {
                  const status = getStatusStyle(item.quantity, item.product.reorderPoint);
                  return (
                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.2s' }}>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{item.product.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#a855f7', fontFamily: 'monospace' }}>{item.product.sku}</div>
                      </td>
                      <td style={{ padding: '1.2rem', color: '#cbd5e1' }}>{item.category?.name || 'Uncategorized'}</td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                          <MapPin size={14} color="#6366f1" /> {item.location.name}
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: status.color }}>
                          {item.quantity} <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>{item.product.uom}</span>
                        </div>
                      </td>
                      <td style={{ padding: '1.2rem' }}>
                        <div style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                          padding: '0.35rem 0.85rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 600,
                          color: status.color, background: status.bg, border: `1px solid ${status.color}20`
                        }}>
                          {item.quantity <= item.product.reorderPoint && <AlertTriangle size={12} />}
                          {status.text}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Pagination 
          currentPage={page} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </div>
    </div>
  );
};

export default Inventory;
