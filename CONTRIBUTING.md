# 🚀 Durchrechnen Development Guide

Willkommen beim **Durchrechnen** Projekt! Diese Anleitung hilft neuen Entwicklern beim Einstieg in die Entwicklung eines modernen Preiskalkulator-Tools für Sales Teams.

**Was ist Durchrechnen?** Ein intelligentes Tool, das Sales-Mitarbeitern hilft, competitive Angebote für IT-Services zu erstellen - mit strategischer Preisvorteil-Strategie und modernen Technologien.

## 📋 Inhaltsverzeichnis

- [System-Voraussetzungen](#system-voraussetzungen)
- [Installation der Core-Tools](#installation-der-core-tools)
- [Projekt-Setup](#projekt-setup)
- [Entwicklungsworkflow](#entwicklungsworkflow)
- [Entwicklungsserver starten](#entwicklungsserver-starten)
- [Verfügbare Kommandos](#verfügbare-kommandos)
- [Projekt-Architektur](#projekt-architektur)
- [Code-Standards](#code-standards)
- [Troubleshooting](#troubleshooting)

## 🔧 System-Voraussetzungen

### Allgemeine Anforderungen
- **Node.js**: Version ≥22.12.0 LTS ([Download](https://nodejs.org/))
- **Bun**: Version ≥1.2.19 ([Installation](#bun-installation)) 
- **Git**: Für Versionskontrolle
- **Neon DB**: Cloud PostgreSQL mit Branching (automatisch über GitHub Actions)
- **Linear Account**: Für Issue-Tracking und Projektmanagement

### Entwicklungsumgebung einrichten

Das Projekt läuft plattformübergreifend auf Windows, macOS und Linux. Die einzigen spezifischen Anforderungen sind moderne Development Tools.

## 🛠️ Installation der Core-Tools

### Node.js v22.12.0 LTS Installation

#### Windows
1. Download: [nodejs.org/en/download](https://nodejs.org/en/download) → Windows Installer (.msi)
2. Installiere das MSI-Paket
3. Terminal neu starten

#### macOS
```bash
# Option 1: PKG Installer
# Download von nodejs.org/en/download → macOS Installer (.pkg)

# Option 2: Homebrew (empfohlen)
brew install node@22
```

#### Linux (Ubuntu/Debian)
```bash
# NodeSource Repository hinzufügen
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Andere Linux Distributionen**: [nodejs.org/en/download/package-manager](https://nodejs.org/en/download/package-manager)

**Verifizierung:**
```bash
node --version  # Sollte v22.12.0 anzeigen
npm --version
```

### Bun Installation

#### Windows
```bash
# PowerShell als Administrator:
irm bun.sh/install.ps1 | iex

# Fallback mit npm:
npm install -g bun
```

#### macOS
```bash
# Option 1: Install Script
curl -fsSL https://bun.sh/install | bash

# Option 2: Homebrew
brew install bun
```

#### Linux
```bash
curl -fsSL https://bun.sh/install | bash
```

**Detaillierte Installation**: [bun.sh/docs/installation](https://bun.sh/docs/installation)

**Verifizierung:**
```bash
bun --version  # Sollte ≥1.2.19 anzeigen
```


## 📦 Projekt-Setup

### Repository klonen
```bash
git clone https://github.com/CodenadeLab/durchrechnen.git
cd durchrechnen
```

### Dependencies installieren
```bash
# Root-Level Dependencies
bun install
```

### Umgebungsvariablen konfigurieren

#### API (.env in apps/api/)
```bash
cd apps/api
cp .env.example .env.local  # Falls vorhanden

# Editiere .env.local mit deinen Werten:
# DATABASE_URL="postgresql://..." (wird über Neon Branches automatisch gesetzt)
# BETTER_AUTH_SECRET="dein-geheimer-schlüssel"
# GOOGLE_CLIENT_ID="google-oauth-client-id"
# GOOGLE_CLIENT_SECRET="google-oauth-client-secret"
```

#### Web App (.env in apps/web/)
```bash
cd apps/web
cp .env.example .env.local  # Falls vorhanden

# Konfiguriere API-URL für Development:
# NEXT_PUBLIC_API_URL="http://localhost:3003"
```

## 🔄 Entwicklungsworkflow

### Linear Integration

Dieses Projekt nutzt **Linear** für Issue-Tracking und Projektmanagement:

#### Entwicklungsworkflow mit Linear
1. **Issues prüfen**: Schaue in Linear nach zugewiesenen oder verfügbaren Issues
2. **Issue Status**: Setze Status auf "In Progress" wenn du beginnst
3. **Branch erstellen**: Basierend auf Feature-Scope (kann mehrere Issues umfassen)
4. **Development**: Implementiere Features gemäß Issue-Beschreibungen
5. **PR erstellen**: Liste alle relevanten Linear Issues in PR-Beschreibung auf
6. **Review**: Code Review durch Team-Mitglied
7. **Merge**: Manuelle Linear Issue Updates oder automatisch via PR-Beschreibung

#### Linear Issue Lifecycle
```
Backlog → Todo → In Progress → In Review → Done
```

#### Branch Naming Strategy
```bash
# Feature-basierte Branches (können mehrere Issues abdecken)
git checkout -b feature/user-authentication
git checkout -b feature/pricing-calculator-engine
git checkout -b feature/dashboard-analytics

# Bug-Fixes (meist einzelne Issues)
git checkout -b fix/login-redirect-loop
git checkout -b fix/database-connection-timeout

# Scope-basierte Entwicklung hat Priorität über Issue-Nummern
```

#### Linear Labels & Priorität
- **Priority**: Urgent > High > Medium > Low
- **Teams**: Frontend, Backend, Database, DevOps
- **Status**: Backlog, Todo, In Progress, In Review, Done
- **Type**: Feature, Bug, Enhancement, Documentation

#### PR-Beschreibung mit Linear Issues
```markdown
## Linear Issues
Closes DUR-123, DUR-124
Addresses DUR-125

## Summary
Implementiert komplettes User Authentication System mit:
- Google OAuth Integration
- Session Management
- User Profile Dashboard
```

### Neon DB Branching Workflow

**Automatisches Database Branching:**

#### Beim Erstellen eines Pull Requests:
1. **Branch-Erstellung**: GitHub Action erstellt automatisch `preview/pr-{number}-{branch-name}`
2. **Migration-Anwendung**: Alle Pending Migrations werden auf Preview-Branch angewendet
3. **Schema-Diff**: Automatischer Vergleich mit `dev` Branch wird als PR-Kommentar gepostet
4. **Isolierte Umgebung**: Jeder PR hat eine eigene Database-Kopie für Tests

#### Während der Entwicklung:
```bash
# Lokale Development gegen Preview-Branch
export DATABASE_URL="postgresql://preview-branch-url"
bun run db:studio  # Drizzle Studio für Preview-Database
```

#### Bei PR-Merge:
1. **Production-Migration**: Automatische Anwendung auf Production-Database
2. **Preview-Cleanup**: Preview-Branch wird automatisch gelöscht
3. **Schema-Synchronisation**: Production-Database ist aktuell

#### Manueller Workflow (falls nötig):
```bash
# Neue Migration erstellen
cd apps/api
bun run db:generate

# Migration lokal testen
bun run db:migrate

# Git Commit für automatisches Deployment
git add migrations/
git commit -m "feat(db): Add user preferences table"
```

### Git Branching Strategy

```bash
# Feature Branch erstellen
git checkout -b feature/scope-description

# Beispiele:
git checkout -b feature/database-schema-services
git checkout -b feature/pricing-calculation-engine
git checkout -b feature/web-frontend-dashboard
```

## 🚀 Entwicklungsserver starten

### Alle Services gleichzeitig
```bash
# Im Root-Verzeichnis - startet API und Web App parallel
bun dev
```

### Einzelne Services

#### API-Server (Hono.js + tRPC)
```bash
cd apps/api
bun run dev          # Läuft auf http://localhost:3003
```

#### Web App (Next.js)
```bash
cd apps/web
bun run dev          # Läuft auf http://localhost:3000
```

### Entwicklungsports
- **API**: `http://localhost:3003`
- **Web App**: `http://localhost:3000`
- **Drizzle Studio**: `http://localhost:4983` (mit `bun run db:studio`)

## 📋 Verfügbare Kommandos

### Root-Level
```bash
bun dev          # API und Web App im Dev-Modus
bun build        # Alle Apps builden
bun lint         # Biome Linting across workspaces
bun format       # Code formatting mit Prettier  
bun typecheck    # TypeScript Checks across workspaces
```

### API-spezifisch (apps/api/)
```bash
bun run dev           # Hono development server mit hot reload
bun run db:pull       # Drizzle database introspection
bun run db:generate   # Migrations generieren
bun run db:migrate    # Migrations ausführen
bun run db:studio     # Drizzle Studio für DB-Management
bun test              # Tests ausführen
bun test:watch        # Tests im Watch-Modus
```

### Web App-spezifisch (apps/web/)
```bash
bun run dev           # Next.js development server
bun run build         # Production build
bun run start         # Production server starten
bun run lint          # ESLint für Web App
bun run typecheck     # TypeScript checking
```

## 🏗️ Projekt-Architektur

### Monorepo-Struktur
```
durchrechnen/
├── apps/
│   ├── api/          # Hono.js + tRPC Backend
│   └── web/          # Next.js 15 Web App
├── packages/
│   ├── tsconfig/     # Shared TypeScript Configs
│   └── utils/        # Shared Utilities
└── scripts/          # Development & Deployment Scripts
```

### Technologie-Stack

#### API (apps/api/)
- **Framework**: Hono.js v4.8.5
- **API-Layer**: Dual (OpenAPI REST + tRPC v11.4.3)
- **Database**: PostgreSQL mit Drizzle ORM v0.44.3
- **Auth**: Better Auth v1.3.3
- **Deployment**: Fly.io
- **Documentation**: Scalar API Reference

#### Web App (apps/web/)
- **Framework**: Next.js 15 mit App Router
- **UI**: TailwindCSS v4, Radix UI, Lucide Icons
- **State**: TanStack Query v5.83.0
- **Auth**: Better Auth Integration
- **Build**: Next.js Production Optimierung

#### Shared Packages
- **TypeScript**: v5.8.3
- **Linting**: Biome v2.1.2
- **Monorepo**: Turborepo v2.5.5
- **Package Manager**: Bun v1.2.19

### Deployment Targets
- **Web Application**: Modern browsers mit PWA-Support
- **API Backend**: Fly.io Container Deployment
- **Database**: Neon PostgreSQL mit automatischem Branching

## 📝 Code Standards

### Generelle Prinzipien

#### Code Qualität
- **TypeScript**: Immer strict mode aktiviert, keine `any` types
- **Linting**: Biome für einheitliche Code-Formatierung
- **Testing**: Jest/Vitest für Unit Tests, Playwright für E2E
- **Documentation**: JSDoc für komplexe Funktionen

#### Naming Conventions
```typescript
// Variablen & Funktionen: camelCase
const userName = "john_doe";
const getUserData = () => {...};

// Konstanten: SCREAMING_SNAKE_CASE  
const API_BASE_URL = "https://api.durchrechnen.com";

// Interfaces & Types: PascalCase
interface UserData {
  id: string;
  email: string;
}

// React Components: PascalCase
export function DashboardHeader() {...}
```

### API Development (apps/api/)

#### Datenbankschema
```typescript
// Drizzle Schema Definition
import { pgTable, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});
```

#### tRPC Procedures
```typescript
// Immer Input Validation mit Zod
import { z } from "zod";

export const userRouter = router({
  getUser: publicProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Database Query mit Drizzle
      return await ctx.db.query.users.findFirst({
        where: eq(users.id, input.userId)
      });
    }),
});
```

#### Error Handling
```typescript
// Structured Error Responses
import { TRPCError } from "@trpc/server";

if (!user) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "User not found",
  });
}
```

### Web App Development (apps/web/)

#### React Components
```typescript
// Functional Components mit TypeScript
interface DashboardProps {
  userId: string;
  className?: string;
}

export function Dashboard({ userId, className }: DashboardProps) {
  // TanStack Query für Server State
  const { data: user, isLoading } = trpc.user.getUser.useQuery({ userId });
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className={cn("dashboard-container", className)}>
      {/* Component Content */}
    </div>
  );
}
```

#### Styling Guidelines
```css
/* TailwindCSS Utility Classes */
.dashboard-container {
  @apply flex flex-col gap-4 p-6 bg-background;
}

/* CSS Variables für konsistente Farben */
:root {
  --color-primary: hsl(210 40% 20%);
  --color-secondary: hsl(210 40% 90%);
}
```

#### State Management
```typescript
// TanStack Query für Server State
const { data, mutate } = trpc.user.updateUser.useMutation({
  onSuccess: () => {
    // Optimistic Updates
    queryClient.invalidateQueries(["user", userId]);
  }
});

// React State für UI State
const [isModalOpen, setIsModalOpen] = useState(false);
```

### Database Migrations

#### Schema Changes
```bash
# Neue Migration erstellen
cd apps/api
bun run db:generate

# Migration Review
# Prüfe generated SQL in migrations/ folder

# Migration anwenden (automatisch über Neon Branching)
bun run db:migrate
```

#### Audit Logging
```typescript
// Jede Änderung wird automatisch geloggt
await ctx.db.insert(auditLogs).values({
  tableName: "user",
  recordId: user.id,
  action: "UPDATE",
  oldValues: previousUserData,
  newValues: updatedUserData,
  userId: ctx.user?.id,
});
```

### Git Workflow

#### Commit Messages
```bash
# Format: type(scope): description
feat(auth): Implementiere Google OAuth Login
fix(api): Behebe Datenbankverbindungsfehler  
docs(readme): Aktualisiere Setup-Anweisungen
refactor(components): Optimiere Dashboard Performance
```

#### Branch Naming
```bash
# Feature Branches
feature/auth-google-oauth
feature/pricing-calculator-engine
feature/dashboard-analytics

# Bugfix Branches  
fix/database-connection-timeout
fix/oauth-redirect-loop

# Chore Branches
chore/update-dependencies
chore/improve-error-handling
```

### Testing Standards

#### Unit Tests
```typescript
// Jest/Vitest für API Logic
describe("User Service", () => {
  it("should create user with valid data", async () => {
    const userData = { email: "test@example.com", name: "Test User" };
    const user = await createUser(userData);
    
    expect(user.id).toBeDefined();
    expect(user.email).toBe(userData.email);
  });
});
```

#### Integration Tests
```typescript
// tRPC Integration Tests
it("should return user data via tRPC", async () => {
  const caller = appRouter.createCaller({ db, user: testUser });
  const result = await caller.user.getUser({ userId: "test-id" });
  
  expect(result.email).toBe("test@example.com");
});
```

### Performance Guidelines

#### Database Optimierung
```typescript
// Verwendung von Indexes
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(), // Automatischer Index
}, (table) => ({
  emailIdx: index("email_idx").on(table.email), // Custom Index
}));

// Query Optimierung mit Select
const user = await ctx.db
  .select({ id: users.id, email: users.email }) // Nur benötigte Felder
  .from(users)
  .where(eq(users.id, userId));
```

#### Frontend Performance
```typescript
// Code Splitting mit Dynamic Imports
const DashboardChart = lazy(() => import("./DashboardChart"));

// Memoization für expensive Calculations
const expensiveCalculation = useMemo(() => {
  return calculatePricing(products, settings);
}, [products, settings]);
```

## 🔧 Troubleshooting

### Häufige Probleme

#### "bun: command not found"
```bash
# Shell-Konfiguration neu laden
source ~/.bashrc  # oder ~/.zshrc

# Oder Terminal neu starten
```

#### Next.js Build-Fehler
```bash
# Dependencies neu installieren
bun install

# TypeScript Fehler prüfen
bun run typecheck

# Linting-Probleme beheben
bun run lint --fix
```

#### API-Server startet nicht
```bash
# Port-Konflikte prüfen
lsof -i :3003

# Umgebungsvariablen überprüfen
cat apps/api/.env.local
```

#### Database Connection Fehler
```bash
# Überprüfe .env-Datei in apps/api/
# Stelle sicher, dass PostgreSQL läuft
# Verifiziere DATABASE_URL Format
```

### Logs und Debugging

#### API-Logs
```bash
cd apps/api
bun run dev  # Logs werden in der Konsole angezeigt
```

#### Web App-Logs
```bash
# Next.js Development Logs
cd apps/web
bun run dev  # Browser Console für Client-Side Logs
```

### Performance-Tipps

#### Schnellere Builds
```bash
# Turbo Cache nutzen
bun build  # Cached automatisch

# Nur veränderte Packages builden
bun run build --filter=changed
```

#### Entwicklungs-Optimierungen
```bash
# Hot Reload für API
bun run dev  # Nutzt --hot Flag

# Parallele Entwicklung
bun dev  # Startet alle Services parallel
```

## 🔗 Nützliche Links

### Dokumentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Hono.js Docs](https://hono.dev/)
- [tRPC Docs](https://trpc.io/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Better Auth Docs](https://www.better-auth.com/)
- [Bun Docs](https://bun.sh/docs)

### Service-spezifische Guides
- [Neon Database Docs](https://neon.tech/docs)
- [Fly.io Deployment](https://fly.io/docs)
- [Linear API Docs](https://developers.linear.app/)

### Community & Support
- [Next.js Discord](https://nextjs.org/discord)
- [Hono Discord](https://discord.gg/hono)
- [tRPC Discord](https://trpc.io/discord)

---

Bei Problemen oder Fragen, prüfe zuerst die [Troubleshooting-Sektion](#troubleshooting) oder erstelle ein Issue im Repository.