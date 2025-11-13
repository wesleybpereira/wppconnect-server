# ============ STAGE 1: Clone e Build ============
FROM node:22.21.1-bullseye-slim AS builder
WORKDIR /tmp/wppconnect

# Instala dependências do sistema conforme documentação oficial
RUN apt-get update && apt-get install -y \
    git \
    wget \
    unzip \
    fontconfig \
    locales \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    libgbm1 \
    libxshmfence1 \
    libvips-dev \
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Instala Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Clone do repositório
ARG WPPCONNECT_VERSION=main
RUN git clone --depth 1 --branch ${WPPCONNECT_VERSION} \
    https://github.com/wppconnect-team/wppconnect-server.git .

# Instala dependências e sharp nativamente para linux
RUN yarn install --pure-lockfile && \
    yarn add sharp --platform=linux --arch=x64 --ignore-engines && \
    yarn cache clean

# Build do projeto
RUN yarn build

# ============ STAGE 2: Runtime ============
FROM node:22.21.1-bullseye-slim
WORKDIR /usr/src/wpp-server

ENV NODE_ENV=production
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Instala dependências de runtime conforme documentação oficial
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    unzip \
    fontconfig \
    locales \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    libgbm1 \
    libxshmfence1 \
    libvips42 \
    libvips-dev \
    && rm -rf /var/lib/apt/lists/*

# Instala Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Copia tudo do builder
COPY --from=builder /tmp/wppconnect ./

EXPOSE 21465

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD node -e "require('http').get('http://localhost:21465/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" || exit 1

ENTRYPOINT ["node", "dist/server.js"]