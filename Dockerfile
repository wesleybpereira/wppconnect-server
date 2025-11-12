FROM node:22.21.1-alpine AS base
WORKDIR /usr/src/wpp-server
ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package.json ./
RUN apk update && \
    apk add --no-cache \
    vips-dev \
    fftw-dev \
    gcc \
    g++ \
    make \
    libc6-compat \
    && rm -rf /var/cache/apk/*
RUN yarn install --production --pure-lockfile && \
    yarn add sharp --ignore-engines && \
    yarn cache clean

FROM base AS build
WORKDIR /usr/src/wpp-server
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
COPY package.json  ./
RUN yarn install --production=false --pure-lockfile
RUN yarn cache clean
COPY . .
RUN yarn build

# ESTÁGIO FINAL - Começa do ZERO (não do base)
FROM node:22.21.1-alpine
WORKDIR /usr/src/wpp-server/
ENV NODE_ENV=production PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Instala RUNTIME do vips (não -dev)
RUN apk add --no-cache \
    chromium \
    vips \
    fftw \
    libc6-compat \
    && rm -rf /var/cache/apk/*

# Copia node_modules DO ESTÁGIO BASE (onde sharp foi compilado)
COPY --from=base /usr/src/wpp-server/node_modules ./node_modules

# Copia apenas o dist compilado
COPY --from=build /usr/src/wpp-server/dist ./dist

# Copia package.json
COPY package.json ./

EXPOSE 21465
ENTRYPOINT ["node", "dist/server.js"]