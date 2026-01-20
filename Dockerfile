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
COPY .npmrc .npmrc
RUN pnpm install

FROM base AS build
WORKDIR /app
COPY package.json ./
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
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
CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3001"]
