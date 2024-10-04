FROM node:22.9.0-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM nginx:alpine AS static
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist/zoneless-playground/browser /usr/share/nginx/html
EXPOSE 80

FROM node:22.9.0-alpine AS ssr
WORKDIR /usr/app
COPY --from=build /app/dist/zoneless-playground ./
EXPOSE 4000
CMD ["node", "server/server.mjs"]
