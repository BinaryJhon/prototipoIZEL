interface Props {
  valor:    number  // 0-100
  tamaño?:  number  // px
  grosor?:  number  // px
  color?:   string
  children?: React.ReactNode
}

export function ProgressRing({
  valor,
  tamaño  = 80,
  grosor  = 6,
  color   = '#2A5A3B',
  children,
}: Props) {
  const radio  = (tamaño - grosor) / 2
  const circunf = 2 * Math.PI * radio
  const progreso = ((100 - valor) / 100) * circunf

  return (
    <div style={{ position: 'relative', width: tamaño, height: tamaño }}>
      <svg
        width={tamaño}
        height={tamaño}
        viewBox={`0 0 ${tamaño} ${tamaño}`}
        style={{ transform: 'rotate(-90deg)' }}
      >
        {/* Track */}
        <circle
          cx={tamaño / 2}
          cy={tamaño / 2}
          r={radio}
          fill="none"
          stroke="rgba(42,90,59,0.08)"
          strokeWidth={grosor}
        />
        {/* Progreso */}
        <circle
          cx={tamaño / 2}
          cy={tamaño / 2}
          r={radio}
          fill="none"
          stroke={color}
          strokeWidth={grosor}
          strokeLinecap="round"
          strokeDasharray={circunf}
          strokeDashoffset={progreso}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      {/* Contenido centrado */}
      {children && (
        <div style={{
          position:       'absolute',
          inset:          0,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}
