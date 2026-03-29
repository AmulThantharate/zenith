import React from 'react';

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: '1rem',
      background: 'radial-gradient(ellipse at 60% 0%, #7c6aff18 0%, transparent 60%), var(--bg)',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow)',
        animation: 'fadeIn 250ms ease',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 48, borderRadius: 12,
            background: 'var(--accent-lo)', border: '1px solid var(--accent)',
            fontSize: '1.4rem', marginBottom: '1rem',
          }}>✓</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{title}</h1>
          {subtitle && <p style={{ color: 'var(--text-2)', fontSize: '0.875rem', marginTop: '0.35rem' }}>{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  );
}
