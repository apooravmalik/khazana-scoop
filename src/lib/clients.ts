import { createRequire } from "node:module";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import Stripe from "stripe";

type PrismaClientLike = Record<string, any>;

const require = createRequire(import.meta.url);

let prismaClient: PrismaClientLike | null = null;
let stripeClient: Stripe | null = null;
let prismaPool: Pool | null = null;

export function getPrisma(): PrismaClientLike {
  if (!prismaClient) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is required for Prisma/Supabase database access.");
    }

    const prismaModule = require("@prisma/client") as { PrismaClient?: new (options?: unknown) => PrismaClientLike };
    if (!prismaModule.PrismaClient) {
      throw new Error("Prisma client is not generated. Run `pnpm prisma generate` before using Prisma-backed routes.");
    }

    prismaPool = new Pool({
      connectionString,
      max: 5,
    });
    const adapter = new PrismaPg(prismaPool);
    prismaClient = new prismaModule.PrismaClient({ adapter });
  }
  return prismaClient;
}

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return null;
  }
  if (!stripeClient) {
    stripeClient = new Stripe(key);
  }
  return stripeClient;
}

export function hasDatabaseUrl(): boolean {
  return Boolean(process.env.DATABASE_URL);
}
