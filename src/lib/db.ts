import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function makeClient() {
  return new PrismaClient({ log: ['query'] })
}

// Check if cached client has all the latest models
const cached = globalForPrisma.prisma
const isFresh =
  cached &&
  typeof (cached as any).user !== 'undefined' &&
  typeof (cached as any).review !== 'undefined' &&
  typeof (cached as any).galleryImage !== 'undefined' &&
  typeof (cached as any).faqEntry !== 'undefined'

export const db = isFresh ? (cached as PrismaClient) : makeClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
