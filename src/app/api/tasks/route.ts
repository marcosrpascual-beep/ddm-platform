import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { addDays, addHours } from 'date-fns'
import { sendTaskAssignedEmail } from '@/lib/email'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  const { searchParams } = new URL(req.url)
  const userId = searchParams.get('userId')

  if (user.role === 'ADMIN') {
    // ?mine=true → return only this admin's own tasks in member format (with myAssignment)
    if (searchParams.get('mine') === 'true') {
      const assignments = await prisma.taskAssignment.findMany({
        where: { userId: user.id },
        include: {
          task: {
            include: {
              createdBy: { select: { id: true, name: true } },
              assignments: { include: { user: { select: { id: true, name: true, email: true } } } },
            },
          },
        },
        orderBy: { task: { deadline: 'asc' } },
      })
      return NextResponse.json(assignments.map((a) => ({ ...a.task, myAssignment: a })))
    }

    const targetUserId = userId || undefined
    const tasks = await prisma.task.findMany({
      where: targetUserId
        ? { assignments: { some: { userId: targetUserId } } }
        : undefined,
      include: {
        createdBy: { select: { id: true, name: true } },
        assignments: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
      orderBy: { deadline: 'asc' },
    })
    return NextResponse.json(tasks)
  }

  // Employee: only their own tasks
  const assignments = await prisma.taskAssignment.findMany({
    where: { userId: user.id },
    include: {
      task: {
        include: {
          createdBy: { select: { id: true, name: true } },
          assignments: {
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
    orderBy: { task: { deadline: 'asc' } },
  })

  return NextResponse.json(assignments.map((a) => ({ ...a.task, myAssignment: a })))
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const { title, description, priority, durationDays, durationHours, assigneeIds } = body

  if (!title || !assigneeIds?.length) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const days = parseInt(durationDays) || 0
  const hours = parseInt(durationHours) || 0
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

  // Send assignment emails to all assignees
  for (const assignment of task.assignments) {
    await sendTaskAssignedEmail(
      assignment.user.email,
      assignment.user.name,
      task.title,
      task.description,
      task.deadline,
      task.priority
    )
  }

  return NextResponse.json(task, { status: 201 })
}
