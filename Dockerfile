FROM node:22.21.1-bullseye-slim
WORKDIR /usr/src/wpp-server

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

# Instala TODAS as dependências do sistema conforme documentação oficial
RUN apt-get update && apt-get install -y \
    git \
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
    build-essential \
    python3 \
    && rm -rf /var/lib/apt/lists/*

# Instala Google Chrome
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# Clone do repositório ORIGINAL (upstream - sem modificações)
ARG WPPCONNECT_VERSION=main
RUN git clone --depth 1 --branch ${WPPCONNECT_VERSION} \
    https://github.com/wppconnect-team/wppconnect-server.git . && \
    rm -rf .git

# Instala dependências
RUN yarn install --pure-lockfile --ignore-engines && \
    yarn cache clean

# Build do projeto
RUN yarn build

# Cria wrapper que injeta variáveis de ambiente em runtime (após build)
RUN cat > /usr/src/wpp-server/dist/config-runtime.js << 'EOFCONFIG'
"use strict";

// Importa o config original compilado
const originalConfig = require('./config.js').default || require('./config.js');

// Função helper para ler env (retorna undefined se não existir)
const env = (key) => {
  return process.env[key] !== undefined ? process.env[key] : undefined;
};

const numericEnv = (key, fallback) => {
  const value = env(key);
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const boolEnv = (key, fallback) => {
  const value = env(key);
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

// Cria config com variáveis de ambiente sobrescrevendo defaults
const runtimeConfig = {
  ...originalConfig,
  // Sobrescreve apenas se env var existir (!== undefined)
  ...(env('SECRET_KEY') !== undefined && { secretKey: env('SECRET_KEY') }),
  ...(env('HOST') !== undefined && { host: env('HOST') }),
  ...(env('PORT') !== undefined && { port: env('PORT') }),
  ...(env('DEVICE_NAME') !== undefined && { deviceName: env('DEVICE_NAME') }),
  ...(env('START_ALL_SESSIONS') !== undefined && { startAllSession: boolEnv('START_ALL_SESSIONS', true) }),
  ...(env('MAX_LISTENERS') !== undefined && { maxListeners: numericEnv('MAX_LISTENERS', 15) }),
  ...(env('CUSTOM_USER_DATA_DIR') !== undefined && { customUserDataDir: env('CUSTOM_USER_DATA_DIR') }),
  
  createOptions: {
    ...originalConfig.createOptions,
    // Define headless explicitamente (padrão do WPPConnect é true se não definido)
    headless: env('HEADLESS') !== undefined ? boolEnv('HEADLESS', true) : true,
    ...(env('AUTO_CLOSE') !== undefined && { autoClose: numericEnv('AUTO_CLOSE', 60000) }),
    ...(env('DEVICE_SYNC_TIMEOUT') !== undefined && { deviceSyncTimeout: numericEnv('DEVICE_SYNC_TIMEOUT', 120000) }),
    puppeteerOptions: {
      ...originalConfig.createOptions.puppeteerOptions,
      ...(env('PUPPETEER_EXECUTABLE_PATH') !== undefined && { executablePath: env('PUPPETEER_EXECUTABLE_PATH') })
    }
  }
};

module.exports = runtimeConfig;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = runtimeConfig;
EOFCONFIG

# Substitui imports de './config' para './config-runtime' em todos os arquivos compilados
RUN find dist -type f -name "*.js" -exec sed -i \
    -e "s|require(['\"]\\./config['\"])|require('./config-runtime')|g" \
    -e "s|require(['\"]\\.\\./ config['\"])|require('../config-runtime')|g" \
    -e "s|from ['\"]\\./config['\"]|from './config-runtime'|g" \
    -e "s|from ['\"]\\.\\./ config['\"]|from '../config-runtime'|g" \
    {} \;

EXPOSE 21465

# Healthcheck removido - Dokploy/Traefik fará o health check via HTTP
# Se necessário, configure no Dokploy: GET http://container:21465/api/health

ENTRYPOINT ["node", "dist/server.js"]
