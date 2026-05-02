'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer
} from 'recharts'
import { getUserProfile } from '@/lib/session'
import { trackEvent, getDaysActive, countEvents } from '@/lib/events'
import {
  calcularHexagono,
  calcularHealthMetrics,
  calcularAdvancedMetrics,
} from '@/lib/metrics'
import { HexagonDimensions, HealthMetrics, AdvancedMetrics } from '@/types/user'

// ─── HELPERS ─────────────────────────────────────────────────

function getEstadoMetrica(valor: number): { label: string; color: string } {
  if (valor >= 70) return { label: 'Óptimo',   color: '#4CA861' }
  if (valor >= 40) return { label: 'Estable',   color: '#D4AF37' }
  return              { label: 'Bajo',       color: 'rgba(42,90,59,0.35)' }
}

function getEstadoInverso(valor: number): { label: string; color: string } {
  // Para métricas donde bajo = bueno (estrés, inflamación)
  if (valor <= 30) return { label: 'Óptimo',   color: '#4CA861' }
  if (valor <= 60) return { label: 'Moderado', color: '#D4AF37' }
  return              { label: 'Elevado',   color: '#C0392B' }
}

function getEstadoPresion(sistolica: number): { label: string; color: string } {
  if (sistolica < 120) return { label: 'Óptima',   color: '#4CA861' }
  if (sistolica < 130) return { label: 'Normal',    color: '#D4AF37' }
  return                  { label: 'Elevada',   color: '#C0392B' }
}

function getEstadoTrigliceridos(valor: number): { label: string; color: string } {
  if (valor < 150) return { label: 'Normal',   color: '#4CA861' }
  if (valor < 200) return { label: 'Límite',   color: '#D4AF37' }
  return              { label: 'Elevado',  color: '#C0392B' }
}

function getEstadoGlucosa(valor: number): { label: string; color: string } {
  if (valor < 100) return { label: 'Normal',   color: '#4CA861' }
  if (valor < 126) return { label: 'Límite',   color: '#D4AF37' }
  return              { label: 'Alto',      color: '#C0392B' }
}

// ─── COMPONENTE ──────────────────────────────────────────────

export default function Progress() {
  const router = useRouter()

  const [hexagono, setHexagono]     = useState<HexagonDimensions | null>(null)
  const [health, setHealth]         = useState<HealthMetrics | null>(null)
  const [advanced, setAdvanced]     = useState<AdvancedMetrics | null>(null)
  const [nombre, setNombre]         = useState('')
  const [diasActivos, setDias]      = useState(0)
  const [correo, setCorreo]         = useState('')
  const [correoEnviado, setEnviado] = useState(false)
  const [enviando, setEnviando]     = useState(false)

  // ─── INIT ───────────────────────────────────────────────

  useEffect(() => {
    const profile = getUserProfile()
    if (!profile) { router.push('/onboarding'); return }

    setNombre(profile.nombre)
    setHexagono(calcularHexagono())
    setHealth(calcularHealthMetrics())
    setAdvanced(calcularAdvancedMetrics())
    setDias(getDaysActive())

    // Correo ya enviado antes
    const correoGuardado = localStorage.getItem('izel_correo')
    if (correoGuardado) setEnviado(true)
  }, [router])

  // ─── DATOS PARA RECHARTS ─────────────────────────────────

  const radarData = hexagono ? [
    { eje: 'Ánimo',      valor: hexagono.animo },
    { eje: 'Movimiento', valor: hexagono.movimiento },
    { eje: 'Nutrición',  valor: hexagono.nutricion },
    { eje: 'Mente',      valor: hexagono.mente },
    { eje: 'Constancia', valor: hexagono.constancia },
    { eje: 'Conexión',   valor: hexagono.conexion },
  ] : []

  // ─── ENVIAR CORREO ───────────────────────────────────────

  async function handleCorreo() {
    if (!correo.trim() || !correo.includes('@')) return
    setEnviando(true)

    try {
      await trackEvent('email_submitted', { correo })
      localStorage.setItem('izel_correo', correo)
      setEnviado(true)
    } catch {
      // falla silenciosa
    } finally {
      setEnviando(false)
    }
  }

  // ─── RENDER ─────────────────────────────────────────────

  if (!hexagono || !health || !advanced) return null

  const mensajes  = countEvents('message_sent')
  const misiones  = countEvents('mission_completed')
  const focos     = countEvents('focus_completed')

  return (
    <main style={{
      minHeight:     '100vh',
      fontFamily:    'var(--font-dm-sans)',
      color:         '#2A5A3B',
      maxWidth:      '480px',
      margin:        '0 auto',
      padding:       '32px 24px 80px',
    }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '40px' }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background: 'transparent',
            border:     'none',
            cursor:     'pointer',
            fontSize:   '18px',
            color:      '#2A5A3B',
            padding:    '4px',
          }}
        >
          ←
        </button>
        <div style={{ marginLeft: '12px' }}>
          <h1 style={{
            fontFamily: 'var(--font-playfair)',
            fontSize:   '24px',
            fontWeight: 700,
            fontStyle:  'italic',
            lineHeight: 1,
          }}>
            Tu progreso
          </h1>
          <p style={{ fontSize: '12px', opacity: 0.45, marginTop: '4px' }}>
            {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      {/* ── HEXÁGONO ── */}
      <div style={{
        background:   '#FFFFFF',
        borderRadius: '16px',
        border:       '1px solid rgba(42,90,59,0.1)',
        padding:      '24px 16px',
        marginBottom: '24px',
      }}>
        <p style={{
          fontSize:     '10px',
          letterSpacing:'3px',
          textTransform:'uppercase',
          fontWeight:   700,
          opacity:      0.45,
          marginBottom: '4px',
        }}>
          Bienestar integral
        </p>
        <p style={{
          fontFamily:   'var(--font-playfair)',
          fontSize:     '20px',
          fontWeight:   700,
          fontStyle:    'italic',
          marginBottom: '16px',
        }}>
          {nombre}, así estás hoy
        </p>

        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
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
              dot={{ fill: '#2A5A3B', r: 3 }}
            />
          </RadarChart>
        </ResponsiveContainer>

        {/* Valores numéricos debajo */}
        <div style={{
          display:             'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap:                 '8px',
          marginTop:           '8px',
        }}>
          {radarData.map(({ eje, valor }) => {
            const est = getEstadoMetrica(valor)
            return (
              <div key={eje} style={{
                textAlign:    'center',
                padding:      '8px',
                background:   'rgba(42,90,59,0.03)',
                borderRadius: '8px',
              }}>
                <p style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1 }}>{valor}</p>
                <p style={{ fontSize: '10px', opacity: 0.5, margin: '2px 0', textTransform: 'capitalize' }}>{eje}</p>
                <p style={{ fontSize: '10px', fontWeight: 700, color: est.color }}>{est.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── ESTADÍSTICAS DE USO ── */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: '1fr 1fr',
        gap:                 '12px',
        marginBottom:        '24px',
      }}>
        {[
          { label: 'Días activos',  valor: diasActivos, emoji: '📅' },
          { label: 'Mensajes',      valor: mensajes,    emoji: '💬' },
          { label: 'Misiones',      valor: misiones,    emoji: '✓'  },
          { label: 'Ciclos foco',   valor: focos,       emoji: '🎯' },
        ].map(item => (
          <div key={item.label} style={{
            background:   '#FFFFFF',
            borderRadius: '12px',
            border:       '1px solid rgba(42,90,59,0.08)',
            padding:      '16px',
            display:      'flex',
            alignItems:   'center',
            gap:          '12px',
          }}>
            <span style={{ fontSize: '24px' }}>{item.emoji}</span>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 600, lineHeight: 1 }}>{item.valor}</p>
              <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── MÉTRICAS CORE ── */}
      <div style={{
        background:   '#FFFFFF',
        borderRadius: '16px',
        border:       '1px solid rgba(42,90,59,0.1)',
        padding:      '20px',
        marginBottom: '24px',
      }}>
        <p style={{
          fontSize:     '10px',
          letterSpacing:'3px',
          textTransform:'uppercase',
          fontWeight:   700,
          opacity:      0.45,
          marginBottom: '20px',
        }}>
          Indicadores generales
        </p>

        {[
          { label: 'Energía',    valor: health.energyLevel,      inverso: false },
          { label: 'Estrés',     valor: health.stressLevel,      inverso: true  },
          { label: 'Actividad',  valor: health.activityLevel,    inverso: false },
          { label: 'Nutrición',  valor: health.nutritionQuality, inverso: false },
          { label: 'Sueño',      valor: health.sleepQuality,     inverso: false },
          { label: 'Hidratación',valor: health.hydration,        inverso: false },
        ].map(({ label, valor, inverso }) => {
          const est = inverso ? getEstadoInverso(valor) : getEstadoMetrica(valor)
          return (
            <div key={label} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: est.color }}>{est.label}</span>
              </div>
              <div style={{
                height:       '4px',
                background:   'rgba(42,90,59,0.08)',
                borderRadius: '2px',
                overflow:     'hidden',
              }}>
                <div style={{
                  height:     '100%',
                  width:      `${valor}%`,
                  background: est.color,
                  borderRadius:'2px',
                  transition: 'width 1s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── MÉTRICAS AVANZADAS ── */}
      <div style={{
        background:   '#FFFFFF',
        borderRadius: '16px',
        border:       '1px solid rgba(42,90,59,0.1)',
        padding:      '20px',
        marginBottom: '24px',
      }}>
        <p style={{
          fontSize:     '10px',
          letterSpacing:'3px',
          textTransform:'uppercase',
          fontWeight:   700,
          opacity:      0.45,
          marginBottom: '4px',
        }}>
          Indicadores avanzados
        </p>
        <p style={{
          fontFamily:   'var(--font-playfair)',
          fontSize:     '18px',
          fontWeight:   700,
          fontStyle:    'italic',
          marginBottom: '20px',
        }}>
          Vista fisiológica
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {/* Presión arterial */}
          {(() => {
            const est = getEstadoPresion(advanced.bloodPressure.sistolica)
            return (
              <div style={{
                padding:      '16px',
                background:   'rgba(42,90,59,0.03)',
                borderRadius: '10px',
                border:       '1px solid rgba(42,90,59,0.06)',
              }}>
                <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '8px' }}>Presión arterial</p>
                <p style={{ fontSize: '20px', fontWeight: 600, lineHeight: 1, marginBottom: '4px' }}>
                  {advanced.bloodPressure.sistolica}/{advanced.bloodPressure.diastolica}
                </p>
                <p style={{ fontSize: '11px', fontWeight: 700, color: est.color }}>{est.label}</p>
              </div>
            )
          })()}

          {/* Triglicéridos */}
          {(() => {
            const est = getEstadoTrigliceridos(advanced.triglycerides)
            return (
              <div style={{
                padding:      '16px',
                background:   'rgba(42,90,59,0.03)',
                borderRadius: '10px',
                border:       '1px solid rgba(42,90,59,0.06)',
              }}>
                <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '8px' }}>Triglicéridos</p>
                <p style={{ fontSize: '20px', fontWeight: 600, lineHeight: 1, marginBottom: '4px' }}>
                  {advanced.triglycerides} <span style={{ fontSize: '11px', opacity: 0.4 }}>mg/dL</span>
                </p>
                <p style={{ fontSize: '11px', fontWeight: 700, color: est.color }}>{est.label}</p>
              </div>
            )
          })()}

          {/* Glucosa */}
          {(() => {
            const est = getEstadoGlucosa(advanced.glucoseLevel)
            return (
              <div style={{
                padding:      '16px',
                background:   'rgba(42,90,59,0.03)',
                borderRadius: '10px',
                border:       '1px solid rgba(42,90,59,0.06)',
              }}>
                <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '8px' }}>Glucosa</p>
                <p style={{ fontSize: '20px', fontWeight: 600, lineHeight: 1, marginBottom: '4px' }}>
                  {advanced.glucoseLevel} <span style={{ fontSize: '11px', opacity: 0.4 }}>mg/dL</span>
                </p>
                <p style={{ fontSize: '11px', fontWeight: 700, color: est.color }}>{est.label}</p>
              </div>
            )
          })()}

          {/* Salud cardíaca */}
          {(() => {
            const est = getEstadoMetrica(advanced.heartHealth)
            return (
              <div style={{
                padding:      '16px',
                background:   'rgba(42,90,59,0.03)',
                borderRadius: '10px',
                border:       '1px solid rgba(42,90,59,0.06)',
              }}>
                <p style={{ fontSize: '11px', opacity: 0.5, marginBottom: '8px' }}>Salud cardíaca</p>
                <p style={{ fontSize: '20px', fontWeight: 600, lineHeight: 1, marginBottom: '4px' }}>
                  {advanced.heartHealth}<span style={{ fontSize: '11px', opacity: 0.4 }}>/100</span>
                </p>
                <p style={{ fontSize: '11px', fontWeight: 700, color: est.color }}>{est.label}</p>
              </div>
            )
          })()}
        </div>
      </div>

      {/* ── CAPTURA DE CORREO ── */}
      <div style={{
        background:   '#2A5A3B',
        borderRadius: '16px',
        padding:      '28px 24px',
        marginBottom: '24px',
        textAlign:    'center',
      }}>
        {!correoEnviado ? (
          <>
            <p style={{
              fontFamily:   'var(--font-playfair)',
              fontSize:     '20px',
              fontWeight:   700,
              fontStyle:    'italic',
              color:        '#F8F4EB',
              marginBottom: '8px',
            }}>
              ¿Te gustó IZEL?
            </p>
            <p style={{
              fontSize:     '13px',
              color:        'rgba(248,244,235,0.7)',
              marginBottom: '20px',
              lineHeight:   1.6,
            }}>
              Déjanos tu correo y te avisamos cuando lancemos.
            </p>
            <input
              type="email"
              value={correo}
              onChange={e => setCorreo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCorreo()}
              placeholder="tu@correo.com"
              style={{
                width:        '100%',
                padding:      '12px 16px',
                fontSize:     '14px',
                fontFamily:   'var(--font-dm-sans)',
                color:        '#2A5A3B',
                background:   '#F8F4EB',
                border:       'none',
                borderRadius: '6px',
                outline:      'none',
                marginBottom: '10px',
                boxSizing:    'border-box',
              }}
            />
            <button
              onClick={handleCorreo}
              disabled={!correo.includes('@') || enviando}
              style={{
                width:        '100%',
                padding:      '13px',
                background:   correo.includes('@') ? '#4CA861' : 'rgba(248,244,235,0.2)',
                color:        '#FFFFFF',
                border:       'none',
                borderRadius: '6px',
                fontSize:     '12px',
                fontWeight:   600,
                letterSpacing:'2px',
                textTransform:'uppercase',
                cursor:       correo.includes('@') ? 'pointer' : 'not-allowed',
                fontFamily:   'var(--font-dm-sans)',
                transition:   'all 0.3s ease',
              }}
            >
              {enviando ? 'Guardando...' : 'Quiero saber más'}
            </button>
          </>
        ) : (
          <div>
            <p style={{ fontSize: '32px', marginBottom: '12px' }}>🙌</p>
            <p style={{
              fontFamily: 'var(--font-playfair)',
              fontSize:   '20px',
              fontWeight: 700,
              fontStyle:  'italic',
              color:      '#F8F4EB',
              marginBottom:'8px',
            }}>
              ¡Gracias!
            </p>
            <p style={{ fontSize: '13px', color: 'rgba(248,244,235,0.6)' }}>
              Te avisamos cuando lancemos IZEL.
            </p>
          </div>
        )}
      </div>

      {/* ── DISCLAIMER ── */}
      <p style={{
        fontSize:   '11px',
        textAlign:  'center',
        opacity:    0.35,
        lineHeight: 1.6,
        marginTop:  '8px',
      }}>
        ✦ Indicadores simulados · Solo orientativos · No reemplazan consulta médica
      </p>
    </main>
  )
}
