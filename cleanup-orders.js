const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('Cleaning up order data...')

  try {
    // Delete all order items first (due to foreign key constraints)
    const deletedOrderItems = await prisma.orderItem.deleteMany({})
    console.log(`Deleted ${deletedOrderItems.count} order items`)

    // Delete all orders
    const deletedOrders = await prisma.order.deleteMany({})
    console.log(`Deleted ${deletedOrders.count} orders`)

    console.log('Order cleanup completed successfully!')
  } catch (error) {
    console.error('Error during cleanup:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })