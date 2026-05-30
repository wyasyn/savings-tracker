import "server-only"

/* -------------------------------------------------------------------------- */
/*  Tiny JSON response helpers for the mobile REST API (`/api/v1/*`).          */
/*  Keeps every route handler returning the same envelope shape so the Expo    */
/*  client can rely on it: success bodies are the payload as-is; errors are    */
/*  always `{ error: string }` with the matching HTTP status.                  */
/* -------------------------------------------------------------------------- */

export function json<T>(data: T, status = 200): Response {
  return Response.json(data, { status })
}

export function error(message: string, status = 400): Response {
  return Response.json({ error: message }, { status })
}

/** 401 — no valid session/token on the request. */
export function unauthorized(message = "Not signed in."): Response {
  return error(message, 401)
}

/** 404 — the resource doesn't exist or isn't owned by the caller. */
export function notFound(message = "Not found."): Response {
  return error(message, 404)
}
