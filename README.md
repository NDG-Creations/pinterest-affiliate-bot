# Pinterest Affiliate Bot

A clean starter project for a future Pinterest affiliate automation bot.

This project currently includes only the foundation:

- Next.js App Router
- TypeScript
- Prisma
- PostgreSQL support via Prisma's PostgreSQL adapter
- Product database model for future affiliate workflows
- Environment variable example

Pinterest API integration and product scraping are intentionally not included yet.

## Requirements

- Node.js 20 or newer
- npm
- PostgreSQL database

## Getting Started

Install dependencies:

```bash
npm install
```

Create your local environment file:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` with your PostgreSQL connection string.

## Database Setup

The app uses PostgreSQL through Prisma. The main model is `Product`, with a `ProductStatus` enum for tracking whether a product is new, generated, published, or failed.

Generate the Prisma client:

```bash
npm run prisma:generate
```

Create and apply the first database migration:

```bash
npm run prisma:migrate
```

This creates the database tables from `prisma/schema.prisma`.

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Prisma

The Prisma schema lives at `prisma/schema.prisma`.

Useful commands:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
```

## External Scheduler

The app exposes a secured cron endpoint for processing products:

```text
GET /api/cron/process-products
POST /api/cron/process-products
```

Set `CRON_SECRET` in your environment to a long random value. External schedulers must send it as a bearer token:

```bash
curl -X POST https://your-domain.com/api/cron/process-products \
  -H "Authorization: Bearer $CRON_SECRET"
```

If `CRON_SECRET` is missing on the server, the endpoint returns `500`. If the bearer token is missing or incorrect, it returns `401`.

The manual `Process Next Product` button in the admin dashboard does not use this API route and continues to work from the admin page.

## Supabase Storage

Generated pin images are uploaded to Supabase Storage when these environment variables are configured:

```bash
NEXT_PUBLIC_SUPABASE_URL=""
SUPABASE_SERVICE_ROLE_KEY=""
SUPABASE_STORAGE_BUCKET="pin-images"
```

Create a Supabase Storage bucket named `pin-images`, or set `SUPABASE_STORAGE_BUCKET` to the bucket you want to use. The app uploads PNG files under `generated-pins/` and saves the public URL in `Product.pinImageUrl`.

Use a server-only Supabase service role key for `SUPABASE_SERVICE_ROLE_KEY`. Do not expose it in client-side code.

If the Supabase variables are missing, the app keeps the local development fallback and writes generated images to `public/generated-pins`.

## Project Structure

```text
prisma/
  schema.prisma
src/
  app/
  lib/
    prisma.ts
```
