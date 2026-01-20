/**
 * Field-Level Error Handling Utilities
 *
 * Utilities for extracting and managing field-level validation errors
 * from API responses for form validation.
 */

import { useMemo } from 'react';
import type { NormalizedError } from '@/store/types/AsyncState';

export interface FieldError {
  field: string;
  message: string;
  code?: string;
}

export interface FieldErrors {
  [field: string]: string[];
}

interface ValidationError {
  field?: string;
  message: string;
  code?: string;
}

/**
 * Extract field-level errors from a NormalizedError
 * Handles various API error response formats
 */
export function extractFieldErrors(error: NormalizedError | undefined | null): FieldErrors {
  if (!error) return {};

  const fieldErrors: FieldErrors = {};

  // Handle validation errors array from details
  const details = error.details as {
    validationErrors?: ValidationError[];
    errors?: ValidationError[];
    fields?: Record<string, string | string[]>;
  } | undefined;

  // Format 1: validationErrors array
  if (details?.validationErrors && Array.isArray(details.validationErrors)) {
    for (const ve of details.validationErrors) {
      const field = ve.field || 'general';
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(ve.message);
    }
  }

  // Format 2: errors array (common in GraphQL)
  if (details?.errors && Array.isArray(details.errors)) {
    for (const ve of details.errors) {
      const field = ve.field || 'general';
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(ve.message);
    }
  }

  // Format 3: fields object (common in REST validation)
  if (details?.fields && typeof details.fields === 'object') {
    for (const [field, messages] of Object.entries(details.fields)) {
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      if (Array.isArray(messages)) {
        fieldErrors[field].push(...messages);
      } else if (typeof messages === 'string') {
        fieldErrors[field].push(messages);
      }
    }
  }

  // Format 4: Single field error from NormalizedError
  if (error.field && error.message) {
    if (!fieldErrors[error.field]) {
      fieldErrors[error.field] = [];
    }
    fieldErrors[error.field].push(error.message);
  }

  // If no field-level errors found, put the general message under 'general'
  if (Object.keys(fieldErrors).length === 0 && error.message) {
    fieldErrors.general = [error.message];
  }

  return fieldErrors;
}

/**
 * Get the first error message for a specific field
 */
export function getFieldError(errors: FieldErrors, field: string): string | undefined {
  return errors[field]?.[0];
}

/**
 * Get all error messages for a specific field
 */
export function getFieldErrors(errors: FieldErrors, field: string): string[] {
  return errors[field] ?? [];
}

/**
 * Check if a field has any errors
 */
export function hasFieldError(errors: FieldErrors, field: string): boolean {
  return (errors[field]?.length ?? 0) > 0;
}

/**
 * Check if there are any field errors
 */
export function hasAnyFieldErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Get all field names that have errors
 */
export function getErrorFields(errors: FieldErrors): string[] {
  return Object.keys(errors).filter((field) => errors[field].length > 0);
}

/**
 * React hook for working with field errors from a NormalizedError
 * Provides memoized helpers for form validation UI
 */
export function useFieldErrors(error: NormalizedError | undefined | null) {
  const fieldErrors = useMemo(() => extractFieldErrors(error), [error]);

  return useMemo(
    () => ({
      fieldErrors,
      getError: (field: string) => getFieldError(fieldErrors, field),
      getAllErrors: (field: string) => getFieldErrors(fieldErrors, field),
      hasError: (field: string) => hasFieldError(fieldErrors, field),
      hasAnyErrors: hasAnyFieldErrors(fieldErrors),
      errorFields: getErrorFields(fieldErrors),
      generalError: getFieldError(fieldErrors, 'general'),
    }),
    [fieldErrors]
  );
}

/**
 * Helper to create field error props for form inputs
 * Compatible with most UI component libraries
 */
export function getFieldErrorProps(
  errors: FieldErrors,
  field: string
): { isInvalid: boolean; errorMessage?: string } {
  const hasError = hasFieldError(errors, field);
  return {
    isInvalid: hasError,
    errorMessage: hasError ? getFieldError(errors, field) : undefined,
  };
}
