# ============ STAGE 1: Clone e Build ============
FROM node:22.21.1-alpine AS builder
WORKDIR /tmp/wppconnect

# Instala git e dependências de build
RUN apk add --no-cache \
    git \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat

# Clone a versão específica do wppconnect-server
ARG WPPCONNECT_VERSION=main
RUN git clone --depth 1 --branch ${WPPCONNECT_VERSION} \
    https://github.com/wppconnect-team/wppconnect-server.git .

# Instala TODAS as dependências
RUN yarn install --pure-lockfile && \
    yarn add sharp --ignore-engines && \
    yarn cache clean

# Build do projeto
RUN yarn build

# ============ STAGE 2: Runtime ============
FROM node:22.21.1-alpine
WORKDIR /usr/src/wpp-server

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROME_BIN=/usr/bin/chromium-browser

# Instala dependências de runtime (incluindo vips)
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

# Copia TUDO do builder
COPY --from=builder /tmp/wppconnect ./

EXPOSE 21465

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:21465/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

ENTRYPOINT ["node", "dist/server.js"]