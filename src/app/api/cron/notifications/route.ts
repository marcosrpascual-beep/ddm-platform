import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendTaskWarningEmail, sendClientExpiryEmail } from '@/lib/email'
import { sendWhatsAppNotification } from '@/lib/whatsapp'

// Called periodically to check tasks at 50% time elapsed
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (process.env.NODE_ENV === 'production' && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  const tasks = await prisma.task.findMany({
    where: { notified50: false },
    include: {
      assignments: {
        where: { completedAt: null },
        include: {
          user: { select: { email: true, name: true, phone: true, whatsappApiKey: true } },
        },
      },
    },
  })

  let notified = 0

  for (const task of tasks) {
    const totalMs = new Date(task.deadline).getTime() - new Date(task.createdAt).getTime()
    const elapsedMs = now.getTime() - new Date(task.createdAt).getTime()
    const percentElapsed = (elapsedMs / totalMs) * 100

    if (percentElapsed >= 50 && task.assignments.length > 0) {
      const remainingMs = new Date(task.deadline).getTime() - now.getTime()
      const hoursRemaining = Math.max(0, Math.round(remainingMs / 3600000))

      for (const assignment of task.assignments) {
        const { user } = assignment

        await sendTaskWarningEmail(user.email, user.name, task.title, hoursRemaining)

        if (user.phone && user.whatsappApiKey) {
          await sendWhatsAppNotification(user.phone, user.whatsappApiKey, task.title, hoursRemaining)
        }
      }

      await prisma.task.update({
        where: { id: task.id },
        data: { notified50: true },
      })

      notified++
    }
  }

  // Check clients expiring in 15 days
  const in15days = new Date(now)
  in15days.setDate(in15days.getDate() + 15)
  const in14days = new Date(now)
  in14days.setDate(in14days.getDate() + 14)

  const expiringClients = await prisma.client.findMany({
    where: {
      isActive: true,
      leftService: false,
      notifiedExpiry: false,
    },
    include: { renewals: { orderBy: { createdAt: 'asc' } } },
  })

  let clientsNotified = 0
  for (const client of expiringClients) {
    const latestEnd = client.renewals.length > 0
      ? new Date(client.renewals[client.renewals.length - 1].endDate)
      : client.endDate ? new Date(client.endDate) : null

    if (!latestEnd) continue
    const daysLeft = Math.ceil((latestEnd.getTime() - now.getTime()) / 86400000)
    if (daysLeft <= 15 && daysLeft > 0) {
      await sendClientExpiryEmail(client.name, latestEnd, daysLeft)
      await prisma.client.update({ where: { id: client.id }, data: { notifiedExpiry: true } })
      clientsNotified++
    }
  }

  return NextResponse.json({ checked: tasks.length, notified, clientsNotified })
}
