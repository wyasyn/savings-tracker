import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"

import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.")
}

// The HTTP (fetch) driver is the robust choice for serverless: each query is a
// one-shot request over HTTPS — no long-lived socket to drop. Pair it with
// Neon's pooled connection string (-pooler).
const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql, { schema })

export { schema }
