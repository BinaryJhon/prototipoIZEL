import { HexagonDimensions, HealthMetrics, AdvancedMetrics, BodyState } from '@/types/user'
import { getEvents, getDaysActive, countEvents } from '@/lib/events'

// ─── HEXÁGONO ────────────────────────────────────────────────

// Calcula los 6 ejes del hexágono a partir de los eventos del usuario
export function calcularHexagono(): HexagonDimensions {
  const mensajes      = countEvents('message_sent')
  const misiones      = countEvents('mission_completed')
  const focusOk       = countEvents('focus_completed')
  const focusMal      = countEvents('focus_interrupted')
  const comidas       = countEvents('food_logged')
  const dias          = getDaysActive()

  return {
    // Ánimo → qué tanto interactúa con la mascota
    animo: calcularAnimo(mensajes),

    // Movimiento → misiones completadas
    movimiento: calcularMovimiento(misiones),

    // Nutrición → veces que registró comida
    nutricion: calcularNutricion(comidas),

    // Mente → sesiones de foco completadas vs interrumpidas
    mente: calcularMente(focusOk, focusMal),

    // Constancia → días activos en la app
    constancia: calcularConstancia(dias),

    // Conexión → combinación de todo (qué tan completo es el perfil)
    conexion: calcularConexion(mensajes, misiones, focusOk, comidas, dias),
  }
}

// ─── CÁLCULOS POR EJE ────────────────────────────────────────

// Escala un valor a 0-100 con un máximo esperado
function escalar(valor: number, maximo: number): number {
  return Math.min(100, Math.round((valor / maximo) * 100))
}

function calcularAnimo(mensajes: number): number {
  // 20 mensajes = 100% de ánimo
  return escalar(mensajes, 20)
}

function calcularMovimiento(misiones: number): number {
  // 10 misiones = 100% de movimiento
  return escalar(misiones, 10)
}

function calcularNutricion(comidas: number): number {
  // 14 registros (2 por día durante 7 días) = 100%
  return escalar(comidas, 14)
}

function calcularMente(focusOk: number, focusMal: number): number {
  const total = focusOk + focusMal
  if (total === 0) return 0

  // Penaliza las interrupciones
  const ratio = focusOk / total
  const base  = escalar(focusOk, 8)
  return Math.round(base * ratio)
}

function calcularConstancia(dias: number): number {
  // 14 días = 100% de constancia
  return escalar(dias, 14)
}

function calcularConexion(
  mensajes: number,
  misiones: number,
  focus: number,
  comidas: number,
  dias: number
): number {
  // Promedio ponderado de todas las dimensiones
  const pesos = [
    { valor: calcularAnimo(mensajes),      peso: 0.2 },
    { valor: calcularMovimiento(misiones), peso: 0.2 },
    { valor: calcularNutricion(comidas),   peso: 0.2 },
    { valor: calcularMente(focus, 0),      peso: 0.2 },
    { valor: calcularConstancia(dias),     peso: 0.2 },
  ]

  return Math.round(
    pesos.reduce((acc, { valor, peso }) => acc + valor * peso, 0)
  )
}

// ─── HEALTH METRICS (SIMULADAS) ──────────────────────────────

// Genera métricas de salud simuladas basadas en el hexágono
export function calcularHealthMetrics(): HealthMetrics {
  const hex = calcularHexagono()

  return {
    energyLevel:      hex.animo,
    stressLevel:      Math.max(0, 100 - hex.mente),   // más foco = menos estrés
    activityLevel:    hex.movimiento,
    nutritionQuality: hex.nutricion,
    calories:         simularCalorias(hex.nutricion),
    hydration:        simularHidratacion(hex.constancia),
    sleepQuality:     simularSueno(hex.mente),
    heartRate:        simularFrecuencia(hex.movimiento),
    digestion:        simularDigestion(hex.nutricion),
    inflammation:     simularInflamacion(hex.mente, hex.nutricion),
  }
}

// ─── SIMULACIONES FISIOLÓGICAS ───────────────────────────────

// Genera métricas avanzadas simuladas — NO son datos médicos reales
export function calcularAdvancedMetrics(): AdvancedMetrics {
  const hex = calcularHexagono()

  return {
    bloodPressure: {
      // Estrés alto → presión alta
      sistolica:  Math.round(110 + (100 - hex.mente) * 0.3),
      diastolica: Math.round(70  + (100 - hex.mente) * 0.15),
    },
    // Mala nutrición → triglicéridos altos
    triglycerides: Math.round(150 + (100 - hex.nutricion) * 0.8),

    // Buen descanso → glucosa estable
    glucoseLevel: Math.round(90 + (100 - hex.constancia) * 0.2),

    // Más movimiento → mejor salud cardíaca
    heartHealth: hex.movimiento,
  }
}

// ─── BODY STATE ───────────────────────────────────────────────

export function calcularBodyState(): BodyState {
  const hex = calcularHexagono()

  return {
    digestion:  hex.nutricion,
    stressLoad: Math.max(0, 100 - hex.mente),
    energy:     hex.animo,
  }
}

// ─── HELPERS INTERNOS DE SIMULACIÓN ──────────────────────────

function simularCalorias(nutricion: number): number {
  // Entre 1400 y 2200 kcal simuladas
  return Math.round(1400 + nutricion * 8)
}

function simularHidratacion(constancia: number): number {
  return Math.round(40 + constancia * 0.6)  // % de hidratación
}

function simularSueno(mente: number): number {
  return Math.round(40 + mente * 0.6)       // calidad de sueño 0-100
}

function simularFrecuencia(movimiento: number): number {
  // Entre 60 y 90 bpm
  return Math.round(60 + movimiento * 0.3)
}

function simularDigestion(nutricion: number): number {
  return nutricion
}

function simularInflamacion(mente: number, nutricion: number): number {
  // Más estrés + peor nutrición = más inflamación
  return Math.round(((100 - mente) + (100 - nutricion)) / 2)
}
