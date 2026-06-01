import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const clients = await prisma.client.findMany({
    include: {
      ddmUser: { select: { id: true, name: true } },
      renewals: { orderBy: { createdAt: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = session.user as any
  if (user.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await req.json()
  const {
    name,
    isActive,
    leftService,
    followersStart,
    startDate,
    endDate,
    instagramUrl,
    tiktokUrl,
    contentSheetUrl,
    scriptDocUrl,
    notes,
    country,
    source,
    ddmUserId,
  } = body

  if (!name) {
    return NextResponse.json({ error: 'El nombre es obligatorio' }, { status: 400 })
  }

  const client = await prisma.client.create({
    data: {
      name,
      isActive: isActive !== undefined ? isActive : true,
      leftService: leftService !== undefined ? leftService : false,
      followersStart: followersStart ? parseInt(followersStart) : null,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      instagramUrl: instagramUrl || null,
      tiktokUrl: tiktokUrl || null,
      contentSheetUrl: contentSheetUrl || null,
      scriptDocUrl: scriptDocUrl || null,
      notes: notes || null,
      country: country || null,
      source: source || null,
      ddmUserId: ddmUserId || null,
    },
    include: {
      ddmUser: { select: { id: true, name: true } },
    },
  })

  return NextResponse.json(client, { status: 201 })
}
