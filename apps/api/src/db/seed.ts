// =============================================================================
// DATABASE SEED SCRIPT - Complete Sample Data for Development & Testing
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
// SERVICE CATEGORIES SEED DATA (7 Main Categories)
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
    id: "cat-2-ecommerce",
    name: "E-Commerce & Online-Handel",
    slug: "e-commerce-online-handel",
    description:
      "Online-Shops, E-Commerce-Lösungen und digitale Verkaufsplattformen",
    sortOrder: 2,
  },
  {
    id: "cat-3-hosting",
    name: "Hosting & Technische Infrastruktur",
    slug: "hosting-technische-infrastruktur",
    description:
      "Server-Hosting, Cloud-Services und technische Infrastrukturlösungen",
    sortOrder: 3,
  },
  {
    id: "cat-4-integration",
    name: "Integration & Automatisierung",
    slug: "integration-automatisierung",
    description:
      "API-Integrationen, Workflow-Automatisierung und Systemverbindungen",
    sortOrder: 4,
  },
  {
    id: "cat-5-support",
    name: "Wartung, Support & Marketing",
    slug: "wartung-support-marketing",
    description:
      "Laufende Betreuung, technischer Support und digitales Marketing",
    sortOrder: 5,
  },
  {
    id: "cat-6-consulting",
    name: "Beratung, Compliance & Zusatzservices",
    slug: "beratung-compliance-zusatzservices",
    description:
      "Beratungsleistungen, Compliance-Services und zusätzliche Dienstleistungen",
    sortOrder: 6,
  },
  {
    id: "cat-7-business",
    name: "Unternehmensberatung",
    slug: "unternehmensberatung",
    description:
      "Strategische Beratung, Digitalisierung und Geschäftsprozessoptimierung",
    sortOrder: 7,
  },
];

// =============================================================================
// SERVICES SEED DATA (Sample services per category with realistic pricing)
// =============================================================================

const seedServices = [
  // Web-Entwicklung & Basis-Websites
  {
    id: "svc-responsive-website",
    name: "Responsive Website",
    slug: "responsive-website",
    description: "Mobile-first responsive Website mit modernem Design",
    shortDescription: "Responsive Website für alle Geräte",
    categoryId: "cat-1-web-dev",
    pricingModel: "project" as const,
    basePrice: "2500.00",
    minHours: 40,
    maxHours: 80,
    complexityMultiplier: { basic: 1.0, standard: 1.5, premium: 2.2 },
    isPopular: true,
    tags: ["website", "responsive", "mobile"],
    sortOrder: 1,
  },
  {
    id: "svc-landing-page",
    name: "Landing Page",
    slug: "landing-page",
    description: "Optimierte Landing Page für Marketing-Kampagnen",
    shortDescription: "Conversion-optimierte Landing Page",
    categoryId: "cat-1-web-dev",
    pricingModel: "fixed" as const,
    basePrice: "850.00",
    complexityMultiplier: { basic: 1.0, standard: 1.3, premium: 1.8 },
    tags: ["landing", "marketing", "conversion"],
    sortOrder: 2,
  },
  {
    id: "svc-cms-integration",
    name: "CMS Integration",
    slug: "cms-integration",
    description:
      "Content Management System Integration (WordPress, Strapi, etc.)",
    shortDescription: "CMS für einfache Inhaltspflege",
    categoryId: "cat-1-web-dev",
    pricingModel: "project" as const,
    basePrice: "1200.00",
    minHours: 15,
    maxHours: 40,
    complexityMultiplier: { basic: 1.0, standard: 1.4, premium: 2.0 },
    dependencies: ["svc-responsive-website"],
    tags: ["cms", "wordpress", "content"],
    sortOrder: 3,
  },

  // E-Commerce & Online-Handel
  {
    id: "svc-online-shop",
    name: "Online Shop",
    slug: "online-shop",
    description: "Vollständiger E-Commerce Shop mit Zahlungsabwicklung",
    shortDescription: "Kompletter Online-Shop",
    categoryId: "cat-2-ecommerce",
    pricingModel: "project" as const,
    basePrice: "4500.00",
    minHours: 80,
    maxHours: 160,
    complexityMultiplier: { basic: 1.0, standard: 1.6, premium: 2.5 },
    dependencies: ["svc-responsive-website"],
    isPopular: true,
    tags: ["shop", "e-commerce", "payment"],
    sortOrder: 1,
  },
  {
    id: "svc-payment-integration",
    name: "Payment Integration",
    slug: "payment-integration",
    description:
      "Integration von Zahlungsdienstleistern (Stripe, PayPal, etc.)",
    shortDescription: "Sichere Zahlungsabwicklung",
    categoryId: "cat-2-ecommerce",
    pricingModel: "fixed" as const,
    basePrice: "800.00",
    complexityMultiplier: { basic: 1.0, standard: 1.3, premium: 1.7 },
    tags: ["payment", "stripe", "paypal"],
    sortOrder: 2,
  },

  // Hosting & Technische Infrastruktur
  {
    id: "svc-web-hosting",
    name: "Web Hosting",
    slug: "web-hosting",
    description: "Professionelles Web-Hosting mit SSL und Backups",
    shortDescription: "Zuverlässiges Web-Hosting",
    categoryId: "cat-3-hosting",
    pricingModel: "monthly" as const,
    basePrice: "25.00",
    complexityMultiplier: { basic: 1.0, standard: 2.0, premium: 4.0 },
    isPopular: true,
    tags: ["hosting", "ssl", "backup"],
    sortOrder: 1,
  },
  {
    id: "svc-cloud-setup",
    name: "Cloud Infrastructure Setup",
    slug: "cloud-infrastructure-setup",
    description: "Cloud-Infrastruktur Setup (AWS, Google Cloud, etc.)",
    shortDescription: "Professionelle Cloud-Infrastruktur",
    categoryId: "cat-3-hosting",
    pricingModel: "project" as const,
    basePrice: "1500.00",
    minHours: 20,
    maxHours: 60,
    complexityMultiplier: { basic: 1.0, standard: 1.8, premium: 3.0 },
    tags: ["cloud", "aws", "infrastructure"],
    sortOrder: 2,
  },

  // Integration & Automatisierung
  {
    id: "svc-api-integration",
    name: "API Integration",
    slug: "api-integration",
    description: "Integration externer APIs und Services",
    shortDescription: "Nahtlose API-Verbindungen",
    categoryId: "cat-4-integration",
    pricingModel: "hourly" as const,
    basePrice: "120.00",
    minHours: 8,
    maxHours: 40,
    complexityMultiplier: { basic: 1.0, standard: 1.4, premium: 2.0 },
    tags: ["api", "integration", "automation"],
    sortOrder: 1,
  },

  // Wartung, Support & Marketing
  {
    id: "svc-website-maintenance",
    name: "Website Wartung",
    slug: "website-maintenance",
    description: "Regelmäßige Website-Wartung und Updates",
    shortDescription: "Laufende Website-Betreuung",
    categoryId: "cat-5-support",
    pricingModel: "monthly" as const,
    basePrice: "150.00",
    complexityMultiplier: { basic: 1.0, standard: 1.5, premium: 2.2 },
    isPopular: true,
    tags: ["wartung", "support", "updates"],
    sortOrder: 1,
  },
  {
    id: "svc-seo-optimization",
    name: "SEO Optimierung",
    slug: "seo-optimization",
    description: "Suchmaschinenoptimierung für bessere Rankings",
    shortDescription: "Professionelle SEO-Betreuung",
    categoryId: "cat-5-support",
    pricingModel: "monthly" as const,
    basePrice: "300.00",
    complexityMultiplier: { basic: 1.0, standard: 1.4, premium: 2.0 },
    tags: ["seo", "marketing", "ranking"],
    sortOrder: 2,
  },
];

// =============================================================================
// SERVICE DEPENDENCIES SEED DATA
// =============================================================================

const seedServiceDependencies = [
  {
    id: "dep-cms-website",
    serviceId: "svc-cms-integration",
    dependentServiceId: "svc-responsive-website",
    isRequired: true,
    reason: "CMS benötigt eine bestehende Website als Grundlage",
  },
  {
    id: "dep-shop-website",
    serviceId: "svc-online-shop",
    dependentServiceId: "svc-responsive-website",
    isRequired: true,
    reason: "Online Shop basiert auf responsiver Website-Struktur",
  },
  {
    id: "dep-maintenance-website",
    serviceId: "svc-website-maintenance",
    dependentServiceId: "svc-responsive-website",
    isRequired: false,
    reason: "Wartung setzt normalerweise eine bestehende Website voraus",
  },
];

// =============================================================================
// CUSTOMERS SEED DATA (Different segments)
// =============================================================================

const seedCustomers = [
  {
    id: "cust-mueller-gmbh",
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
    },
    tags: ["stammkunde", "bayern"],
    isVip: true,
  },
  {
    id: "cust-startup-tech",
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
    tags: ["startup", "tech"],
  },
  {
    id: "cust-enterprise-corp",
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
      },
    },
    tags: ["enterprise", "volume"],
    isVip: true,
  },
  {
    id: "cust-private-kunde",
    name: "Anna Privatkundin",
    email: "anna.private@email.de",
    phone: "+49 171 1234567",
    segment: "private" as const,
    tags: ["privat"],
  },
];

// =============================================================================
// CUSTOMER CONTACTS SEED DATA
// =============================================================================

const seedCustomerContacts = [
  {
    id: "contact-mueller-tech",
    customerId: "cust-mueller-gmbh",
    name: "Lisa Müller",
    email: "lisa.mueller@mueller-gmbh.de",
    phone: "+49 89 123456790",
    role: "technical" as const,
    department: "IT",
    isPrimary: false,
  },
  {
    id: "contact-enterprise-decision",
    customerId: "cust-enterprise-corp",
    name: "Jennifer Weber",
    email: "j.weber@enterprise-corp.de",
    phone: "+49 40 555777888",
    role: "decision_maker" as const,
    department: "Geschäftsführung",
    isPrimary: true,
  },
];

// =============================================================================
// DISCOUNT RULES SEED DATA
// =============================================================================

const seedDiscountRules = [
  {
    id: "discount-volume-10",
    name: "Volumenrabatt 10%",
    code: "VOLUME10",
    description: "10% Rabatt ab 5.000€ Auftragswert",
    type: "percentage" as const,
    value: "10.00",
    minAmount: "5000.00",
    priority: 100,
    tags: ["volume", "automatic"],
  },
  {
    id: "discount-sme-5",
    name: "KMU-Rabatt",
    description: "5% Rabatt für kleine und mittlere Unternehmen",
    type: "percentage" as const,
    value: "5.00",
    applicableSegments: ["sme"],
    priority: 50,
    tags: ["sme", "segment"],
  },
  {
    id: "discount-bundle-website-shop",
    name: "Website + Shop Bundle",
    description: "15% Rabatt bei Kombination Website + Online Shop",
    type: "bundle" as const,
    value: "15.00",
    conditions: {
      bundleServices: ["svc-responsive-website", "svc-online-shop"],
    },
    priority: 200,
    tags: ["bundle", "website", "shop"],
  },
];

// =============================================================================
// QUOTATIONS SEED DATA
// =============================================================================

const seedQuotations = [
  {
    id: "quote-mueller-website",
    quoteNumber: "Q-2024-001",
    title: "Responsive Website für Müller GmbH",
    customerId: "cust-mueller-gmbh",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    status: "sent" as const,
    subtotalAmount: "2500.00",
    discountAmount: "125.00", // 5% VIP discount
    taxAmount: "451.25", // 19% VAT
    totalAmount: "2826.25",
    notes: "Standard responsive Website mit CMS Integration",
    customerNotes: "Bitte Terminwunsch für Kickoff-Meeting mitteilen",
  },
  {
    id: "quote-startup-shop",
    quoteNumber: "Q-2024-002",
    title: "E-Commerce Lösung für StartupTech",
    customerId: "cust-startup-tech",
    validFrom: new Date(),
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    status: "draft" as const,
    subtotalAmount: "7000.00",
    discountAmount: "1050.00", // 15% bundle discount
    taxAmount: "1130.50",
    totalAmount: "7080.50",
    notes: "Website + Online Shop Bundle mit Payment Integration",
  },
];

// =============================================================================
// QUOTATION ITEMS SEED DATA
// =============================================================================

const seedQuotationItems = [
  {
    id: "item-mueller-website",
    quotationId: "quote-mueller-website",
    serviceId: "svc-responsive-website",
    name: "Responsive Website",
    description: "Mobile-first responsive Website mit modernem Design",
    quantity: 1,
    unitPrice: "2500.00",
    totalPrice: "2500.00",
    finalPrice: "2500.00",
    complexity: "standard",
    position: 1,
  },
  {
    id: "item-startup-website",
    quotationId: "quote-startup-shop",
    serviceId: "svc-responsive-website",
    name: "Responsive Website",
    description: "Basis-Website für E-Commerce Integration",
    quantity: 1,
    unitPrice: "2500.00",
    totalPrice: "2500.00",
    finalPrice: "2500.00",
    complexity: "standard",
    position: 1,
  },
  {
    id: "item-startup-shop",
    quotationId: "quote-startup-shop",
    serviceId: "svc-online-shop",
    name: "Online Shop",
    description: "E-Commerce Shop mit Zahlungsabwicklung",
    quantity: 1,
    unitPrice: "4500.00",
    totalPrice: "4500.00",
    finalPrice: "4500.00",
    complexity: "standard",
    position: 2,
  },
];

// =============================================================================
// SEED EXECUTION FUNCTION
// =============================================================================

export async function seedDatabase() {
  console.log("🌱 Starting comprehensive database seeding...");

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

    // Seed Service Categories
    console.log("📂 Seeding service categories...");
    await db.insert(serviceCategories).values(seedServiceCategories);
    console.log(
      `✅ Inserted ${seedServiceCategories.length} service categories`,
    );

    // Seed Services
    console.log("🛠️  Seeding services...");
    await db.insert(services).values(seedServices);
    console.log(`✅ Inserted ${seedServices.length} services`);

    // Seed Service Dependencies
    console.log("🔗 Seeding service dependencies...");
    await db.insert(serviceDependencies).values(seedServiceDependencies);
    console.log(
      `✅ Inserted ${seedServiceDependencies.length} service dependencies`,
    );

    // Seed Customers
    console.log("👥 Seeding customers...");
    await db.insert(customers).values(seedCustomers);
    console.log(`✅ Inserted ${seedCustomers.length} customers`);

    // Seed Customer Contacts
    console.log("📞 Seeding customer contacts...");
    await db.insert(customerContacts).values(seedCustomerContacts);
    console.log(`✅ Inserted ${seedCustomerContacts.length} customer contacts`);

    // Seed Discount Rules
    console.log("💰 Seeding discount rules...");
    await db.insert(discountRules).values(seedDiscountRules);
    console.log(`✅ Inserted ${seedDiscountRules.length} discount rules`);

    // Seed Quotations
    console.log("📄 Seeding quotations...");
    await db.insert(quotations).values(seedQuotations);
    console.log(`✅ Inserted ${seedQuotations.length} quotations`);

    // Seed Quotation Items
    console.log("📋 Seeding quotation items...");
    await db.insert(quotationItems).values(seedQuotationItems);
    console.log(`✅ Inserted ${seedQuotationItems.length} quotation items`);

    console.log("🎉 Database seeding completed successfully!");
    console.log("📊 Sample data summary:");
    console.log(`   • ${seedServiceCategories.length} service categories`);
    console.log(`   • ${seedServices.length} services`);
    console.log(`   • ${seedCustomers.length} customers`);
    console.log(`   • ${seedQuotations.length} quotations`);
    console.log(`   • ${seedDiscountRules.length} discount rules`);
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
