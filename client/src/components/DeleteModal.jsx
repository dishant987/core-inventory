import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

/**
 * Reusable delete-confirmation modal.
 *
 * Props:
 *  isOpen      – boolean
 *  onClose     – () => void
 *  onConfirm   – () => void  (called when user clicks "Delete")
 *  title       – string  (e.g. "Delete Product")
 *  itemName    – string  (the specific name/reference to show)
 *  description – string  (optional secondary explanation)
 *  loading     – boolean (shows spinner on confirm button)
 */
const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item',
  itemName = '',
  description = '',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(7, 11, 25, 0.82)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        zIndex: 1100, padding: '1rem',
        animation: 'dmFadeIn 0.18s ease',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'linear-gradient(160deg, rgba(20,30,55,0.99) 0%, rgba(15,23,42,0.99) 100%)',
          border: '1px solid rgba(239,68,68,0.25)',
          borderRadius: '20px',
          padding: '2rem',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.7), 0 0 0 1px rgba(239,68,68,0.1)',
          animation: 'dmSlideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon + Close row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#64748b', cursor: 'pointer', padding: '0.3rem', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#f8fafc'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Text */}
        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', letterSpacing: '-0.01em' }}>
          {title}
        </h3>

        {itemName && (
          <p style={{ margin: '0 0 0.75rem', color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>
            You are about to delete{' '}
            <span style={{
              fontWeight: 700, color: '#f1f5f9',
              background: 'rgba(239,68,68,0.1)', padding: '0.1rem 0.45rem',
              borderRadius: '5px', fontSize: '0.88rem',
            }}>
              {itemName}
            </span>
            .
          </p>
        )}

        <p style={{ margin: '0 0 1.75rem', color: '#64748b', fontSize: '0.875rem', lineHeight: 1.55 }}>
          {description || 'This action cannot be undone. Are you sure you want to continue?'}
        </p>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex: 1, padding: '0.72rem 1rem',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#94a3b8', borderRadius: '10px',
              fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer',
              fontFamily: 'inherit', transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.color = '#f1f5f9'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseOut={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{
              flex: 1, padding: '0.72rem 1rem',
              background: loading ? 'rgba(239,68,68,0.4)' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              border: 'none', color: 'white',
              borderRadius: '10px', fontWeight: 600, fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              boxShadow: loading ? 'none' : '0 4px 14px rgba(239,68,68,0.35)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseOver={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(239,68,68,0.5)'; } }}
            onMouseOut={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 4px 14px rgba(239,68,68,0.35)'; }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%',
                  display: 'inline-block', animation: 'dmSpin 0.7s linear infinite',
                }} />
                Deleting…
              </>
            ) : (
              <>
                <Trash2 size={15} /> Delete
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes dmFadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes dmSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: none; } }
        @keyframes dmSpin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default DeleteModal;
