# Plano de Atualização do wppconnect-server

## 1. Fix Aplicado - Maximum call stack size exceeded

### O que foi feito:
Foi adicionado ao `package.json` as seguintes dependências conforme recomendação da comunidade:

```json
"@wppconnect/wa-js": "https://github.com/wppconnect-team/wa-js/archive/refs/tags/nightly.tar.gz",
"@wppconnect/wa-version": "^1.5.2709"
```

### Próximos passos para aplicar o fix:

```bash
# 1. Limpar cache e reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**IMPORTANTE**: Você está usando `yarn.lock`, então deve usar:

```bash
# Limpar cache do yarn
yarn cache clean
rm -rf node_modules yarn.lock
yarn install
```

## 2. Estado Atual do Repositório

### Versão Atual:
- `@wppconnect-team/wppconnect`: **1.37.5**
- Baseado no upstream commit: `493f42c` (aproximadamente v2.8.6)

### Última Versão Upstream:
- Commit mais recente: `7172948` - "Inclusão da opção de enviar botão do PIX (#2374)"
- Versão: **v2.8.6** (mesma base)
- `@wppconnect-team/wppconnect`: **1.37.6** (versão mais nova disponível)

## 3. Customizações da Branch dokploy-custom

Suas customizações incluem **5.720 linhas adicionadas** em 27 arquivos:

### Arquivos de Configuração/Deploy:
- `.env.example` - Variáveis de ambiente
- `Dockerfile` - Build customizado para Dokploy/Alpine/Debian
- `docker-entrypoint.sh` - Script de inicialização
- `nixpacks.toml` - Configuração Nixpacks
- `scripts/start.sh` - Script de start

### Documentação Adicionada:
- `BUTTONS-API-GUIDE.md` - Guia completo de API de botões
- `BUTTONS-QUICK-START.md` - Quick start para botões
- `CHROME-LOCK-FIX.md` - Correção de locks do Chrome
- `COMO-TESTAR.md` - Guia de testes
- `DOKPLOY-CONFIG.md` - Configuração Dokploy
- `ENV-VARS-GUIDE.md` - Guia de variáveis de ambiente
- `EXECUTIVE-SUMMARY.md` - Resumo executivo
- `IMPLEMENTATION-SUMMARY.md` - Resumo de implementação
- `MAINTAINING-FORK.md` - Manutenção do fork
- `README-DOKPLOY.md` - README para Dokploy
- `SOLUTION-COMPARISON.md` - Comparação de soluções
- `TESTING-GUIDE.md` - Guia de testes
- `TROUBLESHOOTING-QRCODE.md` - Troubleshooting QR Code

### Código Customizado:
- `src/config.ts.original` - Backup da config original
- `src/controller/messageController.ts` - Controller de mensagens modificado
- `src/examples/button-usage-examples.ts` - Exemplos de uso de botões
- `src/routes/index.ts` - Rotas adicionadas
- `src/types/ButtonTypes.ts` - Tipos TypeScript para botões
- `src/util/buttonHelper.ts` - Helper para botões

### Patches e Testes:
- `patches/fix-close-session.patch` - Patch para corrigir close session
- `test-buttons.js` - Testes de botões
- `test-buttons.sh` - Script de testes

## 4. Estratégia de Atualização Segura

### Opção A: Atualização Conservadora (RECOMENDADA)
Aplicar apenas o fix do "Maximum call stack size exceeded" sem fazer merge do upstream:

```bash
# 1. Criar branch de backup
git checkout -b backup-before-fix

# 2. Voltar para dokploy-custom
git checkout dokploy-custom

# 3. Limpar e reinstalar com as novas dependências
yarn cache clean
rm -rf node_modules yarn.lock
yarn install

# 4. Testar aplicação
yarn dev
# OU
yarn build
yarn start

# 5. Commit das mudanças
git add package.json yarn.lock
git commit -m "fix: Add @wppconnect/wa-js and @wppconnect/wa-version to fix Maximum call stack size exceeded"
```

### Opção B: Atualização Incremental (Para depois de testar Opção A)
Atualizar dependências específicas do upstream:

```bash
# Atualizar apenas @wppconnect-team/wppconnect para v1.37.6
# Editar package.json manualmente ou usar:
yarn add @wppconnect-team/wppconnect@^1.37.6

# Outras dependências que podem ser atualizadas com segurança:
yarn add @aws-sdk/client-s3@^3.937.0
yarn add mongoose@^8.19.4
yarn add form-data@^4.0.5
```

### Opção C: Merge Completo do Upstream (AVANÇADO - fazer depois)
Fazer merge completo mantendo suas customizações:

```bash
# 1. Criar branch de teste
git checkout -b test-upstream-merge

# 2. Fazer merge do upstream
git merge upstream/main

# 3. Resolver conflitos manualmente
# Os principais conflitos esperados:
# - src/controller/messageController.ts
# - src/routes/index.ts
# - Dockerfile
# - package.json

# 4. Testar extensivamente antes de fazer merge na dokploy-custom
```

## 5. Checklist de Testes Pós-Atualização

Após aplicar qualquer atualização, teste:

- [ ] Servidor inicia corretamente
- [ ] QR Code é gerado
- [ ] Conexão com WhatsApp funciona
- [ ] Envio de mensagens de texto
- [ ] Envio de botões (sua customização principal)
- [ ] API de botões interativos
- [ ] Envio de mídia (imagens, vídeos, documentos)
- [ ] Webhooks funcionam
- [ ] Deploy no Dokploy funciona
- [ ] Variáveis de ambiente são lidas corretamente

## 6. Mudanças Importantes no Upstream

Commits relevantes desde sua última sincronização:

1. **7172948** - Inclusão da opção de enviar botão do PIX
2. **93c5b4d** - Update @wppconnect-team/wppconnect to ^1.37.6
3. **67752e0** - Update dependency webpack-cli to v6
4. **27cac9d** - Update @aws-sdk/client-s3 to ^3.937.0

## 7. Recomendação Final

**FAÇA AGORA:**
1. ✅ Já aplicamos o fix no package.json
2. Execute: `yarn cache clean && rm -rf node_modules yarn.lock && yarn install`
3. Teste a aplicação localmente
4. Faça commit e push
5. Teste no Dokploy

**FAÇA DEPOIS (quando tiver tempo):**
1. Considere atualizar para @wppconnect-team/wppconnect@^1.37.6
2. Avalie fazer merge incremental de outras atualizações
3. Mantenha documentação do que foi customizado

## 8. Como Manter o Fork Atualizado

Para futuras atualizações:

```bash
# Buscar atualizações do upstream periodicamente
git fetch upstream

# Ver o que mudou
git log upstream/main --oneline -20

# Ver diferenças
git diff upstream/main...dokploy-custom

# Decidir se quer fazer merge
git merge upstream/main
```

## 9. Arquivos a Monitorar em Atualizações

Estes arquivos têm grandes chances de conflito em merges futuros:

- `src/controller/messageController.ts` (+364 linhas suas)
- `src/util/buttonHelper.ts` (+375 linhas suas)
- `src/types/ButtonTypes.ts` (+163 linhas suas)
- `Dockerfile` (muito modificado)
- `src/routes/index.ts` (+18 linhas suas)

Mantenha backups desses arquivos antes de qualquer merge!
