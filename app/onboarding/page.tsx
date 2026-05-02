'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { getMascotasIniciales, getMascotaPorEdad } from '@/data/mascotas'
import { saveUserProfile } from '@/lib/session'
import { trackEvent } from '@/lib/events'
import { AgeGroup, UserProfile } from '@/types/user'
import { Mascota } from '@/types/mascota'

// ─── HELPERS ─────────────────────────────────────────────────

function getAgeGroup(edad: number): AgeGroup {
  if (edad < 18) return '<18'
  if (edad <= 25) return '18-25'
  if (edad <= 40) return '26-40'
  return '40+'
}

// Oscuridad del fondo según paso y si hay input activo
function getOverlayOpacity(paso: number, hasInput: boolean): number {
  if (paso === 1 && !hasInput) return 0
  if (paso === 1 && hasInput)  return 0.06
  if (paso === 2 && !hasInput) return 0.1
  if (paso === 2 && hasInput)  return 0.16
  if (paso === 3)              return 0.22
  return 0
}

// ─── COMPONENTE ──────────────────────────────────────────────

export default function Onboarding() {
  const router  = useRouter()
  const mascotas = getMascotasIniciales()

  const [paso, setPaso]               = useState(1)
  const [nombre, setNombre]           = useState('')
  const [edad, setEdad]               = useState('')
  const [mascotaElegida, setMascota]  = useState<Mascota | null>(null)
  const [hasInput, setHasInput]       = useState(false)
  const [animating, setAnimating]     = useState(false)

  // Mascota sugerida según edad (solo resaltado visual)
  const mascotaSugerida = edad ? getMascotaPorEdad(Number(edad)) : null

  // Oscuridad del overlay
  const overlayOpacity = getOverlayOpacity(paso, hasInput)

  // Cuando cambia el paso, anima la transición
  function irAlPaso(siguiente: number) {
    setAnimating(true)
    setTimeout(() => {
      setPaso(siguiente)
      setHasInput(false)
      setAnimating(false)
    }, 300)
  }

  function handleNombre(e: React.ChangeEvent<HTMLInputElement>) {
    setNombre(e.target.value)
    setHasInput(e.target.value.length > 0)
  }

  function handleEdad(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2)
    setEdad(val)
    setHasInput(val.length > 0)
  }

  async function handleConfirmar() {
    if (!mascotaElegida) return

    const edadNum = Number(edad)

    const profile: UserProfile = {
      nombre,
      edad:      edadNum,
      ageGroup:  getAgeGroup(edadNum),
      mascotaId: mascotaElegida.id,
      creadoEn:  Date.now(),
    }

    saveUserProfile(profile)

    await trackEvent('onboarding_completed', { nombre, edad: edadNum })
    await trackEvent('pet_selected', { mascotaId: mascotaElegida.id, ageGroup: profile.ageGroup })

    router.push('/dashboard')
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        fontFamily: 'var(--font-dm-sans)',
        color: '#2A5A3B',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
      }}
    >
      {/* Overlay oscurecimiento gradual */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#2A5A3B',
          opacity: overlayOpacity,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Contenido */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: '480px',
          opacity: animating ? 0 : 1,
          transform: animating ? 'translateY(8px)' : 'translateY(0)',
          transition: 'opacity 0.3s ease, transform 0.3s ease',
        }}
      >
        {/* Indicador de pasos */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '48px', justifyContent: 'center' }}>
          {[1, 2, 3].map(n => (
            <div
              key={n}
              style={{
                width: n === paso ? '24px' : '6px',
                height: '6px',
                borderRadius: '3px',
                backgroundColor: '#2A5A3B',
                opacity: n === paso ? 1 : n < paso ? 0.4 : 0.15,
                transition: 'all 0.4s ease',
              }}
            />
          ))}
        </div>

        {/* ── PASO 1: NOMBRE ── */}
        {paso === 1 && (
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, opacity: 0.5, marginBottom: '16px' }}>
              Paso 1 de 3
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '36px',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 1.2,
                marginBottom: '32px',
              }}
            >
              ¿Cómo te llamas?
            </h1>
            <input
              type="text"
              value={nombre}
              onChange={handleNombre}
              placeholder="Tu nombre"
              autoFocus
              style={{
                width: '100%',
                padding: '16px 0',
                fontSize: '24px',
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: 300,
                color: '#2A5A3B',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(42,90,59,0.3)',
                outline: 'none',
                marginBottom: '40px',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={e => e.target.style.borderBottomColor = '#2A5A3B'}
              onBlur={e  => e.target.style.borderBottomColor = 'rgba(42,90,59,0.3)'}
            />
            <button
              onClick={() => nombre.trim() && irAlPaso(2)}
              disabled={!nombre.trim()}
              style={{
                display: 'block',
                width: '100%',
                padding: '16px',
                background: nombre.trim() ? '#2A5A3B' : 'rgba(42,90,59,0.1)',
                color: nombre.trim() ? '#FDF9F1' : 'rgba(42,90,59,0.3)',
                border: 'none',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '2px',
                textTransform: 'uppercase',
                cursor: nombre.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.3s ease',
                fontFamily: 'var(--font-dm-sans)',
              }}
            >
              Continuar
            </button>
          </div>
        )}

        {/* ── PASO 2: EDAD ── */}
        {paso === 2 && (
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, opacity: 0.5, marginBottom: '16px' }}>
              Paso 2 de 3
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '36px',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 1.2,
                marginBottom: '8px',
              }}
            >
              ¿Cuántos años tienes,
            </h1>
            <h1
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '36px',
                fontWeight: 700,
                fontStyle: 'italic',
                color: '#4CA861',
                lineHeight: 1.2,
                marginBottom: '32px',
              }}
            >
              {nombre}?
            </h1>
            <input
              type="text"
              inputMode="numeric"
              value={edad}
              onChange={handleEdad}
              placeholder="Tu edad"
              autoFocus
              style={{
                width: '100%',
                padding: '16px 0',
                fontSize: '24px',
                fontFamily: 'var(--font-dm-sans)',
                fontWeight: 300,
                color: '#2A5A3B',
                background: 'transparent',
                border: 'none',
                borderBottom: '1px solid rgba(42,90,59,0.3)',
                outline: 'none',
                marginBottom: '40px',
                transition: 'border-color 0.3s ease',
              }}
              onFocus={e => e.target.style.borderBottomColor = '#2A5A3B'}
              onBlur={e  => e.target.style.borderBottomColor = 'rgba(42,90,59,0.3)'}
            />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => irAlPaso(1)}
                style={{
                  padding: '16px',
                  background: 'transparent',
                  color: '#2A5A3B',
                  border: '1px solid rgba(42,90,59,0.2)',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                ←
              </button>
              <button
                onClick={() => Number(edad) > 0 && Number(edad) < 120 && irAlPaso(3)}
                disabled={!edad || Number(edad) <= 0 || Number(edad) >= 120}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: edad && Number(edad) > 0 ? '#2A5A3B' : 'rgba(42,90,59,0.1)',
                  color: edad && Number(edad) > 0 ? '#FDF9F1' : 'rgba(42,90,59,0.3)',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: edad && Number(edad) > 0 ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* ── PASO 3: MASCOTA ── */}
        {paso === 3 && (
          <div>
            <p style={{ fontSize: '11px', letterSpacing: '4px', textTransform: 'uppercase', fontWeight: 600, opacity: 0.5, marginBottom: '16px' }}>
              Paso 3 de 3
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-playfair)',
                fontSize: '32px',
                fontWeight: 700,
                fontStyle: 'italic',
                lineHeight: 1.2,
                marginBottom: '8px',
              }}
            >
              Elige tu compañero
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.6, marginBottom: '32px', lineHeight: 1.6 }}>
              Te acompañará en tu camino. Puedes cambiar cuando quieras.
            </p>

            {/* Grid de mascotas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '32px' }}>
              {mascotas.map(mascota => {
                const esSugerida  = mascotaSugerida?.id === mascota.id
                const esElegida   = mascotaElegida?.id  === mascota.id

                return (
                  <button
                    key={mascota.id}
                    onClick={() => setMascota(mascota)}
                    style={{
                      background: esElegida ? '#2A5A3B' : '#FFFFFF',
                      border: esSugerida && !esElegida
                        ? '2px solid #4CA861'
                        : esElegida
                          ? '2px solid #2A5A3B'
                          : '1px solid rgba(42,90,59,0.15)',
                      borderRadius: '12px',
                      padding: '20px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      textAlign: 'center',
                      position: 'relative',
                    }}
                  >
                    {/* Badge "Para ti" en la sugerida */}
                    {esSugerida && !esElegida && (
                      <span style={{
                        position: 'absolute',
                        top: '-10px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        background: '#4CA861',
                        color: '#FDF9F1',
                        fontSize: '9px',
                        fontWeight: 700,
                        letterSpacing: '1.5px',
                        textTransform: 'uppercase',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        whiteSpace: 'nowrap',
                      }}>
                        Para ti
                      </span>
                    )}

                    {/* Imagen */}
                    <div style={{ position: 'relative', width: '80px', height: '80px', margin: '0 auto 12px' }}>
                      <Image
                        src={mascota.imagen}
                        alt={mascota.nombre}
                        fill
                        sizes="80px"
                        style={{ objectFit: 'contain' }}
                      />
                    </div>

                    {/* Nombre */}
                    <p style={{
                      fontSize: '11px',
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                      fontWeight: 700,
                      color: esElegida ? '#FDF9F1' : '#2A5A3B',
                      marginBottom: '6px',
                    }}>
                      {mascota.nombre}
                    </p>

                    {/* Descripción */}
                    <p style={{
                      fontSize: '11px',
                      color: esElegida ? 'rgba(248,244,235,0.7)' : 'rgba(42,90,59,0.55)',
                      lineHeight: 1.5,
                    }}>
                      {mascota.descripcion}
                    </p>
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => irAlPaso(2)}
                style={{
                  padding: '16px',
                  background: 'transparent',
                  color: '#2A5A3B',
                  border: '1px solid rgba(42,90,59,0.2)',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-dm-sans)',
                }}
              >
                ←
              </button>
              <button
                onClick={handleConfirmar}
                disabled={!mascotaElegida}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: mascotaElegida ? '#4CA861' : 'rgba(42,90,59,0.1)',
                  color: mascotaElegida ? '#FFFFFF' : 'rgba(42,90,59,0.3)',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 600,
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  cursor: mascotaElegida ? 'pointer' : 'not-allowed',
                  transition: 'all 0.3s ease',
                  fontFamily: 'var(--font-dm-sans)',
                  boxShadow: mascotaElegida ? '0 0 12px rgba(76,168,97,0.4)' : 'none',
                }}
              >
                Comenzar
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
