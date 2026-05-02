import { NextRequest, NextResponse } from 'next/server'
import { IzelEvent } from '@/types/event'

export async function POST(req: NextRequest) {
  try {
    const event = await req.json() as IzelEvent

    // Validación mínima
    if (!event.sessionId || !event.type || !event.timestamp) {
      return NextResponse.json({ error: 'Evento inválido' }, { status: 400 })
    }

    const webhook = process.env.GOOGLE_SHEETS_WEBHOOK
    if (!webhook) {
      return NextResponse.json({ error: 'Webhook no configurado' }, { status: 500 })
    }

    // Reenviar a Google Sheets
    // 🔥 Reenviar a Google Sheets SIN bloquear
      fetch(webhook, {
        method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: event.sessionId,
        type: event.type,
        value: event.value ? JSON.stringify(event.value) : '',
        timestamp: event.timestamp,
        fecha: new Date(event.timestamp).toLocaleString('es-MX', {
          timeZone: 'America/Monterrey'
        }),
      }),
    }).catch((err) => {
      console.error('[IZEL] Background track error:', err);
    });

    return NextResponse.json({ ok: true })

  } catch (err) {
    console.error('[IZEL] Track error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
