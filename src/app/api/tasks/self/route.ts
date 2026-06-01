import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, addHours } from 'date-fns'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  const body = await req.json()
  const { title, description, priority, durationDays, durationHours } = body

  if (!title) return NextResponse.json({ error: 'El título es obligatorio' }, { status: 400 })

  const days = parseInt(durationDays) || 0
  const hours = parseInt(durationHours) || 0
  if (days === 0 && hours === 0) {
    return NextResponse.json({ error: 'Definí una duración mayor a 0' }, { status: 400 })
  }

  const deadline = addHours(addDays(new Date(), days), hours)

  const task = await prisma.task.create({
    data: {
      title,
      description: description || null,
      priority: priority || 'MEDIUM',
      durationDays: days,
      durationHours: hours,
      deadline,
      createdById: user.id,
      assignments: {
        create: [{ userId: user.id }],
      },
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      assignments: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  return NextResponse.json(task, { status: 201 })
}
