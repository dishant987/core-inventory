import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, Clock, Layers, ArrowRight, Activity, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const MoveHistory = () => {
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLedger = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/stock/ledger?limit=100');
        setLedger(data);
      } catch (error) {
        console.error('Failed to load ledger', error);
        toast.error('Failed to load move history.');
      } finally {
        setLoading(false);
      }
    };
    fetchLedger();
  }, []);

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
              <Activity color="#a855f7" /> Immutable Move History
            </h2>
            <p style={{ margin: 0, color: '#94a3b8' }}>A complete timestamped log of all physical stock movements across your ecosystem.</p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', whiteSpace: 'nowrap' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontWeight: 600 }}>Date / Time</th>
                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontWeight: 600 }}>Operation Ref</th>
                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontWeight: 600 }}>Product</th>
                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontWeight: 600 }}>Movement Trail</th>
                <th style={{ padding: '1.25rem 1rem', color: '#94a3b8', fontWeight: 600, textAlign: 'right' }}>Phys. Qty</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>Loading highly secured ledger blocks...</td></tr>
              ) : ledger.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>No stock movements recorded yet.</td></tr>
              ) : (
                ledger.map((log) => (
                  <tr key={log._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                    
                    <td style={{ padding: '1.25rem 1rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1' }}>
                         <Calendar size={14} color="#64748b" />
                         <span>{new Date(log.date).toLocaleDateString()}</span>
                       </div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem', paddingLeft: '2px' }}>
                         <Clock size={12} color="#475569" />
                         <span>{new Date(log.date).toLocaleTimeString()}</span>
                       </div>
                    </td>

                    <td style={{ padding: '1.25rem 1rem' }}>
                      <span style={{ 
                        background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', 
                        padding: '0.25rem 0.5rem', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem' 
                      }}>
                        {log.operation?.referenceNumber || 'System Sync'}
                      </span>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.4rem', fontWeight: 500 }}>
                        {log.operation?.type || 'Correction'}
                      </div>
                    </td>

                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ color: '#f8fafc', fontWeight: 500 }}>{log.product?.name || 'Unknown Item'}</div>
                      <div style={{ color: '#a855f7', fontSize: '0.85rem', marginTop: '0.2rem' }}>{log.product?.sku || '-'}</div>
                    </td>

                    <td style={{ padding: '1.25rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <span style={{ 
                          color: log.fromLocation ? '#cbd5e1' : '#64748b',
                          background: log.fromLocation ? 'rgba(255,255,255,0.05)' : 'transparent',
                          padding: '0.25rem 0.5rem', borderRadius: '4px'
                        }}>
                          {log.fromLocation ? log.fromLocation.name : 'External Source'}
                        </span>
                        
                        <ArrowRight size={14} color="#64748b" />
                        
                        <span style={{ 
                          color: log.toLocation ? '#cbd5e1' : '#64748b',
                          background: log.toLocation ? 'rgba(255,255,255,0.05)' : 'transparent',
                          padding: '0.25rem 0.5rem', borderRadius: '4px'
                        }}>
                          {log.toLocation ? log.toLocation.name : 'External Dest'}
                        </span>
                      </div>
                    </td>

                    <td style={{ padding: '1.25rem 1rem', textAlign: 'right' }}>
                       <span style={{
                         display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: '999px',
                         background: 'rgba(34, 197, 94, 0.1)', color: '#4ade80', fontWeight: 700
                       }}>
                         Qty: {log.quantity} {log.product?.uom || 'pcs'}
                       </span>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MoveHistory;
