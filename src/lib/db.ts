import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// In dev mode the cached PrismaClient can become stale if the Prisma schema is
// regenerated mid-session (new models added). Detect that by checking for a
// known late-added model (User) and rebuild the client if it's missing. This
// is a no-op in production because the cache is always fresh there.
function makeClient() {
  return new PrismaClient({ log: ['query'] })
}

const cached = globalForPrisma.prisma
const isFresh =
  cached && typeof (cached as any).user !== 'undefined'

export const db = isFresh ? (cached as PrismaClient) : makeClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
