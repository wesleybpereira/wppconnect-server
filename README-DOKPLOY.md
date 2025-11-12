# WPPConnect Server - Deploy no Dokploy

Este guia explica como fazer o deploy do WPPConnect Server no Dokploy usando Nixpacks.

## 📋 Pré-requisitos

- Dokploy configurado e funcionando
- Acesso ao repositório Git do projeto
- Conhecimento básico de variáveis de ambiente

## 🚀 Configuração do Deploy

### 1. Variáveis de Ambiente Essenciais

Configure estas variáveis no Dokploy:

```bash
# Configuração básica
SECRET_KEY=seu_token_secreto_aqui
HOST=https://seu-dominio.com
PORT=21465
START_ALL_SESSIONS=false

# Puppeteer/Chrome
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
NODE_ENV=production

# Logging
LOG_LEVEL=info
LOG_LOGGER=console
```

### 2. Arquivos de Configuração

- `nixpacks.toml` - Configura as dependências do sistema
- `start.sh` - Script de inicialização inteligente
- `src/config.ts` - Configuração adaptada para containers

### 3. Processo de Build

O Nixpacks irá:
1. Instalar dependências do sistema (Chromium, bibliotecas gráficas)
2. Instalar dependências Node.js
3. Fazer build do TypeScript
4. Configurar o ambiente de execução

## 🔧 Solução de Problemas

### Erro: "libglib-2.0.so.0: cannot open shared object file"

✅ **Resolvido** - O `nixpacks.toml` instala todas as dependências necessárias.

### Erro: "Failed to launch the browser process"

✅ **Resolvido** - O `start.sh` encontra automaticamente o Chromium e configura o Puppeteer.

### Erro de timeout ao conectar

Certifique-se de que:
- As variáveis `HOST` e `PORT` estão corretas
- O Dokploy está expondo a porta correta
- Não há firewalls bloqueando a conexão

### QR Code não aparece

1. Verifique se `START_ALL_SESSIONS=false`
2. Teste criar uma sessão manualmente via API:
   ```bash
   POST /api/{{session}}/start-session
   ```
3. Monitore os logs para erros do Puppeteer

## 📱 Usando a API

### Criar uma sessão
```bash
POST https://seu-dominio.com/api/minha-sessao/start-session
```

### Ver QR Code
```bash
GET https://seu-dominio.com/api/minha-sessao/qr-code
```

### Status da sessão
```bash
GET https://seu-dominio.com/api/minha-sessao/status-session
```

## 🔍 Monitoramento

- Logs: Verifique os logs do container no Dokploy
- Health Check: `GET /api/health`
- Swagger: `GET /api-docs`

## 🆘 Suporte

Se ainda houver problemas:

1. Verifique os logs do container
2. Teste localmente com Docker
3. Verifique se todas as variáveis de ambiente estão configuradas
4. Consulte a documentação oficial do WPPConnect

## 📚 Links Úteis

- [Documentação WPPConnect](https://docs.wppconnect.io/)
- [Dokploy Docs](https://dokploy.com/docs)
- [Nixpacks](https://nixpacks.com/)