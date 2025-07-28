// =============================================================================
// DATABASE SEED SCRIPT - Based on Detailed Service Documentation
// =============================================================================

import { db } from "./index";
import {
  customerContacts,
  customers,
  discountRules,
  quotationItems,
  quotations,
  serviceCategories,
  serviceDependencies,
  services,
} from "./schema";

// =============================================================================
// SERVICE CATEGORIES SEED DATA (7 Main Categories from Documentation)
// =============================================================================

const seedServiceCategories = [
  {
    name: "Web-Entwicklung & Basis-Websites",
    slug: "web-entwicklung-basis-websites",
    description:
      "WordPress, HTML, Landing Pages, PWAs, SPAs, React, Next.js - vollständige Web-Lösungen",
    sortOrder: 1,
  },
  {
    name: "E-Commerce & Online-Handel",
    slug: "e-commerce-online-handel",
    description:
      "WooCommerce, Shopware, Custom Shops, Payment-Integration, Marktplatz-Anbindungen",
    sortOrder: 2,
  },
  {
    name: "Hosting & Technische Infrastruktur",
    slug: "hosting-technische-infrastruktur",
    description:
      "Web-Hosting, Cloud Setup, Server-Management, SSL, Backups und Infrastruktur",
    sortOrder: 3,
  },
  {
    name: "Integration & Automatisierung",
    slug: "integration-automatisierung",
    description:
      "API-Integrationen, Workflow-Automatisierung, Datenbank-Anbindungen, Custom Plugins",
    sortOrder: 4,
  },
  {
    name: "Wartung, Support & Marketing",
    slug: "wartung-support-marketing",
    description:
      "Website-Wartung, SEO, Content-Management, technischer Support und Digital Marketing",
    sortOrder: 5,
  },
  {
    name: "Beratung, Compliance & Zusatzservices",
    slug: "beratung-compliance-zusatzservices",
    description:
      "DSGVO, BFSG-Compliance, Beratung, Audits, Zertifizierungen und Rechtskonformität",
    sortOrder: 6,
  },
  {
    name: "Unternehmensberatung",
    slug: "unternehmensberatung",
    description:
      "Digitalisierung, Prozessoptimierung, Technologie-Beratung und strategische Planung",
    sortOrder: 7,
  },
];

// =============================================================================
// DETAILED SERVICES SEED DATA (From Category Documentation)
// =============================================================================

const seedServicesDetailed = [
  // =============================================================================
  // KATEGORIE 1: WEB-ENTWICKLUNG & BASIS-WEBSITES
  // =============================================================================

  // WordPress Websites
  {
    name: "WordPress Starter Website",
    slug: "wordpress-starter-website",
    description:
      "5-seitige WordPress Website mit Standard-Theme und Basis-Features",
    shortDescription: "WordPress Starter (5 Seiten)",
    categorySlug: "web-entwicklung-basis-websites",
    pricingModel: "fixed" as const,
    basePrice: "437.00", // Markt €450 -3% = €437
    minHours: 8,
    maxHours: 12,
    complexityMultiplier: { basic: 1.0, standard: 1.2, premium: 1.5 },
    tags: ["wordpress", "starter", "basic", "cms"],
    isPopular: true,
    sortOrder: 1,
  },
  {
    name: "WordPress Professional Website",
    slug: "wordpress-professional-website",
    description:
      "10-seitige WordPress Website mit Custom-Design und erweiterten Features",
    shortDescription: "WordPress Professional (10 Seiten)",
    categorySlug: "web-entwicklung-basis-websites",
    pricingModel: "fixed" as const,
    basePrice: "1843.00", // Markt €1,900 -3% = €1,843
    minHours: 24,
    maxHours: 35,
    complexityMultiplier: { basic: 1.0, standard: 1.3, premium: 1.8 },
    tags: ["wordpress", "professional", "custom-design"],
    isPopular: true,
    sortOrder: 2,
  },
  {
    name: "WordPress Business Website",
    slug: "wordpress-business-website",
    description:
      "20-seitige Business WordPress Website mit umfangreichen Features",
    shortDescription: "WordPress Business (20 Seiten)",
    categorySlug: "web-entwicklung-basis-websites",
    pricingModel: "fixed" as const,
    basePrice: "3298.00", // Markt €3,400 -3% = €3,298
    minHours: 40,
    maxHours: 60,
    complexityMultiplier: { basic: 1.0, standard: 1.4, premium: 2.0 },
    tags: ["wordpress", "business", "enterprise"],
    sortOrder: 3,
  },

  // Landing Pages
  {
    name: "Express Landing Page",
    slug: "express-landing-page",
    description:
      "Schnelle Landing Page für Marketing-Kampagnen mit Conversion-Optimierung",
    shortDescription: "Express Landing Page (2h Express)",
    categorySlug: "web-entwicklung-basis-websites",
    pricingModel: "fixed" as const,
    basePrice: "242.00", // Markt €249 -3% = €242
    minHours: 2,
    maxHours: 4,
    complexityMultiplier: { basic: 1.0, standard: 1.3, premium: 1.6 },
    tags: ["landing", "express", "marketing", "conversion"],
    sortOrder: 4,
  },
  {
    name: "Custom Landing Page",
    slug: "custom-landing-page",
    description:
      "Individuelle Landing Page mit Custom-Design und A/B-Testing Setup",
    shortDescription: "Custom Landing Page",
    categorySlug: "web-entwicklung-basis-websites",
    pricingModel: "fixed" as const,
    basePrice: "484.00", // Markt €499 -3% = €484
    minHours: 6,
    maxHours: 10,
    complexityMultiplier: { basic: 1.0, standard: 1.4, premium: 1.8 },
    tags: ["landing", "custom", "ab-testing"],
    sortOrder: 5,
  },

  // Progressive Web Apps
  {
    name: "PWA Starter",
    slug: "pwa-starter",
    description:
      "Progressive Web App Starter mit Offline-Funktionalität und Push-Notifications",
    shortDescription: "PWA mit Offline-Support",
    categorySlug: "web-entwicklung-basis-websites",
    pricingModel: "project" as const,
    basePrice: "2716.00", // Markt €2,800 -3% = €2,716
    minHours: 40,
    maxHours: 60,
    complexityMultiplier: { basic: 1.0, standard: 1.5, premium: 2.2 },
    tags: ["pwa", "offline", "mobile", "notifications"],
    sortOrder: 6,
  },

  // React Development
  {
    name: "React Starter Projekt",
    slug: "react-starter-projekt",
    description:
      "React-basierte Single Page Application mit modernem Tech-Stack",
    shortDescription: "React SPA Starter",
    categorySlug: "web-entwicklung-basis-websites",
    pricingModel: "project" as const,
    basePrice: "14550.00", // Markt €15,000 -3% = €14,550
    minHours: 160,
    maxHours: 220,
    complexityMultiplier: { basic: 1.0, standard: 1.4, premium: 2.0 },
    tags: ["react", "spa", "javascript", "frontend"],
    isPopular: true,
    sortOrder: 7,
  },

  // Next.js Development
  {
    name: "Next.js Website",
    slug: "nextjs-website",
    description:
      "Server-Side Rendered Website mit Next.js und optimaler Performance",
    shortDescription: "Next.js SSR Website",
    categorySlug: "web-entwicklung-basis-websites",
    pricingModel: "project" as const,
    basePrice: "11640.00", // Markt €12,000 -3% = €11,640
    minHours: 120,
    maxHours: 180,
    complexityMultiplier: { basic: 1.0, standard: 1.5, premium: 2.2 },
    tags: ["nextjs", "ssr", "performance", "react"],
    sortOrder: 8,
  },

  // =============================================================================
  // KATEGORIE 2: E-COMMERCE & ONLINE-HANDEL
  // =============================================================================

  // WooCommerce Shops
  {
    name: "WooCommerce Shop Klein",
    slug: "woocommerce-shop-klein",
    description:
      "WooCommerce Setup für bis zu 50 Produkte mit Standard-Features",
    shortDescription: "WooCommerce Klein (bis 50 Produkte)",
    categorySlug: "e-commerce-online-handel",
    pricingModel: "fixed" as const,
    basePrice: "970.00", // Markt €1,000 -3% = €970
    minHours: 16,
    maxHours: 25,
    complexityMultiplier: { basic: 1.0, standard: 1.3, premium: 1.8 },
    tags: ["woocommerce", "shop", "ecommerce", "small"],
    isPopular: true,
    sortOrder: 1,
  },
  {
    name: "WooCommerce Shop Mittel",
    slug: "woocommerce-shop-mittel",
    description:
      "WooCommerce Setup für ca. 500 Produkte mit erweiterten E-Commerce Features",
    shortDescription: "WooCommerce Mittel (ca. 500 Produkte)",
    categorySlug: "e-commerce-online-handel",
    pricingModel: "fixed" as const,
    basePrice: "3395.00", // Markt €3,500 -3% = €3,395
    minHours: 40,
    maxHours: 60,
    complexityMultiplier: { basic: 1.0, standard: 1.4, premium: 2.0 },
    tags: ["woocommerce", "shop", "ecommerce", "medium"],
    sortOrder: 2,
  },

  // Shopware Shops
  {
    name: "Shopware 6 Shop Klein",
    slug: "shopware-6-shop-klein",
    description: "Shopware 6 Installation und Anpassung für bis zu 50 Produkte",
    shortDescription: "Shopware 6 Klein (bis 50 Produkte)",
    categorySlug: "e-commerce-online-handel",
    pricingModel: "project" as const,
    basePrice: "5820.00", // Markt €6,000 -3% = €5,820
    minHours: 60,
    maxHours: 90,
    complexityMultiplier: { basic: 1.0, standard: 1.3, premium: 1.8 },
    tags: ["shopware", "shop", "ecommerce", "professional"],
    sortOrder: 3,
  },

  // Payment Integration
  {
    name: "Payment Integration Multi",
    slug: "payment-integration-multi",
    description: "Integration von 3 Payment-Anbietern (PayPal, Stripe, Klarna)",
    shortDescription: "Multi-Payment Setup (3 Anbieter)",
    categorySlug: "e-commerce-online-handel",
    pricingModel: "fixed" as const,
    basePrice: "776.00", // Markt €800 -3% = €776
    minHours: 10,
    maxHours: 15,
    complexityMultiplier: { basic: 1.0, standard: 1.2, premium: 1.6 },
    tags: ["payment", "integration", "paypal", "stripe", "klarna"],
    sortOrder: 4,
  },

  // =============================================================================
  // KATEGORIE 3: HOSTING & TECHNISCHE INFRASTRUKTUR
  // =============================================================================

  {
    name: "Web Hosting Professional",
    slug: "web-hosting-professional",
    description: "Professionelles Web-Hosting mit SSL, Backups und Support",
    shortDescription: "Web-Hosting mit SSL & Backups",
    categorySlug: "hosting-technische-infrastruktur",
    pricingModel: "monthly" as const,
    basePrice: "25.00", // Markt €25 bereits günstig
    complexityMultiplier: { basic: 1.0, standard: 2.0, premium: 4.0 },
    tags: ["hosting", "ssl", "backup", "support"],
    isPopular: true,
    sortOrder: 1,
  },
  {
    name: "Cloud Infrastructure Setup",
    slug: "cloud-infrastructure-setup",
    description:
      "Professionelle Cloud-Infrastruktur Setup (AWS, Google Cloud, Azure)",
    shortDescription: "Cloud Setup (AWS/GCP/Azure)",
    categorySlug: "hosting-technische-infrastruktur",
    pricingModel: "project" as const,
    basePrice: "1455.00", // Markt €1,500 -3% = €1,455
    minHours: 20,
    maxHours: 60,
    complexityMultiplier: { basic: 1.0, standard: 1.8, premium: 3.0 },
    tags: ["cloud", "aws", "gcp", "azure", "infrastructure"],
    sortOrder: 2,
  },

  // =============================================================================
  // KATEGORIE 4: INTEGRATION & AUTOMATISIERUNG
  // =============================================================================

  {
    name: "API Integration Standard",
    slug: "api-integration-standard",
    description: "Integration externer APIs und Services in bestehende Systeme",
    shortDescription: "Standard API-Integration",
    categorySlug: "integration-automatisierung",
    pricingModel: "hourly" as const,
    basePrice: "116.00", // Markt €120 -3% = €116 (gerundet)
    minHours: 8,
    maxHours: 40,
    complexityMultiplier: { basic: 1.0, standard: 1.4, premium: 2.0 },
    tags: ["api", "integration", "automation", "rest"],
    sortOrder: 1,
  },

  // =============================================================================
  // KATEGORIE 5: WARTUNG, SUPPORT & MARKETING
  // =============================================================================

  {
    name: "Website Wartung Professional",
    slug: "website-wartung-professional",
    description: "Monatliche Website-Wartung mit Updates, Backups und Support",
    shortDescription: "Professional Website-Wartung",
    categorySlug: "wartung-support-marketing",
    pricingModel: "monthly" as const,
    basePrice: "291.00", // Markt €300 -3% = €291
    complexityMultiplier: { basic: 1.0, standard: 1.5, premium: 2.2 },
    tags: ["wartung", "support", "updates", "backup"],
    isPopular: true,
    sortOrder: 1,
  },
  {
    name: "SEO Optimierung",
    slug: "seo-optimierung",
    description: "Professionelle Suchmaschinenoptimierung für bessere Rankings",
    shortDescription: "SEO-Optimierung & Betreuung",
    categorySlug: "wartung-support-marketing",
    pricingModel: "monthly" as const,
    basePrice: "291.00", // Markt €300 -3% = €291
    complexityMultiplier: { basic: 1.0, standard: 1.4, premium: 2.0 },
    tags: ["seo", "marketing", "ranking", "google"],
    sortOrder: 2,
  },
];

// =============================================================================
// SERVICE DEPENDENCIES SEED DATA (Logical Dependencies)
// =============================================================================

const seedServiceDependencies = [
  {
    serviceSlug: "woocommerce-shop-klein",
    dependentServiceSlug: "wordpress-starter-website",
    isRequired: true,
    reason: "WooCommerce benötigt WordPress als Grundlage",
  },
  {
    serviceSlug: "woocommerce-shop-mittel",
    dependentServiceSlug: "wordpress-professional-website",
    isRequired: true,
    reason:
      "Größere WooCommerce Shops benötigen professionelle WordPress-Basis",
  },
  {
    serviceSlug: "payment-integration-multi",
    dependentServiceSlug: "woocommerce-shop-klein",
    isRequired: false,
    reason: "Payment Integration erweitert Shop-Funktionalität",
  },
  {
    serviceSlug: "website-wartung-professional",
    dependentServiceSlug: "wordpress-professional-website",
    isRequired: false,
    reason: "Wartung setzt eine bestehende Website voraus",
  },
];

// =============================================================================
// ENHANCED CUSTOMERS SEED DATA
// =============================================================================

const seedCustomersEnhanced = [
  {
    name: "Thomas Müller",
    email: "thomas.mueller@mueller-gmbh.de",
    phone: "+49 89 123456789",
    address: {
      street: "Maximilianstraße 15",
      city: "München",
      postalCode: "80539",
      country: "Deutschland",
    },
    companyName: "Müller GmbH",
    taxId: "DE123456789",
    segment: "sme" as const,
    customPricingRules: {
      discountPercentage: 5,
      preferredCustomer: true,
    },
    tags: ["stammkunde", "bayern", "handwerk"],
    isVip: true,
  },
  {
    name: "Sarah Schmidt",
    email: "sarah@startup-tech.com",
    phone: "+49 30 987654321",
    address: {
      street: "Friedrichstraße 123",
      city: "Berlin",
      postalCode: "10117",
      country: "Deutschland",
    },
    companyName: "StartupTech GmbH",
    segment: "sme" as const,
    tags: ["startup", "tech", "berlin"],
  },
  {
    name: "Dr. Michael Weber",
    email: "m.weber@enterprise-corp.de",
    phone: "+49 40 555777999",
    address: {
      street: "Speicherstadt 45",
      city: "Hamburg",
      postalCode: "20457",
      country: "Deutschland",
    },
    companyName: "Enterprise Corp AG",
    taxId: "DE987654321",
    commercialRegister: "HRB 123456",
    segment: "enterprise" as const,
    customPricingRules: {
      discountPercentage: 15,
      specialRules: {
        volumeDiscount: true,
        preferredCustomer: true,
        contractDiscount: 10,
      },
    },
    tags: ["enterprise", "volume", "hamburg"],
    isVip: true,
  },
  {
    name: "Lisa Kleinmann",
    email: "lisa@boutique-online.de",
    phone: "+49 221 4455667",
    address: {
      street: "Hohe Straße 89",
      city: "Köln",
      postalCode: "50667",
      country: "Deutschland",
    },
    companyName: "Boutique Online",
    segment: "sme" as const,
    tags: ["fashion", "ecommerce", "nrw"],
  },
];

// =============================================================================
// ENHANCED DISCOUNT RULES SEED DATA
// =============================================================================

const seedDiscountRulesEnhanced = [
  {
    name: "Startup-Rabatt",
    code: "STARTUP15",
    description: "15% Rabatt für Startups und Gründer",
    type: "percentage" as const,
    value: "15.00",
    minAmount: "1000.00",
    applicableSegments: ["sme"],
    conditions: {
      customLogic: { requiresStartupProof: true },
    },
    priority: 100,
    tags: ["startup", "gründer"],
  },
  {
    name: "Bundle WordPress + WooCommerce",
    description:
      "20% Rabatt bei Kombination WordPress Professional + WooCommerce",
    type: "bundle" as const,
    value: "20.00",
    conditions: {
      bundleServices: [
        "wordpress-professional-website",
        "woocommerce-shop-mittel",
      ],
    },
    priority: 200,
    tags: ["bundle", "wordpress", "woocommerce"],
  },
  {
    name: "Volumenrabatt Enterprise",
    description: "10% Rabatt ab €10.000 Auftragswert",
    type: "volume" as const,
    value: "10.00",
    minAmount: "10000.00",
    applicableSegments: ["enterprise"],
    priority: 150,
    tags: ["volume", "enterprise"],
  },
  {
    name: "Wartungsvertrag-Rabatt",
    code: "WARTUNG10",
    description: "10% Rabatt bei Abschluss eines Wartungsvertrags",
    type: "customer" as const,
    value: "10.00",
    conditions: {
      customLogic: { requiresMaintenanceContract: true },
    },
    priority: 80,
    tags: ["wartung", "vertrag"],
  },
];

// =============================================================================
// SEED EXECUTION FUNCTION
// =============================================================================

export async function seedDatabase() {
  console.log(
    "🌱 Starting database seeding with detailed service data...",
  );

  try {
    // Clear existing data (for development)
    console.log("🧹 Clearing existing data...");
    await db.delete(quotationItems);
    await db.delete(quotations);
    await db.delete(customerContacts);
    await db.delete(customers);
    await db.delete(discountRules);
    await db.delete(serviceDependencies);
    await db.delete(services);
    await db.delete(serviceCategories);

    // 1. Seed Service Categories
    console.log("📂 Seeding service categories...");
    const insertedCategories = await db
      .insert(serviceCategories)
      .values(seedServiceCategories)
      .returning();
    console.log(`✅ Inserted ${insertedCategories.length} service categories`);

    // Create category lookup map
    const categoryMap = new Map<string, string>();
    insertedCategories.forEach((cat) => {
      categoryMap.set(cat.slug, cat.id);
    });

    // 2. Seed Detailed Services
    console.log("🛠️  Seeding detailed services...");
    const servicesWithCategoryIds = seedServicesDetailed.map((service) => {
      const categoryId = categoryMap.get(service.categorySlug);
      if (!categoryId) {
        throw new Error(`Category not found for slug: ${service.categorySlug}`);
      }

      const { categorySlug: _categorySlug, ...serviceData } = service;
      return {
        ...serviceData,
        categoryId,
      };
    });

    const insertedServices = await db
      .insert(services)
      .values(servicesWithCategoryIds)
      .returning();
    console.log(`✅ Inserted ${insertedServices.length} detailed services`);

    // Create service lookup map
    const serviceMap = new Map<string, string>();
    insertedServices.forEach((service) => {
      serviceMap.set(service.slug, service.id);
    });

    // 3. Seed Service Dependencies
    console.log("🔗 Seeding service dependencies...");
    const dependenciesWithIds = seedServiceDependencies.map((dep) => {
      const serviceId = serviceMap.get(dep.serviceSlug);
      const dependentServiceId = serviceMap.get(dep.dependentServiceSlug);

      if (!serviceId || !dependentServiceId) {
        throw new Error(
          `Service not found: ${dep.serviceSlug} -> ${dep.dependentServiceSlug}`,
        );
      }

      const {
        serviceSlug: _serviceSlug,
        dependentServiceSlug: _dependentServiceSlug,
        ...depData
      } = dep;
      return {
        ...depData,
        serviceId,
        dependentServiceId,
      };
    });

    if (dependenciesWithIds.length > 0) {
      await db.insert(serviceDependencies).values(dependenciesWithIds);
      console.log(
        `✅ Inserted ${dependenciesWithIds.length} service dependencies`,
      );
    }

    // 4. Seed Enhanced Customers
    console.log("👥 Seeding enhanced customers...");
    const insertedCustomers = await db
      .insert(customers)
      .values(seedCustomersEnhanced)
      .returning();
    console.log(`✅ Inserted ${insertedCustomers.length} customers`);

    // 5. Seed Enhanced Discount Rules
    console.log("💰 Seeding enhanced discount rules...");
    await db.insert(discountRules).values(seedDiscountRulesEnhanced);
    console.log(
      `✅ Inserted ${seedDiscountRulesEnhanced.length} discount rules`,
    );

    console.log("🎉 Database seeding finished successfully!");
    console.log("📊 Seeded data summary:");
    console.log(`   • ${insertedCategories.length} service categories`);
    console.log(`   • ${insertedServices.length} detailed services`);
    console.log(`   • ${dependenciesWithIds.length} service dependencies`);
    console.log(`   • ${insertedCustomers.length} customers`);
    console.log(`   • ${seedDiscountRulesEnhanced.length} discount rules`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// =============================================================================
// CLI EXECUTION (if run directly)
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
