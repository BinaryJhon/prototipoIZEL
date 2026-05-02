'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getUserProfile } from '@/lib/session'
import { trackEvent } from '@/lib/events'
import { getMascota } from '@/data/mascotas'
import { Mascota } from '@/types/mascota'

// ─── TIPOS LOCALES ────────────────────────────────────────────

type FocusEstado = 'idle' | 'focus' | 'descanso' | 'completado'

// ─── CONSTANTES ───────────────────────────────────────────────

const FOCUS_SEGUNDOS    = 25 * 60  // 25 minutos
const DESCANSO_SEGUNDOS = 5  * 60  // 5 minutos

// ─── HELPERS ─────────────────────────────────────────────────

function formatTiempo(segundos: number): string {
  const m = Math.floor(segundos / 60).toString().padStart(2, '0')
  const s = (segundos % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// Radio del anillo SVG
const RADIO   = 88
const CIRCUNF = 2 * Math.PI * RADIO

function getProgreso(segundos: number, total: number): number {
  return ((total - segundos) / total) * CIRCUNF
}

// ─── MENSAJES DE DESCANSO POR MASCOTA ────────────────────────

const MENSAJES_DESCANSO: Record<string, string[]> = {
  'ajolote':          ['¡Lo lograste! Regenera tu energía como yo lo hago.', 'Descansa, los grandes ciclos necesitan pausas.'],
  'jaguar':           ['¡Excelente cacería! 5 minutos y volvemos a la selva.', 'El guerrero también necesita descansar.'],
  'quetzal':          ['Vuelas alto. Ahora descansa tus alas por 5 minutos.', 'La sabiduría también se cultiva en el silencio.'],
  'xoloitzcuintle':   ['¡Muy bien! Tómate un respiro, yo te cuido.', '5 minutitos y seguimos juntos.'],
  'lobo-mexicano':    ['¡La manada descansa para volver más fuerte!', 'Buen trabajo. Recarga energía.'],
  'ocelote':          ['¡Ágil y enfocado! Ahora una pausa estratégica.', 'El ocelote también necesita su momento.'],
  'aguila-real':      ['Visión clara, mente descansada. 5 minutos.', '¡Desde las alturas lo viste todo!'],
  'cenzontle':        ['Tu concentración fue música para mis oídos.', 'Descansa tu mente, luego cantamos más.'],
  'cacomixtle':       ['¡Te adaptaste perfecto! Pausa merecida.', 'Flexible y enfocado, así me gusta.'],
  'tlacuache':        ['Caíste y te levantaste. Ahora descansa.', 'La resiliencia también incluye el descanso.'],
  'murcielago-frutero': ['Navegaste en la oscuridad con precisión.', 'Descansa tus sentidos 5 minutos.'],
  'oso-hormiguero':   ['Paciencia y constancia, eso es lo tuyo.', 'Pequeño descanso para seguir avanzando.'],
  'vaquita-marina':   ['Rara y valiosa, como tu concentración.', '5 minutos para ti, lo mereces.'],
  'quetzalcoatl':     ['La transformación requiere pausas sagradas.', '5 minutos de renovación.'],
  'iguana-espinosa':  ['Firme como la roca. Ahora descansa.', 'Nada te movió. Excelente.'],
  'mariposa-monarca': ['¡Volaste libre y enfocado!', 'Pequeña pausa en tu gran migración.'],
  'mono-aullador':    ['¡Lo gritaste con todo! Ahora silencio y descanso.', '5 minutos y seguimos con energía.'],
  'sapo-cresta':      ['Observaste y te concentraste. Bien hecho.', 'El sabio también descansa.'],
  'tecolote':         ['En silencio y oscuridad, lo lograste.', 'Descansa tus ojos nocturnos.'],
  'teporingo':        ['¡Pequeño pero veloz e imparable!', '5 minutitos y volvemos a correr.'],
  'vibora-cascabel':  ['Directo al objetivo. Sin rodeos.', 'Pausa precisa. 5 minutos.'],
}

function getMensajeDescanso(mascotaId: string): string {
  const msgs = MENSAJES_DESCANSO[mascotaId] ?? ['¡Excelente trabajo! Descansa 5 minutos.']
  return msgs[Math.floor(Math.random() * msgs.length)]
}

// ─── COMPONENTE ──────────────────────────────────────────────

export default function Focus() {
  const router = useRouter()

  const [mascota, setMascota]         = useState<Mascota | null>(null)
  const [estado, setEstado]           = useState<FocusEstado>('idle')
  const [segundos, setSegundos]       = useState(FOCUS_SEGUNDOS)
  const [ciclos, setCiclos]           = useState(0)
  const [mensajeDescanso, setMensaje] = useState('')
  const [iniciado, setIniciado]       = useState(0) // timestamp de inicio
  const intervalRef                   = useRef<ReturnType<typeof setInterval> | null>(null)

  // ─── INIT ─────────────────────────────────────────────────

  useEffect(() => {
    const profile = getUserProfile()
    if (!profile) { router.push('/onboarding'); return }

    const m = getMascota(profile.mascotaId)
    if (m) setMascota(m)
  }, [router])

  // ─── TIMER ────────────────────────────────────────────────

  useEffect(() => {
    if (estado === 'focus' || estado === 'descanso') {
      intervalRef.current = setInterval(() => {
        setSegundos(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!)
            if (estado === 'focus')    handleFocusCompleto()
            if (estado === 'descanso') handleDescansoCompleto()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [estado])

  // ─── ACCIONES ─────────────────────────────────────────────

  function iniciarFocus() {
    setEstado('focus')
    setSegundos(FOCUS_SEGUNDOS)
    setIniciado(Date.now())
    trackEvent('focus_started')
  }

  async function handleFocusCompleto() {
    const duracion = Math.round((Date.now() - iniciado) / 1000 / 60)
    await trackEvent('focus_completed', { duracion, ciclo: ciclos + 1 })
    setCiclos(prev => prev + 1)
    setMensaje(getMensajeDescanso(mascota?.id ?? ''))
    setEstado('descanso')
    setSegundos(DESCANSO_SEGUNDOS)
  }

  function handleDescansoCompleto() {
    setEstado('completado')
  }

  async function interrumpir() {
    if (intervalRef.current) clearInterval(intervalRef.current)
    const duracion = Math.round((Date.now() - iniciado) / 1000 / 60)
    await trackEvent('focus_interrupted', { duracion, segundosRestantes: segundos })
    setEstado('idle')
    setSegundos(FOCUS_SEGUNDOS)
  }

  function reiniciar() {
    setEstado('idle')
    setSegundos(FOCUS_SEGUNDOS)
    setCiclos(0)
  }

  // ─── ANILLO SVG ───────────────────────────────────────────

  const totalSegundos = estado === 'descanso' ? DESCANSO_SEGUNDOS : FOCUS_SEGUNDOS
  const progreso      = estado === 'idle' || estado === 'completado'
    ? 0
    : getProgreso(segundos, totalSegundos)

  const colorAnillo = estado === 'descanso' ? '#4CA861' : '#2A5A3B'

  // ─── RENDER ───────────────────────────────────────────────

  if (!mascota) return null

  return (
    <main style={{
      minHeight:      '100vh',
      fontFamily:     'var(--font-dm-sans)',
      color:          '#2A5A3B',
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      maxWidth:       '480px',
      margin:         '0 auto',
      padding:        '32px 24px 80px',
    }}>

      {/* ── HEADER ── */}
      <div style={{
        width:          '100%',
        display:        'flex',
        alignItems:     'center',
        marginBottom:   '40px',
      }}>
        <button
          onClick={() => {
            if (estado === 'focus') interrumpir()
            router.push('/dashboard')
          }}
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
        <h1 style={{
          fontFamily:  'var(--font-playfair)',
          fontSize:    '20px',
          fontWeight:  700,
          fontStyle:   'italic',
          marginLeft:  '12px',
        }}>
          Modo enfoque
        </h1>
        {ciclos > 0 && (
          <span style={{
            marginLeft:  'auto',
            fontSize:    '12px',
            fontWeight:  600,
            opacity:     0.5,
          }}>
            🔥 {ciclos} {ciclos === 1 ? 'ciclo' : 'ciclos'}
          </span>
        )}
      </div>

      {/* ── ESTADO: IDLE ── */}
      {estado === 'idle' && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          {/* Mascota */}
          <div
            className="animate-floating-pet"
            style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 32px' }}
          >
            <Image src={mascota.imagen} alt={mascota.nombre} fill sizes="160px" style={{ objectFit: 'contain' }} />
          </div>

          <h2 style={{
            fontFamily:   'var(--font-playfair)',
            fontSize:     '28px',
            fontWeight:   700,
            fontStyle:    'italic',
            marginBottom: '12px',
          }}>
            ¿Listo para enfocarte?
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.55, marginBottom: '48px', lineHeight: 1.6 }}>
            25 minutos de enfoque profundo,{'\n'}5 minutos de descanso.
          </p>

          <button
            onClick={iniciarFocus}
            style={{
              width:        '100%',
              padding:      '18px',
              background:   '#2A5A3B',
              color:        '#FDF9F1',
              border:       'none',
              borderRadius: '4px',
              fontSize:     '13px',
              fontWeight:   600,
              letterSpacing:'2px',
              textTransform:'uppercase',
              cursor:       'pointer',
              fontFamily:   'var(--font-dm-sans)',
            }}
          >
            Iniciar sesión
          </button>
        </div>
      )}

      {/* ── ESTADO: FOCUS / DESCANSO ── */}
      {(estado === 'focus' || estado === 'descanso') && (
        <div style={{ textAlign: 'center', width: '100%' }}>

          {/* Etiqueta */}
          <p style={{
            fontSize:     '11px',
            letterSpacing:'4px',
            textTransform:'uppercase',
            fontWeight:   600,
            opacity:      0.45,
            marginBottom: '32px',
          }}>
            {estado === 'focus' ? '✦ Enfoque profundo' : '✦ Descanso'}
          </p>

          {/* Anillo SVG + Timer */}
          <div style={{ position: 'relative', width: '220px', height: '220px', margin: '0 auto 40px' }}>
            <svg
              width="220"
              height="220"
              viewBox="0 0 220 220"
              style={{ transform: 'rotate(-90deg)' }}
            >
              {/* Track */}
              <circle
                cx="110" cy="110" r={RADIO}
                fill="none"
                stroke="rgba(42,90,59,0.08)"
                strokeWidth="8"
              />
              {/* Progreso */}
              <circle
                cx="110" cy="110" r={RADIO}
                fill="none"
                stroke={colorAnillo}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={CIRCUNF}
                strokeDashoffset={CIRCUNF - progreso}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>

            {/* Timer centrado */}
            <div style={{
              position:   'absolute',
              inset:      0,
              display:    'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <span style={{
                fontFamily: 'var(--font-dm-sans)',
                fontSize:   '42px',
                fontWeight: 300,
                letterSpacing: '-2px',
                lineHeight: 1,
              }}>
                {formatTiempo(segundos)}
              </span>
              <span style={{ fontSize: '11px', opacity: 0.4, marginTop: '6px' }}>
                {estado === 'focus' ? 'enfocado' : 'descansando'}
              </span>
            </div>
          </div>

          {/* Mascota durante descanso con mensaje */}
          {estado === 'descanso' && (
            <div style={{
              display:      'flex',
              alignItems:   'flex-end',
              gap:          '12px',
              marginBottom: '32px',
              padding:      '0 16px',
            }}>
              <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                <Image src={mascota.imagen} alt={mascota.nombre} fill sizes="60px" style={{ objectFit: 'contain' }} />
              </div>
              <div style={{
                padding:      '12px 16px',
                background:   '#FFFFFF',
                borderRadius: '16px 16px 16px 4px',
                border:       '1px solid rgba(42,90,59,0.1)',
                fontSize:     '14px',
                lineHeight:   1.6,
                textAlign:    'left',
                color:        '#2A5A3B',
              }}>
                {mensajeDescanso}
              </div>
            </div>
          )}

          {/* Botón interrumpir solo en focus */}
          {estado === 'focus' && (
            <button
              onClick={interrumpir}
              style={{
                width:        '100%',
                padding:      '14px',
                background:   'transparent',
                color:        'rgba(42,90,59,0.4)',
                border:       '1px solid rgba(42,90,59,0.15)',
                borderRadius: '4px',
                fontSize:     '12px',
                fontWeight:   600,
                letterSpacing:'2px',
                textTransform:'uppercase',
                cursor:       'pointer',
                fontFamily:   'var(--font-dm-sans)',
              }}
            >
              Interrumpir
            </button>
          )}
        </div>
      )}

      {/* ── ESTADO: COMPLETADO ── */}
      {estado === 'completado' && (
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div
            className="animate-floating-pet"
            style={{ position: 'relative', width: '160px', height: '160px', margin: '0 auto 24px' }}
          >
            <Image src={mascota.imagen} alt={mascota.nombre} fill sizes="160px" style={{ objectFit: 'contain' }} />
          </div>

          <p style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</p>

          <h2 style={{
            fontFamily:   'var(--font-playfair)',
            fontSize:     '28px',
            fontWeight:   700,
            fontStyle:    'italic',
            marginBottom: '8px',
          }}>
            ¡Sesión completa!
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.55, marginBottom: '8px' }}>
            {ciclos} {ciclos === 1 ? 'ciclo completado' : 'ciclos completados'}
          </p>
          <p style={{ fontSize: '13px', opacity: 0.4, marginBottom: '48px' }}>
            {ciclos * 25} minutos de enfoque total
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={reiniciar}
              style={{
                width:        '100%',
                padding:      '16px',
                background:   '#2A5A3B',
                color:        '#FDF9F1',
                border:       'none',
                borderRadius: '4px',
                fontSize:     '13px',
                fontWeight:   600,
                letterSpacing:'2px',
                textTransform:'uppercase',
                cursor:       'pointer',
                fontFamily:   'var(--font-dm-sans)',
              }}
            >
              Otra sesión
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              style={{
                width:        '100%',
                padding:      '16px',
                background:   'transparent',
                color:        '#2A5A3B',
                border:       '1px solid rgba(42,90,59,0.2)',
                borderRadius: '4px',
                fontSize:     '13px',
                fontWeight:   600,
                letterSpacing:'2px',
                textTransform:'uppercase',
                cursor:       'pointer',
                fontFamily:   'var(--font-dm-sans)',
              }}
            >
              Volver al inicio
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
