import { getApiBaseUrl } from "@/api/config";
import { ApiError } from "@/api/errors";
import type { DataMode } from "@/config/data-mode";
import { getDemoEmail, getDemoPassword } from "@/config/demo-session";
import { createMockUser } from "@/data/mocks/auth";
import type { User, UserRole } from "@/types/auth";
import { MOCK_DEMO_PROFILE } from "@/config/auth";
import type { OperatingRegion } from "@/types/regulatory";

type AuthResponse = {
  access_token: string;
  user?: {
    orgId?: string | null;
    tenantId?: string | null;
    isAdmin?: boolean;
    operatingRegion?: OperatingRegion | null;
    organizationConfigured?: boolean;
  };
};

export type AuthResult = {
  user: User;
  accessToken: string | null;
  sessionType: "demo" | "authenticated";
  dataModeOverride?: DataMode;
};

type JwtPayload = {
  sub: string;
  email: string;
  name?: string;
  role: UserRole;
  orgId?: string;
  tenantId?: string;
  isAdmin?: boolean;
  operatingRegion?: OperatingRegion | null;
  organizationConfigured?: boolean;
};

const DEMO_EMAIL = getDemoEmail();
const DEMO_PASSWORD = getDemoPassword();

function getPasswordVariants(value: string): string[] {
  const variants: string[] = [];
  const queue: string[] = [value.trim()];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || variants.includes(current)) {
      continue;
    }
    variants.push(current);

    // Support escaped-dollar variants from env interpolation layers.
    if (current.includes("$$")) {
      queue.push(current.replace(/\$\$/g, "$"));
    }

    // Support dotenv-style expansion side-effects (e.g. Pa$$w0rd -> Pa$).
    const dotenvExpanded = current.replace(/\$[A-Za-z_][A-Za-z0-9_]*/g, "$");
    if (dotenvExpanded !== current) {
      queue.push(dotenvExpanded);
    }
  }

  return variants;
}

function passwordMatches(input: string, expected: string): boolean {
  const inputVariants = getPasswordVariants(input);
  const expectedVariants = getPasswordVariants(expected);

  return inputVariants.some((variant) => expectedVariants.includes(variant));
}

export function isDemoCredentials(email: string, password: string): boolean {
  if (!DEMO_PASSWORD) {
    return false;
  }
  return (
    email.trim().toLowerCase() === DEMO_EMAIL &&
    passwordMatches(password, DEMO_PASSWORD)
  );
}

function decodeJwt(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid JWT format");
  }
  const payload = parts[1];
  const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(decoded) as JwtPayload;
}

function userFromJwt(token: string, responseUser?: AuthResponse["user"]): User {
  const payload = decodeJwt(token);
  return {
    id: payload.sub,
    name: payload.name ?? payload.email,
    email: payload.email,
    role: payload.role,
    tenantId:
      payload.tenantId ??
      payload.orgId ??
      responseUser?.tenantId ??
      responseUser?.orgId ??
      undefined,
    isAdmin: payload.isAdmin ?? responseUser?.isAdmin ?? false,
    operatingRegion:
      payload.operatingRegion ?? responseUser?.operatingRegion ?? null,
    organizationConfigured:
      payload.organizationConfigured ??
      responseUser?.organizationConfigured ??
      true,
  };
}

async function postAuth(
  path: string,
  body: Record<string, unknown>,
): Promise<AuthResponse> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, "");
  const response = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch((error) => {
    console.error("Failed to parse auth response payload", error);
    return {};
  })) as Partial<AuthResponse> & {
    message?: string | string[];
  };

  if (!response.ok) {
    const message = Array.isArray(payload.message)
      ? payload.message.join(", ")
      : payload.message || response.statusText;
    throw new ApiError({
      message,
      status: response.status,
      details: payload,
    });
  }

  if (!payload.access_token) {
    throw new ApiError({
      message: "No access token in response",
      status: 500,
      details: payload,
    });
  }

  return payload as AuthResponse;
}

export async function authenticateUser(
  email: string,
  password: string,
): Promise<AuthResult> {
  if (isDemoCredentials(email, password)) {
    return {
      user: createMockUser(DEMO_EMAIL!, "gp", {
        id: MOCK_DEMO_PROFILE.id,
        tenantId: MOCK_DEMO_PROFILE.tenantId,
        isAdmin: false,
        operatingRegion: MOCK_DEMO_PROFILE.operatingRegion,
        organizationConfigured: MOCK_DEMO_PROFILE.organizationConfigured,
      }),
      accessToken: MOCK_DEMO_PROFILE.accessToken,
      sessionType: "demo",
      dataModeOverride: "mock",
    };
  }

  // Login-only flow: users must be pre-created by a superuser
  // Role comes from JWT, not from client
  const response = await postAuth("/auth/login", { email, password });
  return {
    user: userFromJwt(response.access_token, response.user),
    accessToken: response.access_token,
    sessionType: "authenticated",
    dataModeOverride: "api",
  };
}
