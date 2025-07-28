# IHK Abschlussprojekt: Echtzeit-Preisberechnungs-Engine

## 🎯 Projektübersicht

**Linear Issue:** DUR-8 - Echtzeit-Preisberechnungs-Engine implementieren  
**Geschätzte Projektdauer:** 70-80 Stunden (innerhalb des 80h Limits für FIAE)  
**Priorität:** Urgent - Core Business Logic für Durchrechnen

## ✅ Warum dieses Projekt perfekt für die IHK-Abschlussprüfung ist

### Erfüllt ALLE IHK-Anforderungen für Fachinformatiker Anwendungsentwicklung:

- ✅ **Kundenspezifische Anforderungen analysieren** → 4 verschiedene Preismodelle (Festpreis, Stundensatz, Monatlich, Projekt)
- ✅ **Projektplanung durchführen** → Klare Projektphasen mit Zeitschätzung
- ✅ **Wirtschaftliche Betrachtung** → Mindestmargen-Schutz und Rabattsystem
- ✅ **Softwareanwendung erstellen** → Complete TypeScript Engine mit tRPC API
- ✅ **Softwareanwendung testen** → Performance-Tests (Sub-100ms Requirement)
- ✅ **Dokumentation** → Source Code + API-Dokumentation + Benutzeranleitung

### Technische Komplexität (50% der IHK-Bewertung):

- **Algorithmus-Komplexität:** 4 verschiedene Preisberechnungsmodelle
- **Abhängigkeits-Management:** Service-Dependencies mit Validierung
- **Performance-Optimierung:** Caching-System für häufige Berechnungen
- **Business Logic:** Bundle-Erkennung und intelligente Rabatt-Anwendung
- **Type-Safety:** Vollständig typisierte API mit tRPC und Zod-Validierung

## 📋 Projektphasen (Min. 3 Phasen für IHK erforderlich)

### Phase 1: Anforderungsanalyse & Konzeptentwicklung (15 Stunden)

**Ziel:** Verstehen der Preiskalkulationslogik und Systemdesign

**Aufgaben:**
- Analyse der 7 Referenz-Dokumente in `/data/` (Kategorie 1-7)
- Extrahierung aller Preisformeln und Rabatt-Strategien
- Dokumentation der 4 Preismodelle:
  - Festpreis (Fixed)
  - Stundensatz (Hourly) 
  - Monatlich (Monthly)
  - Projektbasiert (Project)
- Abhängigkeits-Matrix zwischen Services erstellen
- API-Design für tRPC-Endpoints
- Datenbank-Schema für Pricing-Rules

**Ergebnis:** Technisches Konzept + API-Spezifikation

### Phase 2: Core Engine-Entwicklung (35 Stunden)

**Ziel:** Implementierung der Package-basierten Pricing-Engine

**Aufgaben:**
- **Package-Setup & Architektur** (5h):
  ```json
  // packages/pricing-engine/package.json
  {
    "name": "@durchrechnen/pricing-engine",
    "type": "module",
    "main": "./dist/index.js",
    "types": "./dist/index.d.ts"
  }
  ```
- **Core Models & Types** (5h):
  - Service, Customer, Pricing interfaces
  - Zod-Schemas für Validierung
  - Export-Struktur definieren
- **4 Preismodell-Calculators** (15h):
  ```typescript
  // packages/pricing-engine/src/calculators/
  export class FixedPriceCalculator implements IPricingCalculator
  export class HourlyPriceCalculator implements IPricingCalculator
  export class MonthlyPriceCalculator implements IPricingCalculator
  export class ProjectPriceCalculator implements IPricingCalculator
  ```
- **Rabattsystem** (5h):
  - Bundle-Erkennung implementieren
  - Kundenspezifische Rabatt-Regeln
  - Mindestmargen-Schutz
- **Dependencies & Caching** (5h):
  - Service-Abhängigkeits-Resolver
  - Redis-basiertes Caching
  - Performance-Optimierung

**Ergebnis:** Standalone @durchrechnen/pricing-engine Package

### Phase 3: API-Integration & Frontend-Anbindung (20 Stunden)

**Ziel:** Package-Integration in tRPC-API und Frontend

**Aufgaben:**
- **Package-Integration in API** (8h):
  ```typescript
  // apps/api/src/trpc/routers/pricing.ts
  import { PricingEngine } from '@durchrechnen/pricing-engine';
  
  export const pricingRouter = router({
    calculate: publicProcedure
      .input(calculationSchema)
      .mutation(async ({ input }) => {
        const engine = new PricingEngine();
        return await engine.calculate(input);
      }),
    
    calculateBundle: publicProcedure
      .input(bundleSchema)
      .mutation(async ({ input }) => {
        const engine = new PricingEngine();
        return await engine.calculateBundle(input);
      }),
  });
  ```
- **Monorepo-Integration** (4h):
  - Turborepo Build-Pipeline konfigurieren
  - Package-Dependencies in apps/api/package.json
  - Development-Workflow mit Live-Reload
- **Frontend-Integration** (8h):
  - React-Components für Preisberechnung
  - TanStack Query für API-Calls
  - Live-Updates und Error-Handling

**Ergebnis:** Vollständig integrierte Package-basierte Architecture

### Phase 4: Testing, Performance & Dokumentation (10 Stunden)

**Ziel:** Package-Qualitätssicherung und Dokumentation

**Aufgaben:**
- **Package Unit Tests** (4h):
  - Isolierte Tests für jede Calculator-Klasse
  - Edge-Cases (negative Preise, zirkuläre Dependencies)
  - Test Coverage >90% für @durchrechnen/pricing-engine
  ```typescript
  // packages/pricing-engine/tests/calculators/fixed.test.ts
  import { FixedPriceCalculator } from '../src/calculators/fixed';
  
  describe('FixedPriceCalculator', () => {
    it('should calculate base price correctly', () => {
      // Test implementation
    });
  });
  ```
- **Performance-Benchmarks** (3h):
  - Sub-100ms Benchmark für alle Calculator-Klassen
  - Memory-Usage-Tests
  - Load-Testing mit 1000+ parallelen Requests
- **Package-Dokumentation** (3h):
  - README.md für @durchrechnen/pricing-engine
  - API-Dokumentation mit TypeDoc
  - Usage-Examples und Integration-Guide

**Ergebnis:** Enterprise-ready Package mit kompletter Dokumentation

## 🏗️ Software-Architektur

### Package-basierte Entwicklung (Empfohlen für IHK)

**Erstelle die Engine als separates Package:**
```
packages/pricing-engine/
├── src/
│   ├── models/           # Types & Interfaces
│   │   ├── service.ts    # Service-Datenmodelle
│   │   ├── customer.ts   # Kunden-Segmentierung
│   │   └── pricing.ts    # Preiskalkulationsmodelle
│   ├── calculators/      # 4 Preismodelle
│   │   ├── fixed.ts      # Festpreis-Kalkulation
│   │   ├── hourly.ts     # Stundensatz-Berechnung
│   │   ├── monthly.ts    # Monatliche Abonnements
│   │   └── project.ts    # Projektbasierte Preise
│   ├── discounts/        # Rabattsystem
│   │   ├── bundle.ts     # Bundle-Erkennung
│   │   ├── volume.ts     # Mengenrabatte
│   │   └── customer.ts   # Kundenspezifische Rabatte
│   ├── dependencies/     # Service Dependencies
│   │   └── resolver.ts   # Abhängigkeits-Auflösung
│   ├── cache/           # Performance Layer
│   │   └── redis.ts     # Caching-Implementation
│   └── index.ts         # Main API Export
├── tests/               # Isolierte Unit Tests
├── package.json         # @durchrechnen/pricing-engine
└── README.md           # Package-spezifische Dokumentation
```

### ✅ Vorteile für IHK-Bewertung:

**Software-Architektur (Technische Tiefe 50%):**
- **Clean Code & Separation of Concerns** - Professionelle Modularisierung
- **Enterprise-Level Package-Management** - Wiederverwendbare Business Logic
- **Testability** - Isolierte Unit Tests für jede Komponente
- **Performance** - Separates Benchmarking der Engine möglich

**Integration in API:**
```typescript
// apps/api/src/trpc/routers/pricing.ts
import { PricingEngine } from '@durchrechnen/pricing-engine';

export const pricingRouter = router({
  calculate: publicProcedure
    .input(calculationSchema)
    .mutation(async ({ input }) => {
      const engine = new PricingEngine();
      return await engine.calculate(input);
    }),
});
```

## 🛠️ Technologie-Stack

### Core Package (packages/pricing-engine/)
- **Language:** TypeScript (strict mode)
- **Build:** Bun build with ES modules
- **Testing:** Bun Test (Jest-compatible)
- **Validation:** Zod für Input/Output-Validierung
- **Caching:** Redis für Performance-Optimierung

### Backend Integration (apps/api/)
- **Runtime:** Bun (Node.js Alternative)
- **Framework:** Hono.js mit tRPC
- **Database:** PostgreSQL mit Drizzle ORM
- **Package Import:** @durchrechnen/pricing-engine

### Frontend Integration (apps/web/)
- **Framework:** Next.js 15 mit App Router
- **State Management:** TanStack Query
- **UI:** TailwindCSS + shadcn/ui
- **Forms:** React Hook Form + Zod

### DevOps & Deployment
- **Monorepo:** Turborepo für Package-Building
- **Docker:** Multi-stage build mit Package-Integration
- **Performance:** Custom Benchmarks für Sub-100ms Garantie

## 📊 Bewertungskriterien-Mapping

### Formale Gestaltung (15%)
- ✅ Saubere Code-Struktur mit TypeScript
- ✅ Vollständige Quellenangaben (Referenz-Dokumente)
- ✅ Professional formatting and documentation

### Projektbeschreibung (20%)
- ✅ Klares Projektziel: Echtzeit-Preisberechnung
- ✅ Detaillierte Analyse der 4 Preismodelle
- ✅ Wirtschaftliche Begründung (Mindestmargen-Schutz)

### Technische Tiefe (50%) - HAUPTBEWERTUNG
- ✅ **Hohe Komplexität:** Algorithmus-basierte Preisberechnung
- ✅ **Innovative Lösung:** Bundle-Erkennung und Smart-Caching
- ✅ **Architektur:** Saubere Trennung von Business Logic und API
- ✅ **Performance:** Sub-100ms Berechnungen mit Caching
- ✅ **Qualität:** Type-Safe APIs mit umfassender Validierung

### Dokumentation (15%)
- ✅ Source Code als Anhang (TypeScript/tRPC)
- ✅ API-Dokumentation mit Beispielen
- ✅ Screenshots der funktionalen Engine

## 🔗 Referenz-Materialien

### Wichtige Dokumente (MUSS gelesen werden):
- `data/Kategorie 1 Web-Entwicklung & Basis-Websites.md` - 3% Preisvorteil-Strategie
- `data/Kategorie 2 E-Commerce & Online-Handel.md` - Shop-System Kalkulationen
- `data/Kategorie 3 Hosting & Technische Infrastruktur.md` - Hosting-Preismodelle
- `data/Kategorie 4 Integration & Automatisierung.md` - Komplexitätsfaktoren
- `data/Kategorie 5 Wartung, Support & Marketing.md` - Wiederkehrende Preismodelle
- `data/Kategorie 6 Beratung, Compliance & Zusatzservices.md` - Beratungspreise
- `data/Kategorie 7 Unternehmensberatung.md` - Enterprise-Preismodelle

### Code-Basis:
- `apps/api/src/db/schema.ts` - Database Schema verstehen
- `apps/api/src/trpc/` - Bestehende tRPC-Setup analysieren
- `apps/web/` - Frontend-Integration für Testing

## 🎯 Erfolgskriterien

### Must-Have (für IHK-Bestehen):
- [ ] Alle 4 Preismodelle funktionieren korrekt
- [ ] Service-Abhängigkeiten werden berücksichtigt
- [ ] Rabattsystem anwendbar
- [ ] Performance unter 100ms
- [ ] Vollständige Dokumentation

### Should-Have (für gute Note):
- [ ] Caching-System implementiert
- [ ] Bundle-Erkennung funktional
- [ ] Umfassende Test-Suite
- [ ] API-Integration im Frontend
- [ ] Error-Handling robust

### Could-Have (für Bestnote):
- [ ] A/B-Testing Framework
- [ ] Advanced Analytics
- [ ] Real-time Updates via WebSocket
- [ ] Monitoring & Logging

## 📝 Projektantrag-Vorlage

### Projektbezeichnung
"Echtzeit-Preisberechnungs-Engine für IT-Dienstleistungen mit Multi-Preismodell-Support"

### Kurze Projektbeschreibung
"Entwicklung einer modularen Preisberechnungs-Engine als wiederverwendbares NPM-Package (@durchrechnen/pricing-engine) für automatische IT-Service-Kalkulationen. Implementierung von 4 Preismodellen mit intelligenter Bundle-Erkennung, Rabattsystem und Service-Abhängigkeits-Management. Package-basierte Architektur ermöglicht isolierte Tests und Sub-100ms Performance durch Redis-Caching."

### Projektumfeld
"Codenade GmbH - Entwicklung für internen Preiskalkulator 'Durchrechnen' zur Optimierung von Sales-Prozessen und competitive Pricing-Strategien."

### Projektphasen mit Zeitplanung
1. **Anforderungsanalyse & Konzept** - 15 Stunden
2. **Core Engine-Entwicklung** - 35 Stunden  
3. **API-Integration & Frontend** - 20 Stunden
4. **Testing & Dokumentation** - 10 Stunden

**Gesamt: 80 Stunden**

## 🚀 Nächste Schritte

1. **Projektantrag einreichen** - bis zu den IHK-Fristen
2. **Genehmigung abwarten** - ca. 2 Wochen
3. **Projektstart** - Nach Genehmigung durch IHK
4. **Dokumentation parallel entwickeln** - Nicht am Ende!
5. **Präsentation vorbereiten** - 15 Min + 15 Min Fachgespräch

## ⚠️ Wichtige Hinweise

- **Nicht zu früh starten** - Erst nach IHK-Genehmigung!
- **Zeittracking** - Alle Stunden dokumentieren
- **Backup-Plan** - Falls technische Probleme auftreten
- **Regelmäßige Commits** - Git-Historie als Entwicklungsnachweis
- **Zwischenstände dokumentieren** - Für Projektbericht

**Viel Erfolg! 🎓**