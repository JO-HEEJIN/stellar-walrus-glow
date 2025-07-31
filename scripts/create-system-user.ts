import { prisma } from '../lib/prisma'

async function createSystemUser() {
  try {
    // Check if system user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'system@kfashion.com' },
    })

    if (existingUser) {
      console.log('System user already exists:', existingUser.id)
      return existingUser
    }

    // Create system user
    const systemUser = await prisma.user.create({
      data: {
        id: 'system',
        name: 'System',
        email: 'system@kfashion.com',
        role: 'MASTER_ADMIN',
        status: 'ACTIVE',
        emailVerified: new Date(),
      },
    })

    console.log('System user created successfully:', systemUser.id)
    return systemUser
  } catch (error) {
    console.error('Error creating system user:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
createSystemUser()
  .then(() => {
    console.log('Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Script failed:', error)
    process.exit(1)
  })