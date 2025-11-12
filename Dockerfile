# ============ STAGE 1: Clone e Build ============
FROM node:22.21.1-alpine AS builder
WORKDIR /tmp/wppconnect

RUN apk add --no-cache \
    git \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat

ARG WPPCONNECT_VERSION=main
RUN git clone --depth 1 --branch ${WPPCONNECT_VERSION} \
    https://github.com/wppconnect-team/wppconnect-server.git .

RUN yarn install --pure-lockfile && \
    yarn cache clean

RUN yarn build

# ============ STAGE 2: Runtime ============
FROM node:22.21.1-alpine
WORKDIR /usr/src/wpp-server

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV CHROME_BIN=/usr/bin/chromium-browser

# Instala TUDO necessário (runtime + build tools temporários)
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    font-noto-emoji \
    vips \
    vips-dev \
    fftw \
    fftw-dev \
    libc6-compat \
    gcc \
    g++ \
    make \
    python3 && \
    rm -rf /var/cache/apk/*

# Copia tudo do builder
COPY --from=builder /tmp/wppconnect ./

# FORÇA rebuild do sharp no ambiente de runtime
RUN cd /usr/src/wpp-server && \
    yarn add sharp --ignore-engines --force && \
    yarn cache clean

# Remove ferramentas de build para reduzir tamanho
RUN apk del vips-dev fftw-dev gcc g++ make python3 && \
    rm -rf /var/cache/apk/*

EXPOSE 21465

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:21465/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

ENTRYPOINT ["node", "dist/server.js"]