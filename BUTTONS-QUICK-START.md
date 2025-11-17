# 🔘 API de Botões Interativos - Quick Start

## 📌 Resumo

Implementação completa de endpoints para enviar e responder mensagens com botões no WPPConnect Server.

## ✅ O que foi implementado

- ✅ **3 novos endpoints** para trabalhar com botões
- ✅ **Sistema de fallback** automático (botão → texto)
- ✅ **Detecção inteligente** de botões em mensagens
- ✅ **Validação completa** de payloads
- ✅ **Exemplos práticos** de uso
- ✅ **Utilitários helpers** para facilitar integração

## 🚀 Endpoints Criados

### 1. Enviar Botões
```bash
POST /api/:session/send-interactive-buttons
```

### 2. Responder Botão
```bash
POST /api/:session/reply-button
```

### 3. Detectar Botões
```bash
POST /api/:session/detect-buttons
```

## 📝 Exemplo Rápido

### Enviar mensagem com botões:
```javascript
fetch('http://localhost:21465/api/session1/send-interactive-buttons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    phone: ['5521999999999'],
    message: 'Escolha uma opção:',
    buttons: [
      { id: 'btn_1', title: 'Opção 1' },
      { id: 'btn_2', title: 'Opção 2' }
    ]
  })
})
```

### Responder a um botão:
```javascript
fetch('http://localhost:21465/api/session1/reply-button', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    phone: ['5521999999999'],
    buttonId: 'btn_1',
    buttonTitle: 'Opção 1',
    messageId: 'message_id_aqui'
  })
})
```

## 📂 Arquivos Criados

### Código Principal:
- `src/types/ButtonTypes.ts` - Interfaces TypeScript
- `src/controller/messageController.ts` - Funções adicionadas (3 novas)
- `src/util/buttonHelper.ts` - Utilitários auxiliares
- `src/routes/index.ts` - Rotas registradas

### Documentação:
- `BUTTONS-API-GUIDE.md` - Documentação completa
- `BUTTONS-QUICK-START.md` - Este arquivo
- `src/examples/button-usage-examples.ts` - Exemplos práticos

## 🔍 Funções Adicionadas no `messageController.ts`

1. **`sendInteractiveButtons()`** - Envia mensagens com botões (1-3 botões)
2. **`replyButton()`** - Responde simulando clique em botão
3. **`detectButtonsInMessage()`** - Detecta botões em mensagens recebidas

## 🛠️ Utilitários em `buttonHelper.ts`

- `replyWithButtonFallback()` - Resposta com fallback automático
- `detectButtons()` - Detecta botões em objeto de mensagem
- `selectButton()` - Seleção inteligente de botões
- `validateButtons()` - Validação de array de botões
- `generateTextFromButtons()` - Converte botões em texto formatado

## ⚙️ Sistema de Fallback

Se o método de botões não funcionar, o sistema automaticamente:

1. **Tentativa 1**: `client.sendButtons()` ou `client.sendButtonResponse()`
2. **Tentativa 2**: Métodos alternativos do WPPConnect
3. **Fallback**: Envia como texto formatado

Exemplo de fallback:
```
*Cabeçalho*

Mensagem principal

1. Opção 1
2. Opção 2
3. Opção 3

_Rodapé_
```

## ⚠️ Limitações e Avisos

- **Máximo**: 3 botões por mensagem
- **Título**: Máximo 20 caracteres
- **API não oficial**: Pode ter instabilidades
- **Rate limiting**: Evite spam para não ser banido

## 🎯 Casos de Uso

### Bot de Atendimento
```javascript
// Enviar menu inicial
await sendInteractiveButtons({
  phone: ['5521999999999'],
  header: '🤖 Atendimento',
  message: 'Como posso ajudar?',
  buttons: [
    { id: 'info', title: 'Informações' },
    { id: 'buy', title: 'Comprar' },
    { id: 'support', title: 'Suporte' }
  ]
});
```

### Comunicação Bot-to-Bot
```javascript
// Detectar e responder automaticamente
const { hasButtons, buttons } = await detectButtons(messageId);
if (hasButtons) {
  await replyButton({
    phone: ['5521999999999'],
    buttonId: buttons[0].id,
    buttonTitle: buttons[0].title,
    messageId
  });
}
```

## 📊 Validações Automáticas

Todos os endpoints validam:
- ✅ Número de botões (1-3)
- ✅ Tamanho do título (max 20 chars)
- ✅ Campos obrigatórios (id, title)
- ✅ Formato do payload

## 🧪 Testando

```bash
# Teste simples com curl
curl -X POST http://localhost:21465/api/session1/send-interactive-buttons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "phone": ["5521999999999"],
    "message": "Teste",
    "buttons": [
      {"id": "1", "title": "Opção 1"}
    ]
  }'
```

## 📚 Documentação Completa

Para mais detalhes, exemplos e casos de uso avançados, consulte:
- **BUTTONS-API-GUIDE.md** - Documentação completa
- **src/examples/button-usage-examples.ts** - Código de exemplo

## 🔐 Segurança

- Autenticação via Bearer token (obrigatório)
- Validação de todos os inputs
- Sanitização de dados
- Rate limiting recomendado (configure no nginx/proxy)

## 🐛 Troubleshooting

### Botões não aparecem?
- Verifique se o WPPConnect está atualizado
- Tente usar o fallback de texto
- Verifique logs do servidor

### Resposta de botão não funciona?
- Sistema usa fallback automático para texto
- Verifique se o messageId está correto
- Veja os logs para entender qual método foi usado

## 📈 Próximos Passos

1. Testar com diferentes números/bots
2. Ajustar mapeamento de fallback se necessário
3. Implementar analytics de uso
4. Considerar API oficial para produção

## 💡 Dicas

- Use IDs descritivos nos botões (ex: `buy_product_123`)
- Implemente timeout para respostas automáticas
- Mantenha títulos curtos e objetivos
- Teste o fallback de texto periodicamente

---

**Pronto para usar! 🎉**

Para dúvidas ou problemas, consulte a documentação completa ou abra uma issue no repositório.
