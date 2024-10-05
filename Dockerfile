FROM node:22.9.0-bookworm-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

FROM base AS ssl-create
WORKDIR /app/ssl
RUN export DEBIAN_FRONTEND=noninteractive
RUN apt-get -y update
RUN apt-get -y upgrade
RUN apt-get -y install --no-install-recommends openssl
RUN apt-get clean
RUN rm -rf /var/lib/apt/lists/*
RUN openssl req \
    -new  \
    -newkey ec\
    -pkeyopt ec_paramgen_curve:prime256v1 \
    -days 365 \
    -nodes \
    -x509 \
    -subj "/C=PL/ST=Mazowieckie/L=Piaseczno/O=SpocLab/CN=localhost" \
    -keyout server.key \
    -out server.cert

FROM node:22.9.0-alpine
WORKDIR /usr/app
COPY --from=ssl-create /app/ssl/server.key ./server/ssl/server.key
COPY --from=ssl-create /app/ssl/server.cert ./server/ssl/server.cert
COPY --from=build /app/dist/zoneless-playground ./
EXPOSE 4000
CMD ["node", "server/server.mjs"]
