# Mobile (Expo) backend

This Next.js app is also the backend for the future Expo app. Both share **one
better-auth instance** — no separate auth server. Web uses cookies; mobile uses
the Expo client (session stored in SecureStore, sent as a cookie or
`Authorization: Bearer <token>`).

## Server setup (already done)

- `lib/auth.ts` has the `expo()` and `bearer()` plugins.
- `MOBILE_TRUSTED_ORIGINS` env (comma-separated) must list the app's deep-link
  scheme(s), e.g. `savingstracker://,exp://`. `BETTER_AUTH_URL` is trusted
  automatically. Leave blank until the app exists.

## Auth endpoints

Standard better-auth routes under `/api/auth/*` (email OTP + Google OAuth, no
passwords — same as web). Drive them from the Expo client:

```ts
// mobile app
import { createAuthClient } from "better-auth/react"
import { expoClient } from "@better-auth/expo/client"
import * as SecureStore from "expo-secure-store"

export const authClient = createAuthClient({
  baseURL: "https://<your-deploy-url>", // the web app's URL
  plugins: [expoClient({ scheme: "savingstracker", storage: SecureStore })],
})
```

## Data endpoints (`/api/v1/*`)

All require a signed-in session except `reference`. Errors are `{ error: string }`.

| Method   | Path                  | Body                                   | Returns |
|----------|-----------------------|----------------------------------------|---------|
| `GET`    | `/api/v1/goals`       | —                                      | `{ goals: Goal[] }` (deposits nested) |
| `POST`   | `/api/v1/goals`       | `{ name, target?, deadline? }`         | the created `Goal` (201) |
| `PATCH`  | `/api/v1/goals/:id`   | `{ name, target?, deadline? }`         | `{ id }` |
| `DELETE` | `/api/v1/goals/:id`   | —                                      | `{ id }` |
| `POST`   | `/api/v1/deposits`    | `{ goalId, amount, note?, channel? }`  | `{ id, goalId }` (201) |
| `GET`    | `/api/v1/me`          | —                                      | `{ user }` (profile) |
| `PATCH`  | `/api/v1/me`          | onboarding fields (see below)          | `{ user }` |
| `GET`    | `/api/v1/reference`   | — (no auth)                            | `{ countries, currencies, savingsChannels }` |

- `target` is a positive number, `deadline` is `"YYYY-MM-DD"`, `channel` is one
  of `bank` \| `mobile_money` \| `sacco` \| `cash`.
- Server generates goal/deposit `id` and `createdAt` (the web app generates them
  client-side; the mobile API does not require them).
- Onboarding PATCH body: `{ preferredName, country, currency, channels[],
  saccoMember, saccoName?, acceptTerms: true }`.

Admin features are **web-only** — there are intentionally no admin endpoints here.
