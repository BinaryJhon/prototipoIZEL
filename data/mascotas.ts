import { Mascota } from '@/types/mascota'

export const MASCOTAS: Mascota[] = [
  // ─── SELECCIONABLES DESDE EL INICIO ──────────────────────

  {
    id: 'ajolote',
    nombre: 'Ajolote',
    imagen: '/animales/Ajolote Oficial.png',
    personalidad: 'emocional',
    descripcion: 'Eterno renaciente. Te acompaña en tus ciclos.',
    edadIdeal: '18-25',
    seleccionable: true,
  },
  {
    id: 'jaguar',
    nombre: 'Jaguar',
    imagen: '/animales/Jaguar Oficial.png',
    personalidad: 'disciplinado',
    descripcion: 'Guerrero enfocado. Te empuja a ser mejor.',
    edadIdeal: '26-40',
    seleccionable: true,
  },
  {
    id: 'quetzal',
    nombre: 'Quetzal',
    imagen: '/animales/Quetzal Oficial.png',
    personalidad: 'reflexivo',
    descripcion: 'Sabio espiritual. Te invita a pausar y observar.',
    edadIdeal: '40+',
    seleccionable: true,
  },
  {
    id: 'xoloitzcuintle',
    nombre: 'Xoloitzcuintle',
    imagen: '/animales/Xoloitzcuintle Oficial.png',
    personalidad: 'energetico',
    descripcion: 'Guardián ancestral. Leal y lleno de energía.',
    edadIdeal: '<18',
    seleccionable: true,
  },

  // ─── DESBLOQUEABLES POR RACHA ─────────────────────────────

  {
    id: 'lobo-mexicano',
    nombre: 'Lobo Mexicano',
    imagen: '/animales/Lobo Mexicano.png',
    personalidad: 'energetico',
    descripcion: 'Espíritu del equipo. Fuerte en manada.',
    edadIdeal: '18-25',
    desbloqueaEnDia: 3,
    seleccionable: false,
  },
  {
    id: 'ocelote',
    nombre: 'Ocelote',
    imagen: '/animales/Ocelote.png',
    personalidad: 'emocional',
    descripcion: 'Explorador curioso. Siempre listo para descubrir.',
    edadIdeal: '18-25',
    desbloqueaEnDia: 7,
    seleccionable: false,
  },
  {
    id: 'aguila-real',
    nombre: 'Águila Real',
    imagen: '/animales/Aguila Real.png',
    personalidad: 'disciplinado',
    descripcion: 'Visión clara. Ve lo que otros no pueden ver.',
    edadIdeal: '26-40',
    desbloqueaEnDia: 14,
    seleccionable: false,
  },
  {
    id: 'cenzontle',
    nombre: 'Cenzontle',
    imagen: '/animales/Cenzontle.png',
    personalidad: 'emocional',
    descripcion: 'Cantor del alma. Transforma el dolor en música.',
    edadIdeal: '18-25',
    desbloqueaEnDia: 21,
    seleccionable: false,
  },
  {
    id: 'cacomixtle',
    nombre: 'Cacomixtle',
    imagen: '/animales/Cacomixtle Oficial.png',
    personalidad: 'energetico',
    descripcion: 'El adaptable. Encuentra su camino en cualquier lugar.',
    edadIdeal: '26-40',
    desbloqueaEnDia: 30,
    seleccionable: false,
  },
  {
    id: 'tlacuache',
    nombre: 'Tlacuache',
    imagen: '/animales/Tlacuache.png',
    personalidad: 'reflexivo',
    descripcion: 'El resiliente. Cae y siempre vuelve a levantarse.',
    edadIdeal: '40+',
    desbloqueaEnDia: 45,
    seleccionable: false,
  },
  {
    id: 'murcielago-frutero',
    nombre: 'Murciélago Frutero',
    imagen: '/animales/Murcielago Frutero.png',
    personalidad: 'reflexivo',
    descripcion: 'El nocturno. Encuentra la luz en la oscuridad.',
    edadIdeal: '26-40',
    desbloqueaEnDia: 60,
    seleccionable: false,
  },
  {
    id: 'oso-hormiguero',
    nombre: 'Oso Hormiguero',
    imagen: '/animales/Oso Hormiguero Sedoso.png',
    personalidad: 'disciplinado',
    descripcion: 'El paciente. La constancia es su superpoder.',
    edadIdeal: '40+',
    desbloqueaEnDia: 90,
    seleccionable: false,
  },
  {
    id: 'vaquita-marina',
    nombre: 'Vaquita Marina',
    imagen: '/animales/Vaquita Marina.PNG',
    personalidad: 'reflexivo',
    descripcion: 'La rara y valiosa. Recuérdalo: eres único.',
    edadIdeal: '40+',
    desbloqueaEnDia: 120,
    seleccionable: false,
  },
  {
    id: 'quetzalcoatl',
    nombre: 'Quetzalcóatl',
    imagen: '/animales/Quetzacoatl.png',
    personalidad: 'reflexivo',
    descripcion: 'La transformación total. El que llega hasta aquí renació.',
    edadIdeal: '40+',
    desbloqueaEnDia: 180,
    seleccionable: false,
  },

  // ─── EXTRAS (sin racha definida aún) ─────────────────────

  {
    id: 'iguana-espinosa',
    nombre: 'Iguana Espinosa',
    imagen: '/animales/Iguana Espinosa.png',
    personalidad: 'disciplinado',
    descripcion: 'Firme como la roca. Nada la mueve.',
    edadIdeal: '26-40',
    desbloqueaEnDia: 10,
    seleccionable: false,
  },
  {
    id: 'mariposa-monarca',
    nombre: 'Mariposa Monarca',
    imagen: '/animales/Mariposa Monarca.png',
    personalidad: 'emocional',
    descripcion: 'La que migra sin mapa. Confía en su instinto.',
    edadIdeal: '18-25',
    desbloqueaEnDia: 5,
    seleccionable: false,
  },
  {
    id: 'mono-aullador',
    nombre: 'Mono Aullador',
    imagen: '/animales/Mono Aullador.png',
    personalidad: 'energetico',
    descripcion: 'El que se hace escuchar. Expresa lo que sientes.',
    edadIdeal: '<18',
    desbloqueaEnDia: 7,
    seleccionable: false,
  },
  {
    id: 'sapo-cresta',
    nombre: 'Sapo de Cresta Grande',
    imagen: '/animales/Sapo de Cresta Grande.png',
    personalidad: 'reflexivo',
    descripcion: 'Callado pero sabio. Observa antes de saltar.',
    edadIdeal: '40+',
    desbloqueaEnDia: 15,
    seleccionable: false,
  },
  {
    id: 'tecolote',
    nombre: 'Tecolote',
    imagen: '/animales/Tecolote.png',
    personalidad: 'reflexivo',
    descripcion: 'Guardián de la noche. La sabiduría llega en silencio.',
    edadIdeal: '40+',
    desbloqueaEnDia: 20,
    seleccionable: false,
  },
  {
    id: 'teporingo',
    nombre: 'Teporingo',
    imagen: '/animales/Teporingo.png',
    personalidad: 'energetico',
    descripcion: 'Pequeño pero veloz. No subestimes tu potencial.',
    edadIdeal: '<18',
    desbloqueaEnDia: 12,
    seleccionable: false,
  },
  {
    id: 'vibora-cascabel',
    nombre: 'Víbora Cascabel',
    imagen: '/animales/Víbora Cascabel.png',
    personalidad: 'disciplinado',
    descripcion: 'Precisa y directa. Sabe exactamente lo que quiere.',
    edadIdeal: '26-40',
    desbloqueaEnDia: 25,
    seleccionable: false,
  },
]

// ─── HELPERS ─────────────────────────────────────────────────

// Mascota por id
export function getMascota(id: string): Mascota | undefined {
  return MASCOTAS.find(m => m.id === id)
}

// Las 4 seleccionables al inicio
export function getMascotasIniciales(): Mascota[] {
  return MASCOTAS.filter(m => m.seleccionable)
}

// Mascotas desbloqueadas según los días activos del usuario
export function getMascotasDesbloqueadas(diasActivos: number): Mascota[] {
  return MASCOTAS.filter(
    m => m.seleccionable || (m.desbloqueaEnDia !== undefined && diasActivos >= m.desbloqueaEnDia)
  )
}

// Mascota sugerida por edad
export function getMascotaPorEdad(edad: number): Mascota {
  if (edad < 18)  return MASCOTAS.find(m => m.id === 'xoloitzcuintle')!
  if (edad <= 25) return MASCOTAS.find(m => m.id === 'ajolote')!
  if (edad <= 40) return MASCOTAS.find(m => m.id === 'jaguar')!
  return MASCOTAS.find(m => m.id === 'quetzal')!
}

// Próxima mascota por desbloquear
export function getProximaDesbloqueable(diasActivos: number): Mascota | null {
  const pendientes = MASCOTAS
    .filter(m => !m.seleccionable && m.desbloqueaEnDia !== undefined && diasActivos < m.desbloqueaEnDia!)
    .sort((a, b) => (a.desbloqueaEnDia ?? 0) - (b.desbloqueaEnDia ?? 0))

  return pendientes[0] ?? null
}
