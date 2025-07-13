import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Helper function to handle Prisma errors
export function handlePrismaError(error: unknown): string {
  if (typeof error !== 'object' || !error) {
    return 'Database operation failed'
  }
  
  const prismaError = error as { code?: string; meta?: { target?: string | string[] } }
  
  if (prismaError.code === 'P2002') {
    const target = prismaError.meta?.target
    if (Array.isArray(target)) {
      return `${target.join(', ')} already exists`
    }
    return 'This record already exists'
  }
  
  if (prismaError.code === 'P2025') {
    return 'Record not found'
  }
  
  if (prismaError.code === 'P2003') {
    return 'Invalid reference: related record not found'
  }
  
  if (prismaError.code === 'P2014') {
    return 'Invalid ID provided'
  }
  
  return 'Database operation failed'
}