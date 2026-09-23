import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/auth";

/**
 * The dev server can hold a stale `@prisma/client` module in its require
 * cache after `prisma generate` adds new models. When that happens the
 * `PrismaClient` constructor exposed to runtime code lacks accessors for the
 * new models (e.g. `trainer`, `user`, `payment`).
 *
 * To keep admin features working in dev we detect the stale class and rebuild
 * it on the fly by invalidating the require cache for `@prisma/client` and
 * `.prisma/client/*`, then re-requiring the module. The fresh instance is
 * stored on `globalThis.prisma` so subsequent re-evaluations of `db.ts`
 * (during hot reload) pick it up via the freshness check there.
 */

type PrismaLike = {
  user?: unknown;
  trainer?: unknown;
  payment?: unknown;
  auditLog?: unknown;
  attendance?: unknown;
  notificationLog?: unknown;
  $connect?: () => Promise<void>;
  $disconnect?: () => Promise<void>;
};

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaLike | undefined;
};

function invalidatePrismaRequireCache() {
  try {
    const paths = Object.keys(require.cache).filter(
      (p) => p.includes("@prisma/client") || p.includes(".prisma/client")
    );
    for (const p of paths) {
      delete require.cache[p];
    }
  } catch {
    // ignore — require.cache may not exist in some bundling modes
  }
}

function buildFreshPrismaClient(): PrismaLike {
  invalidatePrismaRequireCache();
  // Re-require after cache invalidation to pick up the freshly-generated class.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require("@prisma/client") as {
    PrismaClient: new (opts?: { log?: string[] }) => PrismaLike;
  };
  return new mod.PrismaClient({ log: ["query"] });
}

// Decide which client to use:
//  - Prefer an already-fresh cached client on globalThis (covers hot reloads)
//  - Else build a brand-new client from the freshly-required Prisma class.
function resolveDb(): PrismaLike {
  const existing = globalForPrisma.prisma;
  if (existing && typeof existing.user !== "undefined") {
    return existing;
  }
  // Need to (re)build. Try invalidating the require cache and requiring fresh.
  const fresh = buildFreshPrismaClient();
  if (typeof fresh.user !== "undefined") {
    if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = fresh;
    return fresh;
  }
  // Last-ditch fallback — return whatever we built, even if it lacks models.
  return fresh;
}

// Re-export as `db` so callers can use it interchangeably with `@/lib/db`.
export const db = resolveDb() as unknown as import("@prisma/client").PrismaClient;

/**
 * Read the admin identity from the session cookie. Returns
 * `{ id, name }` where `id` equals the username (the cookie only stores
 * the username). Both fields are "" when not authenticated.
 */
export async function getAdminActor(): Promise<{ id: string; name: string }> {
  try {
    const c = await cookies();
    const token = c.get(ADMIN_COOKIE)?.value;
    if (!token) return { id: "", name: "" };
    const body = token.split(".")[0];
    if (!body) return { id: "", name: "" };
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      u?: string;
    };
    const u = payload.u || "";
    return { id: u, name: u };
  } catch {
    return { id: "", name: "" };
  }
}

/**
 * Append an entry to the AuditLog table after an admin action.
 * Failures are swallowed so they never break the parent operation.
 * If `adminId` / `adminName` are omitted, the current admin cookie
 * identity is used automatically.
 */
export async function logAction(
  adminId?: string,
  adminName?: string,
  action?: string,
  details?: string
): Promise<void> {
  try {
    let id = adminId ?? "";
    let name = adminName ?? "";
    if (!id || !name) {
      const actor = await getAdminActor();
      if (!id) id = actor.id;
      if (!name) name = actor.name;
    }
    await (db as any).auditLog.create({
      data: {
        adminId: id || null,
        adminName: name || null,
        action: action || "unknown",
        details: details ?? null,
      },
    });
  } catch {
    // best-effort logging — never throw
  }
}
