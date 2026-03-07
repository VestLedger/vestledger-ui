import { call, put, takeLatest } from "redux-saga/effects";
import {
  authenticateUser,
  isDemoCredentials,
  type AuthResult,
} from "@/services/authService";
import type { User } from "@/types/auth";
import {
  authHydrated,
  loggedOut,
  loginFailed,
  loginRequested,
  loginSucceeded,
  logoutRequested,
} from "@/store/slices/authSlice";
import { safeLocalStorage } from "@/lib/storage/safeLocalStorage";
import { normalizeError } from "@/store/utils/normalizeError";
import { logger } from "@/lib/logger";
import { clearAuthenticatedAppCaches } from "@/services/internal/clearAuthenticatedAppCaches";
import { DATA_MODE_OVERRIDE_KEY, type DataMode } from "@/config/data-mode";
import { isDemoUser } from "@/config/demo-session";
import {
  AUTH_COOKIE_MAX_AGE_SECONDS,
  AUTH_HYDRATION_TIMEOUT_MS,
} from "@/config/auth";
import { getAuthCookieDomain } from "@/utils/auth/cookie-domain";

const STORAGE_AUTH_KEY = "isAuthenticated";
const STORAGE_USER_KEY = "user";
const STORAGE_TOKEN_KEY = "accessToken";
const STORAGE_ARCHIVED_FUND_IDS = "vestledger-archived-fund-ids";
function getCookieValue(name: string): string | null {
  if (typeof document === "undefined") return null;
  const prefix = `${name}=`;
  const entries = document.cookie.split(";");
  for (const entry of entries) {
    const trimmed = entry.trim();
    if (trimmed.startsWith(prefix)) {
      return trimmed.slice(prefix.length);
    }
  }
  return null;
}

function parseCookieUser(): Partial<User> | null {
  const raw = getCookieValue("user");
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw)) as Partial<User>;
  } catch {
    return null;
  }
}

function isValidPersistedUser(
  user: Partial<User> | null | undefined,
): user is Partial<User> & Pick<User, "email" | "name" | "role"> {
  return Boolean(user?.email && user?.name && user?.role);
}

function normalizeUser(
  user: Partial<User> & Pick<User, "email" | "name" | "role">,
): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    tenantId: user.tenantId,
    isAdmin: user.isAdmin,
    operatingRegion: user.operatingRegion,
    organizationConfigured: user.organizationConfigured,
  };
}

function isKnownMockUser(user: User): boolean {
  return isDemoUser(user);
}

function resolveHydratedDataMode(
  storageModeRaw: string | null,
  cookieModeRaw: string | null,
  user: User,
): DataMode | null {
  if (isKnownMockUser(user)) {
    return "mock";
  }
  // Authenticated non-demo sessions should always default to API mode
  // regardless of stale local/cookie overrides.
  void storageModeRaw;
  void cookieModeRaw;
  return "api";
}

function setAuthCookies(user: User, accessToken?: string | null) {
  if (typeof document === "undefined") return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : "";
  document.cookie = `isAuthenticated=true; path=/${domainAttribute}; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/${domainAttribute}; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  if (accessToken) {
    document.cookie = `accessToken=${encodeURIComponent(accessToken)}; path=/${domainAttribute}; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
  }
}

function setDataModeCookie(mode: DataMode) {
  if (typeof document === "undefined") return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : "";
  document.cookie = `${DATA_MODE_OVERRIDE_KEY}=${mode}; path=/${domainAttribute}; max-age=${AUTH_COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`;
}

function clearAuthCookies() {
  if (typeof document === "undefined") return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : "";
  document.cookie = `isAuthenticated=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `user=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `accessToken=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function clearDataModeCookie() {
  if (typeof document === "undefined") return;
  const domain = getAuthCookieDomain(window.location.hostname);
  const domainAttribute = domain ? `; domain=${domain}` : "";
  document.cookie = `${DATA_MODE_OVERRIDE_KEY}=; path=/${domainAttribute}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

function* hydrateAuthWorker() {
  const savedToken = safeLocalStorage.getItem(STORAGE_TOKEN_KEY);
  const cookieToken = getCookieValue(STORAGE_TOKEN_KEY);
  const savedDataMode = safeLocalStorage.getItem(DATA_MODE_OVERRIDE_KEY);
  const cookieDataMode = getCookieValue(DATA_MODE_OVERRIDE_KEY);
  const cookieAuth = getCookieValue("isAuthenticated");
  const cookieUser = parseCookieUser();

  const hasValidCookieSession =
    cookieAuth === "true" && isValidPersistedUser(cookieUser);
  if (hasValidCookieSession) {
    const normalizedUser = normalizeUser(cookieUser);
    const resolvedToken = savedToken ?? cookieToken;
    const hydratedMode = resolveHydratedDataMode(
      savedDataMode,
      cookieDataMode,
      normalizedUser,
    );

    // Keep local storage aligned with the shared cross-subdomain cookie session.
    safeLocalStorage.setItem(STORAGE_AUTH_KEY, "true");
    safeLocalStorage.setJSON(STORAGE_USER_KEY, normalizedUser);
    if (resolvedToken) {
      safeLocalStorage.setItem(STORAGE_TOKEN_KEY, resolvedToken);
    } else {
      safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
    }
    if (hydratedMode) {
      safeLocalStorage.setItem(DATA_MODE_OVERRIDE_KEY, hydratedMode);
      setDataModeCookie(hydratedMode);
      if (hydratedMode === "mock") {
        safeLocalStorage.removeItem(STORAGE_ARCHIVED_FUND_IDS);
      }
    } else {
      safeLocalStorage.removeItem(DATA_MODE_OVERRIDE_KEY);
      clearDataModeCookie();
    }

    yield put(
      authHydrated({
        isAuthenticated: true,
        user: normalizedUser,
        accessToken: resolvedToken,
      }),
    );
    return;
  }

  // Shared auth cookie is absent/invalid: treat as logged out and clear stale local state.
  clearAuthenticatedAppCaches();
  safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
  safeLocalStorage.removeItem(STORAGE_USER_KEY);
  safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
  clearAuthCookies();

  if (savedDataMode === "mock" || savedDataMode === "api") {
    setDataModeCookie(savedDataMode);
  } else {
    safeLocalStorage.removeItem(DATA_MODE_OVERRIDE_KEY);
    clearDataModeCookie();
  }

  yield put(
    authHydrated({ isAuthenticated: false, user: null, accessToken: null }),
  );
}

export function* loginWorker(action: ReturnType<typeof loginRequested>) {
  try {
    const { email, password } = action.payload;
    clearAuthenticatedAppCaches();
    safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
    safeLocalStorage.removeItem(STORAGE_USER_KEY);
    safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
    clearAuthCookies();
    const modeOverride: DataMode = isDemoCredentials(email, password)
      ? "mock"
      : "api";
    safeLocalStorage.setItem(DATA_MODE_OVERRIDE_KEY, modeOverride);
    setDataModeCookie(modeOverride);
    if (modeOverride === "mock") {
      safeLocalStorage.removeItem(STORAGE_ARCHIVED_FUND_IDS);
    }
    const result: AuthResult = yield call(authenticateUser, email, password);
    const resolvedModeOverride: DataMode =
      result.sessionType === "demo" || isKnownMockUser(result.user)
        ? "mock"
        : (result.dataModeOverride ?? modeOverride);

    // Persist to localStorage
    safeLocalStorage.setItem(STORAGE_AUTH_KEY, "true");
    safeLocalStorage.setJSON(STORAGE_USER_KEY, result.user);
    if (result.accessToken) {
      safeLocalStorage.setItem(STORAGE_TOKEN_KEY, result.accessToken);
    } else {
      safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
    }
    safeLocalStorage.setItem(DATA_MODE_OVERRIDE_KEY, resolvedModeOverride);
    setDataModeCookie(resolvedModeOverride);
    if (resolvedModeOverride === "mock") {
      safeLocalStorage.removeItem(STORAGE_ARCHIVED_FUND_IDS);
    }

    // Sync to cookies for middleware access
    setAuthCookies(result.user, result.accessToken);

    // Mark auth state as successful only after storage and cookies are synced
    // so middleware sees the authenticated session on immediate redirects.
    yield put(
      loginSucceeded({ user: result.user, accessToken: result.accessToken }),
    );
  } catch (error: unknown) {
    logger.error("Login failed", error);
    yield put(loginFailed(normalizeError(error)));
  }
}

export function* logoutWorker() {
  clearAuthenticatedAppCaches();
  safeLocalStorage.removeItem(STORAGE_AUTH_KEY);
  safeLocalStorage.removeItem(STORAGE_USER_KEY);
  safeLocalStorage.removeItem(STORAGE_TOKEN_KEY);
  safeLocalStorage.removeItem(DATA_MODE_OVERRIDE_KEY);

  // Clear cookies
  clearAuthCookies();
  clearDataModeCookie();

  yield put(loggedOut());
}

export function* authSaga() {
  yield call(hydrateAuthWorker);
  yield takeLatest(loginRequested.type, loginWorker);
  yield takeLatest(logoutRequested.type, logoutWorker);
}
