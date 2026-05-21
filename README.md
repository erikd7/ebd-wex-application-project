# WEX Purchases API

This is Erik Dietrich's project submission for his May 2026 application to the WEX Corporate Payments team.

A minimal Express API for storing purchase transactions and retrieving them with optional Treasury exchange-rate currency conversion.

## Purpose

- Persist purchase transactions with `description`, `date`, and USD `amount`
- Retrieve a stored transaction by ID
- Optionally return currency conversion using the Treasury Reporting Rates of Exchange API

## Environment variables

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `NODE_ENV` — optional, standard Node environment (`dev`)

## Local setup

Docker is needed to run the database.
\*\* I know the instructions discourage external database dependencies but this was more fun :)

### Run everything together

1. Copy `example.env` to `.env` and update values as needed.
2. Run `docker compose up`

This makes the database available at your set host and port and the API available at `localhost:3000`. You can then make calls like:

```
curl -X POST http://localhost:3000/transaction \
  -H "Content-Type: application/json" \
  -d '{
    "description": "My test transaction",
    "date": "2026-05-21",
    "amount": 100.11
  }'
```

and

```
curl "http://localhost:3000/transaction/<YOUR ID FROM POST>"\?countryCurrencyDesc\=Canada-Dollar
```

### Alternatively, you can run the DB and API separately

1. Copy `example.env` to `.env` and update values as needed.
2. Start DB with `docker compose -f db.docker-compose.yml up`
3. Install API dependencies:
   ```
   cd api
   npm install
   ```
4. Start the app: `npm run dev`
5. Run tests with `npm run test`

## Key npm scripts

- `npm run dev` — run migrations and start `node --watch src/server.js`
- `npm start` — start app without watch mode
- `npm run test` — run migrations and execute Vitest
- `npm run lint` — run ESLint over source files

## High-level design

- `Express` for HTTP routing
- `Postgres` as the persistence layer
- `Drizzle ORM` for database schema and queries
- `Zod` for input validation
- `Vitest` for automated tests

## Docs and requirements

- Swagger docs are exposed from `swagger.json`
- The main project requirements are in `REQUIREMENTS.md`
