# delaykit.dev

Marketing site for [DelayKit](https://www.npmjs.com/package/delaykit) — a library for durable scheduled actions in Next.js.

## Local development

```bash
cp .env.example .env.local   # fill in POSTHOOK_API_KEY + POSTHOOK_SIGNING_KEY
docker compose up -d         # Postgres for the live poller widget
npm install
npm run db:push
npm run dev
```

The dev server picks the next free port (usually `http://localhost:3000`).

## Stack

- Next.js 16 (App Router)
- Tailwind CSS v4
- Drizzle ORM + Postgres — backs the live "fire" poller widget in the header
- `delaykit` and `@posthook/node` — running in the site itself as a working demo
