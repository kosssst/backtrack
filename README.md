# Backtrack

<p align="center">
  <strong>Secure, private activity logging for people who want to remember what they did and when they did it.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black" alt="Next.js 16">
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6" alt="TypeScript 5">
  <img src="https://img.shields.io/badge/MongoDB-Database-47A248" alt="MongoDB">
  <img src="https://img.shields.io/badge/Auth-Better%20Auth-7C3AED" alt="Better Auth">
  <img src="https://img.shields.io/badge/Status-Active%20Development-blue" alt="Status">
</p>

---

- [Overview](#overview)
- [Security notes](#security-notes)
- [Getting started](#getting-started)
  - [Environment variables](#environment-variables)
  - [Option 1: Run with Docker](#option-1-run-with-docker)
  - [Option 2: Run locally](#option-2-run-locally)
    - [Prerequisites](#prerequisites)
    - [Run](#run)
    - [Development run](#development-run)
- [Project structure](#project-structure)
- [Limitations](#limitations)
- [Roadmap ideas](#roadmap-ideas)
- [Contributing](#contributing)

---

## Overview

**Backtrack** is an open-source web application for securely storing personal history: what you worked on, what happened, and when it happened.

It is built for people who want a private, structured place to capture activity and notes now, then come back later to review them with context. The current version focuses on:

- authenticated access
- encrypted storage of post content
- timeline browsing
- date-range filtering

Backtrack is designed as a **personal memory layer** for work logs, troubleshooting notes, progress tracking, and day-to-day private records.

## Security notes

Backtrack is built to protect stored note content.

What is protected:

- Post titles and bodies are encrypted before being written to MongoDB
- AES-256-GCM is used for field-level encryption
- Posts are associated with the authenticated user who created them

Backtrack is **not currently end-to-end encrypted** or zero-knowledge.

The server holds the runtime encryption key and decrypts stored content in order to return it to the authenticated user.

## Getting started

### Environment variables

Backtrack uses the same environment variable names for Docker, Compose, and local runs.

Required server variables:

| Variable | Example | Description |
| --- | --- | --- |
| `APP_ORIGIN` | `https://backtrack.example.com` | Public URL where users open the app. Use `http://localhost:3000` for local runs. |
| `MONGODB_URL` | `mongodb://db:27017/backtrack` | MongoDB connection string. Use the Compose service host `db` inside Compose, or `127.0.0.1` for a local MongoDB process. |
| `ENCRYPTION_KEY` | `REPLACE_WITH_BASE64_32_BYTE_KEY` | Strict base64 key that decodes to exactly 32 bytes. Keep it stable; changing it prevents old posts from being decrypted. |
| `BETTER_AUTH_SECRET` | `REPLACE_WITH_LONG_RANDOM_SECRET` | Long random secret used by Better Auth for signing auth data. Changing it invalidates existing sessions. |

Optional variables:

| Variable | Default | Description |
| --- | --- | --- |
| `LOG_LEVEL` | `info` in production, `debug` otherwise | One of `debug`, `info`, `warn`, or `error`. |
| `DEBUG` | `false` | Optional boolean flag for server-side debug behavior. |
| `NEXT_PUBLIC_APP_VERSION` | `0.0.0` | Version label shown by the app. |

Generate values before deploying:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Use the first output for `ENCRYPTION_KEY` and the second output for `BETTER_AUTH_SECRET`.

### Option 1: Run with Docker

Run the container:

```bash
docker run --rm -p 3000:3000 \
  -e APP_ORIGIN=http://localhost:3000 \
  -e MONGODB_URL=mongodb://host.docker.internal:27017/backtrack \
  -e ENCRYPTION_KEY=REPLACE_WITH_BASE64_32_BYTE_KEY \
  -e BETTER_AUTH_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET \
  -e LOG_LEVEL=info \
  kosssst/backtrack:latest
```

It is recommended to use Compose:

```yaml
services:
  app:
    image: kosssst/backtrack:latest
    ports:
      - "3000:3000"
    environment:
      APP_ORIGIN: http://localhost:3000
      MONGODB_URL: mongodb://db:27017/backtrack
      ENCRYPTION_KEY: REPLACE_WITH_BASE64_32_BYTE_KEY
      BETTER_AUTH_SECRET: REPLACE_WITH_LONG_RANDOM_SECRET
      LOG_LEVEL: info
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "node -e \"fetch('http://127.0.0.1:3000/api/healthcheck').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))\"",
        ]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 20s
    networks:
      - app_net
    depends_on:
      db:
        condition: service_healthy
  db:
    image: mongo:8.2
    healthcheck:
      test:
        [
          "CMD-SHELL",
          "mongosh --quiet --eval \"db.adminCommand({ ping: 1 })\"",
        ]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
    volumes:
      - mongo_data:/data/db
    networks:
      - app_net

networks:
  app_net:

volumes:
  mongo_data:
```

To start compose:

```bash
docker compose up -d
```

### Option 2: Run locally

#### Prerequisites

 - Node.js 22
 - npm
 - MongoDB

#### Run

Clone repository:

```bash
git clone https://github.com/kosssst/backtrack.git
cd backtrack
```

Install dependencies:

```bash
npm install
```

Create `.env.local` in the project root:

```dotenv
APP_ORIGIN=http://localhost:3000
MONGODB_URL=mongodb://127.0.0.1:27017/backtrack
ENCRYPTION_KEY=REPLACE_WITH_BASE64_32_BYTE_KEY
BETTER_AUTH_SECRET=REPLACE_WITH_LONG_RANDOM_SECRET
LOG_LEVEL=debug
DEBUG=true
```

You can also start from the committed example file:

```bash
cp .env.example .env.local
```

Build and start

```bash
npm run build
npm run start
```

Then open:

```text
http://localhost:3000
```

#### Development run

If you want hot reload during development:

```bash
npm run dev
```

## Project structure

Backtrack uses a feature-based source layout:

- `src/features/auth` owns authentication UI, auth client helpers, server auth setup, and redirect/session guards.
- `src/features/posts` owns post UI, client API calls, encrypted persistence, route handlers, and post-specific utilities.
- `src/features/profile` owns profile settings UI and user display components.
- `src/shared` contains cross-feature infrastructure such as layout, environment parsing, logging, database connections, encryption primitives, styles, and generic utilities.
- `src/app` stays focused on Next.js routing and delegates feature behavior to `src/features`.

## Limitations

This project is still early-stage and there are important limitations to be aware of:

 - There is no true full-text private search yet
 - Data is decrypted on the server before being returned to the client
 - There is no export/import workflow yet
 - There are no tags, labels, or structured search dimensions yet

## Roadmap ideas

Backtrack already has a strong foundation for secure personal logging. Natural next steps could include:

 - private search improvements
 - tags or categories
 - backup/export options
 - richer timeline exploration
 - audit-friendly event history
 - stronger operational hardening for production deployments

## Contributing

Contributions are welcome.

If you want to contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run linting, tests and formating
5. Open a pull request

Mandatory before opening a PR:

```bash
npm run lint
npm test
npm run format
```

For larger changes, opening an issue first is a good idea so the direction can be discussed before implementation.
