# Guia de Manutenção do Fork WPPConnect + Dokploy

## Estrutura do Repositório

```
wesleybpereira/wppconnect-server (seu fork)
├── main              ← sincroniza com wppconnect-team/wppconnect-server
└── dokploy-custom    ← suas customizações para Dokploy
```

## Modificações Mínimas Recomendadas

Para facilitar atualizações futuras, mantenha **apenas estas modificações** na branch `dokploy-custom`:

### 1. Dockerfile
```diff
- ARG WPPCONNECT_VERSION=main
- RUN git clone --depth 1 --branch ${WPPCONNECT_VERSION} \
-     https://github.com/wppconnect-team/wppconnect-server.git . && \

+ ARG WPPCONNECT_VERSION=dokploy-custom
+ RUN git clone --depth 1 --branch ${WPPCONNECT_VERSION} \
+     https://github.com/wesleybpereira/wppconnect-server.git . && \
```

### 2. src/config.ts
Mantenha a função `env()` para leitura em runtime das variáveis de ambiente.

### 3. DOKPLOY-CONFIG.md
Documentação específica do deploy no Dokploy.

## Como Atualizar quando o Upstream Lançar Nova Versão

### Método 1: Script Automático (Recomendado)

```bash
# Executar o script de atualização
./scripts/update-from-upstream.sh

# Testar localmente
yarn install
yarn build

# Se tudo OK, enviar para remote
git push origin dokploy-custom --force

# Fazer redeploy no Dokploy
```

### Método 2: Manual

```bash
# 1. Adicionar upstream (apenas primeira vez)
git remote add upstream https://github.com/wppconnect-team/wppconnect-server.git

# 2. Buscar atualizações
git fetch upstream

# 3. Atualizar main
git checkout main
git merge upstream/main
git push origin main

# 4. Rebase dokploy-custom
git checkout dokploy-custom
git rebase main

# 5. Resolver conflitos (se houver)
# Editar arquivos conflitantes
git add .
git rebase --continue

# 6. Push forçado (rebase reescreve histórico)
git push origin dokploy-custom --force
```

## Gerenciamento de Conflitos

### Arquivos que Provavelmente Terão Conflitos

1. **src/config.ts** - Suas modificações vs upstream
2. **Dockerfile** - URL do repositório
3. **package.json** - Se houver mudanças de dependências

### Estratégia de Resolução

Para `src/config.ts`:
1. Aceitar as mudanças do upstream primeiro
2. Reaplicar sua função `env()` manualmente
3. Comparar com backup usando: `git show dokploy-custom-backup:src/config.ts`

Para `Dockerfile`:
1. Aceitar mudanças do upstream
2. Apenas modificar a URL do repositório novamente

## Boas Práticas

### ✅ FAÇA

- Mantenha dokploy-custom com **mínimas modificações**
- Documente cada mudança que fizer
- Teste localmente antes de fazer push
- Crie backup antes de rebase: `git branch -f dokploy-custom-backup dokploy-custom`
- Mantenha um CHANGELOG.md com suas customizações

### ❌ NÃO FAÇA

- Modificar arquivos desnecessariamente
- Fazer mudanças funcionais que não sejam relacionadas ao Dokploy
- Esquecer de testar após merge/rebase
- Fazer push direto sem testar build

## Checklist Pós-Atualização

```bash
# 1. Build local funciona?
yarn install
yarn build

# 2. Arquivos críticos estão corretos?
git diff main..dokploy-custom -- Dockerfile
git diff main..dokploy-custom -- src/config.ts

# 3. Testes passam? (se houver)
yarn test

# 4. Push
git push origin dokploy-custom --force

# 5. Redeploy no Dokploy e verificar logs
```

## Troubleshooting

### "Conflito no rebase que não consigo resolver"

```bash
# Abortar e tentar merge ao invés de rebase
git rebase --abort
git merge main
# Resolver conflitos
git commit
git push origin dokploy-custom
```

### "Quero voltar atrás"

```bash
# Se você criou backup
git reset --hard dokploy-custom-backup

# Se não criou backup, usar reflog
git reflog
git reset --hard HEAD@{n}  # n = número do commit antes do rebase
```

### "Build falhou após atualização"

```bash
# 1. Verificar se config.ts tem a função env()
cat src/config.ts | grep "const env"

# 2. Verificar se Dockerfile aponta para seu fork
cat Dockerfile | grep "git clone"

# 3. Limpar node_modules e rebuild
rm -rf node_modules yarn.lock
yarn install
yarn build
```

## Alternativa: Cherry-pick ao invés de Rebase

Se você tiver **poucas modificações**, pode usar cherry-pick:

```bash
# 1. Listar seus commits únicos
git log main..dokploy-custom --oneline

# 2. Criar nova branch a partir de main atualizado
git checkout main
git pull upstream main
git checkout -b dokploy-custom-new

# 3. Cherry-pick seus commits
git cherry-pick <commit-hash-1>
git cherry-pick <commit-hash-2>

# 4. Substituir dokploy-custom antiga
git branch -D dokploy-custom
git branch -m dokploy-custom-new dokploy-custom
git push origin dokploy-custom --force
```

## Contato e Suporte

- **Repositório Upstream**: https://github.com/wppconnect-team/wppconnect-server
- **Seu Fork**: https://github.com/wesleybpereira/wppconnect-server
- **Documentação WPPConnect**: https://wppconnect.io/docs

---

**Última atualização**: 2025-11-16
