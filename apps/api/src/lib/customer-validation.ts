// =============================================================================
// CUSTOMER VALIDATION LIBRARY - E-Mail, Telefon & Business Logic
// =============================================================================

import { eq } from "drizzle-orm";
import { db } from "../db/index";
import { customerContacts, customers } from "../db/schema";

// =============================================================================
// EMAIL & PHONE VALIDATION
// =============================================================================

/**
 * Validates email addresses using RFC 5322 compliant regex
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "Email is required" };
  }

  // RFC 5322 compliant email regex (simplified but robust)
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: "Invalid email format" };
  }

  // Additional business rules
  if (email.length > 254) {
    return { isValid: false, error: "Email too long (max 254 characters)" };
  }

  const emailParts = email.split("@");
  if (emailParts.length !== 2) {
    return { isValid: false, error: "Invalid email format" };
  }

  const [localPart, domain] = emailParts;
  if (!localPart || !domain) {
    return { isValid: false, error: "Invalid email format" };
  }

  if (localPart.length > 64) {
    return {
      isValid: false,
      error: "Email local part too long (max 64 characters)",
    };
  }

  // Check for blocked domains (spam/temporary email providers)
  const blockedDomains = [
    "tempmail.org",
    "10minutemail.com",
    "guerrillamail.com",
    "mailinator.com",
    "throwaway.email",
  ];

  if (blockedDomains.includes(domain.toLowerCase())) {
    return {
      isValid: false,
      error: "Temporary email addresses are not allowed",
    };
  }

  return { isValid: true };
}

/**
 * Validates phone numbers (German and international formats)
 */
export function validatePhone(phone: string): {
  isValid: boolean;
  error?: string;
  normalizedPhone?: string;
} {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: "Phone number is required" };
  }

  // Remove all non-digit characters except + for international prefix
  const cleanPhone = phone.replace(/[\s\-().]/g, "");

  // German mobile numbers: +49 1XX XXXXXXXX or 01XX XXXXXXXX
  const germanMobileRegex = /^(\+49|0049|0)1[5-7][0-9]{8,9}$/;

  // German landline numbers: +49 XXX XXXXXXX or 0XXX XXXXXXX
  const germanLandlineRegex = /^(\+49|0049|0)[2-9][0-9]{1,4}[0-9]{4,8}$/;

  // International format: +XX XXXXXXXXX (simplified)
  const internationalRegex = /^\+[1-9][0-9]{6,14}$/;

  if (germanMobileRegex.test(cleanPhone)) {
    // Normalize German mobile number to international format
    const normalizedPhone = cleanPhone.startsWith("+49")
      ? cleanPhone
      : cleanPhone.replace(/^(0049|0)/, "+49");
    return { isValid: true, normalizedPhone };
  }

  if (germanLandlineRegex.test(cleanPhone)) {
    // Normalize German landline to international format
    const normalizedPhone = cleanPhone.startsWith("+49")
      ? cleanPhone
      : cleanPhone.replace(/^(0049|0)/, "+49");
    return { isValid: true, normalizedPhone };
  }

  if (internationalRegex.test(cleanPhone)) {
    return { isValid: true, normalizedPhone: cleanPhone };
  }

  return {
    isValid: false,
    error:
      "Invalid phone number format. Please use German (+49...) or international (+XX...) format",
  };
}

// =============================================================================
// CUSTOMER BUSINESS LOGIC VALIDATION
// =============================================================================

/**
 * Validates customer business logic and constraints
 */
export class CustomerBusinessValidator {
  /**
   * Validates customer data before creation/update
   */
  async validateCustomerData(customerData: {
    name: string;
    email: string;
    phone?: string;
    segment: "private" | "sme" | "enterprise";
    companyName?: string;
    taxId?: string;
    commercialRegister?: string;
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate name
    if (!customerData.name || customerData.name.trim().length < 2) {
      errors.push("Customer name must be at least 2 characters long");
    }

    if (customerData.name.length > 100) {
      errors.push("Customer name must not exceed 100 characters");
    }

    // Validate email
    const emailValidation = validateEmail(customerData.email);
    if (!emailValidation.isValid) {
      errors.push(`Email validation failed: ${emailValidation.error}`);
    }

    // Validate phone if provided
    if (customerData.phone) {
      const phoneValidation = validatePhone(customerData.phone);
      if (!phoneValidation.isValid) {
        errors.push(`Phone validation failed: ${phoneValidation.error}`);
      }
    }

    // Segment-specific validations
    switch (customerData.segment) {
      case "private":
        // Private customers should not have company-specific fields
        if (
          customerData.companyName ||
          customerData.taxId ||
          customerData.commercialRegister
        ) {
          errors.push("Private customers cannot have company information");
        }
        break;

      case "sme":
        // SME customers should have company name
        if (
          !customerData.companyName ||
          customerData.companyName.trim().length < 2
        ) {
          errors.push("SME customers must have a valid company name");
        }
        break;

      case "enterprise":
        // Enterprise customers must have complete company information
        if (
          !customerData.companyName ||
          customerData.companyName.trim().length < 2
        ) {
          errors.push("Enterprise customers must have a valid company name");
        }

        if (!customerData.taxId || customerData.taxId.trim().length < 5) {
          errors.push("Enterprise customers must have a valid tax ID");
        }

        // Validate German tax ID format (DE + 9 digits)
        if (customerData.taxId && !/^DE[0-9]{9}$/.test(customerData.taxId)) {
          errors.push("Tax ID must be in German format (DE + 9 digits)");
        }
        break;

      default:
        errors.push("Invalid customer segment");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates customer contact information
   */
  async validateCustomerContact(contactData: {
    customerId: string;
    name: string;
    email: string;
    phone?: string;
    role: "primary" | "technical" | "billing" | "decision_maker" | "other";
    isPrimary: boolean;
  }): Promise<{ isValid: boolean; errors: string[] }> {
    const errors: string[] = [];

    // Validate name
    if (!contactData.name || contactData.name.trim().length < 2) {
      errors.push("Contact name must be at least 2 characters long");
    }

    // Validate email
    const emailValidation = validateEmail(contactData.email);
    if (!emailValidation.isValid) {
      errors.push(`Email validation failed: ${emailValidation.error}`);
    }

    // Validate phone if provided
    if (contactData.phone) {
      const phoneValidation = validatePhone(contactData.phone);
      if (!phoneValidation.isValid) {
        errors.push(`Phone validation failed: ${phoneValidation.error}`);
      }
    }

    // Business rule: Only one primary contact per customer
    if (contactData.isPrimary) {
      const existingPrimaryContact = await db
        .select({ id: customerContacts.id })
        .from(customerContacts)
        .where(eq(customerContacts.customerId, contactData.customerId))
        .limit(1);

      if (existingPrimaryContact.length > 0) {
        errors.push("Customer already has a primary contact");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validates email uniqueness across customers
   */
  async validateEmailUniqueness(
    email: string,
    excludeCustomerId?: string,
  ): Promise<{ isUnique: boolean; error?: string }> {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { isUnique: false, error: emailValidation.error };
    }

    const query = db
      .select({ id: customers.id })
      .from(customers)
      .where(eq(customers.email, email.toLowerCase()));

    const existingCustomer = await query.limit(1);

    if (existingCustomer.length > 0) {
      // If we're updating and it's the same customer, that's ok
      if (excludeCustomerId && existingCustomer[0]?.id === excludeCustomerId) {
        return { isUnique: true };
      }
      return {
        isUnique: false,
        error: "Email already exists for another customer",
      };
    }

    return { isUnique: true };
  }

  /**
   * Validates address information (German addresses)
   */
  validateAddress(address: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (address.street && address.street.length < 5) {
      errors.push("Street address must be at least 5 characters long");
    }

    if (address.city && address.city.length < 2) {
      errors.push("City must be at least 2 characters long");
    }

    // Validate German postal code
    if (address.postalCode) {
      if (!/^[0-9]{5}$/.test(address.postalCode)) {
        errors.push("German postal code must be exactly 5 digits");
      }
    }

    if (
      address.country &&
      !["Deutschland", "Germany", "DE"].includes(address.country)
    ) {
      errors.push("Currently only German addresses are supported");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

// =============================================================================
// CUSTOMER SEGMENTS VALIDATION
// =============================================================================

/**
 * Validates customer segment transitions and rules
 */
export class CustomerSegmentValidator {
  /**
   * Validates if a customer segment transition is allowed
   */
  validateSegmentTransition(
    currentSegment: "private" | "sme" | "enterprise",
    newSegment: "private" | "sme" | "enterprise",
  ): { isValid: boolean; error?: string } {
    // Define allowed transitions
    const allowedTransitions: Record<
      "private" | "sme" | "enterprise",
      ("private" | "sme" | "enterprise")[]
    > = {
      private: ["sme"], // Private can upgrade to SME
      sme: ["enterprise"], // SME can upgrade to Enterprise
      enterprise: [], // Enterprise cannot downgrade
    };

    if (currentSegment === newSegment) {
      return { isValid: true }; // No change
    }

    if (allowedTransitions[currentSegment].includes(newSegment)) {
      return { isValid: true };
    }

    return {
      isValid: false,
      error: `Segment transition from ${currentSegment} to ${newSegment} is not allowed. Only upgrades are permitted.`,
    };
  }

  /**
   * Validates segment-specific pricing rules
   */
  validateSegmentPricingRules(
    segment: "private" | "sme" | "enterprise",
    customPricingRules?: Record<string, string | number | boolean>,
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!customPricingRules) {
      return { isValid: true, errors: [] };
    }

    // Validate discount percentages
    if (customPricingRules.discountPercentage) {
      const discount = Number(customPricingRules.discountPercentage);

      if (Number.isNaN(discount) || discount < 0 || discount > 100) {
        errors.push("Discount percentage must be between 0 and 100");
      }

      // Segment-specific discount limits
      const maxDiscounts = { private: 5, sme: 15, enterprise: 25 };
      if (discount > maxDiscounts[segment]) {
        errors.push(
          `Maximum discount for ${segment} customers is ${maxDiscounts[segment]}%`,
        );
      }
    }

    // Validate fixed discount amounts
    if (customPricingRules.fixedDiscount) {
      const fixedDiscount = Number(customPricingRules.fixedDiscount);

      if (Number.isNaN(fixedDiscount) || fixedDiscount < 0) {
        errors.push("Fixed discount must be a positive number");
      }

      // Segment-specific limits
      const maxFixedDiscounts = { private: 100, sme: 1000, enterprise: 5000 };
      if (fixedDiscount > maxFixedDiscounts[segment]) {
        errors.push(
          `Maximum fixed discount for ${segment} customers is €${maxFixedDiscounts[segment]}`,
        );
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
 * Creates validator instances for easy use
 */
export const createCustomerValidators = () => ({
  business: new CustomerBusinessValidator(),
  segment: new CustomerSegmentValidator(),
});

/**
 * Validates complete customer data before database operations
 */
export const validateCompleteCustomer = async (customerData: {
  name: string;
  email: string;
  phone?: string;
  segment: "private" | "sme" | "enterprise";
  companyName?: string;
  taxId?: string;
  commercialRegister?: string;
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  customPricingRules?: Record<string, string | number | boolean>;
}) => {
  const validators = createCustomerValidators();

  const [
    businessValidation,
    segmentValidation,
    addressValidation,
    emailUniqueness,
  ] = await Promise.all([
    validators.business.validateCustomerData(customerData),
    validators.segment.validateSegmentPricingRules(
      customerData.segment,
      customerData.customPricingRules,
    ),
    Promise.resolve(
      customerData.address
        ? validators.business.validateAddress(customerData.address)
        : { isValid: true, errors: [] },
    ),
    validators.business.validateEmailUniqueness(customerData.email),
  ]);

  const allErrors = [
    ...businessValidation.errors,
    ...segmentValidation.errors,
    ...addressValidation.errors,
    ...(emailUniqueness.isUnique
      ? []
      : [emailUniqueness.error || "Email validation failed"]),
  ];

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    details: {
      business: businessValidation,
      segment: segmentValidation,
      address: addressValidation,
      emailUniqueness,
    },
  };
};

// Export default validator instance
export const customerValidator = createCustomerValidators();
