import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      marginTop: '2rem',
      paddingBottom: '1rem',
      flexWrap: 'wrap'
    }}>
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: currentPage === 1 ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.1)',
          color: currentPage === 1 ? '#64748b' : '#818cf8',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <ChevronLeft size={20} />
      </button>

      {start > 1 && (
        <>
          <button
            onClick={() => onPageChange(1)}
            style={pageButtonStyle(false)}
          >
            1
          </button>
          {start > 2 && <span style={{ color: '#64748b' }}>...</span>}
        </>
      )}

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          style={pageButtonStyle(page === currentPage)}
        >
          {page}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span style={{ color: '#64748b' }}>...</span>}
          <button
            onClick={() => onPageChange(totalPages)}
            style={pageButtonStyle(false)}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          background: currentPage === totalPages ? 'rgba(255, 255, 255, 0.05)' : 'rgba(99, 102, 241, 0.1)',
          color: currentPage === totalPages ? '#64748b' : '#818cf8',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s'
        }}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

const pageButtonStyle = (isActive) => ({
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  border: isActive ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.1)',
  background: isActive ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)' : 'rgba(15, 23, 42, 0.5)',
  color: 'white',
  fontWeight: isActive ? '600' : '400',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontSize: '0.9rem'
});

export default Pagination;
