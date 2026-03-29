import React from 'react';
import { Button } from '../ui/Button';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar({ stats }) {
  const { user, handleLogout } = useAuth();

  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15,15,17,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto',
        padding: '0.75rem 1.5rem',
        minHeight: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: '1rem'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 30, height: 30, borderRadius: 8,
            background: 'var(--accent-lo)', border: '1px solid var(--accent)',
            fontSize: '0.9rem',
          }}>✓</span>
          <span className="logo-text" style={{ fontWeight: 800, fontSize: '1.2rem' }}>ZENITH</span>
        </div>

        {/* Stats pills */}
        {stats && (
          <div className="hide-on-mobile" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Total',    val: stats.total,         color: 'var(--text-2)' },
              { label: 'Done',     val: stats.completed,     color: 'var(--green)'  },
              { label: 'Pending',  val: stats.pending,       color: 'var(--yellow)' },
              { label: '🔥 High',  val: stats.high_priority, color: 'var(--red)'    },
            ].map(({ label, val, color }) => (
              <div key={label} style={{
                padding: '0.2rem 0.65rem',
                borderRadius: 99,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                fontSize: '0.75rem',
                color,
                fontWeight: 600,
                display: 'flex', gap: '0.3rem',
              }}>
                <span style={{ color: 'var(--text-3)' }}>{label}</span>
                {val ?? 0}
              </div>
            ))}
          </div>
        )}

        {/* User + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="hide-on-mobile" style={{ fontSize: '0.8rem', color: 'var(--text-2)' }}>{user?.name}</span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
        </div>
      </div>
    </header>
  );
}
