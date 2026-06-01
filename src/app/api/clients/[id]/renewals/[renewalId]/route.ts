import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string; renewalId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { renewalId } = await params
  const { startDate, endDate } = await req.json()
  if (!startDate || !endDate) return NextResponse.json({ error: 'Fechas requeridas' }, { status: 400 })

  const renewal = await prisma.clientRenewal.update({
    where: { id: renewalId },
    data: { startDate: new Date(startDate), endDate: new Date(endDate) },
  })

  return NextResponse.json(renewal)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string; renewalId: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { renewalId } = await params
  await prisma.clientRenewal.delete({ where: { id: renewalId } })
  return NextResponse.json({ success: true })
}
