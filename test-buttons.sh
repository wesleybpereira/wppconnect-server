#!/bin/bash

# Script de Teste - API de Botões Interativos
# Execute: bash test-buttons.sh

# CONFIGURAÇÕES - AJUSTE AQUI!
BASE_URL="http://localhost:21465"
SESSION="session1"
TOKEN="SEU_TOKEN_AQUI"
PHONE="5521999999999"  # Seu número de teste

echo "🧪 Testando API de Botões Interativos do WPPConnect"
echo "=================================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para testar endpoint
test_endpoint() {
  local name=$1
  local endpoint=$2
  local data=$3
  
  echo -e "${YELLOW}Testando: $name${NC}"
  echo "Endpoint: $endpoint"
  echo "Payload: $data"
  echo ""
  
  response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$data")
  
  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')
  
  if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
    echo -e "${GREEN}✅ Sucesso (HTTP $http_code)${NC}"
    echo "Resposta:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
  else
    echo -e "${RED}❌ Erro (HTTP $http_code)${NC}"
    echo "Resposta:"
    echo "$body"
  fi
  
  echo ""
  echo "=================================================="
  echo ""
}

# Teste 1: Verificar se servidor está rodando
echo "1️⃣  Verificando se servidor está rodando..."
if curl -s "$BASE_URL/healthz" > /dev/null 2>&1; then
  echo -e "${GREEN}✅ Servidor está rodando!${NC}"
  echo ""
else
  echo -e "${RED}❌ Servidor não está respondendo em $BASE_URL${NC}"
  echo "Certifique-se de que o wppconnect-server está rodando:"
  echo "  npm run dev"
  echo ""
  exit 1
fi

# Teste 2: Enviar mensagem simples com botões
test_endpoint \
  "Enviar mensagem com 2 botões" \
  "/api/$SESSION/send-interactive-buttons" \
  '{
    "phone": ["'$PHONE'"],
    "message": "🧪 Teste de botões - escolha uma opção:",
    "buttons": [
      {"id": "test_yes", "title": "✅ Sim"},
      {"id": "test_no", "title": "❌ Não"}
    ]
  }'

# Aguardar 2 segundos
echo "⏳ Aguardando 2 segundos..."
sleep 2
echo ""

# Teste 3: Enviar com header e footer
test_endpoint \
  "Enviar com header e footer" \
  "/api/$SESSION/send-interactive-buttons" \
  '{
    "phone": ["'$PHONE'"],
    "header": "🤖 Bot de Teste",
    "message": "Mensagem completa com cabeçalho e rodapé",
    "footer": "Powered by WPPConnect",
    "buttons": [
      {"id": "opt1", "title": "Opção 1"},
      {"id": "opt2", "title": "Opção 2"},
      {"id": "opt3", "title": "Opção 3"}
    ]
  }'

# Teste 4: Validação - Testar erro (mais de 3 botões)
echo -e "${YELLOW}4️⃣  Testando validação (deve dar erro - mais de 3 botões)${NC}"
test_endpoint \
  "Validação - Mais de 3 botões" \
  "/api/$SESSION/send-interactive-buttons" \
  '{
    "phone": ["'$PHONE'"],
    "message": "Teste com 4 botões (deve falhar)",
    "buttons": [
      {"id": "1", "title": "Um"},
      {"id": "2", "title": "Dois"},
      {"id": "3", "title": "Três"},
      {"id": "4", "title": "Quatro"}
    ]
  }'

# Teste 5: Validação - Título muito longo
echo -e "${YELLOW}5️⃣  Testando validação (deve dar erro - título > 20 chars)${NC}"
test_endpoint \
  "Validação - Título longo" \
  "/api/$SESSION/send-interactive-buttons" \
  '{
    "phone": ["'$PHONE'"],
    "message": "Teste título muito longo (deve falhar)",
    "buttons": [
      {"id": "1", "title": "Este título tem mais de vinte caracteres"}
    ]
  }'

echo ""
echo "🎉 Testes finalizados!"
echo ""
echo "📝 Próximos passos:"
echo "  1. Verifique as mensagens no WhatsApp do número: $PHONE"
echo "  2. Para testar resposta a botões, use o exemplo no TESTING-GUIDE.md"
echo "  3. Para ver logs detalhados, verifique o terminal do servidor"
echo ""
echo "📖 Documentação completa:"
echo "  - BUTTONS-QUICK-START.md"
echo "  - BUTTONS-API-GUIDE.md"
echo "  - TESTING-GUIDE.md"
echo ""
