import { drizzle } from "drizzle-orm/neon-serverless"
import { Pool } from "@neondatabase/serverless"

import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.")
}

// The websocket/Pool driver supports transactions (which better-auth uses) and
// pools connections — pair it with Neon's pooled connection string (-pooler).
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export const db = drizzle(pool, { schema })

export { schema }
