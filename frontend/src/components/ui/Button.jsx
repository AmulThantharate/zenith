import React from 'react';

const variants = {
  primary:  { background: 'var(--accent)',    color: '#fff' },
  ghost:    { background: 'transparent',      color: 'var(--text-2)', border: '1px solid var(--border)' },
  danger:   { background: 'var(--red-lo)',    color: 'var(--red)' },
  success:  { background: 'var(--green-lo)',  color: 'var(--green)' },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style = {},
  ...props
}) {
  const sizeStyle = size === 'sm'
    ? { padding: '0.35rem 0.75rem', fontSize: '0.8rem' }
    : size === 'lg'
    ? { padding: '0.75rem 1.5rem', fontSize: '1rem' }
    : { padding: '0.55rem 1.1rem', fontSize: '0.875rem' };

  return (
    <button
      disabled={disabled || loading}
      style={{
        display:        'inline-flex',
        alignItems:     'center',
        justifyContent: 'center',
        gap:            '0.4rem',
        borderRadius:   'var(--radius)',
        fontWeight:     800,
        textTransform:  'uppercase',
        fontFamily:     'var(--font-title)',
        fontStyle:      'normal',
        letterSpacing:  '0.01em',
        transition:     'opacity var(--transition), transform var(--transition), box-shadow var(--transition)',
        opacity:        disabled || loading ? 0.5 : 1,
        cursor:         disabled || loading ? 'not-allowed' : 'pointer',
        width:          fullWidth ? '100%' : undefined,
        ...variants[variant],
        ...sizeStyle,
        ...style,
      }}
      onMouseEnter={(e) => { if (!disabled && !loading) e.currentTarget.style.opacity = '0.85'; }}
      onMouseLeave={(e) => { if (!disabled && !loading) e.currentTarget.style.opacity = '1'; }}
      {...props}
    >
      {loading && (
        <span style={{
          width: '14px', height: '14px',
          border: '2px solid currentColor',
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
          display: 'inline-block',
          flexShrink: 0,
        }} />
      )}
      {children}
    </button>
  );
}
