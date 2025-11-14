# Configuração do WPPConnect no Dokploy

## Problema Identificado

O servidor está rodando corretamente (logs confirmam "Server is running on port: 21465"), mas o Bad Gateway ocorre porque:

1. **Faltam labels do Traefik** - O serviço não tem labels para roteamento HTTP
2. **Porta não está exposta corretamente** - Docker Swarm não está publicando a porta 21465

## Configuração Necessária no Dokploy

### 1. Configuração de Portas
Na interface do Dokploy, configure:
- **Container Port**: `21465`
- **Protocol**: `TCP`
- **Published Mode**: `ingress` (padrão Docker Swarm)

### 2. Variáveis de Ambiente (já configuradas ✅)
```bash
PORT=21465
HOST=https://wpp-dok.dach.com.br
SECRET_KEY=seu_token_seguro
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable
```

### 3. Health Check
Configure o health check HTTP no Dokploy:
- **Path**: `/api/health`
- **Port**: `21465`
- **Protocol**: `HTTP`
- **Interval**: `30s`
- **Timeout**: `10s`
- **Start Period**: `60s`

### 4. Limpar Containers Antigos

Antes de fazer redeploy, pare e remova os containers antigos:

```bash
# Parar o serviço
docker service rm dach-wppconnectserver-0xkbuk

# Remover containers órfãos
docker container prune -f

# Remover imagens antigas
docker image prune -a -f
```

Ou use a opção **"Clean Build"** no Dokploy antes de fazer deploy.

### 5. Traefik Labels (caso não sejam adicionados automaticamente)

Se o Dokploy não adicionar automaticamente, os labels necessários são:

```yaml
traefik.enable: "true"
traefik.http.routers.wppconnect.rule: "Host(`wpp-dok.dach.com.br`)"
traefik.http.routers.wppconnect.entrypoints: "websecure"
traefik.http.routers.wppconnect.tls.certresolver: "letsencrypt"
traefik.http.services.wppconnect.loadbalancer.server.port: "21465"
```

## Verificação

Após configurar, teste:

1. **Logs do container**:
   ```bash
   docker logs <container_id>
   ```
   Deve mostrar: `Server is running on port: 21465`

2. **Acesso à API**:
   - https://wpp-dok.dach.com.br/api-docs (Swagger)
   - https://wpp-dok.dach.com.br/api/health (Health check)

3. **Criação de sessão**:
   ```bash
   curl -X POST https://wpp-dok.dach.com.br/api/:session/start-session \
     -H "Authorization: Bearer SEU_SECRET_KEY"
   ```

## Problemas Conhecidos

- **Múltiplos containers sendo criados**: Ocorre quando o health check falha repetidamente. Após configurar corretamente, o Docker Swarm manterá apenas 1 réplica.
- **Bad Gateway**: Falta configuração de porta/Traefik. Configure conforme acima.
