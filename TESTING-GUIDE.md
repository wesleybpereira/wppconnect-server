# 🧪 Guia de Testes - API de Botões Interativos

## 📋 Pré-requisitos

Antes de começar os testes:

1. ✅ WPPConnect Server rodando
2. ✅ Sessão do WhatsApp ativa
3. ✅ Token de autenticação válido
4. ✅ Número de telefone de teste

## 🚀 Testes Básicos

### Teste 1: Enviar Mensagem Simples com Botões

```bash
curl -X POST http://localhost:21465/api/session1/send-interactive-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "phone": ["5521999999999"],
    "message": "Teste de botões - escolha uma opção:",
    "buttons": [
      {"id": "test_1", "title": "Opção 1"},
      {"id": "test_2", "title": "Opção 2"}
    ]
  }'
```

**Resultado Esperado:**
```json
{
  "status": "success",
  "response": [{
    "id": "true_5521999999999@c.us_...",
    "ack": 1
  }]
}
```

---

### Teste 2: Enviar com Cabeçalho e Rodapé

```bash
curl -X POST http://localhost:21465/api/session1/send-interactive-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "phone": ["5521999999999"],
    "header": "🤖 Bot de Teste",
    "message": "Mensagem com header e footer",
    "footer": "Powered by WPPConnect",
    "buttons": [
      {"id": "yes", "title": "Sim"},
      {"id": "no", "title": "Não"},
      {"id": "maybe", "title": "Talvez"}
    ]
  }'
```

---

### Teste 3: Detectar Botões em Mensagem

Primeiro, envie uma mensagem com botões e pegue o `message_id` da resposta.

```bash
curl -X POST http://localhost:21465/api/session1/detect-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "messageId": "true_5521999999999@c.us_3EB0..."
  }'
```

**Resultado Esperado:**
```json
{
  "status": "success",
  "response": {
    "hasButtons": true,
    "buttons": [
      {"id": "yes", "title": "Sim", "type": "reply"},
      {"id": "no", "title": "Não", "type": "reply"},
      {"id": "maybe", "title": "Talvez", "type": "reply"}
    ],
    "message": {
      "id": "true_5521999999999@c.us_...",
      "type": "buttons",
      "from": "5521999999999@c.us",
      "timestamp": 1700000000
    }
  }
}
```

---

### Teste 4: Responder a um Botão

```bash
curl -X POST http://localhost:21465/api/session1/reply-button \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "phone": ["5521999999999"],
    "buttonId": "yes",
    "buttonTitle": "Sim",
    "messageId": "true_5521999999999@c.us_3EB0..."
  }'
```

**Resultado Esperado:**
```json
{
  "status": "success",
  "response": [{
    "id": "true_5521999999999@c.us_...",
    "method": "button_reply",
    "ack": 1
  }]
}
```

---

## 🧪 Testes de Validação

### Teste 5: Validação - Sem Botões

```bash
curl -X POST http://localhost:21465/api/session1/send-interactive-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "phone": ["5521999999999"],
    "message": "Teste sem botões",
    "buttons": []
  }'
```

**Resultado Esperado:**
```json
{
  "status": "error",
  "message": "At least one button is required"
}
```

---

### Teste 6: Validação - Mais de 3 Botões

```bash
curl -X POST http://localhost:21465/api/session1/send-interactive-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "phone": ["5521999999999"],
    "message": "Teste com 4 botões",
    "buttons": [
      {"id": "1", "title": "Um"},
      {"id": "2", "title": "Dois"},
      {"id": "3", "title": "Três"},
      {"id": "4", "title": "Quatro"}
    ]
  }'
```

**Resultado Esperado:**
```json
{
  "status": "error",
  "message": "Maximum of 3 buttons allowed"
}
```

---

### Teste 7: Validação - Título Muito Longo

```bash
curl -X POST http://localhost:21465/api/session1/send-interactive-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "phone": ["5521999999999"],
    "message": "Teste título longo",
    "buttons": [
      {"id": "1", "title": "Este título tem mais de vinte caracteres"}
    ]
  }'
```

**Resultado Esperado:**
```json
{
  "status": "error",
  "message": "Button title \"Este título tem mais de vinte caracteres\" exceeds 20 characters"
}
```

---

### Teste 8: Validação - Campos Faltando

```bash
curl -X POST http://localhost:21465/api/session1/send-interactive-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "phone": ["5521999999999"],
    "message": "Teste campos faltando",
    "buttons": [
      {"id": "1"}
    ]
  }'
```

**Resultado Esperado:**
```json
{
  "status": "error",
  "message": "Each button must have an id and title"
}
```

---

## 🤖 Testes de Automação

### Teste 9: Fluxo Completo Bot-to-Bot

**Script Node.js:**

```javascript
const baseUrl = 'http://localhost:21465';
const session = 'session1';
const token = 'SEU_TOKEN_AQUI';
const phone = '5521999999999';

async function testeFluxoCompleto() {
  // 1. Enviar mensagem com botões
  console.log('1. Enviando mensagem com botões...');
  const sendResponse = await fetch(`${baseUrl}/api/${session}/send-interactive-buttons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      phone: [phone],
      message: 'Teste automático - escolha:',
      buttons: [
        { id: 'auto_yes', title: 'Sim' },
        { id: 'auto_no', title: 'Não' }
      ]
    })
  });
  
  const sendResult = await sendResponse.json();
  console.log('Enviado:', sendResult);
  
  const messageId = sendResult.response[0].id;
  
  // 2. Aguardar 2 segundos
  console.log('2. Aguardando 2 segundos...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 3. Detectar botões
  console.log('3. Detectando botões...');
  const detectResponse = await fetch(`${baseUrl}/api/${session}/detect-buttons`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ messageId })
  });
  
  const detectResult = await detectResponse.json();
  console.log('Botões detectados:', detectResult.response.buttons);
  
  // 4. Responder ao primeiro botão
  console.log('4. Respondendo ao botão...');
  const button = detectResult.response.buttons[0];
  const replyResponse = await fetch(`${baseUrl}/api/${session}/reply-button`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      phone: [phone],
      buttonId: button.id,
      buttonTitle: button.title,
      messageId
    })
  });
  
  const replyResult = await replyResponse.json();
  console.log('Resposta enviada:', replyResult);
  
  console.log('✅ Teste completo finalizado!');
}

testeFluxoCompleto().catch(console.error);
```

---

## 📊 Testes de Performance

### Teste 10: Múltiplos Destinatários

```bash
curl -X POST http://localhost:21465/api/session1/send-interactive-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "phone": ["5521111111111", "5521222222222", "5521333333333"],
    "message": "Mensagem em massa com botões",
    "buttons": [
      {"id": "opt1", "title": "Opção 1"}
    ]
  }'
```

---

### Teste 11: Stress Test (10 mensagens consecutivas)

**Script Bash:**

```bash
#!/bin/bash
TOKEN="SEU_TOKEN_AQUI"
SESSION="session1"
PHONE="5521999999999"

for i in {1..10}
do
  echo "Enviando mensagem $i..."
  curl -X POST "http://localhost:21465/api/$SESSION/send-interactive-buttons" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"phone\": [\"$PHONE\"],
      \"message\": \"Teste $i\",
      \"buttons\": [{\"id\": \"test_$i\", \"title\": \"Botão $i\"}]
    }"
  echo ""
  sleep 1
done

echo "Teste finalizado!"
```

---

## 🔍 Testes de Fallback

### Teste 12: Verificar Fallback para Texto

Se o método `sendButtons` não estiver disponível, o sistema deve converter automaticamente para texto formatado.

**Mensagem esperada no WhatsApp:**
```
Mensagem principal

1. Opção 1
2. Opção 2
3. Opção 3
```

Verifique os logs do servidor para confirmar:
```
[WARN] sendButtons not available, falling back to text message
[INFO] Fallback text message sent successfully
```

---

## 📝 Checklist de Testes

### Funcionalidade Básica:
- [ ] Enviar mensagem com 1 botão
- [ ] Enviar mensagem com 2 botões
- [ ] Enviar mensagem com 3 botões
- [ ] Enviar com header
- [ ] Enviar com footer
- [ ] Enviar com header e footer
- [ ] Detectar botões em mensagem
- [ ] Responder a botão
- [ ] Responder sem messageId

### Validações:
- [ ] Rejeitar 0 botões
- [ ] Rejeitar mais de 3 botões
- [ ] Rejeitar título > 20 chars
- [ ] Rejeitar sem id
- [ ] Rejeitar sem title
- [ ] Validar phone obrigatório
- [ ] Validar message obrigatório

### Fallback:
- [ ] Verificar fallback para texto (envio)
- [ ] Verificar fallback para texto (resposta)
- [ ] Logs de fallback gerados
- [ ] Mensagem formatada corretamente

### Performance:
- [ ] Enviar para múltiplos destinatários
- [ ] 10 mensagens consecutivas
- [ ] 100 mensagens (opcional)
- [ ] Verificar rate limiting

### Integração:
- [ ] Webhook recebendo eventos
- [ ] Bot-to-bot funcionando
- [ ] Autenticação funcionando
- [ ] Middleware statusConnection OK

---

## 🐛 Troubleshooting

### Erro: "The session is not active"
**Solução:** Certifique-se de que a sessão está conectada:
```bash
curl http://localhost:21465/api/session1/status-session \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Erro: "No button reply method available"
**Solução:** Normal! O sistema usará fallback automático para texto.

### Botões não aparecem no WhatsApp
**Possíveis causas:**
1. Versão do WhatsApp não suporta botões
2. WPPConnect não tem método disponível
3. Sistema usou fallback (verifique logs)

### Resposta de botão não funciona
**Solução:** Verifique:
1. MessageId está correto
2. ButtonId corresponde ao botão original
3. Logs do servidor para ver qual método foi usado

---

## 📈 Métricas de Sucesso

### Taxa de Sucesso Esperada:
- ✅ Envio de botões: **90-100%**
- ✅ Detecção de botões: **95-100%**
- ✅ Resposta de botões: **70-90%** (pode usar fallback)
- ✅ Validações: **100%**

### Logs Esperados:
```
[INFO] Attempting to send button reply: btn_1 - Opção 1
[INFO] Button reply sent successfully
```

ou

```
[WARN] Button reply failed: No button reply method available
[INFO] Falling back to text message
[INFO] Fallback text message sent successfully
```

---

## ✅ Conclusão dos Testes

Após executar todos os testes:

1. ✅ Todos os endpoints devem responder
2. ✅ Validações devem funcionar corretamente
3. ✅ Fallback deve ativar quando necessário
4. ✅ Logs devem ser claros e informativos
5. ✅ Performance deve ser aceitável

**Se todos os testes passarem: IMPLEMENTAÇÃO VALIDADA! 🎉**

---

## 📞 Reportar Problemas

Se encontrar problemas:
1. Verifique os logs do servidor
2. Confirme versão do WPPConnect
3. Teste com fallback de texto
4. Reporte no GitHub com logs detalhados

---

**Happy Testing! 🧪**
