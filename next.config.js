const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

const normalizeDomain = (value) =>
  value ? value.replace(/^https?:\/\//, "").replace(/\/+$/, "") : null;

const parseCsv = (value) =>
  value
    ? value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const toOriginVariants = (domain) => {
  if (!domain) return [];
  const hostWithOptionalPort = normalizeDomain(domain);
  if (!hostWithOptionalPort) return [];

  const hostOnly = hostWithOptionalPort.split(":")[0];
  return [
    hostWithOptionalPort,
    hostOnly,
    `http://${hostWithOptionalPort}`,
    `https://${hostWithOptionalPort}`,
    `http://${hostOnly}`,
    `https://${hostOnly}`,
  ];
};

const toHostPortTargets = (hosts, ports) => {
  if (ports.length === 0) {
    return hosts;
  }

  const targets = [...hosts];
  hosts.forEach((host) => {
    ports.forEach((port) => {
      targets.push(`${host}:${port}`);
    });
  });
  return targets;
};

const configuredAllowedOrigins = [
  process.env.NEXT_PUBLIC_PUBLIC_DOMAIN,
  process.env.NEXT_PUBLIC_APP_DOMAIN,
  process.env.NEXT_PUBLIC_ADMIN_DOMAIN,
].flatMap(toOriginVariants);

const configuredDevHosts = parseCsv(process.env.NEXT_PUBLIC_DEV_ALLOWED_HOSTS);
const configuredDevPorts = parseCsv(process.env.NEXT_PUBLIC_DEV_ALLOWED_PORTS);
const configuredExtraOrigins = parseCsv(
  process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS,
);

const devHostPortTargets = toHostPortTargets(
  configuredDevHosts,
  configuredDevPorts,
);
const dynamicAllowedOrigins = [
  ...configuredExtraOrigins,
  ...configuredExtraOrigins.flatMap(toOriginVariants),
  ...devHostPortTargets,
  ...devHostPortTargets.flatMap(toOriginVariants),
].filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_DIR || ".next",
  allowedDevOrigins: Array.from(
    new Set([...configuredAllowedOrigins, ...dynamicAllowedOrigins]),
  ),
  compiler: {
    removeConsole:
      process.env.NODE_ENV === "production"
        ? { exclude: ["error", "warn"] }
        : false,
  },
  productionBrowserSourceMaps: false,
  // Phase 2 legacy → canonical redirects (UX transformation Module 2A/2B).
  // Old URLs remain reachable; the redirect lands users on the new
  // canonical path under /deals or /portfolio. Query strings are
  // preserved by Next.js automatically.
  async redirects() {
    return [
      // Module 2A — Deals
      {
        source: "/pipeline",
        destination: "/deals/pipeline",
        permanent: true,
      },
      {
        source: "/pipeline/:path*",
        destination: "/deals/pipeline/:path*",
        permanent: true,
      },
      {
        source: "/deal-intelligence",
        destination: "/deals/intelligence",
        permanent: true,
      },
      {
        source: "/deal-intelligence/:path*",
        destination: "/deals/intelligence/:path*",
        permanent: true,
      },
      {
        source: "/dealflow-review",
        destination: "/deals/review",
        permanent: true,
      },
      {
        source: "/dealflow-review/:path*",
        destination: "/deals/review/:path*",
        permanent: true,
      },
      // Module 2B — Portfolio
      {
        source: "/409a-valuations",
        destination: "/portfolio/valuations",
        permanent: true,
      },
      {
        source: "/409a-valuations/:path*",
        destination: "/portfolio/valuations/:path*",
        permanent: true,
      },
      // Module 3A — Funds
      {
        source: "/waterfall",
        destination: "/funds",
        permanent: true,
      },
      {
        source: "/analytics",
        destination: "/funds",
        permanent: true,
      },
      // Module 3B — LPs
      {
        source: "/lp-management",
        destination: "/lps",
        permanent: true,
      },
      {
        source: "/contacts",
        destination: "/lps",
        permanent: true,
      },
      // Module 4A — Fund Operations Workflows
      {
        source: "/fund-admin",
        destination: "/workflows/fund-ops",
        permanent: true,
      },
      {
        source: "/fund-admin/distributions/new",
        destination: "/workflows/fund-ops",
        permanent: false,
      },
      {
        source: "/fund-admin/distributions/calendar",
        destination: "/workflows/fund-ops",
        permanent: false,
      },
      {
        source: "/tax-center",
        destination: "/workflows/tax",
        permanent: true,
      },
      // Module 4B — Compliance & Audit Workflows
      {
        source: "/compliance",
        destination: "/workflows/compliance",
        permanent: true,
      },
      {
        source: "/audit-trail",
        destination: "/workflows/audit",
        permanent: true,
      },
      {
        source: "/collaboration",
        destination: "/workflows/collaboration",
        permanent: true,
      },
    ];
  },
  async headers() {
    // Long-lived caching is desirable in production, but it can break local dev because
    // Next dev chunk URLs are not content-hashed and the browser may keep stale JS.
    if (process.env.NODE_ENV !== "production") {
      return [];
    }
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Make canvas optional for client-side builds
    // Canvas is a Node.js native module that doesn't work in browser
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }

    // Externalize canvas for server-side builds
    if (isServer) {
      config.externals = [...(config.externals || []), "canvas"];
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
