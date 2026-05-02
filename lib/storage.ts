// Helper genérico para localStorage
// Todos los demás lib/ usan este archivo en lugar de llamar
// localStorage directamente — así si algún día cambiamos
// el storage (ej: IndexedDB) solo tocamos este archivo

const PREFIX = 'izel_'

// ─── PRIMITIVAS ──────────────────────────────────────────────

export function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(value))
  } catch {
    // localStorage lleno (raro pero posible en móvil)
    console.warn(`[IZEL] No se pudo guardar: ${key}`)
  }
}

export function getItem<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function removeItem(key: string): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(`${PREFIX}${key}`)
}

// ─── UTILIDADES ──────────────────────────────────────────────

// Lista todas las keys de IZEL en localStorage
export function listKeys(): string[] {
  if (typeof window === 'undefined') return []
  return Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .map(k => k.replace(PREFIX, ''))
}

// Limpia todo lo de IZEL sin tocar otras keys del navegador
export function clearAll(): void {
  if (typeof window === 'undefined') return
  listKeys().forEach(key => localStorage.removeItem(`${PREFIX}${key}`))
}

// Cuánto espacio aproximado está usando IZEL en localStorage
export function getStorageSize(): string {
  if (typeof window === 'undefined') return '0 KB'
  const total = listKeys().reduce((acc, key) => {
    const raw = localStorage.getItem(`${PREFIX}${key}`) ?? ''
    return acc + raw.length
  }, 0)
  return `${(total / 1024).toFixed(2)} KB`
}
