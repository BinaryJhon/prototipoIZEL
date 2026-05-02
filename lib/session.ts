import { UserProfile } from '@/types/user'

const KEYS = {
  SESSION_ID: 'izel_session_id',
  USER_PROFILE: 'izel_user_profile',
} as const

// Obtiene el sessionId existente o crea uno nuevo
export function getSessionId(): string {
  if (typeof window === 'undefined') return ''

  let sessionId = localStorage.getItem(KEYS.SESSION_ID)

  if (!sessionId) {
    sessionId = crypto.randomUUID()
    localStorage.setItem(KEYS.SESSION_ID, sessionId)
  }

  return sessionId
}

// Guarda el perfil del usuario en localStorage
export function saveUserProfile(profile: UserProfile): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile))
}

// Recupera el perfil del usuario (null si no existe)
export function getUserProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(KEYS.USER_PROFILE)
  if (!raw) return null

  try {
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

// Verifica si el usuario ya hizo el onboarding
export function hasCompletedOnboarding(): boolean {
  return getUserProfile() !== null
}

// Limpia toda la sesión (útil para reset en demo)
export function clearSession(): void {
  if (typeof window === 'undefined') return
  Object.values(KEYS).forEach(key => localStorage.removeItem(key))
}
