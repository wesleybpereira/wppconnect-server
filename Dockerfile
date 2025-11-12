# ============ STAGE 1: Build Dependencies ============
FROM node:22.21.1-alpine AS base
WORKDIR /tmp/wppconnect

# Instala git e dependências de build
RUN apk add --no-cache git vips-dev fftw-dev gcc g++ make libc6-compat

# Clone a versão específica do wppconnect-server
ARG WPPCONNECT_VERSION=main
RUN git clone --depth 1 --branch ${WPPCONNECT_VERSION} \
    https://github.com/wppconnect-team/wppconnect-server.git .

# Instala TODAS as dependências (dev + prod)
RUN yarn install --pure-lockfile && \
    yarn add sharp --ignore-engines && \
    yarn cache clean

# ============ STAGE 2: Build ============
FROM base AS builder
WORKDIR /tmp/wppconnect

# Build do projeto
RUN yarn build

# Reinstala apenas dependências de produção com sharp
RUN rm -rf node_modules && \
    yarn install --production --pure-lockfile && \
    yarn add sharp --ignore-engines && \
    yarn cache clean

# ============ STAGE 3: Runtime ============
FROM node:22.21.1-alpine
WORKDIR /usr/src/wpp-server

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROME_BIN=/usr/bin/chromium-browser

# Instala dependências de runtime
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    vips \
    fftw \
    libc6-compat && \
    rm -rf /var/cache/apk/*

# Copia node_modules de produção (com sharp) do builder
COPY --from=builder /tmp/wppconnect/node_modules ./node_modules

# Copia o código compilado
COPY --from=builder /tmp/wppconnect/dist ./dist

# Copia arquivos necessários
COPY --from=builder /tmp/wppconnect/package.json ./package.json

EXPOSE 21465

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:21465/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

ENTRYPOINT ["node", "dist/server.js"]