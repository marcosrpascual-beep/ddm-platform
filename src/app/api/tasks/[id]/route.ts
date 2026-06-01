import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, addHours } from 'date-fns'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, description, priority, durationDays, durationHours, assigneeIds } = body

  const days = parseInt(durationDays) || 0
  const hours = parseInt(durationHours) || 0
  const deadline = addHours(addDays(new Date(), days), hours)

  await prisma.taskAssignment.deleteMany({ where: { taskId: id } })

  const task = await prisma.task.update({
    where: { id },
    data: {
      title,
      description: description || null,
      priority: priority || 'MEDIUM',
      durationDays: days,
      durationHours: hours,
      deadline,
      notified50: false,
      assignments: {
        create: assigneeIds.map((uid: string) => ({ userId: uid })),
      },
    },
    include: {
      createdBy: { select: { id: true, name: true } },
      assignments: {
        include: { user: { select: { id: true, name: true, email: true } } },
      },
    },
  })

  return NextResponse.json(task)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  await prisma.task.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
