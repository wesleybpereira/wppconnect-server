#!/bin/bash
set -e

echo "🔄 Atualizando fork do WPPConnect Server"
echo "========================================="

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar se está no diretório correto
if [ ! -f "package.json" ] || ! grep -q "wppconnect" package.json; then
    echo -e "${RED}❌ Erro: Execute este script na raiz do projeto wppconnect-server${NC}"
    exit 1
fi

# 2. Salvar branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${YELLOW}📍 Branch atual: ${CURRENT_BRANCH}${NC}"

# 3. Verificar se há mudanças não commitadas
if ! git diff-index --quiet HEAD --; then
    echo -e "${RED}❌ Há mudanças não commitadas. Faça commit ou stash primeiro.${NC}"
    exit 1
fi

# 4. Adicionar upstream se não existir
if ! git remote | grep -q "^upstream$"; then
    echo -e "${GREEN}➕ Adicionando repositório upstream...${NC}"
    git remote add upstream https://github.com/wppconnect-team/wppconnect-server.git
fi

# 5. Buscar atualizações do upstream
echo -e "${GREEN}📥 Buscando atualizações do upstream...${NC}"
git fetch upstream

# 6. Atualizar branch main
echo -e "${GREEN}🔄 Atualizando branch main...${NC}"
git checkout main
git merge upstream/main --no-edit

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Branch main atualizada com sucesso${NC}"
    git push origin main
else
    echo -e "${RED}❌ Erro ao mergear upstream/main. Resolva conflitos manualmente.${NC}"
    exit 1
fi

# 7. Fazer backup da dokploy-custom
echo -e "${YELLOW}💾 Criando backup da branch dokploy-custom...${NC}"
git branch -f dokploy-custom-backup dokploy-custom

# 8. Rebase dokploy-custom
echo -e "${GREEN}🔄 Fazendo rebase de dokploy-custom em main...${NC}"
git checkout dokploy-custom
git rebase main

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Rebase concluído com sucesso${NC}"
    echo -e "${YELLOW}⚠️  Verifique se tudo está funcionando antes de fazer push${NC}"
    echo ""
    echo "Para enviar as mudanças:"
    echo "  git push origin dokploy-custom --force"
    echo ""
    echo "Para desfazer (se algo deu errado):"
    echo "  git reset --hard dokploy-custom-backup"
else
    echo -e "${RED}❌ Conflitos durante rebase. Resolva manualmente:${NC}"
    echo "  1. Edite os arquivos em conflito"
    echo "  2. git add <arquivos-resolvidos>"
    echo "  3. git rebase --continue"
    echo ""
    echo "Para abortar o rebase:"
    echo "  git rebase --abort"
    echo "  git reset --hard dokploy-custom-backup"
    exit 1
fi

# 9. Voltar para branch original
git checkout "$CURRENT_BRANCH"

echo -e "${GREEN}✅ Processo concluído!${NC}"
echo ""
echo "📋 Próximos passos:"
echo "  1. Teste localmente: yarn install && yarn build"
echo "  2. Se tudo OK: git push origin dokploy-custom --force"
echo "  3. Faça redeploy no Dokploy"
echo "  4. Remova o backup: git branch -D dokploy-custom-backup"
