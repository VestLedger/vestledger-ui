# API Layer

## Overview

This directory contains the API client, error handling utilities, and type definitions for the VestLedger API.

## Directory Structure

```
src/api/
├── client.ts          # OpenAPI fetch client configuration
├── errors.ts          # Error extraction and handling utilities
├── unwrap.ts          # Response unwrapping utility
└── generated/
    └── openapi.ts     # Generated TypeScript types from OpenAPI spec
```

## Client Usage

### Basic GET Request

```typescript
import { apiClient, authHeaders } from '@/api/client';
import { unwrap } from '@/api/unwrap';

async function fetchFunds(token: string) {
  const data = await unwrap(
    apiClient.GET('/api/v1/funds', {
      headers: authHeaders(token),
    })
  );
  return data;
}
```

### POST Request with Body

```typescript
async function createDistribution(token: string, distribution: CreateDistributionRequest) {
  const data = await unwrap(
    apiClient.POST('/api/v1/distributions', {
      headers: authHeaders(token),
      body: distribution,
    })
  );
  return data;
}
```

### With Query Parameters

```typescript
async function searchInvestors(token: string, query: string) {
  const data = await unwrap(
    apiClient.GET('/api/v1/investors', {
      headers: authHeaders(token),
      params: { query: { search: query, limit: 20 } },
    })
  );
  return data;
}
```

## Error Handling

### Supported Error Formats

The API layer handles multiple error response formats:

#### 1. RFC7807 Problem Details

```json
{
  "type": "https://api.vestledger.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "The request body contains invalid data",
  "instance": "/api/v1/distributions/123",
  "errors": [
    { "field": "amount", "message": "Must be positive" }
  ]
}
```

#### 2. Standard Error Response

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid distribution amount",
    "requestId": "req_abc123"
  }
}
```

#### 3. GraphQL Errors

```json
{
  "errors": [
    {
      "message": "Not authorized",
      "extensions": { "code": "UNAUTHORIZED" }
    }
  ]
}
```

### Error Extraction

```typescript
import { extractErrorMessage, extractErrorCode, extractRequestId } from '@/api/errors';

try {
  await apiCall();
} catch (error) {
  const message = extractErrorMessage(error);  // User-friendly message
  const code = extractErrorCode(error);        // Error code for logic
  const requestId = extractRequestId(error);   // For support tickets
}
```

### Field-Level Error Handling

For form validation, use the field error utilities:

```typescript
import { useFieldErrors } from '@/utils/errors/fieldErrors';

function MyForm() {
  const { error } = useSelector(selectSaveError);
  const { getError, hasError, hasAnyErrors } = useFieldErrors(error);

  return (
    <form>
      <Input
        name="amount"
        isInvalid={hasError('amount')}
        errorMessage={getError('amount')}
      />
      {hasAnyErrors && <Alert>Please fix the errors above</Alert>}
    </form>
  );
}
```

## Type Generation

### Prerequisites

- OpenAPI spec available at API endpoint or as local file
- `openapi-typescript` package installed

### Generate Types

```bash
# From remote spec
npx openapi-typescript https://api.vestledger.com/openapi.json \
  -o src/api/generated/openapi.ts

# From local spec
npx openapi-typescript ./api-spec.json \
  -o src/api/generated/openapi.ts
```

### Add to package.json

```json
{
  "scripts": {
    "api:generate": "openapi-typescript https://api.vestledger.com/openapi.json -o src/api/generated/openapi.ts"
  }
}
```

## Service Layer Pattern

### Creating a New Service

Services wrap API calls with business logic and provide typed interfaces.

```typescript
// src/services/example/exampleService.ts
import { apiClient, authHeaders } from '@/api/client';
import { unwrap } from '@/api/unwrap';

export async function fetchExamples(token: string): Promise<Example[]> {
  return unwrap(
    apiClient.GET('/api/v1/examples', {
      headers: authHeaders(token),
    })
  );
}

export async function createExample(
  token: string,
  data: CreateExampleRequest
): Promise<Example> {
  return unwrap(
    apiClient.POST('/api/v1/examples', {
      headers: authHeaders(token),
      body: data,
    })
  );
}
```

### Service Organization

```
src/services/
├── auth/
│   └── authService.ts
├── backOffice/
│   ├── distributionService.ts
│   └── waterfallService.ts
├── funds/
│   └── fundsService.ts
└── investors/
    └── investorService.ts
```

## Authentication

### Token Management

Tokens are managed via the auth context and stored in cookies for SSR support.

```typescript
import { useAuth } from '@/contexts/auth-context';

function MyComponent() {
  const { token } = useAuth();

  // Use token in API calls
  const data = await fetchFunds(token);
}
```

### Auth Headers Helper

```typescript
import { authHeaders } from '@/api/client';

// Returns undefined if no token (for public endpoints)
// Returns { Authorization: 'Bearer <token>' } if token exists
const headers = authHeaders(token);
```

### Protected vs Public Endpoints

```typescript
// Protected endpoint - requires auth
async function fetchUserProfile(token: string) {
  return unwrap(
    apiClient.GET('/api/v1/me', {
      headers: authHeaders(token), // Required
    })
  );
}

// Public endpoint - no auth needed
async function fetchPublicFunds() {
  return unwrap(
    apiClient.GET('/api/v1/public/funds', {
      // No headers needed
    })
  );
}
```

## Error Handling in Sagas

Redux sagas should use `normalizeError` for consistent error handling:

```typescript
import { normalizeError } from '@/store/utils/normalizeError';
import { errorTracking } from '@/lib/errorTracking';

function* loadDataWorker(action: PayloadAction<string>): SagaIterator {
  try {
    const data = yield call(fetchData, action.payload);
    yield put(dataLoaded(data));
  } catch (error: unknown) {
    errorTracking.captureException(error as Error, {
      extra: { context: 'loadDataWorker', id: action.payload },
    });
    yield put(dataFailed(normalizeError(error)));
  }
}
```

## Best Practices

1. **Always use `unwrap`** - It handles response unwrapping and error extraction
2. **Always use `authHeaders`** - For protected endpoints
3. **Use `normalizeError`** - For consistent error shapes in Redux
4. **Capture to errorTracking** - For monitoring and debugging
5. **Type your responses** - Use generated OpenAPI types when available
