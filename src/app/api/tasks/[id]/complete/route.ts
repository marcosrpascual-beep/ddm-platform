import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = session.user as any
  const { completed } = await req.json()

  const assignment = await prisma.taskAssignment.findUnique({
    where: { taskId_userId: { taskId: id, userId: user.id } },
  })

  if (!assignment) return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })

  const updated = await prisma.taskAssignment.update({
    where: { taskId_userId: { taskId: id, userId: user.id } },
    data: { completedAt: completed ? new Date() : null },
  })

  return NextResponse.json(updated)
}
