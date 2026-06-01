import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { readFileSync } from 'fs'
import { join } from 'path'

function getSystemPrompt(): string {
  // Try to read from env var first (production), then fall back to file (dev)
  if (process.env.CEREBRO_SYSTEM_PROMPT) {
    return process.env.CEREBRO_SYSTEM_PROMPT
  }
  try {
    const filePath = join(process.cwd(), '..', 'cerebro', 'project_instructions.txt')
    return readFileSync(filePath, 'utf-8')
  } catch {
    return 'Sos el cerebro digital del negocio.'
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Solo admins' }, { status: 403 })

  const body = await req.json()
  const { messages, apiKey } = body

  if (!apiKey || !apiKey.startsWith('sk-ant-')) {
    return NextResponse.json({ error: 'API key inválida. Ingresá tu Anthropic API key.' }, { status: 400 })
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 8192,
      system: getSystemPrompt(),
      messages,
      stream: true,
    }),
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    return NextResponse.json({ error: err }, { status: upstream.status })
  }

  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
