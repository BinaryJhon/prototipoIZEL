'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getUserProfile } from '@/lib/session'
import { trackEvent, getDaysActive } from '@/lib/events'
import { getMascota } from '@/data/mascotas'
import { calcularHexagono } from '@/lib/metrics'
import { HexagonDimensions } from '@/types/user'
import { Mascota, MascotaEstado } from '@/types/mascota'

// ─── TIPOS LOCALES ────────────────────────────────────────────

interface Meta {
  texto: string
  activada: boolean
  completada: boolean
  creadaEn: number
}

interface Clima {
  temperatura: number
  descripcion: string
  emoji: string
  recomendacion: string
}

// ─── HELPERS ─────────────────────────────────────────────────

function getWeatherEmoji(code: number): string {
  if (code === 0) return '☀️'
  if (code <= 3)  return '⛅'
  if (code <= 48) return '🌫️'
  if (code <= 67) return '🌧️'
  if (code <= 77) return '🌨️'
  if (code <= 82) return '🌦️'
  return '⛈️'
}

function getWeatherDesc(code: number): string {
  if (code === 0) return 'Despejado'
  if (code <= 3)  return 'Parcialmente nublado'
  if (code <= 48) return 'Neblina'
  if (code <= 67) return 'Lluvia'
  if (code <= 77) return 'Nieve'
  if (code <= 82) return 'Chubascos'
  return 'Tormenta'
}

function getWeatherRecomendacion(code: number, temp: number): string {
  if (code === 0 && temp > 18)  return 'Buen día para caminar o salir a moverse'
  if (code <= 3 && temp > 15)   return 'Clima agradable para actividad al aire libre'
  if (code <= 48)               return 'Día nublado, ideal para ejercicio en casa'
  if (code <= 67)               return 'Lluvia afuera, perfecto para meditar adentro'
  return 'Quédate en casa y enfócate en tu bienestar interior'
}

function getMascotaEstado(hexagono: HexagonDimensions): MascotaEstado {
  const promedio = Object.values(hexagono).reduce((a, b) => a + b, 0) / 6
  if (promedio >= 70) return 'feliz'
  if (promedio >= 50) return 'motivado'
  if (promedio >= 30) return 'neutral'
  return 'cansado'
}

function getSaludo(nombre: string): string {
  const hora = new Date().getHours()
  if (hora < 12) return `Buenos días, ${nombre}`
  if (hora < 19) return `Buenas tardes, ${nombre}`
  return `Buenas noches, ${nombre}`
}

// ─── COMPONENTE ──────────────────────────────────────────────

export default function Dashboard() {
  const router = useRouter()

  const [mascota, setMascota]         = useState<Mascota | null>(null)
  const [hexagono, setHexagono]       = useState<HexagonDimensions | null>(null)
  const [diasActivos, setDiasActivos] = useState(0)
  const [clima, setClima]             = useState<Clima | null>(null)
  const [meta, setMeta]               = useState<Meta | null>(null)
  const [inputMeta, setInputMeta]     = useState('')
  const [cargandoMeta, setCargando]   = useState(false)
  const [nombre, setNombre]           = useState('')
  const [mascotaEstado, setEstado]    = useState<MascotaEstado>('neutral')
  const [metaCompletada, setMetaCompletada] = useState(false)

  // ─── INIT ───────────────────────────────────────────────

  useEffect(() => {
    const profile = getUserProfile()
    if (!profile) { router.push('/onboarding'); return }

    setNombre(profile.nombre)

    const m = getMascota(profile.mascotaId)
    if (m) setMascota(m)

    const hex = calcularHexagono()
    setHexagono(hex)
    setEstado(getMascotaEstado(hex))
    setDiasActivos(getDaysActive())

    // Cargar meta guardada del día
    const metaGuardada = localStorage.getItem('izel_meta_hoy')
    if (metaGuardada) {
      const metaObj = JSON.parse(metaGuardada) as Meta
      // Solo cargar si es del día de hoy
      const esHoy = new Date(metaObj.creadaEn).toDateString() === new Date().toDateString()
      if (esHoy) {
        setMeta(metaObj)
        setMetaCompletada(metaObj.completada)
      }
    }

    trackEvent('app_opened')
    fetchClima()
  }, [router])

  // ─── CLIMA ──────────────────────────────────────────────

  const fetchClima = useCallback(async () => {
    // Cache de 1 hora
    const cached = localStorage.getItem('izel_clima')
    if (cached) {
      const { data, ts } = JSON.parse(cached)
      if (Date.now() - ts < 3600000) { setClima(data); return }
    }

    try {
      // Coordenadas de Torreón por defecto
      // En el futuro: navigator.geolocation
      const res  = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=25.54&longitude=-103.41&current=temperature_2m,weathercode'
      )
      const json = await res.json()
      const code = json.current.weathercode
      const temp = Math.round(json.current.temperature_2m)

      const data: Clima = {
        temperatura:   temp,
        descripcion:   getWeatherDesc(code),
        emoji:         getWeatherEmoji(code),
        recomendacion: getWeatherRecomendacion(code, temp),
      }

      setClima(data)
      localStorage.setItem('izel_clima', JSON.stringify({ data, ts: Date.now() }))
    } catch {
      // Falla silenciosa
    }
  }, [])

  // ─── META ────────────────────────────────────────────────

  async function sugerirMeta() {
    if (!mascota || !nombre) return
    setCargando(true)

    try {
      const res  = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: 'Sugiere UNA meta de bienestar simple y concreta para hoy. Máximo 8 palabras. Solo la meta, sin explicación.',
          mascotaId: mascota.id,
          soloSugerencia: true,
        }),
      })
      const json = await res.json()
      setInputMeta(json.respuesta ?? '')
    } catch {
      setInputMeta('Tomar 2 litros de agua hoy')
    } finally {
      setCargando(false)
    }
  }

  function activarMeta() {
    if (!inputMeta.trim()) return
    const nueva: Meta = {
      texto:      inputMeta.trim(),
      activada:   true,
      completada: false,
      creadaEn:   Date.now(),
    }
    setMeta(nueva)
    localStorage.setItem('izel_meta_hoy', JSON.stringify(nueva))
    setInputMeta('')
  }

  async function completarMeta() {
    if (!meta) return
    const actualizada = { ...meta, completada: true }
    setMeta(actualizada)
    setMetaCompletada(true)
    localStorage.setItem('izel_meta_hoy', JSON.stringify(actualizada))
    setEstado('feliz')
    await trackEvent('mission_completed', { meta: meta.texto })
  }

  // ─── RENDER ──────────────────────────────────────────────

  if (!mascota || !hexagono) return null

  const estado = mascotaEstado

  return (
    <main
      style={{
        minHeight: '100vh',
        fontFamily: 'var(--font-dm-sans)',
        color: '#2A5A3B',
        maxWidth: '480px',
        margin: '0 auto',
        padding: '32px 24px 80px',
      }}
    >
      {/* ── CLIMA ── */}
      {clima && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px',
          padding: '10px 14px',
          background: 'rgba(42,90,59,0.06)',
          borderRadius: '8px',
          fontSize: '13px',
          color: 'rgba(42,90,59,0.7)',
        }}>
          <span style={{ fontSize: '18px' }}>{clima.emoji}</span>
          <span>{clima.temperatura}°C · {clima.descripcion}</span>
          <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.6 }}>
            {clima.recomendacion}
          </span>
        </div>
      )}

      {/* ── SALUDO ── */}
      <div style={{ marginBottom: '32px' }}>
        <p style={{
          fontSize: '11px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          fontWeight: 600,
          opacity: 0.45,
          marginBottom: '8px',
        }}>
          {new Date().toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '28px',
          fontWeight: 700,
          fontStyle: 'italic',
          lineHeight: 1.2,
        }}>
          {getSaludo(nombre)}
        </h1>
      </div>

      {/* ── MASCOTA ── */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '40px',
        padding: '32px 24px',
        background: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid rgba(42,90,59,0.1)',
        boxShadow: '0 4px 24px rgba(42,90,59,0.06)',
      }}>
        {/* Estado */}
        <span style={{
          fontSize: '10px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontWeight: 700,
          color: estado === 'feliz' ? '#4CA861' : 'rgba(42,90,59,0.45)',
          marginBottom: '16px',
        }}>
          {estado === 'feliz'    && '✦ Sintiéndose genial'}
          {estado === 'motivado' && '✦ Listo para el día'}
          {estado === 'neutral'  && '✦ Por aquí contigo'}
          {estado === 'cansado'  && '✦ Necesita tu atención'}
          {estado === 'triste'   && '✦ Extrañándote'}
        </span>

        {/* Imagen mascota */}
        <div
          className="animate-floating-pet"
          style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '16px' }}
        >
          <Image
            src={mascota.imagen}
            alt={mascota.nombre}
            fill
            sizes="160px"
            style={{ objectFit: 'contain' }}
            priority
          />
        </div>

        <p style={{
          fontSize: '11px',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          fontWeight: 700,
          marginBottom: '4px',
        }}>
          {mascota.nombre}
        </p>
        <p style={{ fontSize: '13px', opacity: 0.55, textAlign: 'center' }}>
          {mascota.descripcion}
        </p>
      </div>

      {/* ── RACHA ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
        padding: '16px 20px',
        background: diasActivos >= 3 ? 'rgba(76,168,97,0.08)' : 'rgba(42,90,59,0.04)',
        borderRadius: '10px',
        border: `1px solid ${diasActivos >= 3 ? 'rgba(76,168,97,0.2)' : 'rgba(42,90,59,0.08)'}`,
      }}>
        <span style={{ fontSize: '24px' }}>🔥</span>
        <div>
          <p style={{ fontSize: '18px', fontWeight: 600, lineHeight: 1 }}>
            {diasActivos} {diasActivos === 1 ? 'día' : 'días'}
          </p>
          <p style={{ fontSize: '12px', opacity: 0.55, marginTop: '2px' }}>
            de racha activa
          </p>
        </div>
        {diasActivos >= 3 && (
          <p style={{ marginLeft: 'auto', fontSize: '11px', color: '#4CA861', fontWeight: 600 }}>
            ¡Sigue así!
          </p>
        )}
      </div>

      {/* ── HEXÁGONO MINI ── */}
      <div style={{
        marginBottom: '32px',
        padding: '20px',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid rgba(42,90,59,0.1)',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontWeight: 700,
          opacity: 0.45,
          marginBottom: '16px',
        }}>
          Tu bienestar hoy
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
          {Object.entries(hexagono).map(([eje, valor]) => (
            <div key={eje} style={{ textAlign: 'center' }}>
              <div style={{
                height: '3px',
                background: 'rgba(42,90,59,0.08)',
                borderRadius: '2px',
                marginBottom: '6px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${valor}%`,
                  background: valor >= 60 ? '#4CA861' : valor >= 30 ? '#D4AF37' : 'rgba(42,90,59,0.3)',
                  borderRadius: '2px',
                  transition: 'width 0.8s ease',
                }} />
              </div>
              <p style={{ fontSize: '10px', opacity: 0.5, textTransform: 'capitalize' }}>{eje}</p>
              <p style={{ fontSize: '13px', fontWeight: 600 }}>{valor}</p>
            </div>
          ))}
        </div>
        <button
          onClick={() => router.push('/progress')}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '10px',
            background: 'transparent',
            border: '1px solid rgba(42,90,59,0.15)',
            borderRadius: '6px',
            fontSize: '11px',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: '#2A5A3B',
            cursor: 'pointer',
            fontFamily: 'var(--font-dm-sans)',
          }}
        >
          Ver progreso completo →
        </button>
      </div>

      {/* ── META DEL DÍA ── */}
      <div style={{
        marginBottom: '32px',
        padding: '20px',
        background: '#FFFFFF',
        borderRadius: '12px',
        border: '1px solid rgba(42,90,59,0.1)',
      }}>
        <p style={{
          fontSize: '10px',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          fontWeight: 700,
          opacity: 0.45,
          marginBottom: '16px',
        }}>
          Meta del día
        </p>

        {/* Sin meta activa */}
        {!meta && (
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="text"
                value={inputMeta}
                onChange={e => setInputMeta(e.target.value)}
                placeholder="¿Qué quieres lograr hoy?"
                onKeyDown={e => e.key === 'Enter' && activarMeta()}
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-dm-sans)',
                  color: '#2A5A3B',
                  background: 'rgba(42,90,59,0.04)',
                  border: '1px solid rgba(42,90,59,0.15)',
                  borderRadius: '6px',
                  outline: 'none',
                }}
              />
              <button
                onClick={sugerirMeta}
                disabled={cargandoMeta}
                title="Pedirle una sugerencia a tu mascota"
                style={{
                  padding: '12px 14px',
                  background: 'rgba(42,90,59,0.06)',
                  border: '1px solid rgba(42,90,59,0.15)',
                  borderRadius: '6px',
                  cursor: cargandoMeta ? 'wait' : 'pointer',
                  fontSize: '18px',
                }}
              >
                {cargandoMeta ? '...' : '✨'}
              </button>
            </div>
            <button
              onClick={activarMeta}
              disabled={!inputMeta.trim()}
              style={{
                width: '100%',
                padding: '12px',
                background: inputMeta.trim() ? '#2A5A3B' : 'rgba(42,90,59,0.08)',
                color: inputMeta.trim() ? '#FDF9F1' : 'rgba(42,90,59,0.3)',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: inputMeta.trim() ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--font-dm-sans)',
                transition: 'all 0.3s ease',
              }}
            >
              Activar meta
            </button>
          </div>
        )}

        {/* Meta activa */}
        {meta && !metaCompletada && (
          <div>
            <p style={{
              fontSize: '16px',
              fontWeight: 500,
              marginBottom: '16px',
              lineHeight: 1.4,
              padding: '14px',
              background: 'rgba(42,90,59,0.04)',
              borderRadius: '8px',
              borderLeft: '3px solid #4CA861',
            }}>
              {meta.texto}
            </p>
            <button
              onClick={completarMeta}
              style={{
                width: '100%',
                padding: '14px',
                background: '#4CA861',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: 'pointer',
                fontFamily: 'var(--font-dm-sans)',
                boxShadow: '0 0 12px rgba(76,168,97,0.3)',
                transition: 'all 0.3s ease',
              }}
            >
              ✓ Lo logré
            </button>
          </div>
        )}

        {/* Meta completada */}
        {meta && metaCompletada && (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>🎉</p>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#4CA861', marginBottom: '4px' }}>
              ¡Meta completada!
            </p>
            <p style={{ fontSize: '13px', opacity: 0.55 }}>{meta.texto}</p>
          </div>
        )}
      </div>

      {/* ── ACCESOS RÁPIDOS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {[
          { label: 'Hablar con\nmi mascota', emoji: '💬', ruta: '/chat',     color: '#2A5A3B' },
          { label: 'Modo\nenfoque',          emoji: '🎯', ruta: '/focus',    color: '#2A5A3B' },
          { label: 'Ver mi\nprogreso',       emoji: '📊', ruta: '/progress', color: '#2A5A3B' },
        ].map(item => (
          <button
            key={item.ruta}
            onClick={() => router.push(item.ruta)}
            style={{
              padding: '20px 16px',
              background: '#FFFFFF',
              border: '1px solid rgba(42,90,59,0.1)',
              borderRadius: '12px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(42,90,59,0.04)',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(42,90,59,0.3)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(42,90,59,0.1)')}
          >
            <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>
              {item.emoji}
            </span>
            <span style={{
              fontSize: '12px',
              fontWeight: 600,
              color: item.color,
              whiteSpace: 'pre-line',
              lineHeight: 1.4,
            }}>
              {item.label}
            </span>
          </button>
        ))}

        {/* Botón reset demo — útil para testers */}
        <button
          onClick={() => {
            localStorage.clear()
            router.push('/')
          }}
          style={{
            padding: '20px 16px',
            background: 'transparent',
            border: '1px solid rgba(42,90,59,0.08)',
            borderRadius: '12px',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>🔄</span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(42,90,59,0.4)', lineHeight: 1.4 }}>
            Reiniciar{'\n'}demo
          </span>
        </button>
      </div>
    </main>
  )
}
