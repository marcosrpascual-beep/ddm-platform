import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const { startDate, endDate } = await req.json()

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 })
  }

  const renewal = await prisma.clientRenewal.create({
    data: {
      clientId: id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    },
  })

  await prisma.client.update({
    where: { id },
    data: { isActive: true, leftService: false, notifiedExpiry: false },
  })

  return NextResponse.json(renewal, { status: 201 })
}
