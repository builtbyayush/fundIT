# FundIt

FundIt is an investment opportunity platform where investors discover curated projects and administrators publish and manage opportunities.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style UI
- MongoDB / Mongoose
- Auth.js (ADMIN / INVESTOR RBAC)
- Zod + Vitest

## Setup

1. Copy `.env.example` to `.env.local` and set `MONGODB_URI`, `AUTH_SECRET`, and payment mock secrets.
2. Install dependencies: `npm install`
3. Seed data (optional):
   - `npm run seed:admin`
   - `npm run seed:categories`
   - `npm run seed:projects`
   - `npm run seed:opportunities`
4. Run locally: `npm run dev`

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run typecheck` | TypeScript |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |
| `npm run build` | Production build |

## Product boundary

FundIt's final investment instrument and production payment provider are pending client confirmation. Development uses a mock payment provider only (`PAYMENT_PROVIDER=mock`), blocked in production.

See [`src/docs/investment-domain.md`](src/docs/investment-domain.md).
# fundIT
