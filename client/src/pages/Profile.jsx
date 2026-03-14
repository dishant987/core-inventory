import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Shield, Hash, Calendar } from 'lucide-react';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user } = useAuth();

  return (
    <div style={{ color: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        background: 'rgba(30, 41, 59, 0.6)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        {/* Profile Header Background */}
        <div style={{
          height: '160px',
          background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
          position: 'relative'
        }}>
          {/* Avatar floating over the edge */}
          <div style={{
            position: 'absolute',
            bottom: '-50px',
            left: '40px',
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '4px solid #0f172a',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#a855f7'
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>

        {/* Profile Details Container */}
        <div style={{ padding: '4rem 2.5rem 2.5rem 2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '2rem', margin: '0 0 0.25rem 0', fontWeight: '700' }}>{user?.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a855f7', fontWeight: 500 }}>
              <Shield size={16} />
              <span>{user?.role}</span>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1.5rem'
          }}>
            {/* Detail Cards */}
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{ background: 'rgba(99, 102, 241, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#818cf8' }}>
                <Mail size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Email Address</p>
                <p style={{ margin: 0, fontWeight: 500, color: '#f8fafc' }}>{user?.email}</p>
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{ background: 'rgba(168, 85, 247, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#c084fc' }}>
                <Hash size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Login ID</p>
                <p style={{ margin: 0, fontWeight: 500, color: '#f8fafc' }}>{user?.loginId}</p>
              </div>
            </div>

            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{ background: 'rgba(236, 72, 153, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#f472b6' }}>
                <Shield size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Account Role</p>
                <p style={{ margin: 0, fontWeight: 500, color: '#f8fafc' }}>{user?.role}</p>
              </div>
            </div>
            
            <div style={{
              background: 'rgba(15, 23, 42, 0.5)',
              padding: '1.25rem',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.05)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem'
            }}>
              <div style={{ background: 'rgba(20, 184, 166, 0.2)', padding: '0.75rem', borderRadius: '12px', color: '#2dd4bf' }}>
                <Calendar size={24} />
              </div>
              <div>
                <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem', color: '#94a3b8' }}>Member Since</p>
                <p style={{ margin: 0, fontWeight: 500, color: '#f8fafc' }}>Today</p> {/* If actual createdAt becomes available from context, render it here */}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
