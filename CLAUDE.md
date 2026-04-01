# waoowaoo -- AI Video Studio

AI-powered short drama/comic video creation tool. Converts novel text into script, storyboard, characters/scenes, and finally video through an automated pipeline.

## Critical Constraints

- Default locale: Turkish (`tr`). English (`en`) also supported.
- Fork of saturndec/waoowaoo with custom KIE.ai provider.
- `upstream` remote: github.com/saturndec/waoowaoo (original)
- `origin` remote: github.com/kernelheaders/waoowaoo (our fork)
- Feature branch: `feature/kie-provider`
- Model keys always use the format `provider::modelId` (double colon).
- Imports use `@/` alias pointing to `src/`.
- Icons only via `@/components/ui/icons` (AppIcon), never inline SVG.
- Logging: use `@/lib/logging/core`, never `console.log`.
- Guard scripts enforce architecture rules at commit time via husky.

## Tech Stack

| Layer         | Technology              | Version        |
|---------------|-------------------------|----------------|
| Framework     | Next.js (Turbopack)     | ^15.5.7        |
| React         | React                   | ^19.1.2        |
| Language      | TypeScript              | ^5             |
| Node.js       | (Dockerfile / .nvmrc)   | 20-alpine / 22.14.0 |
| CSS           | Tailwind CSS            | ^4             |
| ORM           | Prisma                  | ^6.19.2        |
| Database      | MySQL                   | 8.0            |
| Queue         | BullMQ + Redis          | ^5.67.3        |
| Object Store  | MinIO (S3-compat)       | RELEASE.2025-02-28 |
| AI SDK        | Vercel AI SDK           | ^6.0.116       |
| LLM Clients   | OpenAI ^6.8.1, @google/genai ^1.34.0, @ai-sdk/openai ^3.0.26 |
| Media Gen     | @fal-ai/client ^1.7.2   |                |
| Video Render  | Remotion                | ^4.0.405       |
| Auth          | NextAuth                | ^4.24.11       |
| i18n          | next-intl               | ^4.7.0         |
| Validation    | Zod                     | ^3.25.76       |
| Testing       | Vitest                  | ^2.1.8         |

## Quick Start

```bash
docker compose up -d --build
# App:        http://localhost:13000
# BullBoard:  http://localhost:13010/admin/queues
# MinIO:      http://localhost:19001  (minioadmin/minioadmin)
```

## Architecture

```
                          Novel Text
                              |
                        [Story Analysis]          text worker
                              |
                         [Script Gen]             text worker
                              |
                       [Storyboard Gen]           text worker
                       /       |        \
              [Characters] [Scenes]  [Voice Lines]
               image wkr   image wkr   voice wkr
                       \       |        /
                        [Panel Images]            image worker
                              |
                        [Panel Videos]            video worker
                              |
                        [Video Editor]            Remotion
                              |
                         Final Video
```

### Services (docker-compose)

| Service  | Container Port | Host Port | Notes                  |
|----------|---------------|-----------|------------------------|
| MySQL    | 3306          | 13306     | waoowaoo database      |
| Redis    | 6379          | 16379     | BullMQ + cache         |
| MinIO    | 9000 / 9001   | 19000 / 19001 | S3 storage + console |
| App      | 3000          | 13000     | Next.js + Workers      |
| BullBoard| 3010          | 13010     | Queue admin UI         |

### BullMQ Queues

| Queue            | Const                  | Processes                        |
|------------------|------------------------|----------------------------------|
| waoowaoo-text    | QUEUE_NAME.TEXT         | Story analysis, script, storyboard, clips |
| waoowaoo-image   | QUEUE_NAME.IMAGE        | Character, location, panel images |
| waoowaoo-video   | QUEUE_NAME.VIDEO        | Panel video generation, lip sync |
| waoowaoo-voice   | QUEUE_NAME.VOICE        | Voice lines, voice design        |

## Directory Structure

```
src/
  app/[locale]/          # Next.js App Router pages (tr, en)
  components/            # Shared UI components
  contexts/              # React context providers
  features/
    video-editor/        # Remotion-based video editor
  hooks/                 # Custom React hooks
  i18n/                  # Locale routing, next-intl config
  lib/
    ai-runtime/          # AI step execution
    async-poll.ts        # Unified async task polling
    billing/             # Balance, freeze, transactions
    generators/          # Media generators (fal, kie, ark, etc.)
    llm/                 # LLM chat stream, completion, providers
    logging/             # Structured logging (core)
    media/               # Media normalization, outbound image
    model-capabilities/  # Model capability lookup
    model-gateway/       # Route: official vs openai-compat
    novel-promotion/     # Core domain logic
    prompt-i18n/         # Prompt templates with i18n
    providers/           # Provider-specific adapters (bailian, fal, siliconflow)
    sse/                 # Server-Sent Events shared subscriber
    storage/             # S3/MinIO/COS storage abstraction
    task/                # Task types, queues, submission
    voice/               # TTS generation
    workers/             # BullMQ worker processes (text, image, video, voice)
    workflow-engine/     # Graph-based workflow execution
  pages/                 # Legacy pages (if any)
  styles/                # Global styles
  types/                 # Shared TypeScript types
prisma/
  schema.prisma          # 40 models
scripts/
  guards/                # Architecture guard scripts
  migrations/            # Data migration scripts
messages/                # i18n JSON translation files
standards/               # Pricing and config standards
```

## Documentation Index

| Working on...          | Read...                                           |
|------------------------|---------------------------------------------------|
| System design          | [docs/architecture.md](docs/architecture.md)      |
| Adding AI providers    | [docs/providers.md](docs/providers.md)            |
| Database changes       | [docs/database.md](docs/database.md)              |
| Adding languages       | docs/i18n.md (planned)                            |
| Background jobs        | docs/workers.md (planned)                         |
| API endpoints          | docs/api-routes.md (planned)                      |
| Deployment             | docs/deployment.md (planned)                      |
| Local development      | docs/development.md (planned)                     |
| Billing system         | docs/billing.md (planned)                         |
| Video editor           | docs/video-editor.md (planned)                    |

## Dev Commands

```bash
npm run dev              # Start all (Next.js + workers + watchdog + BullBoard)
npm run build            # Prisma generate + Next.js production build
npm run typecheck        # tsc --noEmit
npm run lint:all         # ESLint across all files
npm run test:all         # Guards + unit + integration + system + regression
npm run test:billing     # Billing-specific test suite with coverage
npm run test:guards      # Architecture guard checks only
npm run verify:commit    # lint + typecheck + test:all (pre-commit)
npm run verify:push      # lint + typecheck + test:all + build (pre-push)
```

## Code Conventions

- **Imports**: `@/` alias for `src/`
- **Icons**: Only via `@/components/ui/icons` (AppIcon), no inline SVG
- **Logging**: Use `@/lib/logging/core` (`createScopedLogger`, `logInfo`, `logError`), never `console.log`
- **Models**: Always use model key format `provider::modelId` (via `composeModelKey`)
- **Guard scripts**: Enforce rules at commit time via husky pre-commit hooks
  - `check:logs` -- no console.log
  - `check:no-api-direct-llm-call` -- LLM calls go through proper layers
  - `check:no-provider-guessing` -- use model config, not hardcoded logic
  - `check:file-line-count` -- files must stay under size limits
  - `check:api-handler` -- API route contract enforcement
  - `check:test-coverage-guards` -- test coverage requirements
- **Error handling**: Use typed error codes (e.g., `KIE_TASK_SUBMIT_FAILED`, `LLM_EMPTY_RESPONSE`)
- **Async tasks**: Return `externalId` in format `PROVIDER:TYPE:requestId` (e.g., `KIE:IMAGE:abc123`)
- **Media references**: All media URLs must go through `MediaObject` with `storageKey` and `publicId`
