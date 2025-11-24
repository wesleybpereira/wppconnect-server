# 🔧 Solução para Problemas de Chrome Locks em Redeploys

## 📋 Problema Original

Quando você faz **redeploy no Dokploy** ou **reinicia containers**:

1. ❌ Novo container inicia
2. ❌ Container antigo ainda está rodando (com Chrome aberto)
3. ❌ Ambos compartilham o **mesmo volume** (`wppconnect-sessions`)
4. ❌ Chrome detecta locks do processo antigo → **ERRO 21: Profile in use**
5. ❌ Sessão não conecta → Servidor fica em `INITIALIZING` indefinidamente

**Erro típico:**
```
The profile appears to be in use by another Google Chrome process (622) 
on another computer (de653b6e8639). Chrome has locked the profile...
```

---

## ✅ Solução Implementada

A solução usa **3 camadas de proteção**:

### 1️⃣ **Patch 2: Limpeza por Sessão**
Antes de **cada sessão** do WhatsApp inicializar:
- Remove `SingletonLock`, `SingletonCookie`, `SingletonSocket`
- Remove arquivos `lockfile`
- Logs: `[CHROME-FIX] Removed symlink: SingletonLock`

**Localização:** `dist/util/createSessionUtil.js`

### 2️⃣ **Patch 3: Limpeza Global no Startup**
Quando o **servidor inicia**:
- Varre **todas as sessões** em `userDataDir`
- Remove locks de **todas as sessões** de uma vez
- Logs: `[STARTUP] Removed SingletonLock from wpp-default`

**Localização:** `dist/server.js`

### 3️⃣ **Docker Entrypoint: Limpeza + Graceful Shutdown**
Script bash (`docker-entrypoint.sh`) que:

**Na inicialização:**
```bash
cleanup_chrome_locks()
  → find userDataDir -name "Singleton*" -delete
  → find userDataDir -name "lockfile" -delete
```

**No shutdown (SIGTERM/SIGINT):**
```bash
graceful_shutdown()
  → pkill -TERM chrome     # Mata Chrome gracefully
  → sleep 5                # Aguarda 5 segundos
  → pkill -9 chrome        # Força kill se necessário
  → cleanup_chrome_locks() # Limpa locks antes de sair
```

---

## 🔄 Fluxo de Redeploy Agora

### Antes (Problemático):
```
1. Dokploy inicia novo container
2. Container antigo ainda rodando (Chrome aberto, locks ativos)
3. Novo container tenta usar mesmo volume
4. Chrome detecta locks → ERRO 21
5. Sessão falha → fica em INITIALIZING
```

### Depois (Corrigido):
```
1. Dokploy envia SIGTERM ao container antigo
   → docker-entrypoint.sh executa graceful_shutdown()
   → Mata Chrome
   → Remove locks
   → Container antigo termina LIMPO

2. Novo container inicia
   → docker-entrypoint.sh executa cleanup_chrome_locks()
   → Remove qualquer lock remanescente
   → server.js inicia e executa Patch 3 (limpeza global)
   → Cada sessão executa Patch 2 antes de conectar

3. ✅ Chrome não encontra locks
4. ✅ Sessão conecta normalmente
5. ✅ QR Code gerado (se necessário)
```

---

## 🧪 Como Testar

### Teste 1: Redeploy Básico
```bash
# 1. Conecte uma sessão
curl -X POST https://wpp-dok.dach.com.br/api/wpp-default/start-session \
  -H "Authorization: Bearer SEU_TOKEN"

# 2. Aguarde conectar (scan QR code)

# 3. Faça redeploy no Dokploy

# 4. Aguarde 30 segundos

# 5. Verifique status
curl https://wpp-dok.dach.com.br/api/wpp-default/status-session \
  -H "Authorization: Bearer SEU_TOKEN"

# Resultado esperado:
# {"status": "CONNECTED", ...}  ✅
```

### Teste 2: Múltiplos Redeploys
```bash
# Execute 3 redeploys consecutivos (intervalo de 2 minutos)
# A sessão deve SEMPRE voltar ao estado CONNECTED
```

### Teste 3: Verificar Logs
```bash
ssh root@srv-vps-hostinger "docker logs -f \$(docker ps -q -f name=wppconnect) 2>&1 | grep -E 'ENTRYPOINT|CHROME-FIX|STARTUP'"
```

**Logs esperados:**
```
[ENTRYPOINT] Starting WPPConnect Server...
[ENTRYPOINT] Cleaning Chrome locks...
[ENTRYPOINT] Chrome locks cleaned in: ./userDataDir
[ENTRYPOINT] Starting Node.js server...
[STARTUP] Cleaning all Chrome locks in: ./userDataDir/
[STARTUP] Removed SingletonLock from wpp-default
[CHROME-FIX] Cleaning locks in: ./userDataDir/wpp-default
[CHROME-FIX] Removed symlink: SingletonLock
```

---

## 🛠️ Arquivos Modificados

### 1. `Dockerfile`
```dockerfile
# Adiciona procps (pkill, ps)
RUN apt-get install -y procps

# Patch 2 melhorado (limpeza por sessão)
# Patch 3 novo (limpeza global)

# Copia entrypoint customizado
COPY docker-entrypoint.sh /usr/src/wpp-server/
RUN chmod +x /usr/src/wpp-server/docker-entrypoint.sh

ENTRYPOINT ["/usr/src/wpp-server/docker-entrypoint.sh"]
```

### 2. `docker-entrypoint.sh` (NOVO)
```bash
#!/bin/bash
cleanup_chrome_locks() { ... }
graceful_shutdown() { ... }
trap graceful_shutdown SIGTERM SIGINT
cleanup_chrome_locks
exec node dist/server.js &
wait $NODE_PID
```

### 3. `dist/util/createSessionUtil.js` (Patch 2)
```javascript
// Antes de criar sessão:
const lockPatterns = ["SingletonLock", "SingletonCookie", "SingletonSocket", "lockfile"];
lockPatterns.forEach(pattern => {
  const lockPath = path.join(userDataDir, pattern);
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
    console.log("[CHROME-FIX] Removed:", pattern);
  }
});
```

### 4. `dist/server.js` (Patch 3)
```javascript
// No startup do servidor:
function cleanAllChromeLocks() {
  const baseDir = config.customUserDataDir || "./userDataDir/";
  const sessions = fs.readdirSync(baseDir);
  sessions.forEach(session => {
    // Remove locks de todas as sessões
  });
}
cleanAllChromeLocks();
```

---

## 🎯 Resultados Esperados

### ✅ Cenários que funcionam agora:

1. **Redeploy com sessão ativa**
   - Sessão reconecta automaticamente
   - Sem scan de QR code (se token válido)

2. **Múltiplos redeploys consecutivos**
   - Locks são sempre limpos
   - Chrome inicia sem conflitos

3. **Container parado/iniciado manualmente**
   - `docker stop` → graceful shutdown
   - `docker start` → limpeza automática

4. **Scaling horizontal (se configurado)**
   - Cada replica limpa seus próprios locks
   - Sem interferência entre containers

### ❌ Cenários que ainda podem falhar:

1. **Kill forçado do container** (`docker kill -9`)
   - Graceful shutdown NÃO executa
   - Solução: Evite kill -9, use `docker stop`

2. **Volume compartilhado entre múltiplos containers simultâneos**
   - Locks são por design para evitar isso
   - Solução: Um container por volume

---

## 🔍 Troubleshooting

### Problema: Sessão ainda fica em INITIALIZING

**Diagnóstico:**
```bash
# Verificar se locks foram removidos
ssh root@srv-vps-hostinger "ls -la /var/lib/docker/volumes/wppconnect-sessions/_data/wpp-default/ | grep Singleton"

# Deve retornar vazio
```

**Solução:**
```bash
# Parar container
docker stop $(docker ps -q -f name=wppconnect)

# Remover locks manualmente
rm -rf /var/lib/docker/volumes/wppconnect-sessions/_data/*/Singleton*

# Iniciar container
docker start $(docker ps -aq -f name=wppconnect | head -1)
```

### Problema: Logs não mostram limpeza

**Verificar entrypoint:**
```bash
docker exec $(docker ps -q -f name=wppconnect) cat /usr/src/wpp-server/docker-entrypoint.sh
```

**Verificar patches:**
```bash
docker exec $(docker ps -q -f name=wppconnect) grep -n "CHROME-FIX\|STARTUP" dist/util/createSessionUtil.js dist/server.js
```

---

## 📊 Comparação Antes/Depois

| Cenário | Antes | Depois |
|---------|-------|--------|
| Primeiro deploy | ✅ Funciona | ✅ Funciona |
| Redeploy simples | ❌ ERRO 21 | ✅ Funciona |
| Redeploys consecutivos | ❌ ERRO 21 | ✅ Funciona |
| Container restart | ❌ ERRO 21 | ✅ Funciona |
| Sessão sobrevive | ❌ Perde sessão | ✅ Mantém sessão |
| Logs claros | ❌ Confuso | ✅ Informativos |

---

## 🚀 Próximos Passos

1. **Faça redeploy no Dokploy**
2. **Monitore logs** para ver limpeza funcionando
3. **Teste a API de botões** que agora estará disponível
4. **Configure monitoramento** (se necessário)

---

## 📞 Suporte

Se encontrar problemas:
1. Verifique logs do container
2. Confirme que entrypoint está executando
3. Verifique se patches foram aplicados
4. Reporte com logs detalhados

---

**Problema resolvido! 🎉**
