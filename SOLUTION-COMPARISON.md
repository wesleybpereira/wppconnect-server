# Solução Limpa: Usar Repositório Original + Pequeno Patch

## Problema Identificado

O Babel está fazendo **constant folding** - avaliando `process.env.X || 'default'` em build-time e gerando código hardcoded porque as variáveis não existem durante o build.

## Solução 1: Wrapper Script (RECOMENDADO) ⭐

Usar o código original do upstream + criar um wrapper que injeta as variáveis.

### Dockerfile
```dockerfile
FROM node:22.21.1-bullseye-slim
WORKDIR /usr/src/wpp-server

# ... (dependências do sistema) ...

# Clone do repositório ORIGINAL (upstream)
ARG WPPCONNECT_VERSION=main
RUN git clone --depth 1 --branch ${WPPCONNECT_VERSION} \
    https://github.com/wppconnect-team/wppconnect-server.git . && \
    rm -rf .git

# Instala dependências
RUN yarn install --pure-lockfile --ignore-engines && yarn cache clean

# Build do projeto
RUN yarn build

# Cria wrapper que sobrescreve config em runtime
COPY <<EOF /usr/src/wpp-server/config-override.js
const originalConfig = require('./dist/config.js').default;

// Sobrescreve apenas o que precisa com process.env
module.exports = new Proxy(originalConfig, {
  get(target, prop) {
    // Mapeia propriedades para variáveis de ambiente
    const envMap = {
      secretKey: 'SECRET_KEY',
      host: 'HOST',
      port: 'PORT',
      deviceName: 'DEVICE_NAME'
    };
    
    if (envMap[prop] && process.env[envMap[prop]]) {
      return process.env[envMap[prop]];
    }
    
    return target[prop];
  }
});
EOF

# Modifica imports de config para usar o override
RUN find dist -type f -name "*.js" -exec sed -i \
    "s|require(\"\\.\\./config\")|require(\"../config-override\")|g" {} \;
RUN find dist -type f -name "*.js" -exec sed -i \
    "s|require(\"\\./config\")|require(\"./config-override\")|g" {} \;

EXPOSE 21465
ENTRYPOINT ["node", "dist/server.js"]
```

**Vantagens**:
- ✅ Não modifica código upstream
- ✅ Fácil atualizar (só trocar ARG WPPCONNECT_VERSION)
- ✅ Variáveis do Dokploy funcionam automaticamente
- ✅ Zero conflitos em futuros merges

## Solução 2: Build-time ARGs

Passar as variáveis em build-time (não funciona bem com Dokploy).

## Solução 3: Manter Fork (atual)

Continuar com fork + modificações no config.ts, mas:
- Minimizar mudanças
- Documentar bem
- Usar script de update

## Recomendação Final

Use **Solução 1** porque:
1. Não precisa de fork ou branch customizada
2. Atualizar = só trocar versão no ARG
3. Dokploy injeta variáveis normalmente
4. Zero manutenção de merge/rebase
