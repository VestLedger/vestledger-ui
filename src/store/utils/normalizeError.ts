import type { NormalizedError } from "../types/AsyncState";
import { ApiError, normalizeApiError } from "@/api/errors";

type GraphQLExtensions = Record<
  string,
  string | number | boolean | null | undefined | object
>;

type GraphQLErrorLike = {
  message?: string;
  extensions?: GraphQLExtensions;
};

type GraphQLErrorContainer = {
  graphQLErrors?: GraphQLErrorLike[];
};

type ErrorWithCode = Error & { code?: string };

type ApiErrorLike = {
  message?: string;
  code?: string;
  field?: string;
};

/**
 * Normalize any error into structured format
 * Used by all sagas for consistent error handling
 */
export function normalizeError(error: unknown): NormalizedError {
  if (error instanceof ApiError) {
    return normalizeApiError(error);
  }

  // GraphQL errors
  if (error && typeof error === "object") {
    const graphQLErrorContainer = error as GraphQLErrorContainer;
    if (Array.isArray(graphQLErrorContainer.graphQLErrors)) {
      const gqlError = graphQLErrorContainer.graphQLErrors[0];
      const errorCode =
        typeof gqlError?.extensions?.code === "string"
          ? gqlError.extensions.code
          : undefined;
      return {
        message: gqlError?.message || "GraphQL error",
        code: errorCode,
        details: gqlError?.extensions,
      };
    }

    // Standard Error objects
    if (error instanceof Error) {
      const errorWithCode = error as ErrorWithCode;
      return {
        message: error.message,
        code: errorWithCode.code,
      };
    }

    // API error responses
    const apiError = error as ApiErrorLike;
    if ("message" in error && typeof apiError.message === "string") {
      return {
        message: apiError.message,
        code: apiError.code,
        field: apiError.field,
      };
    }
  }

  // String errors
  if (typeof error === "string") {
    return { message: error };
  }

  // Unknown errors
  return {
    message: "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
    details: error,
  };
}
