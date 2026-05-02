'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getUserProfile } from '@/lib/session'
import { trackEvent } from '@/lib/events'
import { getMascota } from '@/data/mascotas'
import { calcularBodyState } from '@/lib/metrics'
import { Mascota } from '@/types/mascota'

// ─── TIPOS LOCALES ────────────────────────────────────────────

interface Mensaje {
  role: 'user' | 'model'
  text: string
  timestamp: number
}

// ─── COMPONENTE ──────────────────────────────────────────────

export default function Chat() {
  const router  = useRouter()
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  const [mascota, setMascota]       = useState<Mascota | null>(null)
  const [mensajes, setMensajes]     = useState<Mensaje[]>([])
  const [input, setInput]           = useState('')
  const [cargando, setCargando]     = useState(false)
  const [ageGroup, setAgeGroup]     = useState<string>('')
  const [nombre, setNombre]         = useState('')

  // ─── INIT ─────────────────────────────────────────────────

  useEffect(() => {
    const profile = getUserProfile()
    if (!profile) { router.push('/onboarding'); return }

    setNombre(profile.nombre)
    setAgeGroup(profile.ageGroup)

    const m = getMascota(profile.mascotaId)
    if (m) {
      setMascota(m)
      // Mensaje de bienvenida de la mascota
      setMensajes([{
        role:      'model',
        text:      `Hola ${profile.nombre}, soy tu ${m.nombre}. ¿Cómo te sientes hoy?`,
        timestamp: Date.now(),
      }])
    }

    // Cargar historial del día si existe
    const historialGuardado = localStorage.getItem('izel_chat_historial')
    if (historialGuardado) {
      const { mensajes: msgs, fecha } = JSON.parse(historialGuardado)
      const esHoy = new Date(fecha).toDateString() === new Date().toDateString()
      if (esHoy && msgs.length > 0) setMensajes(msgs)
    }
  }, [router])

  // ─── SCROLL AUTOMÁTICO ────────────────────────────────────

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  // ─── GUARDAR HISTORIAL ────────────────────────────────────

  function guardarHistorial(msgs: Mensaje[]) {
    localStorage.setItem('izel_chat_historial', JSON.stringify({
      mensajes: msgs,
      fecha:    Date.now(),
    }))
  }

  // ─── ENVIAR MENSAJE ───────────────────────────────────────

  async function enviarMensaje() {
    if (!input.trim() || cargando || !mascota) return

    const textoUsuario = input.trim()
    setInput('')

    // Detectar si registró comida
    const esFoodLog = /comí|comí|desayuné|almorcé|cené|comer|comida|almuerzo|cena|desayuno/i.test(textoUsuario)

    const nuevoMensaje: Mensaje = {
      role:      'user',
      text:      textoUsuario,
      timestamp: Date.now(),
    }

    const nuevosMensajes = [...mensajes, nuevoMensaje]
    setMensajes(nuevosMensajes)
    setCargando(true)

    await trackEvent('message_sent', {
      mascotaId: mascota.id,
      mensajeNum: mensajes.filter(m => m.role === 'user').length + 1,
    })

    if (esFoodLog) {
      await trackEvent('food_logged', { descripcion: textoUsuario })
    }

    try {
      const bodyState = calcularBodyState()

      // Historial en formato Gemini (sin el mensaje de bienvenida inicial)
      const historialGemini = mensajes
        .slice(1) // omitir bienvenida
        .map(m => ({
          role:  m.role,
          parts: [{ text: m.text }],
        }))

      const res = await fetch('/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje:   textoUsuario,
          mascotaId: mascota.id,
          ageGroup,
          bodyState,
          historial: historialGemini,
        }),
      })

      const data = await res.json()
      const respuestaMascota: Mensaje = {
        role:      'model',
        text:      data.respuesta ?? 'No pude responder en este momento.',
        timestamp: Date.now(),
      }

      const mensajesFinales = [...nuevosMensajes, respuestaMascota]
      setMensajes(mensajesFinales)
      guardarHistorial(mensajesFinales)

    } catch {
      const errorMsg: Mensaje = {
        role:      'model',
        text:      'Algo salió mal. ¿Intentamos de nuevo?',
        timestamp: Date.now(),
      }
      setMensajes(prev => [...prev, errorMsg])
    } finally {
      setCargando(false)
      inputRef.current?.focus()
    }
  }

  // ─── RENDER ───────────────────────────────────────────────

  if (!mascota) return null

  return (
    <main style={{
      minHeight:      '100vh',
      fontFamily:     'var(--font-dm-sans)',
      color:          '#2A5A3B',
      display:        'flex',
      flexDirection:  'column',
      maxWidth:       '480px',
      margin:         '0 auto',
    }}>

      {/* ── HEADER ── */}
      <header style={{
        position:        'sticky',
        top:             0,
        zIndex:          10,
        display:         'flex',
        alignItems:      'center',
        gap:             '12px',
        padding:         '16px 24px',
        backgroundColor: '#FDF9F1',
        borderBottom:    '1px solid rgba(42,90,59,0.1)',
      }}>
        <button
          onClick={() => router.push('/dashboard')}
          style={{
            background:  'transparent',
            border:      'none',
            cursor:      'pointer',
            fontSize:    '18px',
            color:       '#2A5A3B',
            padding:     '4px',
            lineHeight:  1,
          }}
        >
          ←
        </button>

        {/* Avatar mascota */}
        <div style={{ position: 'relative', width: '40px', height: '40px' }}>
          <Image
            src={mascota.imagen}
            alt={mascota.nombre}
            fill
            sizes="40px"
            style={{ objectFit: 'contain' }}
          />
        </div>

        <div>
          <p style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1 }}>
            {mascota.nombre}
          </p>
          <p style={{ fontSize: '11px', opacity: 0.5, marginTop: '2px' }}>
            {cargando ? 'Escribiendo...' : 'En línea'}
          </p>
        </div>

        {/* Botón limpiar chat */}
        <button
          onClick={() => {
            localStorage.removeItem('izel_chat_historial')
            setMensajes([{
              role:      'model',
              text:      `Hola ${nombre}, empecemos de nuevo. ¿Cómo te sientes?`,
              timestamp: Date.now(),
            }])
          }}
          style={{
            marginLeft:  'auto',
            background:  'transparent',
            border:      'none',
            cursor:      'pointer',
            fontSize:    '12px',
            opacity:     0.4,
            color:       '#2A5A3B',
            fontFamily:  'var(--font-dm-sans)',
          }}
        >
          Limpiar
        </button>
      </header>

      {/* ── MENSAJES ── */}
      <div style={{
        flex:       1,
        overflowY:  'auto',
        padding:    '24px 16px',
        display:    'flex',
        flexDirection: 'column',
        gap:        '12px',
        paddingBottom: '120px',
      }}>
        {mensajes.map((msg, i) => (
          <div
            key={i}
            style={{
              display:       'flex',
              flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
              alignItems:    'flex-end',
              gap:           '8px',
            }}
          >
            {/* Avatar mascota en mensajes del modelo */}
            {msg.role === 'model' && (
              <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
                <Image
                  src={mascota.imagen}
                  alt={mascota.nombre}
                  fill
                  sizes="28px"
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}

            {/* Burbuja */}
            <div style={{
              maxWidth:     '75%',
              padding:      '12px 16px',
              borderRadius: msg.role === 'user'
                ? '16px 16px 4px 16px'
                : '16px 16px 16px 4px',
              background:   msg.role === 'user'
                ? '#2A5A3B'
                : '#FFFFFF',
              color:        msg.role === 'user' ? '#FDF9F1' : '#2A5A3B',
              fontSize:     '14px',
              lineHeight:   1.6,
              border:       msg.role === 'model'
                ? '1px solid rgba(42,90,59,0.1)'
                : 'none',
              boxShadow:    '0 2px 8px rgba(42,90,59,0.06)',
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Indicador de escritura */}
        {cargando && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ position: 'relative', width: '28px', height: '28px', flexShrink: 0 }}>
              <Image
                src={mascota.imagen}
                alt={mascota.nombre}
                fill
                sizes="28px"
                style={{ objectFit: 'contain' }}
              />
            </div>
            <div style={{
              padding:      '12px 16px',
              borderRadius: '16px 16px 16px 4px',
              background:   '#FFFFFF',
              border:       '1px solid rgba(42,90,59,0.1)',
              display:      'flex',
              gap:          '4px',
              alignItems:   'center',
            }}>
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width:            '6px',
                    height:           '6px',
                    borderRadius:     '50%',
                    background:       '#2A5A3B',
                    opacity:          0.4,
                    animation:        'bounce 1.2s ease infinite',
                    animationDelay:   `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── INPUT ── */}
      <div style={{
        position:        'fixed',
        bottom:          0,
        left:            '50%',
        transform:       'translateX(-50%)',
        width:           '100%',
        maxWidth:        '480px',
        padding:         '12px 16px 24px',
        backgroundColor: '#FDF9F1',
        borderTop:       '1px solid rgba(42,90,59,0.1)',
      }}>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviarMensaje()}
            placeholder={`Cuéntale a tu ${mascota.nombre}...`}
            disabled={cargando}
            style={{
              flex:        1,
              padding:     '12px 16px',
              fontSize:    '14px',
              fontFamily:  'var(--font-dm-sans)',
              color:       '#2A5A3B',
              background:  '#FFFFFF',
              border:      '1px solid rgba(42,90,59,0.15)',
              borderRadius:'24px',
              outline:     'none',
              transition:  'border-color 0.2s ease',
            }}
            onFocus={e => e.target.style.borderColor = '#2A5A3B'}
            onBlur={e  => e.target.style.borderColor = 'rgba(42,90,59,0.15)'}
          />
          <button
            onClick={enviarMensaje}
            disabled={!input.trim() || cargando}
            style={{
              width:        '44px',
              height:       '44px',
              borderRadius: '50%',
              background:   input.trim() && !cargando ? '#4CA861' : 'rgba(42,90,59,0.1)',
              border:       'none',
              cursor:       input.trim() && !cargando ? 'pointer' : 'not-allowed',
              display:      'flex',
              alignItems:   'center',
              justifyContent: 'center',
              fontSize:     '18px',
              transition:   'all 0.2s ease',
              boxShadow:    input.trim() ? '0 0 12px rgba(76,168,97,0.3)' : 'none',
              flexShrink:   0,
            }}
          >
            ↑
          </button>
        </div>
      </div>

      {/* Animación de los puntos */}
      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </main>
  )
}
