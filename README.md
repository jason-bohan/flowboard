# Flowboard

<!-- Added for committing phase -->

![GitHub package.json version](https://img.shields.io/github/package-json/v/jason-bohan/flowboard)

A minimal Kanban task board used to demo an AI SDLC agent framework. Agents pick up GitHub Issues, fix bugs, add features, and open PRs against this repo.

## Stack

- **API** — Node 22, TypeScript, Express, better-sqlite3 (port 3000)
- **UI** — React 18, Vite (port 5173)
- **Tests** — Vitest + supertest

## Quick start

```bash
npm install

# Run the test suite — 3 tests will fail (see Known Issues below)
npm test

# Start API + UI in watch mode
npm run dev
```

The frontend proxies `/api` requests to the Express server, so running both together is all you need.

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a task `{ title, description?, status? }` |
| PATCH | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |
| GET | `/api/tasks/stats` | Count tasks by status |

## Known Issues

The following bugs are intentionally planted so the AI agent framework can demonstrate end-to-end fix → PR workflows:

| # | Issue | Symptom | Failing test |
|---|-------|---------|--------------|
| [#1](../../issues/1) | Missing title validation | `POST /api/tasks` with empty title returns 201 instead of 400 | `rejects empty title` |
| [#2](../../issues/2) | Stale PATCH response | `PATCH /api/tasks/:id` returns the pre-update task body | `PATCH returns updated task` |
| [#3](../../issues/3) | Off-by-one in stats | `GET /api/tasks/stats` always returns `done: 0` due to trailing space in SQL | `stats endpoint counts done tasks` |

## Project structure

```
src/
├── server/
│   ├── index.ts      Express app (exported for tests)
│   ├── db.ts         SQLite schema + query helpers
│   └── tasks.ts      /api/tasks route handlers
├── client/
│   ├── main.tsx      Vite entry point
│   ├── App.tsx       Kanban board (3 columns)
│   ├── api.ts        Typed fetch helpers
│   └── types.ts      Shared Task interface
└── test/
    └── tasks.test.ts API integration tests (Vitest + supertest)
```
