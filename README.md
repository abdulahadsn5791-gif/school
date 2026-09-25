# Hono + DDD + CQRS + Hexagonal Base Scaffold

A drop-in starting point for new Bun/Hono API projects. Copy this directory into a fresh repo and rename it.

## What's inside

```
apps/
  api/                         # Hono v4 API (Bun)
    core/                      # Framework foundation
      controller/              #   BaseController (ok/created/paginated/assert/body/param/query)
      database/                #   UnitOfWork + AsyncLocalStorage transaction context
      infrastructure/buses/    #   In-memory CommandBus / QueryBus / EventBus (singletons)
      repository/              #   BaseRepository + MongoRepository (paginate, cursor, bulk, upsert)
      services/                #   BaseService (guards, validators, retry, date/object helpers)
    errors/                    # AppError hierarchy + global error handler (Zod/Mongo/Supabase safe)
    lib/                       # mongo, redis, jwt (jose), supabase, slug, sanitize, validators
    middleware/                # request guards, rate limiter, db, auth (Supabase), admin
    modules/category/          # EXAMPLE module — the 4-layer DDD reference (see AGENTS.md)
packages/
  domain/                      # Pure TS: aggregate-root, buses interfaces, ~30 VOs, example aggregate/ports/events
  frontend/                    # Headless SDK: React Query hooks, Zustand stores, HTTP client, auth/storage adapters
  shared/                      # Zod schemas (DTOs) + API envelope types
```

## Start a new project

```bash
cp -r create/ my-new-project && cd my-new-project      # copy the scaffold
git init && git add -A && git commit -m 'init'        # fresh history
bun install
cp .env.example .env                                   # set MONGO_URI, REDIS_URL, SUPABASE_*
bun run dev                                            # API on :8000 and web on :3000
bun run clean                                         # remove .next and node_modules
bun run reset                                         # clean and reinstall dependencies
```

## Build a new feature

Follow the **Adding a New Module** checklist in `AGENTS.md` in strict bottom-up order
(domain -> infrastructure -> application -> presentation -> routes). The bundled
`category` module demonstrates all four layers, the aggregate/events pattern, bus
registration, cursor pagination, optimistic-concurrency saves, and the mapper.

### Key patterns to reuse

- **Aggregate** (`packages/domain/modules/category/category.aggregate.ts`): private state,
  command methods mutate and `this.raise(event)`; the app service calls `pullEvents()` and publishes them.
- **App service** (`apps/api/modules/category/application/category.app.service.ts`):
  load -> run command -> `Save` (optimistic concurrency via `version`) -> publish events.
- **Internal service + QueryBus** (`category.internal.service.ts`): read-side logic
  reachable cross-module via `GetCategoryQuery` registered in `category.module.ts`.
- **IDs are always UUID v7** generated server-side with `Id.create()` — never from the client.
- **Transactions**: `new UnitOfWork().transaction(async () => {...})`; repositories inherit the
  mongoose session automatically via AsyncLocalStorage.