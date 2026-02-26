#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const rootDir = process.cwd();
const routesPath = path.join(rootDir, 'src/config/routes.ts');
const accessRoutesPath = path.join(rootDir, 'src/config/access-routes.ts');
const dataModePath = path.join(rootDir, 'src/config/data-mode.ts');
const appDir = path.join(rootDir, 'app');
const shouldEnforce = process.argv.includes('--enforce');

/**
 * Route-to-feature mapping guardrail:
 * - If a new route key is added, this map must be updated.
 * - Feature values must exist in data-mode FeatureName and featureFlags.
 * - null means the route is intentionally shell/static and not tied to a domain data feature.
 */
const ROUTE_KEY_TO_FEATURE = Object.freeze({
  superadmin: null,
  dashboard: 'dashboards',
  pipeline: 'pipeline',
  portfolio: 'portfolio',
  dealIntelligence: 'dealIntelligence',
  dealflowReview: 'dealflow',
  analytics: 'portfolio',
  fundAdmin: 'backOffice',
  fundAdminDistributionsNew: 'backOffice',
  fundAdminDistributionsCalendar: 'backOffice',
  fundAdminDistributionDetail: 'backOffice',
  lpManagement: 'lpPortal',
  lpPortal: 'lpPortal',
  compliance: 'backOffice',
  valuations409a: 'backOffice',
  taxCenter: 'backOffice',
  contacts: 'crm',
  notifications: 'alerts',
  reports: 'documents',
  aiTools: 'ai',
  waterfall: 'portfolio',
  auditTrail: 'auditTrail',
  documents: 'documents',
  integrations: 'integrations',
  collaboration: 'collaboration',
  settings: null,
});

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function readSourceFile(filePath, scriptKind = ts.ScriptKind.TS) {
  const content = readFileSync(filePath, 'utf8');
  return {
    content,
    sourceFile: ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      scriptKind
    ),
  };
}

function getPropertyName(nodeName) {
  if (ts.isIdentifier(nodeName)) return nodeName.text;
  if (ts.isStringLiteralLike(nodeName)) return nodeName.text;
  return null;
}

function getStringLiteralText(node) {
  if (!node) return null;
  if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    return node.text;
  }
  return null;
}

function extractRoutesConfig(sourceFile) {
  const routeKeys = new Set();
  const routePaths = new Set();
  const aiSuggestionHrefs = [];

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'routes' &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const property of node.initializer.properties) {
        if (!ts.isPropertyAssignment(property)) continue;

        const routeKey = getPropertyName(property.name);
        if (!routeKey || !ts.isObjectLiteralExpression(property.initializer)) continue;

        routeKeys.add(routeKey);

        for (const routeProperty of property.initializer.properties) {
          if (!ts.isPropertyAssignment(routeProperty)) continue;
          const routePropertyName = getPropertyName(routeProperty.name);
          if (!routePropertyName) continue;

          if (routePropertyName === 'path') {
            const pathValue = getStringLiteralText(routeProperty.initializer);
            if (pathValue) {
              routePaths.add(pathValue);
            }
          }

          if (
            routePropertyName === 'aiSuggestion' &&
            ts.isObjectLiteralExpression(routeProperty.initializer)
          ) {
            for (const aiProperty of routeProperty.initializer.properties) {
              if (!ts.isPropertyAssignment(aiProperty)) continue;
              const aiPropertyName = getPropertyName(aiProperty.name);
              if (aiPropertyName !== 'href') continue;
              const hrefValue = getStringLiteralText(aiProperty.initializer);
              if (hrefValue) {
                aiSuggestionHrefs.push({
                  routeKey,
                  href: hrefValue,
                });
              }
            }
          }
        }
      }
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return { routeKeys, routePaths, aiSuggestionHrefs };
}

function extractAllAbsolutePaths(sourceFile) {
  const paths = new Set();

  function visit(node) {
    const text = getStringLiteralText(node);
    if (text && text.startsWith('/')) {
      paths.add(text);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return paths;
}

function extractFeatureNames(sourceFile) {
  const names = new Set();

  function visit(node) {
    if (
      ts.isTypeAliasDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'FeatureName' &&
      ts.isUnionTypeNode(node.type)
    ) {
      for (const typeNode of node.type.types) {
        if (
          ts.isLiteralTypeNode(typeNode) &&
          ts.isStringLiteralLike(typeNode.literal)
        ) {
          names.add(typeNode.literal.text);
        }
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return names;
}

function extractFeatureFlagKeys(sourceFile) {
  const keys = new Set();

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === 'featureFlags' &&
      node.initializer &&
      ts.isObjectLiteralExpression(node.initializer)
    ) {
      for (const property of node.initializer.properties) {
        if (!ts.isPropertyAssignment(property)) continue;
        const key = getPropertyName(property.name);
        if (key) keys.add(key);
      }
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return keys;
}

function walkFiles(dirPath, accumulator = []) {
  if (!existsSync(dirPath)) return accumulator;
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const absolutePath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(absolutePath, accumulator);
      continue;
    }
    if (entry.isFile()) {
      accumulator.push(absolutePath);
    }
  }
  return accumulator;
}

function pageFileToRoutePath(pageFilePath) {
  const relativePath = toPosixPath(path.relative(appDir, pageFilePath));
  const segments = relativePath.split('/');
  if (segments[segments.length - 1] !== 'page.tsx') return null;

  segments.pop(); // remove page.tsx
  const routeSegments = segments.filter((segment) => {
    if (!segment) return false;
    // Ignore Next.js route groups: (dashboard), (public), (admin)
    if (segment.startsWith('(') && segment.endsWith(')')) return false;
    return true;
  });

  if (routeSegments.length === 0) return '/';
  return `/${routeSegments.join('/')}`;
}

const { sourceFile: routesSource } = readSourceFile(routesPath, ts.ScriptKind.TS);
const { sourceFile: accessRoutesSource } = readSourceFile(accessRoutesPath, ts.ScriptKind.TS);
const { sourceFile: dataModeSource } = readSourceFile(dataModePath, ts.ScriptKind.TS);

const { routeKeys, routePaths, aiSuggestionHrefs } = extractRoutesConfig(routesSource);
const accessRoutePaths = extractAllAbsolutePaths(accessRoutesSource);
const featureNames = extractFeatureNames(dataModeSource);
const featureFlagKeys = extractFeatureFlagKeys(dataModeSource);

const appPagePaths = new Set(
  walkFiles(appDir)
    .filter((filePath) => filePath.endsWith('page.tsx'))
    .map(pageFileToRoutePath)
    .filter(Boolean)
);

const centralPathSet = new Set([...routePaths, ...accessRoutePaths]);
const routeKeySetFromMap = new Set(Object.keys(ROUTE_KEY_TO_FEATURE));
const mappedFeatures = new Set(
  Object.values(ROUTE_KEY_TO_FEATURE).filter((value) => typeof value === 'string')
);

const appRoutesMissingCentralConfig = Array.from(appPagePaths)
  .filter((routePath) => !centralPathSet.has(routePath))
  .sort();

const routeConfigPathsMissingPage = Array.from(routePaths)
  .filter((routePath) => !appPagePaths.has(routePath))
  .sort();

const aiSuggestionHrefsMissingCentralPath = aiSuggestionHrefs
  .filter((entry) => !centralPathSet.has(entry.href))
  .sort((a, b) => `${a.routeKey}:${a.href}`.localeCompare(`${b.routeKey}:${b.href}`));

const routeKeysMissingFeatureMapping = Array.from(routeKeys)
  .filter((routeKey) => !routeKeySetFromMap.has(routeKey))
  .sort();

const staleFeatureMappings = Array.from(routeKeySetFromMap)
  .filter((routeKey) => !routeKeys.has(routeKey))
  .sort();

const mappedFeaturesMissingFeatureName = Array.from(mappedFeatures)
  .filter((feature) => !featureNames.has(feature))
  .sort();

const featureNamesMissingFlagEntry = Array.from(featureNames)
  .filter((feature) => !featureFlagKeys.has(feature))
  .sort();

const mappedFeaturesMissingFlagEntry = Array.from(mappedFeatures)
  .filter((feature) => !featureFlagKeys.has(feature))
  .sort();

const metrics = {
  app_routes_missing_central_config: appRoutesMissingCentralConfig.length,
  route_config_paths_missing_page: routeConfigPathsMissingPage.length,
  ai_suggestion_hrefs_missing_central_path: aiSuggestionHrefsMissingCentralPath.length,
  route_keys_missing_feature_mapping: routeKeysMissingFeatureMapping.length,
  stale_route_feature_mappings: staleFeatureMappings.length,
  mapped_features_missing_feature_name: mappedFeaturesMissingFeatureName.length,
  feature_names_missing_flag_entry: featureNamesMissingFlagEntry.length,
  mapped_features_missing_flag_entry: mappedFeaturesMissingFlagEntry.length,
};

console.log('\nRouting + Data Mode Centralization Audit');
console.log('=======================================');
for (const [metric, value] of Object.entries(metrics)) {
  console.log(`${metric}: ${value}`);
}

function printList(title, values) {
  if (values.length === 0) return;
  console.log(`\n${title}:`);
  for (const value of values) {
    if (typeof value === 'string') {
      console.log(`- ${value}`);
      continue;
    }
    console.log(`- ${value.routeKey}: ${value.href}`);
  }
}

printList('App routes missing centralized registration', appRoutesMissingCentralConfig);
printList('Route config paths without matching app page', routeConfigPathsMissingPage);
printList('AI suggestion href targets not found in centralized routes', aiSuggestionHrefsMissingCentralPath);
printList('Route keys missing ROUTE_KEY_TO_FEATURE mapping', routeKeysMissingFeatureMapping);
printList('Stale ROUTE_KEY_TO_FEATURE entries', staleFeatureMappings);
printList('Mapped features missing FeatureName declaration', mappedFeaturesMissingFeatureName);
printList('FeatureName values missing featureFlags entry', featureNamesMissingFlagEntry);
printList('Mapped features missing featureFlags entry', mappedFeaturesMissingFlagEntry);

if (shouldEnforce) {
  const failures = Object.entries(metrics)
    .filter(([, value]) => value > 0)
    .map(([metric, value]) => `${metric}: ${value}`);

  if (failures.length > 0) {
    console.error('\nEnforcement failed:');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exit(1);
  }

  console.log('\nEnforcement passed: centralized routing and data-mode mappings are valid.');
}
