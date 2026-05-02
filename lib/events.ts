import { IzelEvent, EventType } from '@/types/event'
import { getSessionId } from '@/lib/session'

const EVENTS_KEY = 'izel_events'

// ─── LOCAL STORAGE ───────────────────────────────────────────

// Guarda todos los eventos en localStorage
function saveEventLocal(event: IzelEvent): void {
  if (typeof window === 'undefined') return

  const raw = localStorage.getItem(EVENTS_KEY)
  const events: IzelEvent[] = raw ? JSON.parse(raw) : []

  events.push(event)
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

// Recupera todos los eventos guardados
export function getEvents(): IzelEvent[] {
  if (typeof window === 'undefined') return []

  const raw = localStorage.getItem(EVENTS_KEY)
  if (!raw) return []

  try {
    return JSON.parse(raw) as IzelEvent[]
  } catch {
    return []
  }
}

// ─── GOOGLE SHEETS (TRACKING REMOTO) ─────────────────────────

// Envía el evento a la API que lo manda a Google Sheets
async function saveEventRemote(event: IzelEvent): Promise<void> {
  try {
    await fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    })
  } catch {
    // Falla silenciosa — el tracking remoto nunca rompe la app
  }
}

// ─── TRACK PRINCIPAL ─────────────────────────────────────────

// Función principal — úsala en toda la app para registrar eventos
export async function trackEvent(
  type: EventType,
  value?: Record<string, unknown>
): Promise<void> {
  const event: IzelEvent = {
    sessionId: getSessionId(),
    type,
    value,
    timestamp: Date.now(),
  }

  // Doble tracking: local + remoto en paralelo
  saveEventLocal(event)
  await saveEventRemote(event)
}

// ─── HELPERS ─────────────────────────────────────────────────

// Cuántos eventos de un tipo específico tiene el usuario
export function countEvents(type: EventType): number {
  return getEvents().filter(e => e.type === type).length
}

// Último evento de un tipo específico
export function getLastEvent(type: EventType): IzelEvent | null {
  const filtered = getEvents().filter(e => e.type === type)
  return filtered.length > 0 ? filtered[filtered.length - 1] : null
}

// Cuántos días lleva el usuario usando la app (para rachas)
export function getDaysActive(): number {
  const events = getEvents()
  if (events.length === 0) return 0

  const dias = new Set(
    events.map(e => new Date(e.timestamp).toDateString())
  )

  return dias.size
}
