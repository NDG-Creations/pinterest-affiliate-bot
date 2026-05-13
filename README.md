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

## Project Structure

```text
prisma/
  schema.prisma
src/
  app/
  lib/
    prisma.ts
```
