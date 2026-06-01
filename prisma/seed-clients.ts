import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const clients = [
  // ACTIVOS
  { name: 'Cliente Ejemplo 1', isActive: true, leftService: false, startDate: new Date('2025-01-01'), endDate: new Date('2025-12-31'), notes: 'Cliente de ejemplo activo' },
  { name: 'Cliente Ejemplo 2', isActive: true, leftService: false, startDate: new Date('2025-03-01'), notes: 'Cliente de ejemplo activo' },
  { name: 'Cliente Ejemplo 3', isActive: true, leftService: false, startDate: new Date('2025-06-01'), notes: 'Cliente de ejemplo activo' },

  // INACTIVOS
  { name: 'Ex Cliente 1', isActive: false, leftService: true, startDate: new Date('2024-01-01'), notes: 'Cliente que dejó el servicio' },
  { name: 'Ex Cliente 2', isActive: false, leftService: true, startDate: new Date('2024-06-01'), notes: 'Cliente que dejó el servicio' },
]

async function main() {
  console.log('Insertando clientes de ejemplo...')
  for (const client of clients) {
    await prisma.client.create({ data: client })
    console.log(`✓ ${client.name}`)
  }
  console.log(`\nListo: ${clients.length} clientes cargados.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
