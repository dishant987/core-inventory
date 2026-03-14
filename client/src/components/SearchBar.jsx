import React from 'react';
import { Search, X } from 'lucide-react';

const SearchBar = ({ value, onChange, onClear, placeholder = "Search..." }) => {
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
      <Search 
        size={18} 
        color="#94a3b8" 
        style={{ 
          position: 'absolute', 
          left: '14px', 
          top: '50%', 
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }} 
      />
      <input 
        type="text" 
        placeholder={placeholder}
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '0.85rem 2.8rem 0.85rem 2.8rem',
          borderRadius: '14px',
          background: 'rgba(15, 23, 42, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          color: 'white',
          outline: 'none',
          fontSize: '0.9rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          boxSizing: 'border-box'
        }}
        onFocus={(e) => {
          e.target.style.borderColor = '#6366f1';
          e.target.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.1)';
          e.target.parentElement.style.transform = 'scale(1.02)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
          e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          e.target.parentElement.style.transform = 'scale(1)';
        }}
      />
      {value && (
        <button
          onClick={onClear}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            padding: 0,
            color: '#94a3b8'
          }}
        >
          <X size={12} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
