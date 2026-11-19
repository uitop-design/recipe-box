# Recipe Box

A small recipe catalog built with Next.js. Recipes have ingredients, steps and tags,
can be searched by title, filtered by tag and scaled to any number of servings.
Redis is used to cache search results and to keep view counters for the "popular" block.

## Stack

- Next.js 15 (App Router, React 19, TypeScript)
- PostgreSQL + Prisma
- Redis (ioredis)
- Zod for request validation
- Vitest for tests

## Getting started

```bash
cp .env.example .env
docker compose up -d          # Postgres on 5432, Redis on 6379
npm install
npm run db:migrate            # creates tables
npm run db:seed               # adds sample recipes
npm run dev                   # http://localhost:3000
```

## Environment

| Variable           | Description                              | Default                  |
| ------------------ | ---------------------------------------- | ------------------------ |
| `DATABASE_URL`     | Postgres connection string               | -                        |
| `REDIS_URL`        | Redis connection string                  | `redis://localhost:6379` |
| `SEARCH_CACHE_TTL` | Seconds to keep a cached search result   | `120`                    |

## Project layout

```
prisma/              schema and seed script
src/app/             pages and API route handlers
src/components/      UI components
src/lib/recipes.ts   recipe service: queries, writes, cache invalidation
src/lib/cache.ts     read-through Redis cache with versioned search keys
src/lib/views.ts     view counters in a Redis sorted set
src/lib/scale.ts     servings scaling and quantity formatting
src/lib/validation.ts zod schemas
tests/               unit and route tests
```

## API

| Method | Path                     | Description                                  |
| ------ | ------------------------ | -------------------------------------------- |
| GET    | `/api/recipes?q=&tag=`   | List recipes, optional title search and tag  |
| POST   | `/api/recipes`           | Create a recipe                              |
| GET    | `/api/recipes/:id`       | Recipe with ingredients and tags             |
| PUT    | `/api/recipes/:id`       | Replace a recipe                             |
| DELETE | `/api/recipes/:id`       | Delete a recipe                              |
| GET    | `/api/recipes/popular`   | Top 5 recipes by views                       |
| GET    | `/api/tags`              | Tags with recipe counts                      |

Example body for `POST /api/recipes`:

```json
{
  "title": "Tomato pasta",
  "servings": 2,
  "cookMinutes": 15,
  "steps": ["Boil pasta", "Warm the sauce", "Mix and serve"],
  "ingredients": [
    { "name": "spaghetti", "quantity": 200, "unit": "g" },
    { "name": "tomato sauce", "quantity": 250, "unit": "ml" }
  ],
  "tags": ["pasta", "quick"]
}
```

## Caching

- Search results are stored under `recipes:search:v{version}:{q}:{tag}` with a TTL.
  Any write bumps `recipes:search:version`, so stale entries are never read again
  and simply expire.
- Views are counted in the `recipes:views` sorted set when a recipe page is opened.
- If Redis is down the app still works: reads go straight to Postgres.

## Tests

```bash
npm test
```
