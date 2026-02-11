const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const normalizeDomain = (value) =>
  value ? value.replace(/^https?:\/\//, '').replace(/\/+$/, '') : null;

const parseCsv = (value) =>
  value
    ? value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
    : [];

const toOriginVariants = (domain) => {
  if (!domain) return [];
  const hostWithOptionalPort = normalizeDomain(domain);
  if (!hostWithOptionalPort) return [];

  const hostOnly = hostWithOptionalPort.split(':')[0];
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
]
  .flatMap(toOriginVariants);

const configuredDevHosts = parseCsv(process.env.NEXT_PUBLIC_DEV_ALLOWED_HOSTS);
const configuredDevPorts = parseCsv(process.env.NEXT_PUBLIC_DEV_ALLOWED_PORTS);
const configuredExtraOrigins = parseCsv(process.env.NEXT_PUBLIC_ALLOWED_DEV_ORIGINS);

const devHostPortTargets = toHostPortTargets(configuredDevHosts, configuredDevPorts);
const dynamicAllowedOrigins = [
  ...configuredExtraOrigins,
  ...configuredExtraOrigins.flatMap(toOriginVariants),
  ...devHostPortTargets,
  ...devHostPortTargets.flatMap(toOriginVariants),
].filter(Boolean);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: Array.from(
    new Set([
      ...configuredAllowedOrigins,
      ...dynamicAllowedOrigins,
    ])
  ),
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },
  productionBrowserSourceMaps: false,
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
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
      config.externals = [...(config.externals || []), 'canvas'];
    }

    return config;
  },
};

module.exports = withBundleAnalyzer(nextConfig);
