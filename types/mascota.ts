export type MascotaId =
  | 'aguila-real'
  | 'ajolote'
  | 'cacomixtle'
  | 'cenzontle'
  | 'iguana-espinosa'
  | 'jaguar'
  | 'lobo-mexicano'
  | 'mariposa-monarca'
  | 'mono-aullador'
  | 'murcielago-frutero'
  | 'ocelote'
  | 'oso-hormiguero'
  | 'quetzal'
  | 'quetzalcoatl'
  | 'sapo-cresta'
  | 'tecolote'
  | 'teporingo'
  | 'tlacuache'
  | 'vaquita-marina'
  | 'vibora-cascabel'
  | 'xoloitzcuintle'

export type PersonalidadTono =
  | 'energetico'
  | 'emocional'
  | 'disciplinado'
  | 'reflexivo'

export type MascotaEstado =
  | 'feliz'
  | 'triste'
  | 'motivado'
  | 'cansado'
  | 'neutral'

export interface Mascota {
  id: MascotaId
  nombre: string
  imagen: string          // ruta en /public/animales/
  personalidad: PersonalidadTono
  descripcion: string     // frase corta de personalidad
  edadIdeal: string       // ej: '18-25'
  desbloqueaEnDia?: number // undefined = disponible desde inicio
  seleccionable: boolean  // true = las 4 iniciales
}
