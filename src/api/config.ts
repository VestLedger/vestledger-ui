import { resolveApiBaseUrl } from "@/config/env";

export function getApiBaseUrl(): string {
  return resolveApiBaseUrl(
    typeof window === "undefined" ? undefined : window.location.hostname,
  );
}
