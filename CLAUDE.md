# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Durchrechnen is a Turborepo monorepo containing a price calculator application with:
- **API App**: Hono.js + tRPC backend with PostgreSQL/Drizzle ORM
- **Native App**: Tauri v2 + React cross-platform application (desktop, iOS, Android)

Package manager: **Bun** (requires Node.js >=22.12.0)

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Frontend

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server:

```ts#index.ts
import index from "./index.html"

Bun.serve({
  routes: {
    "/": index,
    "/api/users/:id": {
      GET: (req) => {
        return new Response(JSON.stringify({ id: req.params.id }));
      },
    },
  },
  // optional websocket support
  websocket: {
    open: (ws) => {
      ws.send("Hello, world!");
    },
    message: (ws, message) => {
      ws.send(message);
    },
    close: (ws) => {
      // handle close
    }
  },
  development: {
    hmr: true,
    console: true,
  }
})
```

HTML files can import .tsx, .jsx or .js files directly and Bun's bundler will transpile & bundle automatically. `<link>` tags can point to stylesheets and Bun's CSS bundler will bundle.

```html#index.html
<html>
  <body>
    <h1>Hello, world!</h1>
    <script type="module" src="./frontend.tsx"></script>
  </body>
</html>
```

With the following `frontend.tsx`:

```tsx#frontend.tsx
import React from "react";

// import .css files directly and it works
import './index.css';

import { createRoot } from "react-dom/client";

const root = createRoot(document.body);

export default function Frontend() {
  return <h1>Hello, world!</h1>;
}

root.render(<Frontend />);
```

Then, run index.ts

```sh
bun --hot ./index.ts
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.

## Development Commands

### Root Level Commands
```bash
bun dev          # Start all apps in development mode
bun build        # Build all apps  
bun lint         # Run Biome linting across workspaces
bun format       # Format code with Prettier
bun typecheck    # TypeScript checking across workspaces
```

### API Development (`apps/api/`)
```bash
bun run dev           # Start Hono server with hot reload on port 3003
bun run db:pull       # Drizzle database introspection
bun test              # Run tests
bun test:watch        # Run tests in watch mode
```

### Native App Development (`apps/native/`)
```bash
bun run dev           # Vite web development server (port 1420)
bun run dev:desktop   # Tauri desktop development
bun run dev:ios       # iOS development (requires Xcode)  
bun run dev:android   # Android development (requires Android SDK)
bun run build         # Build for production
```

## Architecture

### API App (`apps/api/`)
- **Framework**: Hono.js with dual API approach (OpenAPI REST + tRPC)
- **Database**: PostgreSQL with Drizzle ORM, multi-region support (Germany/Europe/Global)
- **Documentation**: Auto-generated OpenAPI docs via Scalar UI
- **Features**: Authentication (JWT), rate limiting, CORS, API keys, email (Resend)
- **Entry Point**: `src/index.ts` - Hono server setup
- **Database Config**: `drizzle.config.ts` - Multi-region database configuration
- **Structure**:
  - `src/rest/routers/` - OpenAPI REST endpoints
  - `src/trpc/routers/` - tRPC procedures  
  - `src/db/schema.ts` - Drizzle database schema
  - `src/lib/` - Shared utilities and middleware

### Native App (`apps/native/`)
- **Framework**: Tauri v2 (Rust backend) + React 19 frontend
- **UI**: TailwindCSS v4, Radix UI components, Lucide icons
- **State Management**: TanStack Query for server state
- **Routing**: TanStack Router
- **Data Tables**: TanStack Table
- **Build Tool**: Vite with Tauri integration
- **Entry Points**:
  - `src-tauri/src/main.rs` - Tauri/Rust backend
  - `src/main.tsx` - React frontend entry
- **Config**: `src-tauri/tauri.conf.json` - Platform-specific settings

### Shared Packages (`packages/`)
- **TypeScript Config** (`tsconfig/`): Shared TypeScript configurations
  - `base.json` - Core config with modern ES features
  - `nextjs.json` - Next.js specific config  
  - `react-library.json` - React library config

## Key Configuration Files

- `turbo.json` - Turborepo task orchestration and caching
- `drizzle.config.ts` - Database configuration with region-specific connection strings
- `src-tauri/tauri.conf.json` - Cross-platform app configuration and capabilities
- `vite.config.ts` - Vite bundling with Tauri integration
- `Cargo.toml` - Rust dependencies for Tauri

## Database Management

The API uses Drizzle ORM with PostgreSQL. Database operations:
- Schema: Define in `apps/api/src/db/schema.ts`
- Migrations: Auto-generated by Drizzle
- Multi-region setup configured for Germany, Europe, and Global deployments
- Use `bun run db:pull` to introspect existing database schema

## Cross-Platform Development

The native app supports all major platforms:
- **Desktop**: Windows, macOS, Linux via Tauri
- **Mobile**: iOS and Android via Tauri mobile
- **Web**: Standard React app via Vite dev server

Each platform has specific development commands and may require platform-specific SDKs.
