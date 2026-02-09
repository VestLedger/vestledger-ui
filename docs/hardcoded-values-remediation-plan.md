# Hardcoded Values Remediation Plan

## Objective
Remove hardcoded runtime values from application code and move them to centralized configuration and helpers.

This plan targets:
- Route/path literals
- Locale/currency literals
- Domain/API host fallbacks
- Magic numeric constants used in business logic

## Baseline (Current State)
Audit scope excludes `src/data/mocks` and test files.

- Route/path literals: 24
- Locale/currency literals (`en-US`, `USD`): 14
- Domain/API host fallbacks: 12
- Magic numeric constants in runtime logic: 17

## Target End State
- Runtime defaults are defined in one config layer (`src/config/*`).
- Feature components do not hardcode domains, locales, route strings, or calculation defaults.
- Shared formatting/currency/date helpers are the only source of locale/currency behavior.
- CI guardrails fail if regressions are introduced.

## Workstreams

## 1. Config Foundation
Create centralized config modules:

- `src/config/env.ts`
  - `PUBLIC_WEB_URL`
  - `APP_WEB_URL`
  - `API_BASE_URL`
- `src/config/i18n.ts`
  - `DEFAULT_LOCALE`
  - `DEFAULT_CURRENCY`
  - `DEFAULT_TIMEZONE`
- `src/config/calculation-defaults.ts`
  - Waterfall sensitivity defaults
  - Distribution wizard baseline constants
  - Quick scenario presets

Acceptance criteria:
- No direct domain/API fallback literals remain outside config.
- Locale/currency defaults are imported from config.

## 2. Domain and API Fallback Cleanup
Replace inline host/domain defaults with `src/config/env.ts`.

Primary files:
- `src/api/config.ts`
- `app/not-found.tsx`
- `app/(public)/layout.tsx`
- `src/components/topbar.tsx`
- `src/components/public/login-button.tsx`
- `src/components/dealflow/startup-application-form.tsx`

Acceptance criteria:
- All default URL/domain strings come from config.
- Environment variable fallback strategy is defined once.

## 3. Route Literal Centralization
Standardize route references through route constants.

Primary actions:
- Export a typed route map from `src/config/routes.ts` (or `src/config/route-paths.ts`).
- Replace `routePath="/..."`, `router.push("/...")`, and `window.open("/...")` literals with route constants.

Primary files:
- `src/components/fund-admin/distributions/distributions-list.tsx`
- `src/components/fund-admin/distributions/distribution-detail.tsx`
- `src/components/fund-admin/distributions/distribution-calendar.tsx`
- `src/components/fund-admin/distributions/distribution-step-waterfall.tsx`
- `src/components/lp-portal/distribution-upcoming.tsx`
- `src/components/*` pages using `routePath="/..."`

Acceptance criteria:
- Route strings are not duplicated across feature components.
- Route changes require updating one source of truth.

## 4. Locale and Currency Centralization
Use shared formatting utilities and remove scattered `en-US` usage.

Primary actions:
- Replace direct `toLocaleDateString('en-US', ...)` and `Intl.*('en-US', ...)` calls with shared helpers.
- Ensure helper defaults use `src/config/i18n.ts`.
- Remove duplicate currency formatter in waterfall calculations in favor of shared formatting utils.

Primary files:
- `src/utils/formatting/currency.ts`
- `src/lib/calculations/waterfall.ts`
- `src/components/crm/interaction-timeline.tsx`
- `src/components/fund-admin/*`
- `src/components/integrations/calendar-integration.tsx`
- `src/components/dashboard/capital-call-card.tsx`

Acceptance criteria:
- Locale/currency defaults are controlled centrally.
- Feature components do not hardcode `en-US`.

## 5. Numeric Magic Number Extraction
Move runtime numeric defaults into named constants/config.

Primary files:
- `src/components/fund-admin/distributions/distribution-wizard.tsx`
- `src/components/waterfall/sensitivity-panel.tsx`
- `src/components/waterfall/waterfall-modeling.tsx`
- `src/components/dashboard-v2.tsx`

Primary actions:
- Replace literals with constants (for example baseline NAV, DPI/TVPI denominators, min/step bounds, scenario quick picks).
- Keep constant names domain-specific and self-descriptive.

Acceptance criteria:
- Numeric defaults are named and documented.
- Business behavior can be tuned without component edits.

## 6. Audit Guardrails
Add hardcoded-value audit script and baseline thresholds.

New artifacts:
- `scripts/hardcoded-values-audit.mjs`
- `docs/hardcoded-values-baseline.json`
- `package.json` scripts:
  - `audit:hardcoded-values`
  - `audit:hardcoded-values:enforce`

Guardrail checks:
- Domain/API fallback literals outside config
- Hardcoded route string usage in feature components
- Locale/currency literals outside formatting/config layers
- Magic numeric constants in designated runtime files

Acceptance criteria:
- CI can fail on regressions.
- Baseline file documents permitted exceptions explicitly.

## Execution Plan (Suggested Sequence)
1. Create config foundation (`env`, `i18n`, `calculation-defaults`).
2. Migrate domain/API fallback literals.
3. Migrate route literals.
4. Migrate locale/currency usage.
5. Extract numeric magic numbers.
6. Add audit script + enforcement baseline.
7. Run validation and lock baseline.

## Validation Checklist
- `pnpm run lint`
- `npm run build`
- `pnpm run audit:ui-centralization:enforce`
- `pnpm run audit:hardcoded-values:enforce` (after added)

## Implementation Status
- [x] 1. Config Foundation
- [x] 2. Domain and API Fallback Cleanup
- [x] 3. Route Literal Centralization
- [x] 4. Locale and Currency Centralization
- [x] 5. Numeric Magic Number Extraction (designated runtime files)
- [x] 6. Audit Guardrails (script + baseline + enforce script wiring)

## Out of Scope
- Mock datasets under `src/data/mocks`
- Test-only literals unless needed for new guardrails
- Marketing copy and non-runtime static text
