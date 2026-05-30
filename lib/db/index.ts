import { drizzle } from "drizzle-orm/neon-http"
import { neon, neonConfig } from "@neondatabase/serverless"

import * as schema from "./schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Add it to your .env file.")
}

// The HTTP (fetch) driver issues each query as a one-shot HTTPS request. That's
// great for serverless, but a single transient network blip surfaces as
// `TypeError: fetch failed` (an undici AggregateError) and fails the whole
// query — there is no built-in retry. Wrap fetch so brief failures are retried
// with backoff instead of bubbling up as a 500.
//
// The backoff has to be wide enough to ride out the two real causes we see:
// a Neon scale-to-zero cold start (compute wake can take ~1s) and a brief
// loss of connectivity to the IPv6-only endpoint. Tight sub-second retries
// just burn all attempts inside the same outage window, so we space them out.
const RETRY_BACKOFF_MS = [300, 800, 1500]

neonConfig.fetchFunction = async (
  input: RequestInfo | URL,
  init?: RequestInit
) => {
  const maxAttempts = RETRY_BACKOFF_MS.length + 1
  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fetch(input, init)
    } catch (error) {
      // Only network-level failures throw here; HTTP error statuses don't.
      lastError = error
      if (attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, RETRY_BACKOFF_MS[attempt - 1])
        )
      }
    }
  }

  throw lastError
}

// Pair the HTTP driver with Neon's pooled connection string (-pooler).
const sql = neon(process.env.DATABASE_URL)

export const db = drizzle(sql, { schema })

export { schema }
