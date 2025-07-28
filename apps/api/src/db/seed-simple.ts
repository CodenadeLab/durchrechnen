// =============================================================================
// SIMPLE DATABASE SEED SCRIPT - Auto-generated UUIDs
// =============================================================================

import { db } from "./index";
import { serviceCategories } from "./schema";

// =============================================================================
// SIMPLE SEED DATA (Auto UUIDs)
// =============================================================================

const seedServiceCategories = [
  {
    name: "Web-Entwicklung & Basis-Websites",
    slug: "web-entwicklung-basis-websites",
    description:
      "Grundlegende Webentwicklung, Websites und Online-Präsenzen für Unternehmen",
    sortOrder: 1,
  },
  {
    name: "E-Commerce & Online-Handel",
    slug: "e-commerce-online-handel",
    description:
      "Online-Shops, E-Commerce-Lösungen und digitale Verkaufsplattformen",
    sortOrder: 2,
  },
  {
    name: "Hosting & Technische Infrastruktur",
    slug: "hosting-technische-infrastruktur",
    description:
      "Server-Hosting, Cloud-Services und technische Infrastrukturlösungen",
    sortOrder: 3,
  },
  {
    name: "Integration & Automatisierung",
    slug: "integration-automatisierung",
    description:
      "API-Integrationen, Workflow-Automatisierung und Systemverbindungen",
    sortOrder: 4,
  },
  {
    name: "Wartung, Support & Marketing",
    slug: "wartung-support-marketing",
    description:
      "Laufende Betreuung, technischer Support und digitales Marketing",
    sortOrder: 5,
  },
  {
    name: "Beratung, Compliance & Zusatzservices",
    slug: "beratung-compliance-zusatzservices",
    description:
      "Beratungsleistungen, Compliance-Services und zusätzliche Dienstleistungen",
    sortOrder: 6,
  },
  {
    name: "Unternehmensberatung",
    slug: "unternehmensberatung",
    description:
      "Strategische Beratung, Digitalisierung und Geschäftsprozessoptimierung",
    sortOrder: 7,
  },
];

// =============================================================================
// SEED FUNCTION
// =============================================================================

export async function seedDatabase() {
  console.log("🌱 Starting simple database seeding...");

  try {
    // Seed Service Categories
    console.log("📂 Seeding service categories...");

    // Check if categories already exist
    const existingCategories = await db.select().from(serviceCategories);

    if (existingCategories.length === 0) {
      const insertedCategories = await db
        .insert(serviceCategories)
        .values(seedServiceCategories)
        .returning();
      console.log(
        `✅ Inserted ${insertedCategories.length} service categories`,
      );

      // Show inserted categories with their UUIDs
      for (const cat of insertedCategories) {
        console.log(`   • ${cat.name} (${cat.id})`);
      }
    } else {
      console.log(
        `ℹ️  Service categories already exist (${existingCategories.length} found)`,
      );
      for (const cat of existingCategories) {
        console.log(`   • ${cat.name} (${cat.id})`);
      }
    }

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// =============================================================================
// CLI EXECUTION
// =============================================================================

if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("Seeding finished - exiting process");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
