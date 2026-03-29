import React, { forwardRef } from 'react';

export const Input = forwardRef(function Input({ label, error, hint, ...props }, ref) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <input ref={ref} {...props} style={{ ...(error && { borderColor: 'var(--red)' }) }} />
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
      {hint && !error && <span style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{hint}</span>}
    </div>
  );
});

export const Textarea = forwardRef(function Textarea({ label, error, rows = 4, ...props }, ref) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <textarea ref={ref} rows={rows} {...props}
        style={{ resize: 'vertical', minHeight: '80px', ...(error && { borderColor: 'var(--red)' }) }}
      />
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
});

export const Select = forwardRef(function Select({ label, error, children, ...props }, ref) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
      {label && (
        <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-2)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {label}
        </label>
      )}
      <select ref={ref} {...props} style={{ cursor: 'pointer' }}>
        {children}
      </select>
      {error && <span style={{ fontSize: '0.78rem', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
});
