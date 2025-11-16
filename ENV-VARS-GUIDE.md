# Guia: Como Fazer o Sistema Reconhecer Variáveis do Dokploy

## 📊 Resumo das Modificações Atuais

Arquivos modificados na branch `dokploy-custom`:

| Arquivo | Modificado? | Necessário? | Motivo |
|---------|-------------|-------------|---------|
| `Dockerfile` | ✅ Sim | ✅ Sim | Apontar para fork/configurações |
| `src/config.ts` | ✅ Sim | ❌ Não* | Pode evitar com solução alternativa |
| `.babelrc` | ✅ Sim | ❌ Não | Tentativa de evitar constant folding |
| `scripts/start.sh` | ✅ Sim | ❌ Não | Detectar Chromium (redundante) |
| Documentação | ✅ Sim | ✅ Sim | Guias e troubleshooting |

\* Com a solução correta, não precisa modificar

## 🎯 3 Soluções Possíveis

### Opção 1: Wrapper Runtime (RECOMENDADA) ⭐

**Como funciona:**
- Usa código ORIGINAL do upstream (sem fork)
- Cria `config-runtime.js` que lê env vars em runtime
- Substitui imports após build

**Vantagens:**
- ✅ Zero modificações no código-fonte
- ✅ Atualização = só trocar ARG no Dockerfile
- ✅ Sem conflitos de merge
- ✅ Variáveis do Dokploy funcionam automaticamente

**Desvantagens:**
- ⚠️ Precisa do sed para substituir imports (pode quebrar se mudar estrutura)

**Implementação:**
```bash
# Use o Dockerfile.final criado
cp Dockerfile.final Dockerfile
git add Dockerfile
git commit -m "feat: use runtime wrapper for env vars (no source changes)"
git push origin dokploy-custom
```

**Manutenção futura:**
```dockerfile
# Para atualizar, só mudar a versão:
ARG WPPCONNECT_VERSION=v2.9.0  # ou main, ou qualquer tag
```

---

### Opção 2: Fork com Modificações Mínimas (ATUAL)

**Como funciona:**
- Fork do repositório
- Modifica `src/config.ts` para usar função `env()`
- Dockerfile clona SEU fork

**Vantagens:**
- ✅ Controle total sobre o código
- ✅ Solução testada e funcionando

**Desvantagens:**
- ❌ Precisa fazer merge/rebase a cada atualização
- ❌ Potencial de conflitos
- ❌ Manutenção contínua

**Manutenção futura:**
```bash
# Use o script criado
./scripts/update-from-upstream.sh
```

---

### Opção 3: Build-time ENV Injection

**Como funciona:**
- Passa variáveis como ARG no Docker build
- Usa ARG para substituir valores durante build

**Vantagens:**
- ✅ Sem modificações no código

**Desvantagens:**
- ❌ Não funciona bem com Dokploy (vars runtime vs build-time)
- ❌ Precisa rebuild para mudar variável
- ❌ Segurança: secrets ficam no histórico da imagem

**NÃO RECOMENDADO para este caso**

---

## 🚀 Implementação Recomendada (Opção 1)

### Passo 1: Limpar Branch Atual

```bash
# Voltar arquivos modificados para estado original
git checkout main -- src/config.ts
git checkout main -- .babelrc
git rm scripts/start.sh  # se não for usado

# Manter apenas documentação
git add DOKPLOY-CONFIG.md MAINTAINING-FORK.md README-DOKPLOY.md
```

### Passo 2: Substituir Dockerfile

```bash
# Usar o Dockerfile final (sem modificação de código)
cp Dockerfile.final Dockerfile
git add Dockerfile
```

### Passo 3: Commit e Push

```bash
git commit -m "refactor: use runtime config wrapper instead of source modifications"
git push origin dokploy-custom --force
```

### Passo 4: Redeploy no Dokploy

O Dokploy vai:
1. Clonar código ORIGINAL do upstream
2. Build normal
3. Criar wrapper runtime que injeta vars
4. Suas variáveis do Dokploy funcionam! ✅

---

## 🔍 Comparação de Manutenção

### Com Opção 1 (Wrapper):
```bash
# Atualizar para nova versão
vim Dockerfile  # Mudar ARG WPPCONNECT_VERSION=v2.9.0
git commit -am "chore: update to wppconnect v2.9.0"
git push
# Redeploy no Dokploy
```

### Com Opção 2 (Fork atual):
```bash
# Atualizar para nova versão
./scripts/update-from-upstream.sh
# Resolver conflitos em src/config.ts (sempre)
# Testar build local
# Push forçado
# Redeploy no Dokploy
```

---

## 💡 Recomendação Final

**Use Opção 1** porque:

1. **Simplicidade**: Um único Dockerfile, zero modificações no código
2. **Manutenção**: Trocar 1 linha vs resolver conflitos
3. **Confiabilidade**: Usa código oficial testado
4. **Futuro**: Atualizar = 30 segundos

**Mantenha fork apenas se:**
- Precisar modificar FUNCIONALIDADES (não apenas config)
- Quiser contribuir de volta para upstream
- Tiver customizações complexas além de env vars

---

## 📝 Arquivos Criados para Você

1. `Dockerfile.final` - Solução completa pronta para usar
2. `SOLUTION-COMPARISON.md` - Comparação detalhada
3. `MAINTAINING-FORK.md` - Guia se escolher manter fork
4. `scripts/update-from-upstream.sh` - Script de atualização

---

## ❓ FAQ

**P: E se eu quiser modificar outras coisas além de env vars?**
R: Mantenha o fork, mas documente bem cada modificação.

**P: O wrapper pode quebrar em atualizações?**
R: Improvável. Se a estrutura de imports mudar drasticamente, basta ajustar o sed.

**P: Posso ter ambas as opções?**
R: Sim! Mantenha o fork em `dokploy-custom` e crie `dokploy-wrapper` com Opção 1.

**P: Qual usa menos recursos?**
R: Opção 1 é ligeiramente mais rápida (não precisa clonar fork).
