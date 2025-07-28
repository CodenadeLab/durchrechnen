// =============================================================================
// QUOTATION VALIDATION LIBRARY - Status-Workflow & Business Logic
// =============================================================================

import { db } from "../db/index";
import { quotations, quotationItems, quotationHistory, customers, services } from "../db/schema";
import { eq, and, desc } from "drizzle-orm";

// =============================================================================
// UNIQUE QUOTE NUMBER GENERATOR
// =============================================================================

/**
 * Generates unique quote numbers in format: Q-YYYY-XXX
 * Where YYYY is the current year and XXX is an incrementing number
 */
export class QuoteNumberGenerator {
  
  /**
   * Generates a unique quote number
   */
  async generateQuoteNumber(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `Q-${currentYear}-`;
    
    // Find the highest quote number for current year
    const latestQuote = await db
      .select({ quoteNumber: quotations.quoteNumber })
      .from(quotations)
      .where(eq(quotations.quoteNumber, `${yearPrefix}%`))
      .orderBy(desc(quotations.quoteNumber))
      .limit(1);

    let nextNumber = 1;
    
    if (latestQuote.length > 0) {
      // Extract number from quote like "Q-2024-123" -> 123
      const quoteNumber = latestQuote[0]?.quoteNumber;
      if (quoteNumber) {
        const quoteParts = quoteNumber.split('-');
        const lastNumber = quoteParts[2];
        if (lastNumber) {
          nextNumber = parseInt(lastNumber, 10) + 1;
        }
      }
    }

    // Format with leading zeros (minimum 3 digits)
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    return `${yearPrefix}${formattedNumber}`;
  }

  /**
   * Validates quote number format
   */
  validateQuoteNumberFormat(quoteNumber: string): { isValid: boolean; error?: string } {
    // Format: Q-YYYY-XXX where YYYY is year and XXX is 3+ digit number
    const quoteNumberRegex = /^Q-\d{4}-\d{3,}$/;
    
    if (!quoteNumberRegex.test(quoteNumber)) {
      return { 
        isValid: false, 
        error: "Quote number must be in format Q-YYYY-XXX (e.g., Q-2024-001)" 
      };
    }

    // Validate year is reasonable (not in future, not too old)
    const quoteParts = quoteNumber.split('-');
    const yearStr = quoteParts[1];
    if (!yearStr) {
      return { isValid: false, error: "Invalid quote number format" };
    }
    
    const year = parseInt(yearStr, 10);
    const currentYear = new Date().getFullYear();
    
    if (year > currentYear || year < currentYear - 10) {
      return { 
        isValid: false, 
        error: "Quote year must be within the last 10 years" 
      };
    }

    return { isValid: true };
  }

  /**
   * Checks if quote number is unique
   */
  async isQuoteNumberUnique(quoteNumber: string, excludeQuoteId?: string): Promise<boolean> {
    let query = db
      .select({ id: quotations.id })
      .from(quotations)
      .where(eq(quotations.quoteNumber, quoteNumber));

    const existingQuote = await query.limit(1);
    
    if (existingQuote.length > 0) {
      // If we're updating and it's the same quote, that's ok
      if (excludeQuoteId && existingQuote[0]?.id === excludeQuoteId) {
        return true;
      }
      return false;
    }

    return true;
  }
}

// =============================================================================
// QUOTATION STATUS WORKFLOW VALIDATION
// =============================================================================

/**
 * Manages quotation status transitions and workflow rules
 */
export class QuotationStatusWorkflow {
  
  // Define valid status transitions
  private readonly statusTransitions: Record<string, string[]> = {
    draft: ["sent", "cancelled"],
    sent: ["accepted", "rejected", "expired", "cancelled"],
    accepted: ["cancelled"], // Can only cancel accepted quotes in special cases
    rejected: [], // Final state
    expired: ["sent"], // Can resend expired quotes
    cancelled: [] // Final state
  };

  /**
   * Validates if a status transition is allowed
   */
  validateStatusTransition(
    currentStatus: string,
    newStatus: string
  ): { isValid: boolean; error?: string } {
    
    if (currentStatus === newStatus) {
      return { isValid: true }; // No change
    }

    const allowedTransitions = this.statusTransitions[currentStatus];
    
    if (!allowedTransitions) {
      return { 
        isValid: false, 
        error: `Invalid current status: ${currentStatus}` 
      };
    }

    if (!allowedTransitions.includes(newStatus)) {
      return { 
        isValid: false, 
        error: `Cannot transition from ${currentStatus} to ${newStatus}. Allowed: ${allowedTransitions.join(', ') || 'None'}` 
      };
    }

    return { isValid: true };
  }

  /**
   * Automatically expires quotes that are past their valid_until date
   */
  async expireOverdueQuotes(): Promise<{ expiredCount: number; expiredQuotes: string[] }> {
    const now = new Date();
    
    // Find quotes that should be expired
    const overdueQuotes = await db
      .select({ 
        id: quotations.id, 
        quoteNumber: quotations.quoteNumber,
        validUntil: quotations.validUntil 
      })
      .from(quotations)
      .where(
        and(
          eq(quotations.status, "sent"),
          // validUntil < now (quote is overdue)
        )
      );

    const expiredQuoteNumbers: string[] = [];

    // Update each overdue quote to expired status
    for (const quote of overdueQuotes) {
      if (quote.validUntil < now) {
        await db
          .update(quotations)
          .set({ 
            status: "expired",
            updatedAt: now
          })
          .where(eq(quotations.id, quote.id));

        // Log the status change in history
        await this.logStatusChange(
          quote.id,
          "sent",
          "expired",
          "system",
          "Automatically expired due to overdue date"
        );

        expiredQuoteNumbers.push(quote.quoteNumber);
      }
    }

    return {
      expiredCount: expiredQuoteNumbers.length,
      expiredQuotes: expiredQuoteNumbers
    };
  }

  /**
   * Logs status changes in quotation history
   */
  async logStatusChange(
    quotationId: string,
    oldStatus: string,
    newStatus: string,
    performedBy: string,
    description?: string
  ): Promise<void> {
    await db.insert(quotationHistory).values({
      quotationId,
      action: "updated",
      description: description || `Status changed from ${oldStatus} to ${newStatus}`,
      oldValues: { status: oldStatus },
      newValues: { status: newStatus },
      performedBy,
      performedAt: new Date(),
    });
  }

  /**
   * Gets the complete status workflow for display
   */
  getStatusWorkflow(): Record<string, { 
    allowedTransitions: string[]; 
    description: string; 
    isFinal: boolean 
  }> {
    return {
      draft: {
        allowedTransitions: this.statusTransitions.draft || [],
        description: "Quote is being prepared and can be edited",
        isFinal: false
      },
      sent: {
        allowedTransitions: this.statusTransitions.sent || [],
        description: "Quote has been sent to customer and awaits response",
        isFinal: false
      },
      accepted: {
        allowedTransitions: this.statusTransitions.accepted || [],
        description: "Customer has accepted the quote",
        isFinal: false
      },
      rejected: {
        allowedTransitions: this.statusTransitions.rejected || [],
        description: "Customer has rejected the quote",
        isFinal: true
      },
      expired: {
        allowedTransitions: this.statusTransitions.expired || [],
        description: "Quote validity period has expired",
        isFinal: false
      },
      cancelled: {
        allowedTransitions: this.statusTransitions.cancelled || [],
        description: "Quote has been cancelled",
        isFinal: true
      }
    };
  }
}

// =============================================================================
// QUOTATION BUSINESS LOGIC VALIDATION
// =============================================================================

/**
 * Validates quotation business logic and constraints
 */
export class QuotationBusinessValidator {
  
  /**
   * Validates quotation data before creation/update
   */
  async validateQuotationData(quotationData: {
    title?: string;
    customerId: string;
    validFrom: Date;
    validUntil: Date;
    status: string;
    subtotalAmount: string;
    discountAmount: string;
    taxAmount: string;
    totalAmount: string;
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate customer exists
    const customerExists = await db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.id, quotationData.customerId))
      .limit(1);

    if (customerExists.length === 0) {
      errors.push("Customer does not exist");
    }

    // Validate title
    if (quotationData.title && quotationData.title.length > 200) {
      errors.push("Quote title cannot exceed 200 characters");
    }

    // Validate date range
    if (quotationData.validFrom >= quotationData.validUntil) {
      errors.push("Valid from date must be before valid until date");
    }

    const now = new Date();
    if (quotationData.validUntil <= now) {
      errors.push("Valid until date must be in the future");
    }

    // Validate amounts
    const subtotal = parseFloat(quotationData.subtotalAmount);
    const discount = parseFloat(quotationData.discountAmount);
    const tax = parseFloat(quotationData.taxAmount);
    const total = parseFloat(quotationData.totalAmount);

    if (isNaN(subtotal) || subtotal < 0) {
      errors.push("Subtotal amount must be a valid positive number");
    }

    if (isNaN(discount) || discount < 0) {
      errors.push("Discount amount must be a valid positive number");
    }

    if (isNaN(tax) || tax < 0) {
      errors.push("Tax amount must be a valid positive number");
    }

    if (isNaN(total) || total < 0) {
      errors.push("Total amount must be a valid positive number");
    }

    // Validate calculation logic
    if (!isNaN(subtotal) && !isNaN(discount) && !isNaN(tax) && !isNaN(total)) {
      const expectedTotal = subtotal - discount + tax;
      const tolerance = 0.01; // 1 cent tolerance for rounding
      
      if (Math.abs(total - expectedTotal) > tolerance) {
        errors.push(`Total amount (${total}) doesn't match calculation (${expectedTotal.toFixed(2)})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates quotation items
   */
  async validateQuotationItems(items: Array<{
    serviceId: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    discountPercentage?: string;
    discountAmount?: string;
    finalPrice: string;
  }>): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    if (items.length === 0) {
      errors.push("Quotation must have at least one item");
    }

    // Validate each item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item) continue;
      
      const itemPrefix = `Item ${i + 1}:`;

      // Validate service exists
      const serviceExists = await db
        .select({ id: services.id })
        .from(services)
        .where(eq(services.id, item.serviceId))
        .limit(1);

      if (serviceExists.length === 0) {
        errors.push(`${itemPrefix} Service does not exist`);
        continue;
      }

      // Validate quantity
      if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
        errors.push(`${itemPrefix} Quantity must be a positive integer`);
      }

      // Validate prices
      const unitPrice = parseFloat(item.unitPrice);
      const totalPrice = parseFloat(item.totalPrice);
      const finalPrice = parseFloat(item.finalPrice);

      if (isNaN(unitPrice) || unitPrice < 0) {
        errors.push(`${itemPrefix} Unit price must be a valid positive number`);
      }

      if (isNaN(totalPrice) || totalPrice < 0) {
        errors.push(`${itemPrefix} Total price must be a valid positive number`);
      }

      if (isNaN(finalPrice) || finalPrice < 0) {
        errors.push(`${itemPrefix} Final price must be a valid positive number`);
      }

      // Validate calculation
      if (!isNaN(unitPrice) && !isNaN(totalPrice)) {
        const expectedTotal = unitPrice * item.quantity;
        const tolerance = 0.01;
        
        if (Math.abs(totalPrice - expectedTotal) > tolerance) {
          errors.push(`${itemPrefix} Total price doesn't match unit price × quantity`);
        }
      }

      // Validate discount calculation
      if (item.discountPercentage || item.discountAmount) {
        if (item.discountPercentage && item.discountAmount) {
          errors.push(`${itemPrefix} Cannot have both percentage and fixed discount`);
        }

        if (item.discountPercentage) {
          const discountPct = parseFloat(item.discountPercentage);
          if (isNaN(discountPct) || discountPct < 0 || discountPct > 100) {
            errors.push(`${itemPrefix} Discount percentage must be between 0 and 100`);
          }
        }

        if (item.discountAmount) {
          const discountAmt = parseFloat(item.discountAmount);
          if (isNaN(discountAmt) || discountAmt < 0) {
            errors.push(`${itemPrefix} Discount amount must be a positive number`);
          }
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validates quotation versioning rules
   */
  async validateVersioning(quotationData: {
    parentQuoteId?: string;
    version: number;
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // If this is a revision (has parent), validate parent exists
    if (quotationData.parentQuoteId) {
      const parentExists = await db
        .select({ id: quotations.id, version: quotations.version })
        .from(quotations)
        .where(eq(quotations.id, quotationData.parentQuoteId))
        .limit(1);

      if (parentExists.length === 0) {
        errors.push("Parent quotation does not exist");
      } else {
        // Version should be parent version + 1
        const parentVersion = parentExists[0]?.version;
        if (parentVersion !== undefined) {
          const expectedVersion = parentVersion + 1;
          if (quotationData.version !== expectedVersion) {
            errors.push(`Version should be ${expectedVersion} (parent version + 1)`);
          }
        }
      }
    } else {
      // If no parent, version should be 1
      if (quotationData.version !== 1) {
        errors.push("Initial quotation version must be 1");
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Creates validator instances for easy use
 */
export const createQuotationValidators = () => ({
  quoteNumber: new QuoteNumberGenerator(),
  statusWorkflow: new QuotationStatusWorkflow(),
  business: new QuotationBusinessValidator(),
});

/**
 * Validates complete quotation before database operations
 */
export const validateCompleteQuotation = async (quotationData: {
  title?: string;
  customerId: string;
  validFrom: Date;
  validUntil: Date;
  status: string;
  subtotalAmount: string;
  discountAmount: string;
  taxAmount: string;
  totalAmount: string;
  parentQuoteId?: string;
  version: number;
  items: Array<{
    serviceId: string;
    quantity: number;
    unitPrice: string;
    totalPrice: string;
    discountPercentage?: string;
    discountAmount?: string;
    finalPrice: string;
  }>;
}) => {
  const validators = createQuotationValidators();
  
  const [businessValidation, itemsValidation, versioningValidation] = await Promise.all([
    validators.business.validateQuotationData(quotationData),
    validators.business.validateQuotationItems(quotationData.items),
    validators.business.validateVersioning(quotationData),
  ]);

  const allErrors = [
    ...businessValidation.errors,
    ...itemsValidation.errors,
    ...versioningValidation.errors,
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    details: {
      business: businessValidation,
      items: itemsValidation,
      versioning: versioningValidation,
    }
  };
};

// Export default validator instance
export const quotationValidator = createQuotationValidators();