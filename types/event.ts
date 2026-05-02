export type EventType =
  | 'app_opened'         // Usuario abre la app por primera vez en la sesión
  | 'onboarding_completed' // Completó nombre + edad → mascota asignada
  | 'pet_selected'       // Eligió su mascota inicial en el onboarding
  | 'message_sent'       // Envió un mensaje al chat con la mascota IA
  | 'focus_started'      // Inició un ciclo Pomodoro de 25 minutos
  | 'focus_completed'    // Completó el ciclo Pomodoro sin interrumpir
  | 'focus_interrupted'  // Salió del Pomodoro antes de que terminara
  | 'mission_completed'  // Completó la misión diaria del dashboard
  | 'food_logged'        // Registró lo que comió vía chat
  | 'email_submitted'    // Dejó su correo al final del flujo

export interface IzelEvent {
  sessionId: string               // ID único de la sesión anónima
  type: EventType                 // Qué acción ocurrió
  value?: Record<string, unknown> // Datos extra según el evento, por ejemplo:
                                  // pet_selected    → { mascotaId: 'ajolote' }
                                  // message_sent    → { mensajeNum: 3 }
                                  // focus_completed → { duracion: 25 }
                                  // food_logged     → { descripcion: 'tacos' }
  timestamp: number               // Date.now() — cuándo ocurrió exactamente
}
