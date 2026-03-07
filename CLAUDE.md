# AI Tourist Guide — Development Guidelines

## Project Overview

Mobile-first conversational tourist guide powered by voice. The core UX is voice conversation via ElevenLabs Agents, not form-based navigation.

## Stack

- **Mobile:** Expo + React Native + NativeWind (development builds, not Expo Go)
- **Backend:** NestJS + Prisma + Postgres
- **Landing:** Next.js + shadcn/ui + Tailwind CSS
- **Voice/Agent:** ElevenLabs Agents (V1 — single agent platform)
- **Monorepo:** pnpm workspaces + Turborepo
- **Deployment:** Docker Compose on Ubuntu server (server-side only) + Expo/EAS (mobile)

## Repository Structure

```
apps/
  api/              # NestJS backend
  mobile/           # Expo React Native app
  landing/          # Next.js marketing site

packages/
  db/               # Prisma schema, migrations, generated client
  ui-tokens/        # shared color, spacing, typography tokens
  types/            # zod schemas / DTO contracts / shared types
  core/             # domain logic shared where useful
  config/           # eslint, tsconfig, prettier, tooling presets

infra/              # Dockerfiles, Caddy config, deploy scripts
.github/workflows/  # CI and deploy workflows
```

## Package Manager

Always use `pnpm`. Never use `npm` or `yarn`.

```bash
pnpm install                        # install all dependencies
pnpm add <pkg> --filter <app>       # add dependency to specific app
pnpm add -D <pkg> -w                # add root dev dependency
pnpm --filter <app> <script>        # run script in specific app
```

## Common Commands

```bash
# Development
pnpm dev                            # start all apps via turbo
pnpm --filter mobile dev            # start mobile app only
pnpm --filter api dev               # start API only
pnpm --filter landing dev           # start landing only

# Quality
pnpm lint                           # lint all packages
pnpm typecheck                      # typecheck all packages
pnpm test                           # test all packages

# Database
pnpm --filter db generate           # regenerate Prisma client
pnpm --filter db migrate:dev        # create/apply dev migration
pnpm --filter db studio             # open Prisma Studio

# Docker (server-side only)
docker compose -f docker-compose.dev.yml up -d
```

## Critical Rules

### Secrets
- NEVER expose backend secrets in mobile app code
- NEVER commit .env files
- Only `EXPO_PUBLIC_*` and `NEXT_PUBLIC_*` prefixed vars are safe for client code
- `ELEVENLABS_API_KEY`, `JWT_SECRET`, `DATABASE_URL` are always server-only

### Expo / Mobile
- This is a **development build** project, NOT an Expo Go project
- The mobile app runs OUTSIDE Docker during development
- Use NativeWind conventions for styling
- Add `testID` to important views for automation
- When testing on physical devices, use LAN IP for API URL, not localhost

### Database / Prisma
- Run `prisma format` and `prisma generate` after every schema change
- Prefer additive schema changes (add columns/tables before removing)
- Never create destructive migrations casually
- Use `prisma migrate dev` locally, `prisma migrate deploy` in production

### Docker
- Docker is for **server-side services only** (API, landing, Postgres, Caddy)
- The mobile Expo app should NEVER be Dockerized
- Use `docker-compose.dev.yml` for local dev, `docker-compose.prod.yml` for production

### NestJS / API
- Keep controllers thin — business logic goes in services
- Use DTOs for all request/response validation
- Follow NestJS module boundaries
- Never embed secrets directly in code

### Landing / Next.js
- Use `output: 'standalone'` for production builds
- Follow Next.js App Router conventions
- Use shadcn/ui components
- Ensure proper SEO metadata on all pages

### ElevenLabs
- ElevenLabs is the ONLY voice agent platform for V1
- Keep reasoning effort = None for conversational flows (latency matters)
- Server-side tools should be registered through the NestJS backend
