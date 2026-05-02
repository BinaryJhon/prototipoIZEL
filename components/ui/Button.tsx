import { ButtonHTMLAttributes } from 'react'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primary' | 'secondary' | 'ghost'
  tamaño?:   'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const VARIANTES = {
  primary: {
    background:  '#2A5A3B',
    color:       '#FDF9F1',
    border:      'none',
    boxShadow:   'none',
  },
  secondary: {
    background:  '#4CA861',
    color:       '#FFFFFF',
    border:      'none',
    boxShadow:   '0 0 12px rgba(76,168,97,0.3)',
  },
  ghost: {
    background:  'transparent',
    color:       '#2A5A3B',
    border:      '1px solid rgba(42,90,59,0.2)',
    boxShadow:   'none',
  },
}

const TAMAÑOS = {
  sm: { padding: '8px 16px',  fontSize: '11px', letterSpacing: '1.5px' },
  md: { padding: '12px 24px', fontSize: '12px', letterSpacing: '2px'   },
  lg: { padding: '16px 32px', fontSize: '13px', letterSpacing: '2px'   },
}

export function Button({
  variante  = 'primary',
  tamaño    = 'md',
  fullWidth = false,
  disabled,
  children,
  style,
  ...props
}: Props) {
  const v = VARIANTES[variante]
  const t = TAMAÑOS[tamaño]

  return (
    <button
      disabled={disabled}
      style={{
        ...v,
        ...t,
        width:         fullWidth ? '100%' : 'auto',
        borderRadius:  '4px',
        fontFamily:    'var(--font-dm-sans)',
        fontWeight:    600,
        textTransform: 'uppercase',
        cursor:        disabled ? 'not-allowed' : 'pointer',
        opacity:       disabled ? 0.4 : 1,
        transition:    'all 0.3s ease',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  )
}
