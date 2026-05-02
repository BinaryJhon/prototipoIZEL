'use client'

import {
  RadarChart, Radar, PolarGrid,
  PolarAngleAxis, ResponsiveContainer
} from 'recharts'
import { HexagonDimensions } from '@/types/user'

interface Props {
  dimensiones: HexagonDimensions
  size?: number
}

export function HexagonoChart({ dimensiones, size = 280 }: Props) {
  const data = [
    { eje: 'Ánimo',      valor: dimensiones.animo },
    { eje: 'Movimiento', valor: dimensiones.movimiento },
    { eje: 'Nutrición',  valor: dimensiones.nutricion },
    { eje: 'Mente',      valor: dimensiones.mente },
    { eje: 'Constancia', valor: dimensiones.constancia },
    { eje: 'Conexión',   valor: dimensiones.conexion },
  ]

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid
          gridType="polygon"
          stroke="rgba(42,90,59,0.1)"
        />
        <PolarAngleAxis
          dataKey="eje"
          tick={{
            fontSize:   12,
            fontWeight: 600,
            fill:       'rgba(42,90,59,0.6)',
            fontFamily: 'var(--font-dm-sans)',
          }}
        />
        <Radar
          dataKey="valor"
          stroke="#2A5A3B"
          fill="#2A5A3B"
          fillOpacity={0.12}
          strokeWidth={2}
          dot={{ fill: '#2A5A3B', r: 4 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
