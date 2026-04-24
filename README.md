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

## Overview

**Backtrack** is an open-source web application for securely storing personal history: what you worked on, what happened, and when it happened.

It is built for people who want a private, structured place to capture activity and notes now, then come back later to review them with context. The current version focuses on:

- authenticated access
- encrypted storage of post content
- timeline browsing
- date-range filtering

Backtrack is designed as a **personal memory layer** for work logs, troubleshooting notes, progress tracking, and day-to-day private records.

---

## Why Backtrack?

A lot of useful context disappears into scattered notes, chat logs, temporary files, and memory.

Backtrack gives you one place to keep a durable history of:

- what you did
- when you did it
- the details you will likely need again later

Typical use cases include:

- daily work logs
- development notes
- debugging history
- incident follow-ups
- learning journals
- private operational notes
- lightweight personal journaling

---

## Current feature set

### Authentication
- Email/password sign up
- Email/password sign in
- Session-based protected routes
- Redirects for unauthenticated users

### Posts
- Create a post with title and body
- Store title and body encrypted at rest
- Load posts in reverse chronological order
- Paginated API responses
- Infinite scrolling in the UI
- Filter posts by date range

### Profile
- View profile page
- Update display name
- Change password

### Developer experience
- TypeScript-first codebase
- App Router-based Next.js structure
- Vitest + Testing Library test setup
- Pull request test workflow
- Production Dockerfile

---

## Security notes

Backtrack is built to protect stored note content, but it is important to describe the current model accurately.

### What is protected
- Post titles and bodies are encrypted before being written to MongoDB
- AES-256-GCM is used for field-level encryption
- Each encrypted field stores its own metadata, IV, ciphertext, and authentication tag
- Posts are associated with the authenticated user who created them

### What this does **not** mean
Backtrack is **not currently end-to-end encrypted** or zero-knowledge.

The server holds the runtime encryption key and decrypts stored content in order to return it to the authenticated user. That means the project currently protects data **at rest in the database**, but does not claim that the server itself is unable to read user data.

That distinction matters, and this repository intentionally describes it honestly.

---

## Tech stack

- **Framework:** Next.js 16
- **Language:** TypeScript
- **UI:** Mantine
- **Authentication:** Better Auth
- **Database:** MongoDB
- **ODM:** Mongoose
- **Logging:** Pino
- **Testing:** Vitest
- **Containerization:** Docker

---

## Architecture at a glance

Backtrack uses a standard web application architecture:

1. The user signs in with email and password
2. Protected routes validate the session
3. New posts are encrypted on the server before storage
4. Encrypted post fields are stored in MongoDB
5. When posts are requested, the server validates the session, loads the user’s records, decrypts the fields, and returns plain text to the client

This keeps the application practical to use while still protecting note content from being stored in plaintext inside the database.

---

## Getting started

### Option 1: Run with Docker

Run the container:

```bash
docker run --rm -p 3000:3000 \
  -e APP_ORIGIN=http://localhost:3000 \
  -e MONGODB_URL=mongodb://link-to-mongodb/backtrack \
  -e ENCRYPTION_KEY=YOUR_BASE64_32_BYTE_KEY \
  -e BETTER_AUTH_SECRET=SECRET_KEY
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
      ENCRYPTION_KEY: YOUR_BASE64_32_BYTE_KEY
      BETTER_AUTH_SECRET: SECRET_KEY
    networks:
      - app_net
    depends_on:
      - db
  db:
    image: mongo:8.2
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

#### Clone the repository

```bash
git clone https://github.com/kosssst/backtrack.git
cd backtrack
```

#### Install dependencies

```bash
npm install
```

#### Create your environment file

Create .env.local in the project root:

```dotenv
APP_ORIGIN=http://localhost:3000
MONGODB_URL=mongodb://127.0.0.1:27017/backtrack
ENCRYPTION_KEY=REPLACE_WITH_A_BASE64_32_BYTE_KEY
BETTER_AUTH_SECRET=SECRET_KEY
```

#### Generate a valid encryption key

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Paste the output into `ENCRYPTION_KEY`.

#### Build and start

```bash
npm run build
npm run start
```

Then open:

```text
http://localhost:3000
```

#### Development

If you want hot reload during development:

```bash
npm run dev
```

---

## What the project does well today

 - Keeps note content encrypted in storage
 - Gives each user a private authenticated workspace
 - Supports fast iteration as a modern Next.js app
 - Includes a clean starting point for expanding into a richer secure knowledge log

---

## Limitations

This project is still early-stage and there are important limitations to be aware of:

 - There is no true full-text private search yet
 - Data is decrypted on the server before being returned to the client
 - There is no export/import workflow yet
 - There are no tags, labels, or structured search dimensions yet

---

## Roadmap ideas

Backtrack already has a strong foundation for secure personal logging. Natural next steps could include:

 - private search improvements
 - tags or categories
 - edit/delete flows
 - backup/export options
 - richer timeline exploration
 - audit-friendly event history
 - stronger operational hardening for production deployments

---

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


