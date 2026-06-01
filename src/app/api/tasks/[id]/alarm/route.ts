import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const user = session.user as any

  await prisma.taskAssignment.update({
    where: { taskId_userId: { taskId: id, userId: user.id } },
    data: { alarmed20: true },
  })

  return NextResponse.json({ success: true })
}
