import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendTaskAssignedEmail(
  to: string,
  userName: string,
  taskTitle: string,
  taskDescription: string | null,
  deadline: Date,
  priority: string
) {
  const priorityLabel: Record<string, string> = { LOW: 'Baja', MEDIUM: 'Media', HIGH: 'Alta' }
  const deadlineStr = deadline.toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const subject = `📋 DDM - Nueva tarea asignada: "${taskTitle}"`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #722F37; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">DDM</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #722F37;">Hola ${userName},</h2>
        <p style="font-size: 16px; color: #333;">
          Se te asignó una nueva tarea:
        </p>
        <div style="background: white; border-left: 4px solid #722F37; padding: 20px; margin: 20px 0; border-radius: 4px;">
          <h3 style="margin: 0 0 10px 0; color: #722F37; font-size: 20px;">${taskTitle}</h3>
          ${taskDescription ? `<p style="color: #555; margin: 0 0 15px 0;">${taskDescription}</p>` : ''}
          <p style="margin: 0; color: #666; font-size: 14px;">
            Prioridad: <strong style="color: ${priority === 'HIGH' ? '#dc2626' : priority === 'MEDIUM' ? '#d97706' : '#16a34a'}">${priorityLabel[priority] || priority}</strong>
          </p>
        </div>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 15px;">
            📅 Fecha límite: <strong>${deadlineStr}</strong>
          </p>
        </div>
        <div style="text-align: center; margin-top: 25px;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard"
             style="background: #722F37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px;">
            Ver mis tareas
          </a>
        </div>
      </div>
      <div style="background: #722F37; padding: 10px; text-align: center;">
        <p style="color: #ddd; margin: 0; font-size: 12px;">DDM - Plataforma de Gestión de Tareas</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `DDM Platform <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export async function sendTaskWarningEmail(
  to: string,
  userName: string,
  taskTitle: string,
  hoursRemaining: number
) {
  const subject = `⚠️ DDM - Recordatorio: "${taskTitle}" al 50% del tiempo`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #722F37; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">DDM</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #722F37;">Hola ${userName},</h2>
        <p style="font-size: 16px; color: #333;">
          Tu tarea <strong>"${taskTitle}"</strong> ya consumió el <strong>50% del tiempo asignado</strong>.
        </p>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 15px;">
            ⏰ Te quedan aproximadamente <strong>${hoursRemaining} horas</strong> para completarla.
          </p>
        </div>
        <p style="color: #555;">
          Por favor ingresá a la plataforma DDM para revisar el estado de tu tarea.
        </p>
        <div style="text-align: center; margin-top: 25px;">
          <a href="${process.env.NEXTAUTH_URL}/dashboard"
             style="background: #722F37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px;">
            Ver mis tareas
          </a>
        </div>
      </div>
      <div style="background: #722F37; padding: 10px; text-align: center;">
        <p style="color: #ddd; margin: 0; font-size: 12px;">DDM - Plataforma de Gestión de Tareas</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `DDM Platform <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}

export async function sendClientExpiryEmail(clientName: string, endDate: Date, daysLeft: number) {
  const endDateStr = endDate.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
  const subject = `⚠️ DDM - Servicio por vencer: ${clientName} (${daysLeft} días)`
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #722F37; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">DDM</h1>
      </div>
      <div style="padding: 30px; background: #f9f9f9;">
        <h2 style="color: #722F37;">Servicio próximo a vencer</h2>
        <p style="font-size: 16px; color: #333;">
          El servicio del cliente <strong>${clientName}</strong> vence en <strong>${daysLeft} días</strong>.
        </p>
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404; font-size: 15px;">
            📅 Fecha de vencimiento: <strong>${endDateStr}</strong>
          </p>
        </div>
        <p style="color: #555;">
          Recordá contactar al cliente para coordinar la renovación del servicio.
        </p>
        <div style="text-align: center; margin-top: 25px;">
          <a href="${process.env.NEXTAUTH_URL}/admin/clients"
             style="background: #722F37; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px;">
            Ver clientes
          </a>
        </div>
      </div>
      <div style="background: #722F37; padding: 10px; text-align: center;">
        <p style="color: #ddd; margin: 0; font-size: 12px;">DDM - Plataforma de Gestión</p>
      </div>
    </div>
  `

  try {
    await transporter.sendMail({
      from: `DDM Platform <${process.env.GMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL!,
      subject,
      html,
    })
    return true
  } catch (error) {
    console.error('Email send error:', error)
    return false
  }
}
