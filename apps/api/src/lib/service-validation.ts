// =============================================================================
// SERVICE VALIDATION LIBRARY - Zirkuläre Abhängigkeiten & Business Logic
// =============================================================================

import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { serviceDependencies, services } from "../db/schema";

// =============================================================================
// CIRCULAR DEPENDENCY VALIDATION
// =============================================================================

/**
 * Detects circular dependencies in service dependency graph
 * Uses Depth-First Search (DFS) algorithm with recursion detection
 */
export class ServiceDependencyValidator {
  private visitedNodes = new Set<string>();
  private recursionStack = new Set<string>();

  /**
   * Validates that adding a new dependency won't create circular dependencies
   * @param serviceId - The service that depends on another
   * @param dependentServiceId - The service being depended upon
   * @returns Promise<{ isValid: boolean, circularPath?: string[] }>
   */
  async validateNewDependency(
    serviceId: string,
    dependentServiceId: string,
  ): Promise<{ isValid: boolean; circularPath?: string[] }> {
    // Reset state for new validation
    this.visitedNodes.clear();
    this.recursionStack.clear();

    // Check if adding this dependency would create a cycle
    // We simulate adding the dependency and check for cycles
    const allDependencies = await this.getAllDependencies();

    // Add the proposed dependency temporarily
    const proposedDep = {
      serviceId,
      dependentServiceId,
      isRequired: true,
    };

    allDependencies.push(proposedDep);

    // Build adjacency list for graph traversal
    const graph = this.buildDependencyGraph(allDependencies);

    // Check for cycles starting from any node
    for (const node of graph.keys()) {
      if (!this.visitedNodes.has(node)) {
        const result = await this.detectCycleFromNode(node, graph);
        if (!result.isValid) {
          return result;
        }
      }
    }

    return { isValid: true };
  }

  /**
   * Validates the entire service dependency graph for circular dependencies
   * @returns Promise<{ isValid: boolean, cycles: string[][] }>
   */
  async validateAllDependencies(): Promise<{
    isValid: boolean;
    cycles: string[][];
    report: string;
  }> {
    this.visitedNodes.clear();
    this.recursionStack.clear();

    const allDependencies = await this.getAllDependencies();
    const graph = this.buildDependencyGraph(allDependencies);
    const cycles: string[][] = [];

    // Check each unvisited node for cycles
    for (const node of graph.keys()) {
      if (!this.visitedNodes.has(node)) {
        const result = await this.detectCycleFromNode(node, graph);
        if (!result.isValid && result.circularPath) {
          cycles.push(result.circularPath);
        }
      }
    }

    const report = this.generateValidationReport(allDependencies, cycles);

    return {
      isValid: cycles.length === 0,
      cycles,
      report,
    };
  }

  /**
   * Gets all service dependencies from database
   */
  private async getAllDependencies() {
    return await db
      .select({
        serviceId: serviceDependencies.serviceId,
        dependentServiceId: serviceDependencies.dependentServiceId,
        isRequired: serviceDependencies.isRequired,
      })
      .from(serviceDependencies);
  }

  /**
   * Builds adjacency list representation of dependency graph
   */
  private buildDependencyGraph(
    dependencies: Array<{
      serviceId: string;
      dependentServiceId: string;
      isRequired: boolean;
    }>,
  ) {
    const graph = new Map<string, string[]>();

    for (const dep of dependencies) {
      if (!graph.has(dep.serviceId)) {
        graph.set(dep.serviceId, []);
      }
      graph.get(dep.serviceId)!.push(dep.dependentServiceId);

      // Ensure all nodes exist in graph
      if (!graph.has(dep.dependentServiceId)) {
        graph.set(dep.dependentServiceId, []);
      }
    }

    return graph;
  }

  /**
   * Detects cycles using DFS with recursion stack
   */
  private async detectCycleFromNode(
    node: string,
    graph: Map<string, string[]>,
  ): Promise<{ isValid: boolean; circularPath?: string[] }> {
    this.visitedNodes.add(node);
    this.recursionStack.add(node);

    const neighbors = graph.get(node) || [];

    for (const neighbor of neighbors) {
      if (!this.visitedNodes.has(neighbor)) {
        const result = await this.detectCycleFromNode(neighbor, graph);
        if (!result.isValid) {
          // Prepend current node to circular path
          return {
            isValid: false,
            circularPath: [node, ...(result.circularPath || [])],
          };
        }
      } else if (this.recursionStack.has(neighbor)) {
        // Found a back edge - cycle detected
        return {
          isValid: false,
          circularPath: [node, neighbor],
        };
      }
    }

    this.recursionStack.delete(node);
    return { isValid: true };
  }

  /**
   * Generates detailed validation report
   */
  private generateValidationReport(
    dependencies: Array<{
      serviceId: string;
      dependentServiceId: string;
      isRequired: boolean;
    }>,
    cycles: string[][],
  ): string {
    const report = [
      "=".repeat(60),
      "SERVICE DEPENDENCY VALIDATION REPORT",
      "=".repeat(60),
      "",
      `📊 Total Dependencies: ${dependencies.length}`,
      `🔄 Circular Dependencies Found: ${cycles.length}`,
      "",
    ];

    if (cycles.length > 0) {
      report.push("❌ CIRCULAR DEPENDENCIES DETECTED:");
      report.push("");

      cycles.forEach((cycle, index) => {
        report.push(`Cycle ${index + 1}: ${cycle.join(" → ")} → ${cycle[0]}`);
      });

      report.push("");
      report.push(
        "⚠️  These circular dependencies must be resolved before deployment.",
      );
    } else {
      report.push(
        "✅ No circular dependencies found. Service dependency graph is valid.",
      );
    }

    report.push("");
    report.push("📋 DEPENDENCY ANALYSIS:");

    // Group dependencies by service
    const serviceMap = new Map<string, string[]>();
    for (const dep of dependencies) {
      if (!serviceMap.has(dep.serviceId)) {
        serviceMap.set(dep.serviceId, []);
      }
      serviceMap.get(dep.serviceId)!.push(dep.dependentServiceId);
    }

    serviceMap.forEach((deps, serviceId) => {
      report.push(`   • Service ${serviceId} depends on: ${deps.join(", ")}`);
    });

    return report.join("\n");
  }
}

// =============================================================================
// SERVICE BUSINESS LOGIC VALIDATION
// =============================================================================

/**
 * Validates service configuration and business rules
 */
export class ServiceBusinessValidator {
  /**
   * Validates service pricing configuration
   */
  async validateServicePricing(serviceData: {
    pricingModel: string;
    basePrice: string;
    minHours?: number;
    maxHours?: number;
    complexityMultiplier?: Record<string, number>;
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate base price
    const basePrice = parseFloat(serviceData.basePrice);
    if (Number.isNaN(basePrice) || basePrice < 0) {
      errors.push("Base price must be a valid positive number");
    }

    // Validate pricing model specific rules
    switch (serviceData.pricingModel) {
      case "hourly":
      case "project":
        if (!serviceData.minHours || serviceData.minHours <= 0) {
          errors.push(
            `${serviceData.pricingModel} pricing requires valid min_hours`,
          );
        }
        if (
          serviceData.maxHours &&
          serviceData.minHours &&
          serviceData.maxHours < serviceData.minHours
        ) {
          errors.push("max_hours must be greater than min_hours");
        }
        break;

      case "monthly":
        if (basePrice < 10) {
          errors.push(
            "Monthly services should have a minimum base price of €10",
          );
        }
        break;

      case "fixed":
        // Fixed pricing is straightforward, just validate base price
        break;

      default:
        errors.push(`Invalid pricing model: ${serviceData.pricingModel}`);
    }

    // Validate complexity multipliers
    if (serviceData.complexityMultiplier) {
      const requiredLevels = ["basic", "standard", "premium"];
      for (const level of requiredLevels) {
        const multiplier = serviceData.complexityMultiplier[level];
        if (typeof multiplier !== "number" || multiplier <= 0) {
          errors.push(
            `Invalid complexity multiplier for ${level}: must be positive number`,
          );
        }
      }

      // Validate logical progression
      const basic = serviceData.complexityMultiplier.basic || 1;
      const standard = serviceData.complexityMultiplier.standard || 1;
      const premium = serviceData.complexityMultiplier.premium || 1;

      if (standard < basic || premium < standard) {
        errors.push(
          "Complexity multipliers must progress: basic ≤ standard ≤ premium",
        );
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates service categorization and metadata
   */
  async validateServiceMetadata(serviceData: {
    name: string;
    slug: string;
    categoryId: string;
    tags?: string[];
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate name
    if (!serviceData.name || serviceData.name.length < 3) {
      errors.push("Service name must be at least 3 characters long");
    }

    // Validate slug format
    const slugRegex = /^[a-z0-9-]+$/;
    if (!serviceData.slug || !slugRegex.test(serviceData.slug)) {
      errors.push(
        "Service slug must contain only lowercase letters, numbers, and hyphens",
      );
    }

    // Check if category exists
    const categoryExists = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.categoryId, serviceData.categoryId))
      .limit(1);

    if (categoryExists.length === 0) {
      // This might be a new category, so we should check service_categories table
      // For now, we'll skip this validation as it requires more complex logic
    }

    // Validate tags
    if (serviceData.tags) {
      for (const tag of serviceData.tags) {
        if (typeof tag !== "string" || tag.length === 0) {
          errors.push("All tags must be non-empty strings");
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates instances of validators for easy use
 */
export const createServiceValidators = () => ({
  dependency: new ServiceDependencyValidator(),
  business: new ServiceBusinessValidator(),
});

/**
 * Validates a complete service before insertion/update
 */
export const validateCompleteService = async (serviceData: any) => {
  const validators = createServiceValidators();

  const [pricingValidation, metadataValidation] = await Promise.all([
    validators.business.validateServicePricing(serviceData),
    validators.business.validateServiceMetadata(serviceData),
  ]);

  const allErrors = [...pricingValidation.errors, ...metadataValidation.errors];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    details: {
      pricing: pricingValidation,
      metadata: metadataValidation,
    },
  };
};

// Export default validator instance
export const serviceValidator = createServiceValidators();
