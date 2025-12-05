# VestLedger UI

Next.js frontend for VestLedger dashboards. Connects to VestLedger API via `NEXT_PUBLIC_API_BASE_URL`.

## Prereqs
- Node 20+
- pnpm

## Install
```
pnpm install
```

## Run
- Dev: `pnpm dev` (default port 3000; pass `--hostname 0.0.0.0` for Docker)
- Build: `pnpm build`
- Tests: `pnpm test` (unit), `pnpm test:e2e` (Cypress; requires API running)

## Env
- `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:3001`)
