import { HTMLAttributes } from 'react'

interface Props extends HTMLAttributes<HTMLDivElement> {
  variante?: 'default' | 'dark' | 'subtle'
  padding?:  'sm' | 'md' | 'lg'
}

const VARIANTES = {
  default: {
    background: '#FFFFFF',
    border:     '1px solid rgba(42,90,59,0.1)',
    boxShadow:  '0 4px 24px rgba(42,90,59,0.06)',
  },
  dark: {
    background: '#2A5A3B',
    border:     'none',
    boxShadow:  'none',
  },
  subtle: {
    background: 'rgba(42,90,59,0.04)',
    border:     '1px solid rgba(42,90,59,0.08)',
    boxShadow:  'none',
  },
}

const PADDINGS = {
  sm: '12px 16px',
  md: '20px',
  lg: '24px 28px',
}

export function Card({
  variante = 'default',
  padding  = 'md',
  children,
  style,
  ...props
}: Props) {
  return (
    <div
      style={{
        ...VARIANTES[variante],
        padding:      PADDINGS[padding],
        borderRadius: '12px',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  )
}
