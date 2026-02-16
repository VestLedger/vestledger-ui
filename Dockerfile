ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-bookworm AS dev
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate
WORKDIR /app
EXPOSE 3001

FROM node:${NODE_VERSION}-bookworm AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@10.23.0 --activate

FROM base AS dependencies
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY .npmrc .npmrc
RUN pnpm install --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# Build-time public config for Next.js (baked into the bundle).
ARG NEXT_PUBLIC_API_BASE_URL=/api
ARG NEXT_PUBLIC_PUBLIC_DOMAIN=www.vestledger.com
ARG NEXT_PUBLIC_APP_DOMAIN=app.vestledger.com
ARG NEXT_PUBLIC_ADMIN_DOMAIN=admin.vestledger.com
ARG NEXT_PUBLIC_DATA_MODE=api
ARG NEXT_PUBLIC_USE_WWW=true
ARG NEXT_PUBLIC_CANONICAL_PUBLIC_URL=https://www.vestledger.com
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_PUBLIC_DOMAIN=$NEXT_PUBLIC_PUBLIC_DOMAIN
ENV NEXT_PUBLIC_APP_DOMAIN=$NEXT_PUBLIC_APP_DOMAIN
ENV NEXT_PUBLIC_ADMIN_DOMAIN=$NEXT_PUBLIC_ADMIN_DOMAIN
ENV NEXT_PUBLIC_DATA_MODE=$NEXT_PUBLIC_DATA_MODE
ENV NEXT_PUBLIC_USE_WWW=$NEXT_PUBLIC_USE_WWW
ENV NEXT_PUBLIC_CANONICAL_PUBLIC_URL=$NEXT_PUBLIC_CANONICAL_PUBLIC_URL

RUN pnpm build
RUN pnpm prune --prod

FROM node:${NODE_VERSION}-bookworm AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/next.config.js ./next.config.js
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
EXPOSE 3001
CMD ["node", "node_modules/next/dist/bin/next", "start", "-H", "0.0.0.0", "-p", "3001"]
