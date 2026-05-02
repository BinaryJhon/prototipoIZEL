export type AgeGroup = '<18' | '18-25' | '26-40' | '40+'

export interface UserProfile {
  nombre: string
  edad: number
  ageGroup: AgeGroup
  mascotaId: string
  creadoEn: number // timestamp
  correo?: string  // se captura al final, opcional
}

export interface BodyState {
  digestion: number   // 0-100
  stressLoad: number  // 0-100
  energy: number      // 0-100
}

export interface HealthMetrics {
  // Core
  energyLevel: number
  stressLevel: number
  activityLevel: number
  nutritionQuality: number
  // Extendidas
  calories: number
  hydration: number
  sleepQuality: number
  heartRate: number
  digestion: number
  inflammation: number
}

export interface AdvancedMetrics {
  bloodPressure: { sistolica: number; diastolica: number }
  triglycerides: number
  glucoseLevel: number
  heartHealth: number
}

export interface HexagonDimensions {
  animo: number       // 0-100
  movimiento: number  // 0-100
  nutricion: number   // 0-100
  mente: number       // 0-100
  constancia: number  // 0-100
  conexion: number    // 0-100
}
