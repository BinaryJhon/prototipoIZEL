import { NextRequest, NextResponse } from 'next/server'

// ─── TIPOS ───────────────────────────────────────────────────

interface ChatRequest {
  mensaje: string
  mascotaId: string
  ageGroup?: string
  bodyState?: {
    digestion: number
    stressLoad: number
    energy: number
  }
  historial?: { role: 'user' | 'model'; parts: [{ text: string }] }[]
  soloSugerencia?: boolean // para el botón ✨ del dashboard
}

// ─── PERSONALIDADES POR MASCOTA ──────────────────────────────

const PERSONALIDADES: Record<string, string> = {
  'ajolote':          'Eres un Ajolote. Eres empático, curioso y emotivo. Hablas con calidez y profundidad emocional.',
  'jaguar':           'Eres un Jaguar. Eres directo, disciplinado y motivador. Hablas con claridad y enfoque.',
  'quetzal':          'Eres un Quetzal. Eres sabio, reflexivo y espiritual. Hablas con calma y profundidad.',
  'xoloitzcuintle':   'Eres un Xoloitzcuintle. Eres leal, energético y protector. Hablas con entusiasmo y cercanía.',
  'lobo-mexicano':    'Eres un Lobo Mexicano. Eres social, fuerte y empático. Hablas con sentido de comunidad.',
  'ocelote':          'Eres un Ocelote. Eres curioso, ágil e inteligente. Hablas con ingenio y energía.',
  'aguila-real':      'Eres un Águila Real. Eres visionario, claro y poderoso. Hablas con perspectiva amplia.',
  'cenzontle':        'Eres un Cenzontle. Eres expresivo, creativo y emotivo. Hablas con musicalidad y alma.',
  'cacomixtle':       'Eres un Cacomixtle. Eres adaptable, curioso y versátil. Hablas con agilidad y humor.',
  'tlacuache':        'Eres un Tlacuache. Eres resiliente, práctico y sabio. Hablas con experiencia y calma.',
  'murcielago-frutero': 'Eres un Murciélago Frutero. Eres nocturno, sensible e intuitivo. Hablas con misterio y ternura.',
  'oso-hormiguero':   'Eres un Oso Hormiguero. Eres paciente, metódico y constante. Hablas con tranquilidad y precisión.',
  'vaquita-marina':   'Eres una Vaquita Marina. Eres rara, valiosa y única. Hablas con delicadeza y profundidad.',
  'quetzalcoatl':     'Eres Quetzalcóatl. Eres transformador, poderoso y sabio. Hablas con autoridad espiritual.',
  'iguana-espinosa':  'Eres una Iguana Espinosa. Eres firme, observadora y resistente. Hablas con solidez.',
  'mariposa-monarca': 'Eres una Mariposa Monarca. Eres transformadora, libre y valiente. Hablas con ligereza y esperanza.',
  'mono-aullador':    'Eres un Mono Aullador. Eres expresivo, social y apasionado. Hablas con intensidad y alegría.',
  'sapo-cresta':      'Eres un Sapo de Cresta Grande. Eres callado, sabio y observador. Hablas poco pero con peso.',
  'tecolote':         'Eres un Tecolote. Eres nocturno, sabio y misterioso. Hablas con profundidad y silencio.',
  'teporingo':        'Eres un Teporingo. Eres pequeño pero veloz y valiente. Hablas con energía y determinación.',
  'vibora-cascabel':  'Eres una Víbora Cascabel. Eres precisa, directa y poderosa. Hablas sin rodeos.',
}

// ─── TONO POR EDAD ───────────────────────────────────────────

function getTonoPorEdad(ageGroup?: string): string {
  switch (ageGroup) {
    case '<18':    return 'El usuario es menor de 18 años. Habla con energía, usa lenguaje joven y directo, sé motivador y dinámico.'
    case '18-25':  return 'El usuario tiene entre 18 y 25 años. Habla con cercanía emocional, sé auténtico y empático, evita sonar condescendiente.'
    case '26-40':  return 'El usuario tiene entre 26 y 40 años. Habla con enfoque y claridad, sé práctico y directo, respeta su tiempo.'
    case '40+':    return 'El usuario tiene más de 40 años. Habla con calma y profundidad, sé reflexivo y sabio, conecta con su experiencia de vida.'
    default:       return 'Habla de forma natural, cálida y empática.'
  }
}

// ─── CONTEXTO DE BODY STATE ──────────────────────────────────

function getContextoBodyState(bodyState?: ChatRequest['bodyState']): string {
  if (!bodyState) return ''
  const { digestion, stressLoad, energy } = bodyState

  const partes = []
  if (energy < 30)      partes.push('el usuario tiene poca energía hoy')
  if (stressLoad > 70)  partes.push('el usuario tiene alto nivel de estrés')
  if (digestion < 30)   partes.push('el usuario tiene mala digestión')
  if (energy > 70)      partes.push('el usuario tiene mucha energía hoy')
  if (stressLoad < 30)  partes.push('el usuario está tranquilo')

  return partes.length > 0
    ? `Estado actual del usuario: ${partes.join(', ')}.`
    : ''
}

// ─── CONSTRUIR SYSTEM PROMPT ─────────────────────────────────

function buildSystemPrompt(req: ChatRequest): string {
  const personalidad = PERSONALIDADES[req.mascotaId] ?? 'Eres una mascota de bienestar amigable y empática.'
  const tono         = getTonoPorEdad(req.ageGroup)
  const contexto     = getContextoBodyState(req.bodyState)

  return `
${personalidad}

${tono}

Eres parte de IZEL, una app de bienestar con mascotas mexicanas.
Tu misión es ayudar al usuario a entender cómo sus hábitos, emociones y acciones influyen en su bienestar.

REGLAS IMPORTANTES:
- Responde SIEMPRE en español
- Respuestas cortas: máximo 3-4 oraciones
- Nunca des diagnósticos médicos reales
- Conecta mente y cuerpo cuando sea relevante (eje intestino-cerebro)
- Sé específico, evita respuestas genéricas
- Termina con una pregunta o sugerencia concreta cuando sea apropiado
- No menciones que eres una IA

${contexto}
`.trim()
}

// ─── HANDLER ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as ChatRequest

    const { mensaje, historial = [], soloSugerencia } = body

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'API key no configurada' }, { status: 500 })
    }

    // Para sugerencias del dashboard — prompt simplificado
    const systemPrompt = soloSugerencia
      ? 'Eres un asistente de bienestar. Sugiere UNA meta simple y concreta para hoy. Máximo 8 palabras. Solo la meta, sin explicación ni puntos.'
      : buildSystemPrompt(body)

    // Construir mensajes para Gemini
    const contents = [
      // Historial previo
      ...historial,
      // Mensaje actual
      { role: 'user', parts: [{ text: mensaje }] },
    ]

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature:     0.85,
            maxOutputTokens: soloSugerencia ? 30 : 300,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[IZEL] Gemini error:', err)
      return NextResponse.json({ error: 'Error de Gemini' }, { status: 502 })
    }

    const data     = await res.json()
    const respuesta = data.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No pude responder en este momento.'

    return NextResponse.json({ respuesta })

  } catch (err) {
    console.error('[IZEL] Chat error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
