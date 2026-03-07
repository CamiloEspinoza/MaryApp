# AI Tourist Guide — Technical Decisions, Development Workflow, and Deployment Architecture

This document captures the decisions already taken for the AI tourist guide project, plus the recommended development, deployment, and autodeploy strategy for a monorepo built with Claude Code.

---

## 1. Final decisions already taken

### Product shape
- We are building a **mobile-first conversational tourist guide**.
- The core UX is **voice conversation**, not form-based navigation.
- The guide will be powered by **ElevenLabs Agents** as the main conversational and voice platform.

### App stack
- **Mobile app:** Expo + React Native
- **Mobile styling:** NativeWind
- **Backend:** NestJS
- **ORM / DB access:** Prisma
- **Repository structure:** Monorepo
- **Package manager:** pnpm
- **Task runner:** Turborepo

### Relevant refinement added after thinking through deployment
- We should add a **separate landing app** inside the monorepo.
- Recommended stack for the landing: **Next.js + shadcn/ui**.
- Reason: the landing is a marketing and SEO surface, while the mobile app is a native product surface. Those are different concerns.

### Main architectural stance
- We will use **ElevenLabs only** for the voice-agent layer in V1 instead of orchestrating OpenAI separately.
- The backend will still exist and remain important for:
  - auth
  - user profiles
  - places / POIs
  - trip memory and preferences
  - internal tool endpoints
  - analytics / logging
  - business logic
  - secret-bearing integrations

### Deployment stance
- **Mobile app deployment:** Expo / EAS
- **Backend deployment:** our own Ubuntu server
- **Landing deployment:** our own Ubuntu server
- **Database deployment:** Postgres in Docker on the Ubuntu server for now
- **Orchestration:** Docker Compose
- **Autodeploy:** GitHub Actions + SSH + Docker image pull/update

### Important warning that changes one operational detail
- We should **not** treat the Expo mobile app as a normal Dockerized service.
- Docker is the right choice for **server-side services**.
- The **mobile Expo app should run outside Docker** during development, using a development build.

---

## 2. Final repo structure

```text
apps/
  api/              # NestJS backend
  mobile/           # Expo React Native app
  landing/          # Next.js marketing site

packages/
  db/               # Prisma schema, migrations, generated client wrappers
  ui-tokens/        # shared color, spacing, typography tokens
  types/            # zod schemas / DTO contracts / shared types
  core/             # domain logic shared where useful
  config/           # eslint, tsconfig, prettier, tooling presets

infra/
  docker/
    api.Dockerfile
    landing.Dockerfile
  caddy/
    Caddyfile
  scripts/
    deploy.sh       # optional remote deployment helper

.github/
  workflows/
    ci.yml
    deploy-production.yml

docker-compose.dev.yml

docker-compose.prod.yml

.env.example
```

---

## 3. High-level architecture

```text
                ┌─────────────────────────────┐
                │       Expo Mobile App       │
                │  React Native + NativeWind  │
                │  ElevenLabs RN SDK          │
                └──────────────┬──────────────┘
                               │ HTTPS / WS
                               ▼
                    ┌───────────────────────┐
                    │      Reverse Proxy    │
                    │       Caddy           │
                    │  TLS + routing        │
                    └───────┬───────┬──────┘
                            │       │
                            │       │
                            ▼       ▼
                  ┌────────────┐  ┌──────────────┐
                  │  Landing   │  │   API        │
                  │  Next.js   │  │ NestJS       │
                  │ shadcn/ui  │  │ Prisma       │
                  └────────────┘  └──────┬───────┘
                                         │
                                         ▼
                                  ┌────────────┐
                                  │ Postgres   │
                                  │ Docker vol │
                                  └────────────┘
```

---

## 4. Runtime split

### Mobile app responsibilities
- voice UI
- microphone permissions
- session start / stop
- map/list views
- lightweight local state
- calling backend APIs
- handling ElevenLabs session bootstrap

### Landing responsibilities
- marketing pages
- waitlist / lead capture
- SEO content
- social previews / OG imagery
- links to App Store / Play Store when ready

### NestJS backend responsibilities
- authentication
- users / profiles
- preferences and trip memory
- place search abstraction
- route / itinerary generation logic
- persistence
- admin / analytics APIs
- secure server-side tools for the agent
- storage of private secrets and service integrations

### Postgres responsibilities
- users
- sessions
- places / itineraries cache if needed
- preferences / memory
- analytics metadata
- internal domain records

---

## 5. Important implementation note about Expo

Even though Expo often starts with Expo Go, this project should assume **development builds from day one**.

Why:
- the ElevenLabs React Native SDK is a better fit in a real native-capable Expo environment,
- the voice experience depends on native capabilities,
- we should optimize for the real app runtime early.

So this repo should be treated as an **Expo development-build project**, not an Expo Go-only prototype.

---

## 6. Why the landing is now a separate app

This is the one meaningful architectural refinement added after discussing deployment.

### Decision
Use a dedicated `apps/landing` app instead of trying to make the marketing site the same thing as the mobile app.

### Recommended stack
- **Next.js**
- **shadcn/ui**
- **Tailwind CSS**

### Why
- better fit for marketing pages
- cleaner SEO story
- better ergonomics for content pages, forms, and polished web UI
- easier Docker self-hosting for a website
- lets Expo stay focused on the mobile product

This does **not** change the core product decision. It only gives the project a cleaner split between:
- native app
- marketing web
- backend API

---

## 7. Local development architecture

### Principle
For local development, Docker should run the **server-side stack**, while the mobile app runs on the host machine.

### Local services that should be Dockerized
- Postgres
- API
- Landing
- optional reverse proxy
- optional admin utilities (for example pgAdmin) behind profiles only

### Local service that should **not** be Dockerized by default
- Expo mobile app

### Why the mobile app should stay outside Docker
- Expo development is smoother on the host machine
- Metro, simulator/device networking, microphone permissions, and native debugging are easier outside Docker
- the mobile app ultimately ships through EAS, not through Docker

### Local development workflow
1. Start infrastructure and server-side apps with Docker Compose
2. Run the Expo mobile app locally from `apps/mobile`
3. Point the app to the local API using `.env`

### Recommended local commands
```bash
docker compose -f docker-compose.dev.yml up -d
pnpm --filter mobile dev
```

### Local networking note
If testing on a physical device, the mobile app should usually call the API using your machine's LAN IP, not `localhost`.

---

## 8. Production architecture on the Ubuntu server

### Services to run on the server
- `caddy`
- `landing`
- `api`
- `postgres`
- optional one-off `migrate` service

### Why Docker Compose is the right fit here
- simple for a single server
- easy to reason about
- reproducible across dev and prod
- easy to update through SSH from GitHub Actions
- good enough until scale or availability requirements force a more advanced orchestrator

### Recommended domains
- `example.com` → landing
- `api.example.com` → API

### Reverse proxy recommendation
Use **Caddy** as the reverse proxy because it keeps HTTPS and routing simple.

### Persistent storage
Use named Docker volumes for:
- Postgres data
- Caddy data
- Caddy config

### Important operational warning
Running Postgres on the same Ubuntu server is acceptable for V1 and early production, but it creates a **single-host failure domain**.

This is fine to start, but add:
- daily backups
- restore testing
- a future plan to externalize the database if the project grows

---

## 9. Docker strategy

### Development Compose
Use `docker-compose.dev.yml` to:
- build local images from source
- mount source code when convenient
- expose app ports directly
- use the root `.env`

### Production Compose
Use `docker-compose.prod.yml` to:
- pull immutable images from a registry
- avoid bind mounts for application code
- use a server-only env file
- attach to persistent volumes
- run behind Caddy

### Mobile app
Do **not** include the mobile app as a normal production service in Docker Compose.

---

## 10. Recommended containerization approach

### API image
Use a multi-stage Docker build for NestJS.

Goals:
- install dependencies with pnpm
- build once
- keep runtime image small
- copy only the files needed to run production

### Landing image
Use a multi-stage Docker build for Next.js.

Recommended mode:
- `output: 'standalone'`
- run the standalone server in production

### Postgres image
Use the official Postgres image.

### Reverse proxy image
Use the official Caddy image.

---

## 11. Recommended Compose service layout

### `docker-compose.dev.yml`
Recommended services:
- `postgres`
- `api`
- `landing`
- optional `caddy`

### `docker-compose.prod.yml`
Recommended services:
- `postgres`
- `migrate`
- `api`
- `landing`
- `caddy`

### Notes
- `migrate` should be a **one-off job**, not a long-running service
- `api` should wait for Postgres health
- `landing` and `api` should be reachable only through Caddy in production

---

## 12. Environment variable strategy

### Local development
Use a single root `.env` for local development.

This file can drive:
- Docker Compose
- API config
- landing config
- mobile app public config

### Production
Do **not** rely on the repo `.env` file in production.

Use a server-side env file such as:
- `/opt/ai-tourist-guide/.env.production`

This file should be created either:
- manually on the server, or
- automatically from GitHub Actions using secrets

### Recommended rule
- local: simple `.env`
- production: `.env.production` stored on the server, never committed

### Public vs secret variables
Only expose public variables to client code.

Examples:
- `EXPO_PUBLIC_API_URL` → public
- `NEXT_PUBLIC_API_URL` → public
- `ELEVENLABS_API_KEY` → secret, never exposed to the mobile app unless the specific integration explicitly requires a safe client flow
- `JWT_SECRET` → secret
- `DATABASE_URL` → secret

### Recommended root `.env.example`
```env
# Shared
NODE_ENV=development

# Database
POSTGRES_DB=aitourguide
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/aitourguide?schema=public

# API
API_PORT=3001
JWT_SECRET=change-me
ELEVENLABS_API_KEY=change-me

# Landing
LANDING_PORT=3000
NEXT_PUBLIC_API_URL=http://localhost:3001

# Mobile
EXPO_PUBLIC_API_URL=http://localhost:3001

# Proxy
CADDY_EMAIL=you@example.com
```

---

## 13. Deployment strategy by surface

### Mobile app
Use **Expo / EAS** for:
- development builds
- preview builds
- production builds
- store submission
- OTA updates where appropriate

The mobile app is **not** deployed from the Ubuntu server.

### Landing
Deploy to the Ubuntu server as a Dockerized web app behind Caddy.

### API
Deploy to the Ubuntu server as a Dockerized NestJS app behind Caddy.

### Database
Deploy to the Ubuntu server as a Dockerized Postgres instance with persistent volumes.

---

## 14. GitHub Actions strategy

### Overview
Use two workflows:
- `ci.yml`
- `deploy-production.yml`

### `ci.yml`
Trigger on:
- pull requests
- pushes to main and develop

Responsibilities:
- install dependencies
- lint
- typecheck
- run tests
- optionally validate Docker builds

### `deploy-production.yml`
Trigger on:
- push to `main`
- manual dispatch

Responsibilities:
1. build Docker images for `api` and `landing`
2. tag images with commit SHA and optionally `latest`
3. push images to GHCR
4. connect to Ubuntu over SSH
5. write or refresh the production env file on the server
6. pull fresh images
7. run Prisma migrations
8. restart services with Docker Compose
9. optionally prune unused images

---

## 15. Recommended image registry

Use **GitHub Container Registry (GHCR)**.

### Why
- it fits naturally with GitHub Actions
- easy tagging by commit SHA
- good for a monorepo with multiple deployable services

### Recommended image names
```text
ghcr.io/<owner>/<repo>/api
ghcr.io/<owner>/<repo>/landing
```

### Tag strategy
Use at least:
- commit SHA tag
- `latest` tag for the active environment only if the team wants operational simplicity

Recommended practical policy:
- deploy by SHA
- keep `latest` only as a convenience tag

---

## 16. Recommended GitHub Actions secrets

Use **GitHub environment secrets** for production.

### SSH / server access secrets
- `PROD_SSH_HOST`
- `PROD_SSH_PORT`
- `PROD_SSH_USER`
- `PROD_SSH_PRIVATE_KEY`
- `PROD_SSH_KNOWN_HOSTS`
- `PROD_SERVER_PATH`

### Registry pull secrets for the server
- `GHCR_USERNAME`
- `GHCR_READ_TOKEN`

### App config secrets
You have two good options.

#### Option A — one multiline env secret
Store the full production env file as a single secret:
- `PROD_ENV_FILE`

This is the easiest operationally.

#### Option B — granular secrets
Store each value independently:
- `DATABASE_URL`
- `POSTGRES_PASSWORD`
- `JWT_SECRET`
- `ELEVENLABS_API_KEY`
- etc.

This is cleaner long term, but more verbose in workflows.

### Mobile build secrets
For the Expo pipeline later:
- `EXPO_TOKEN`

---

## 17. Recommended production deployment flow

### Build phase in GitHub Actions
- build API image
- build Landing image
- push both images to GHCR

### Remote deploy phase over SSH
On the server:
1. ensure target directory exists
2. write `.env.production`
3. update `docker-compose.prod.yml` if needed
4. login to GHCR
5. pull new images
6. run migration job
7. run `docker compose up -d`
8. prune stale images

### Recommended server path
```text
/opt/ai-tourist-guide
```

### Files that should live on the server
```text
/opt/ai-tourist-guide/
  docker-compose.prod.yml
  .env.production
  infra/caddy/Caddyfile
```

---

## 18. Recommended migration strategy with Prisma

Do **not** rely on ad hoc manual migrations during deploy.

### Recommended approach
Create a dedicated `migrate` service or one-off command that runs:

```bash
pnpm prisma migrate deploy
```

### Deployment order
1. Postgres available
2. `migrate` runs
3. API starts
4. Landing starts
5. Caddy routes traffic

This avoids starting the app against an outdated schema.

---

## 19. Example production Compose flow

This is the logical order, not the final code:

```bash
docker compose -f docker-compose.prod.yml pull

docker compose -f docker-compose.prod.yml up -d postgres

docker compose -f docker-compose.prod.yml run --rm migrate

docker compose -f docker-compose.prod.yml up -d api landing caddy
```

---

## 20. Example GitHub Actions workflow shape

### `ci.yml`
```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck
      - run: pnpm test
```

### `deploy-production.yml`
```yaml
name: Deploy Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: production
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          file: infra/docker/api.Dockerfile
          push: true
          tags: ghcr.io/<owner>/<repo>/api:${{ github.sha }}

      - uses: docker/build-push-action@v6
        with:
          context: .
          file: infra/docker/landing.Dockerfile
          push: true
          tags: ghcr.io/<owner>/<repo>/landing:${{ github.sha }}

      - name: Configure SSH
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.PROD_SSH_PRIVATE_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          echo "${{ secrets.PROD_SSH_KNOWN_HOSTS }}" > ~/.ssh/known_hosts

      - name: Deploy remotely
        run: |
          ssh -p "${{ secrets.PROD_SSH_PORT }}" "${{ secrets.PROD_SSH_USER }}@${{ secrets.PROD_SSH_HOST }}" '
            mkdir -p "${{ secrets.PROD_SERVER_PATH }}"
          '

          ssh -p "${{ secrets.PROD_SSH_PORT }}" "${{ secrets.PROD_SSH_USER }}@${{ secrets.PROD_SSH_HOST }}" "cat > ${{ secrets.PROD_SERVER_PATH }}/.env.production <<'EOF'
          ${{ secrets.PROD_ENV_FILE }}
          EOF"

          ssh -p "${{ secrets.PROD_SSH_PORT }}" "${{ secrets.PROD_SSH_USER }}@${{ secrets.PROD_SSH_HOST }}" '
            cd "${{ secrets.PROD_SERVER_PATH }}" && \
            echo "${{ secrets.GHCR_READ_TOKEN }}" | docker login ghcr.io -u "${{ secrets.GHCR_USERNAME }}" --password-stdin && \
            docker compose -f docker-compose.prod.yml pull && \
            docker compose -f docker-compose.prod.yml up -d postgres && \
            docker compose -f docker-compose.prod.yml run --rm migrate && \
            docker compose -f docker-compose.prod.yml up -d api landing caddy && \
            docker image prune -f
          '
```

This workflow is intentionally illustrative. Claude Code should adapt it to the final repo structure and exact image names.

---

## 21. Recommended server bootstrapping checklist

Before the first deploy, prepare the Ubuntu server with:
- Docker Engine
- Docker Compose plugin
- a non-root deploy user
- SSH key-based login only
- firewall rules
- domains pointing to the server
- target deployment directory

Optional but recommended:
- unattended security updates
- fail2ban
- backup cron for Postgres
- log rotation and monitoring

---

## 22. Agentic development strategy with Claude Code

Claude Code should be treated as the main coding agent environment for this repo.

The best setup here is:
- **official MCPs where they exist**
- **official Skills where they exist**
- **CLAUDE.md instructions in the repo**
- **subagents for specialization**
- **hooks for deterministic enforcement**

---

## 23. Official MCP / Skills / LLM-doc support matrix

| Tool | Official MCP for Claude Code? | Official Skills? | LLM-optimized docs? | Recommendation |
|---|---|---|---|---|
| Claude Code | Yes | Yes | Yes | Core dev agent environment |
| Expo | Yes | Yes | Yes | Must install |
| Prisma | Yes | Yes | Yes | Must install |
| ElevenLabs | Yes (for dev tooling) + MCP support inside ElevenAgents | Yes | Partial / mixed | Install if voice workflows will be built from Claude Code |
| NativeWind | I did not find an official MCP | I did not find an official skills package | Yes | Use docs + Expo skill that sets up NativeWind |
| NestJS | I did not find an official MCP in Nest docs | No official skills package found in the sources checked | I did not find an official llms.txt bundle | Rely on official docs + optional community skills |
| Next.js | I did not check for an official MCP here as a required dependency | Community ecosystem is broader than the official source | Yes | Treat official Next docs as source of truth |

---

## 24. Recommended MCPs to install in Claude Code

### 24.1 Expo MCP — required
This is the most important MCP for the mobile app.

Why install it:
- lets Claude fetch latest Expo docs on demand
- can install compatible Expo packages with `npx expo install`
- can open DevTools
- can take screenshots in simulator
- can tap UI elements / test flows
- can generate `CLAUDE.md`

Recommended command:

```bash
claude mcp add --transport http expo-mcp https://mcp.expo.dev/mcp
```

Then authenticate inside Claude Code:

```text
/mcp
```

And inside the project install local Expo MCP capabilities:

```bash
npx expo install expo-mcp --dev
```

### 24.2 Prisma MCP — required
This is the most important MCP for the database layer.

#### Local Prisma MCP
Use this during normal repository development.

```bash
claude mcp add prisma-local -- npx -y prisma mcp
```

Use it for:
- schema work
- migration status
- migrate dev
- migrate reset
- Prisma console workflows

#### Optional remote Prisma MCP
Useful if you later adopt Prisma Postgres or remote database operations.

```bash
claude mcp add --transport http prisma-remote https://mcp.prisma.io/mcp
```

### 24.3 ElevenLabs MCP — optional but valuable
Install this if you want Claude Code to help directly with:
- TTS workflows
- transcription flows
- voice generation
- agent creation / testing
- audio experimentation

Recommendation:
- **optional for day 1**
- **high value once voice flows become central in development**

---

## 25. Recommended Skills

### 25.1 Expo Skills — required
Expo publishes official Skills for AI agents.

Key Expo skills relevant to this repo:
- `building-native-ui`
- `expo-tailwind-setup`
- `expo-dev-client`
- `expo-deployment`
- `upgrading-expo`

Most relevant right now:
- `building-native-ui`
- `expo-tailwind-setup`
- `expo-dev-client`

### 25.2 Prisma Skills — required
Prisma has official installable agent skills.

Install:

```bash
npx skills add prisma/skills
```

Most relevant Prisma skills:
- `prisma-cli`
- `prisma-client-api`
- `prisma-database-setup`
- `prisma-postgres`
- `prisma-upgrade-v7` if needed later

### 25.3 ElevenLabs Skills — recommended
Install:

```bash
npx skills add elevenlabs/skills
```

Use these when Claude Code is helping with:
- creating voice agents
- speech-to-text
- text-to-speech
- sound effects
- audio-related prototyping

### 25.4 NestJS skills — optional community only
I did not find an official NestJS skills package from the official NestJS docs checked.

Recommendation:
- optional
- only add one if the team sees recurring value
- prefer official Nest docs as source of truth

### 25.5 NativeWind skills — not required
I did not find an official NativeWind skills package in the sources checked.

Recommendation:
- use NativeWind docs directly
- rely on Expo's official Tailwind-related skill for setup flows

---

## 26. What the docs say about LLM-friendly development

### Claude Code
Claude Code officially supports:
- MCP servers
- Skills
- Hooks
- Subagents
- an Agent SDK

### Expo
Expo is one of the strongest toolchains for agent-assisted development:
- official MCP server
- official Skills
- official `llms.txt` and `llms-full.txt`
- simulator automation
- docs search
- package installation guidance
- `CLAUDE.md` generation

### Prisma
Prisma is also unusually strong for agentic development:
- official MCP server
- official Agent Skills
- official AI docs section
- official `llms.txt`
- official guides for Claude / Cursor / ChatGPT / others

### ElevenLabs
ElevenLabs supports an agent-centric architecture directly in the product:
- choose native models or a custom LLM
- configure client tools, server tools, MCP tools, and system tools
- use reasoning controls like thinking budget and reasoning effort

Important note for this app:
- because this is a live conversational voice experience,
- keep **reasoning effort = None** unless a specific workflow step truly benefits from deeper deliberation,
- otherwise latency can hurt the conversational feel.

### NativeWind
NativeWind exposes LLM-oriented docs bundles, which is useful for coding agents, even though I did not find an official MCP or official skills package.

### NestJS
NestJS remains a strong technical choice, but compared with Expo and Prisma it is less agent-opinionated in the official material checked.

---

## 27. Suggested Claude Code subagents for this repo

Create specialized subagents instead of doing everything in one context.

### `expo-mobile-engineer`
Scope:
- `apps/mobile`
- Expo navigation
- React Native screens
- NativeWind styling
- simulator verification

Allowed tools:
- Read / Edit / Bash
- Expo MCP tools

### `prisma-db-engineer`
Scope:
- `packages/db`
- schema design
- migrations
- seed data
- query shape reviews

Allowed tools:
- Read / Edit / Bash
- Prisma MCP

### `nest-api-engineer`
Scope:
- `apps/api`
- controllers
- modules
- providers
- DTOs
- auth
- service boundaries

Allowed tools:
- Read / Edit / Bash

### `landing-web-engineer`
Scope:
- `apps/landing`
- Next.js routes
- shadcn/ui
- SEO metadata
- content sections

Allowed tools:
- Read / Edit / Bash

### `elevenlabs-voice-engineer`
Scope:
- conversation bootstrap
- agent configuration
- voice session handling
- tool registration strategy
- latency / interruption concerns

Allowed tools:
- Read / Edit / Bash
- ElevenLabs-related tooling if installed

### `devops-release-engineer`
Scope:
- Dockerfiles
- Compose files
- GitHub Actions
- server env strategy
- release rollouts

Allowed tools:
- Read / Edit / Bash

---

## 28. Suggested hooks for deterministic behavior

### After edits in `apps/mobile/**`
Run:
```bash
pnpm --filter mobile lint && pnpm --filter mobile typecheck
```

### After edits in `apps/api/**`
Run:
```bash
pnpm --filter api lint && pnpm --filter api test
```

### After edits in `apps/landing/**`
Run:
```bash
pnpm --filter landing lint && pnpm --filter landing typecheck
```

### After edits to `packages/db/prisma/schema.prisma`
Run:
```bash
pnpm prisma format && pnpm prisma generate
```

### On task completion
Run:
```bash
pnpm lint && pnpm typecheck
```

---

## 29. Suggested CLAUDE.md structure

Use a root `CLAUDE.md` plus local ones.

### Root `CLAUDE.md`
Include:
- repo layout
- package manager (`pnpm`)
- monorepo commands
- testing policy
- Docker strategy
- how to treat migrations
- how to treat Expo builds
- how to treat ElevenLabs agent config
- security rules around secrets and API keys

### `apps/mobile/CLAUDE.md`
Include:
- Expo dev-build requirement
- never assume Expo Go is enough for this project
- use NativeWind conventions
- prefer reusable primitives
- add `testID` to important views for automation

### `apps/api/CLAUDE.md`
Include:
- Nest module boundaries
- DTO validation rules
- auth patterns
- service / repository separation
- controller thinness rules
- never embed secrets in code

### `apps/landing/CLAUDE.md`
Include:
- Next.js routing conventions
- shadcn/ui usage patterns
- metadata / SEO requirements
- performance budgets for images and fonts

### `packages/db/CLAUDE.md`
Include:
- migration naming conventions
- never create destructive migrations casually
- run Prisma format / generate after schema changes
- prefer additive schema changes first

---

## 30. Recommended initial build order

1. Initialize monorepo
2. Create Expo app in `apps/mobile`
3. Create Nest app in `apps/api`
4. Create Next app in `apps/landing`
5. Set up Prisma in `packages/db`
6. Install Expo MCP in Claude Code
7. Install Prisma MCP in Claude Code
8. Install Expo Skills and Prisma Skills
9. Add ElevenLabs SDK to mobile app
10. Create first ElevenLabs agent
11. Connect app to the agent and verify mic / playback
12. Add first backend endpoints for profile + places
13. Add Dockerfiles and Compose files
14. Add GitHub Actions CI/CD
15. Prepare Ubuntu server and first production deploy

---

## 31. Specific caution points

### Secrets
- never expose backend secrets in the mobile app
- never expose server env files in the repo
- review what is public vs secret before prefixing variables for client-side use

### Expo
- optimize around development builds, not Expo Go
- do not try to make Docker the center of the mobile workflow

### Database
- local Docker Postgres is good
- single-server production Postgres is acceptable for V1
- back it up from day one

### Deployment
- deploy immutable images when possible
- avoid editing containers manually on the server
- treat the server as a host for Compose, not as a place to hack live code

### Future growth
If traffic, availability, or team size increases, the first things to reconsider are:
- managed Postgres
- object storage for assets
- background workers / queues
- separate staging server

---

## 32. Final recommendation summary

### Keep
- Expo + React Native for mobile
- NativeWind for mobile styling
- NestJS + Prisma for backend
- Monorepo with pnpm + Turbo
- ElevenLabs as the V1 agent platform

### Add
- Next.js + shadcn/ui landing app
- Dockerized API / landing / Postgres / Caddy
- GitHub Actions CI + production autodeploy over SSH
- server-side `.env.production`
- backup discipline for Postgres

### Avoid
- Dockerizing the mobile app as the normal workflow
- mixing too many agent platforms in V1
- coupling the landing too tightly to the native app
