import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: 'admin@ddm.com' } })
  if (existing) {
    console.log('Admin ya existe.')
    return
  }

  const hashed = await bcrypt.hash('ddm2024admin', 10)
  await prisma.user.create({
    data: {
      email: 'admin@ddm.com',
      name: 'Admin DDM',
      password: hashed,
      role: 'ADMIN',
    },
  })

  console.log('✅ Admin creado:')
  console.log('   Email: admin@ddm.com')
  console.log('   Contraseña: ddm2024admin')
  console.log('   (Cambiala desde el panel de usuarios)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
