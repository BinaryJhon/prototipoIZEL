## Dia 1 

## types/user.ts
Define todas las estructuras de datos del usuario.
- `AgeGroup` → union type de los 4 rangos de edad
- `UserProfile` → nombre, edad, ageGroup, mascotaId, creadoEn, correo (opcional — se captura al final)
- `BodyState` → digestion, stressLoad, energy (0-100)
- `HealthMetrics` → 10 métricas de salud simuladas (core + extendidas)
- `AdvancedMetrics` → bloodPressure {sistolica, diastolica}, triglycerides, glucoseLevel, heartHealth
- `HexagonDimensions` → los 6 ejes del hexágono (0-100 cada uno)

## types/mascota.ts
Define las estructuras de las mascotas.
- `MascotaId` → union literal de los 21 ids de animales
- `PersonalidadTono` → 'energetico' | 'emocional' | 'disciplinado' | 'reflexivo'
- `MascotaEstado` → 'feliz' | 'triste' | 'motivado' | 'cansado' | 'neutral'
- `Mascota` → id, nombre, imagen, personalidad, descripcion, edadIdeal,
              desbloqueaEnDia (undefined = seleccionable desde inicio), seleccionable

## types/event.ts
Define el sistema de tracking.
- `EventType` → union de los 10 eventos con comentario de cuándo disparar cada uno
- `IzelEvent` → { sessionId, type, value?, timestamp }
- `value` es Record<string, unknown> — flexible por diseño para datos extra por evento

## lib/session.ts
Maneja la sesión anónima del usuario.
- `getSessionId()` → crea o recupera el sessionId con crypto.randomUUID()
- `saveUserProfile()` → guarda UserProfile en localStorage
- `getUserProfile()` → recupera UserProfile (null si no existe)
- `hasCompletedOnboarding()` → boolean, útil para redirigir en onboarding
- `clearSession()` → limpia toda la sesión (botón reset en demo)
- Todas las funciones tienen guard typeof window para SSR de Next.js

## lib/events.ts
Sistema de doble tracking.
- `trackEvent(type, value?)` → función principal, única que se llama en la app
- Guarda en localStorage Y envía a /api/track en paralelo
- La falla remota es silenciosa — nunca rompe la app
- `getEvents()` → todos los eventos guardados
- `countEvents(type)` → cuántos eventos de un tipo
- `getLastEvent(type)` → último evento de un tipo
- `getDaysActive()` → días únicos con actividad (para rachas y desbloqueos)

## lib/storage.ts
Helper genérico de localStorage con prefijo izel_.
- `setItem<T>(key, value)` → guarda con prefijo + JSON.stringify
- `getItem<T>(key)` → recupera con JSON.parse (null si no existe)
- `removeItem(key)` → elimina una key
- `listKeys()` → lista todas las keys de IZEL
- `clearAll()` → limpia solo las keys de IZEL sin tocar el resto del navegador
- `getStorageSize()` → cuánto KB está usando IZEL (útil en demo)

## lib/metrics.ts
Calcula todo lo que alimenta el hexágono y las gráficas.
- `calcularHexagono()` → deriva los 6 ejes desde los eventos del usuario
- `calcularHealthMetrics()` → 10 métricas simuladas basadas en el hexágono
- `calcularAdvancedMetrics()` → presión, triglicéridos, glucosa, salud cardíaca (simulados)
- `calcularBodyState()` → digestion, stressLoad, energy
- Relaciones fisiológicas implementadas:
  - estrés alto → presión sistólica alta
  - mala nutrición → triglicéridos altos
  - más movimiento → mejor salud cardíaca
  - buen foco → glucosa estable

## data/mascotas.ts
Catálogo completo de los 21 animales.
- Array MASCOTAS con los 21 animales, cada uno con su id, imagen, personalidad,
  descripcion, edadIdeal, desbloqueaEnDia y seleccionable
- 4 seleccionables desde el inicio: Ajolote, Jaguar, Quetzal, Xoloitzcuintle
- 17 desbloqueables por racha: del día 3 (Lobo Mexicano) al día 180 (Quetzalcóatl)
- `getMascota(id)` → mascota por id
- `getMascotasIniciales()` → las 4 seleccionables
- `getMascotasDesbloqueadas(diasActivos)` → según racha actual
- `getMascotaPorEdad(edad)` → sugerida en onboarding
- `getProximaDesbloqueable(diasActivos)` → siguiente por desbloquear
---

## DÍA 2 — Componentes base

### components/hexagono/HexagonoChart.tsx
Radar chart con Recharts (pnpm add recharts).
- Recibe `dimensiones: HexagonDimensions` y `size?: number`
- 6 ejes: Ánimo, Movimiento, Nutrición, Mente, Constancia, Conexión
- gridType="polygon" para forma hexagonal
- Reutilizable en dashboard/ y progress/

### components/ui/Button.tsx
Botón base reutilizable.
- variante: 'primary' | 'secondary' | 'ghost'
- tamaño: 'sm' | 'md' | 'lg'
- fullWidth: boolean
- Mantiene tokens de color de IZEL

### components/ui/Card.tsx
Contenedor base reutilizable.
- variante: 'default' | 'dark' | 'subtle'
- padding: 'sm' | 'md' | 'lg'

### components/ui/ProgressRing.tsx
Anillo SVG de progreso.
- Props: valor (0-100), tamaño, grosor, color, children
- Usado en dashboard y focus
- children se centra dentro del anillo

---

## DÍA 3 — Páginas principales

### app/api/chat/route.ts
Integración con Gemini API.
- Modelo: gemini-1.5-flash
- GEMINI_API_KEY en .env.local
- Personalidad por mascota (21 definidas en PERSONALIDADES)
- Tono por ageGroup (<18, 18-25, 26-40, 40+)
- bodyState como contexto adicional
- flag soloSugerencia para el botón ✨ del dashboard
- maxOutputTokens: 300 chat, 30 sugerencias

### app/api/track/route.ts
Reenvía eventos a Google Sheets via webhook.
- GOOGLE_SHEETS_WEBHOOK en .env.local
- URL actual: https://script.google.com/macros/s/AKfycbyn9dF2VQk-qlhsSDamc2VONDdsNpNV80kXsb_qzrrKUdkieIrVD1FdF2EPoKtKMuht/exec
- Agrega campo `fecha` legible en zona horaria America/Monterrey
- value se serializa como JSON string

### app/chat/page.tsx
Chat con la mascota IA.
- Historial persiste en localStorage (izel_chat_historial) por día
- Detecta food_logged automáticamente por keywords
- Indicador de escritura con 3 puntos animados
- Scroll automático al último mensaje

### app/focus/page.tsx
Pomodoro 25/5.
- Estados: idle → focus → descanso → completado
- Anillo SVG con progreso
- Mensajes de descanso específicos por mascota (21 definidos)
- Trackea focus_started, focus_completed, focus_interrupted

### app/dashboard/page.tsx
Dashboard principal.
- Clima via Open-Meteo (sin API key, coordenadas Torreón)
- Cache de clima 1 hora en localStorage
- Meta del día: el usuario escribe o pide sugerencia via ✨ (Gemini)
- Meta persiste en localStorage (izel_meta_hoy) por día
- Hexágono mini con barras de color
- Botón reset para testers (limpia localStorage)

### app/onboarding/page.tsx
3 pasos: nombre → edad → mascota.
- Overlay verde que oscurece el fondo en cada paso
- Mascota sugerida por edad con badge "Para ti"
- Guarda UserProfile y dispara onboarding_completed + pet_selected

### app/progress/page.tsx
Progreso completo.
- HexagonoChart de Recharts
- Métricas core como barras
- Métricas avanzadas como estados (Óptimo/Estable/Elevado/Alto)
- Estadísticas de uso desde eventos
- Captura de correo al fondo
- Disclaimer discreto al pie

---

## Variables de entorno (.env.local)

GEMINI_API_KEY=tu_clave         → https://aistudio.google.com/api-keys
GOOGLE_SHEETS_WEBHOOK=url       → Google Apps Script webhook

## Pendiente

- [ ] components/mascota/Mascota.tsx
- [ ] components/mascota/EstadosMascota.tsx
- [ ] components/gamificacion/Badge.tsx
- [ ] components/gamificacion/DailyChallenge.tsx
- [ ] components/gamificacion/Streak.tsx
- [ ] components/layout/Navbar.tsx
- [ ] components/layout/Sidebar.tsx
- [ ] Vercel deploy
