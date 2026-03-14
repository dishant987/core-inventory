import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Package, AlertTriangle, ArrowDownCircle, ArrowUpCircle, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const Home = () => {
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKPIs = async () => {
       try {
         const { data } = await api.get('/dashboard/kpis');
         setKpis(data);
       } catch (error) {
         console.error('Failed to fetch dashboard data', error);
         toast.error('Could not load KPIs');
       } finally {
         setLoading(false);
       }
    };
    fetchKPIs();
  }, []);

  const Card = ({ title, value, subtitle, icon, colorGrad }) => (
    <div style={{
      background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '24px',
      padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', transition: 'transform 0.2s',
      cursor: 'pointer'
    }}
    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
    >
       <div style={{
         width: '64px', height: '64px', borderRadius: '16px',
         background: colorGrad, display: 'flex', justifyContent: 'center', alignItems: 'center'
       }}>
         {icon}
       </div>
       <div>
         <p style={{ margin: '0 0 0.5rem 0', color: '#94a3b8', fontSize: '0.95rem', fontWeight: 600 }}>{title}</p>
         <h3 style={{ margin: 0, fontSize: '2rem', color: '#f8fafc' }}>{value}</h3>
         {subtitle && <p style={{ margin: '0.5rem 0 0 0', color: '#64748b', fontSize: '0.8rem' }}>{subtitle}</p>}
       </div>
    </div>
  );

  return (
    <div style={{
      color: '#f8fafc', fontFamily: "'Inter', sans-serif"
    }}>

      <div style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '2.25rem', margin: '0 0 0.5rem 0', fontWeight: 700 }}>Inventory Dashboard</h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>Welcome back. Here's a quick look at your stock and operations.</p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading metrics...</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
             
             <Card 
               title="Total Products Modeled" 
               value={kpis?.totalProducts || 0}
               subtitle="Active products in registry"
               icon={<Package size={28} color="white" />}
               colorGrad="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
             />

             <Card 
               title="Low / Out of Stock" 
               value={(kpis?.lowStock || 0) + (kpis?.outOfStock || 0)}
               subtitle={`${kpis?.outOfStock || 0} Out, ${kpis?.lowStock || 0} Low`}
               icon={<AlertTriangle size={28} color="white" />}
               colorGrad="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
             />

             <Card 
               title="Pending Receipts" 
               value={kpis?.pendingReceipts || 0}
               subtitle="Incoming stock waits"
               icon={<ArrowDownCircle size={28} color="white" />}
               colorGrad="linear-gradient(135deg, #10b981 0%, #059669 100%)"
             />

             <Card 
               title="Pending Deliveries" 
               value={kpis?.pendingDeliveries || 0}
               subtitle="Outgoing shipments"
               icon={<ArrowUpCircle size={28} color="white" />}
               colorGrad="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
             />

             <Card 
               title="Internal Transfers" 
               value={kpis?.pendingTransfers || 0}
               subtitle="Scheduled physical moves"
               icon={<RefreshCw size={28} color="white" />}
               colorGrad="linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)"
             />

          </div>

          {/* Low Stock Alerts Table */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)', backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.05)', borderRadius: '24px',
            padding: '2rem'
          }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
               <AlertTriangle color="#f59e0b" size={24} />
               <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Critical Stock Alerts</h3>
             </div>

             {kpis?.lowStockItems?.length > 0 ? (
               <div style={{ overflowX: 'auto' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                   <thead>
                     <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                       <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Product Name</th>
                       <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Current Stock</th>
                       <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Threshold</th>
                       <th style={{ padding: '1rem', color: '#94a3b8', fontWeight: 600 }}>Status</th>
                     </tr>
                   </thead>
                   <tbody>
                     {kpis.lowStockItems.map(item => (
                       <tr key={item._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background 0.2s' }}>
                         <td style={{ padding: '1rem', fontWeight: 500, color: '#f8fafc' }}>{item.name}</td>
                         <td style={{ padding: '1rem', color: '#cbd5e1' }}>{item.totalQty}</td>
                         <td style={{ padding: '1rem', color: '#94a3b8' }}>{item.reorderPoint}</td>
                         <td style={{ padding: '1rem' }}>
                           <span style={{
                             padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700,
                             background: item.totalQty <= 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                             color: item.totalQty <= 0 ? '#f87171' : '#fbbf24'
                           }}>
                             {item.totalQty <= 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                           </span>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
             ) : (
               <div style={{ 
                 padding: '3rem', textAlign: 'center', color: '#94a3b8', 
                 background: 'rgba(15, 23, 42, 0.2)', borderRadius: '16px',
                 border: '1px dashed rgba(255, 255, 255, 0.1)'
               }}>
                 All stock levels are currently healthy!
               </div>
             )}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
