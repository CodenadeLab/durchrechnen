# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Durchrechnen is a Turborepo monorepo containing a price calculator application with API-first architecture:
- **API App**: Hono.js + tRPC backend with PostgreSQL/Drizzle ORM
- **Web App**: Next.js 15 web application with modern UI

**Note**: This project was originally designed with Tauri native apps but has been refactored to focus on web-only deployment for faster time-to-market.

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

### Web App Development (`apps/web/`)
```bash
bun run dev           # Start Next.js development server on port 3000
bun run build         # Build for production
bun run start         # Start production server
bun run lint          # Run ESLint
bun run typecheck     # TypeScript type checking
```

## Architecture

### API App (`apps/api/`)
- **Framework**: Hono.js with dual API approach (OpenAPI REST + tRPC)
- **Database**: Neon DB (Serverless PostgreSQL) with Drizzle ORM, multi-region support
- **Authentication**: Better-Auth with Google OAuth, JWT sessions, role-based access
- **Documentation**: Auto-generated OpenAPI docs via Scalar UI
- **Features**: Health checks, audit logging, CORS, multi-region deployment
- **Entry Point**: `src/index.ts` - Hono server setup
- **Database Config**: `drizzle.config.ts` - Multi-region database configuration
- **Structure**:
  - `src/rest/routers/` - OpenAPI REST endpoints (minimal implementation)
  - `src/trpc/routers/` - tRPC procedures (health check only)
  - `src/db/schema/` - Drizzle database schemas (auth + audit implemented)
  - `src/lib/` - Shared utilities and middleware
  - `src/auth.ts` - Better-Auth configuration

### Web App (`apps/web/`)
- **Framework**: Next.js 15 with App Router
- **UI**: Radix UI components, TailwindCSS v4, Motion animations, Three.js
- **Authentication**: Better-Auth React integration with Google OAuth
- **State Management**: React Server Components + Client Components
- **Styling**: TailwindCSS with custom 3D animations and glassmorphism
- **Entry Points**:
  - `app/page.tsx` - Beautiful sign-in page with canvas animations
  - `app/dashboard/page.tsx` - Dashboard (minimal implementation)
- **Components**: 
  - `components/page-clients/` - Client-side page components
  - `components/ui/` - Shared UI components

### Shared Packages (`packages/`)
- **UI Package** (`ui/`): Radix UI components with Tailwind styling
- **Utils Package** (`utils/`): Logger utility, URL helpers, shared functions
- **TypeScript Config** (`tsconfig/`): Shared TypeScript configurations
  - `base.json` - Core config with modern ES features
  - `nextjs.json` - Next.js specific config  
  - `react-library.json` - React library config

### Business Data (`data/`)
- **Service Categories**: Detailed markdown files with comprehensive pricing strategies
- **Pricing Strategy**: Competitive pricing model with market advantage approach
- **Domain Knowledge**: Complete service definitions and calculation formulas

## Key Configuration Files

- `turbo.json` - Turborepo task orchestration and caching
- `drizzle.config.ts` - Database configuration with region-specific connection strings
- `apps/api/Dockerfile` - API deployment configuration for Fly.io
- `apps/api/fly.toml` - Fly.io deployment settings

## Database Management

The API uses Drizzle ORM with Neon DB (Serverless PostgreSQL). Database operations:
- Schema: Define in `apps/api/src/db/schema/` directory (modular approach)
- Migrations: Auto-generated by Drizzle
- Multi-region setup configured for Germany, Europe, and Global deployments
- Use `bun run db:pull` to introspect existing database schema

**Schema Implementation Approach:**
- ✅ Authentication and user management
- ✅ Audit logging and system tracking
- ⏳ Business domain entities (check Linear issues for current status)

## Development Workflow & Linear Integration

### Task Management with Linear MCP

This project uses Linear for issue tracking and task management. Claude should:

1. **Check Linear Issues**: Use `mcp__linear__list_issues` to see current tasks
2. **Create TodoWrite entries**: Based on Linear issues that need completion
3. **Update Linear Issues**: Provide progress updates and mark as complete
4. **Follow Issue Dependencies**: Respect issue priorities and dependencies

### Development Process

1. **Start with Linear**: Check assigned issues or pick from backlog
2. **Create Todos**: Use TodoWrite to break down Linear issues into development tasks
3. **Implement Features**: Follow the issue requirements and acceptance criteria
4. **Update Progress**: Update Linear issue status and provide progress notes
5. **Complete & Close**: Mark Linear issues as completed when done

### Development Priority Framework

Focus on issues by priority and logical implementation order:
1. **Foundation First**: Database schema and core infrastructure
2. **API Layer**: Business logic and data access layers
3. **Core Features**: Essential business functionality
4. **User Interface**: Frontend implementation
5. **Advanced Features**: Enhancement and optimization

## Implementation Status

### ✅ **Foundation Complete**
- Authentication and user management
- Database infrastructure and auditing
- Web application foundation
- Development tooling and architecture

### 🚧 **Active Development**
- Check Linear issues for current work in progress

### ⏳ **Roadmap**
- Refer to Linear issues for upcoming features and priorities

## Business Domain

**Durchrechnen** is a price calculator tool for sales teams:
- **Target Users**: Sales employees, managers, administrators
- **Core Function**: Generate competitive quotes with strategic pricing
- **Service Areas**: Multiple service categories across technology consulting
- **Use Cases**: Customer conversations, mobile usage, rapid quote generation

## Linear MCP Integration Guidelines

When working on this project, ALWAYS:

1. **Check Linear first**: Use `mcp__linear__list_issues` to see current work
2. **Use TodoWrite for Linear issues**: Break down Linear issues into actionable todos
3. **Follow issue priorities**: Focus on Urgent > High > Medium > Low priority issues
4. **Update issue progress**: Provide meaningful updates to Linear issues as work progresses
5. **Respect dependencies**: Check issue dependencies before starting work
6. **Mark issues complete**: Update Linear issue status when work is finished

### Linear Issue Structure

Linear issues represent the complete development roadmap organized in phases:
- **Phase 1 (Foundation)**: Database schema, authentication, core APIs
- **Phase 2 (Frontend)**: Web application and user interfaces
- **Phase 3 (Advanced)**: Admin tools, analytics, compliance, optimization

### TodoWrite Strategy

For each Linear issue:
1. Create specific, actionable todos that map to the issue's acceptance criteria
2. Mark todos as in_progress when actively working
3. Complete todos as soon as work is finished
4. Update the Linear issue with progress notes

## Git Workflow & Feature Branching

### Feature Branch Strategy

This project follows a **feature branch workflow** with GitHub pull requests:

1. **Analyze Related Issues**: Group logically connected Linear issues into features
2. **Create Feature Branch**: Use semantic naming with scope and description
3. **Implement Complete Feature**: Work through all related issues together
4. **Create Pull Request**: Use GitHub MCP when feature is fully complete

### Feature Branch Naming Convention

```
feature/<scope>-<description>
```

**Scope Examples:** `database`, `api`, `frontend`, `admin`, `security`, `integration`
**Description:** Brief, kebab-case description of the feature

### Feature Grouping Logic

**AI should intelligently determine feature boundaries by:**
- **Functional Cohesion**: Issues that implement related business functionality
- **Technical Dependencies**: Issues that depend on each other's implementation
- **Logical Scope**: Features that make sense to test and review together
- **Size Management**: Keep features manageable (2-5 related issues typically)

### GitHub Integration Workflow

1. **Start Feature**: Create branch for grouped issues using `mcp__github__create_branch`
2. **Implement**: Work through todos, commit regularly, update Linear issues
3. **Complete Feature**: Ensure all related Linear issues are closed
4. **Create PR**: Use `mcp__github__create_pull_request` with comprehensive summary

### Pull Request Standards

- **Title**: Clear feature description
- **Body**: List completed Linear issues with links
- **Summary**: What was implemented and why
- **Testing**: Confirmation that acceptance criteria are met
- **Base Branch**: Always `main`

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.
