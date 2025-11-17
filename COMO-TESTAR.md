# 🧪 Como Testar - API de Botões Interativos

## ✅ Pré-requisitos

Antes de testar, certifique-se de que:

1. ✅ O servidor está rodando:
   ```bash
   npm run dev
   ```

2. ✅ Você tem uma sessão ativa do WhatsApp
3. ✅ Você sabe seu token de autenticação
4. ✅ Você tem um número de telefone para testar

---

## 🚀 Opção 1: Teste Rápido com Script Bash

### 1. Configure o script:

Edite o arquivo `test-buttons.sh` e ajuste:

```bash
BASE_URL="http://localhost:21465"
SESSION="session1"              # Sua sessão
TOKEN="SEU_TOKEN_AQUI"          # Seu token
PHONE="5521999999999"           # Seu número de teste
```

### 2. Execute:

```bash
./test-buttons.sh
```

### 3. Verifique:

- ✅ Mensagens recebidas no WhatsApp
- ✅ Logs no terminal do servidor
- ✅ Respostas do script

---

## 🚀 Opção 2: Teste com Node.js

### 1. Configure o script:

Edite o arquivo `test-buttons.js` e ajuste:

```javascript
const CONFIG = {
  baseUrl: 'http://localhost:21465',
  session: 'session1',          // Sua sessão
  token: 'SEU_TOKEN_AQUI',      // Seu token
  phone: '5521999999999',       // Seu número
};
```

### 2. Execute:

```bash
node test-buttons.js
```

### 3. Verifique:

- ✅ Mensagens recebidas no WhatsApp
- ✅ Output JSON formatado
- ✅ Status codes

---

## 🧪 Opção 3: Teste Manual com cURL

### Teste 1: Enviar Botões

```bash
curl -X POST http://localhost:21465/api/session1/send-interactive-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "phone": ["5521999999999"],
    "message": "Escolha uma opção:",
    "buttons": [
      {"id": "yes", "title": "Sim"},
      {"id": "no", "title": "Não"}
    ]
  }'
```

### Teste 2: Detectar Botões

```bash
curl -X POST http://localhost:21465/api/session1/detect-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "messageId": "true_5521999999999@c.us_3EB0XXX"
  }'
```

### Teste 3: Responder Botão

```bash
curl -X POST http://localhost:21465/api/session1/reply-button \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{
    "phone": ["5521999999999"],
    "buttonId": "yes",
    "buttonTitle": "Sim",
    "messageId": "true_5521999999999@c.us_3EB0XXX"
  }'
```

---

## 🧪 Opção 4: Teste com Postman/Insomnia

### 1. Importe a collection:

Crie uma nova requisição POST:

**URL:** `http://localhost:21465/api/session1/send-interactive-buttons`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer SEU_TOKEN
```

**Body (JSON):**
```json
{
  "phone": ["5521999999999"],
  "message": "Teste de botões",
  "buttons": [
    {"id": "btn1", "title": "Opção 1"},
    {"id": "btn2", "title": "Opção 2"}
  ]
}
```

### 2. Execute e verifique a resposta

---

## 📊 O Que Verificar

### ✅ Sucesso Esperado:

1. **HTTP 200/201** nas respostas
2. **Mensagens chegam no WhatsApp** com botões
3. **Logs no servidor** mostram:
   ```
   [INFO] Interactive buttons sent successfully
   ```
   ou
   ```
   [WARN] sendButtons not available, falling back to text message
   [INFO] Fallback text message sent successfully
   ```

### ❌ Erros Esperados (validação):

1. **HTTP 400** - Mais de 3 botões
2. **HTTP 400** - Título > 20 caracteres
3. **HTTP 400** - Campos obrigatórios faltando

---

## 🤖 Teste Bot-to-Bot (Avançado)

### Cenário: Dois bots conversando

1. **Bot A** (seu bot) envia mensagem
2. **Bot B** (outro sistema) responde com botões
3. **Bot A** detecta e responde aos botões automaticamente

### Código de Exemplo:

```javascript
// Webhook handler
app.post('/webhook', async (req, res) => {
  const message = req.body;
  
  // Detectar botões
  const detection = await fetch('http://localhost:21465/api/session1/detect-buttons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN'
    },
    body: JSON.stringify({ messageId: message.id })
  });
  
  const { hasButtons, buttons } = (await detection.json()).response;
  
  // Responder se tiver botões
  if (hasButtons) {
    await fetch('http://localhost:21465/api/session1/reply-button', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SEU_TOKEN'
      },
      body: JSON.stringify({
        phone: [message.from],
        buttonId: buttons[0].id,
        buttonTitle: buttons[0].title,
        messageId: message.id
      })
    });
  }
  
  res.json({ ok: true });
});
```

---

## 🔍 Troubleshooting

### Problema: "The session is not active"

**Solução:**
```bash
# Verificar status da sessão
curl http://localhost:21465/api/session1/status-session \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Problema: Botões não aparecem no WhatsApp

**Possíveis causas:**
1. ✅ Versão do WhatsApp não suporta → Sistema usa fallback automático
2. ✅ WPPConnect não tem método → Verifique logs do servidor
3. ✅ Normal! Veja logs para confirmar se usou fallback

**Verificar logs:**
```
[WARN] sendButtons not available, falling back to text message
```

### Problema: Token inválido

**Solução:**
```bash
# Gerar novo token
curl -X POST http://localhost:21465/api/session1/SUASECRETKEY/generate-token
```

---

## 📈 Métricas de Sucesso

Após os testes, você deve ter:

- ✅ Mensagens com botões enviadas
- ✅ Validações funcionando (rejeita > 3 botões, título longo)
- ✅ Detecção de botões funcionando
- ✅ Fallback automático ativando quando necessário
- ✅ Logs claros e informativos

---

## 📝 Próximos Passos

Após validar que tudo funciona:

1. ✅ Integre com seu bot/sistema
2. ✅ Configure webhooks para automação
3. ✅ Implemente lógica de negócio
4. ✅ Configure rate limiting
5. ✅ Monitore logs em produção

---

## 📚 Documentação Completa

Para mais detalhes:
- **BUTTONS-QUICK-START.md** - Início rápido
- **BUTTONS-API-GUIDE.md** - Guia completo
- **TESTING-GUIDE.md** - Testes detalhados
- **IMPLEMENTATION-SUMMARY.md** - Detalhes técnicos

---

## 🎉 Pronto para Testar!

Execute um dos scripts acima e comece a testar a nova API de botões!

**Boa sorte! 🚀**
