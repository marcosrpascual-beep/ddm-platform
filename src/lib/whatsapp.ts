import axios from 'axios'

// CallMeBot: gratuito, cada usuario debe activarlo una vez
// Instrucciones en /admin/users para configurar

export async function sendWhatsAppNotification(
  phone: string,
  apiKey: string,
  taskTitle: string,
  hoursRemaining: number
) {
  const message = encodeURIComponent(
    `⚠️ *DDM - Alerta de Tarea*\n\nTu tarea *"${taskTitle}"* ya usó el 50% del tiempo.\nTe quedan aprox. ${hoursRemaining} horas.\n\nIngresá a la plataforma para completarla. 💪`
  )

  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${message}&apikey=${apiKey}`

  try {
    await axios.get(url)
    return true
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return false
  }
}
