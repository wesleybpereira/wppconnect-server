# Endpoints de Botões Interativos - WPPConnect Server

## Visão Geral

Esta implementação adiciona suporte completo para mensagens com botões interativos no wppconnect-server, incluindo:

- ✅ Envio de mensagens com botões (até 3 botões)
- ✅ Resposta automática a mensagens com botões (simula clique)
- ✅ Detecção de botões em mensagens recebidas
- ✅ Sistema de fallback inteligente (botão → texto)
- ✅ Validação completa de payloads

## ⚠️ Avisos Importantes

1. **API Não Oficial**: O WPPConnect usa WhatsApp Web (não oficial), portanto pode haver instabilidades
2. **Risco de Bloqueio**: Uso intensivo de automação pode resultar em ban da conta
3. **Compatibilidade**: Alguns métodos podem não funcionar dependendo da versão do WhatsApp
4. **Fallback Automático**: Se botões não funcionarem, o sistema automaticamente envia texto equivalente

## Novos Endpoints

### 1. Enviar Mensagem com Botões Interativos

**POST** `/api/:session/send-interactive-buttons`

Envia uma mensagem com até 3 botões interativos.

#### Request Body:
```json
{
  "phone": ["5521999999999"],
  "isGroup": false,
  "message": "Escolha uma opção:",
  "header": "Bem-vindo!",
  "footer": "Powered by WPPConnect",
  "buttons": [
    { "id": "btn_1", "title": "Opção 1" },
    { "id": "btn_2", "title": "Opção 2" },
    { "id": "btn_3", "title": "Opção 3" }
  ]
}
```

#### Validações:
- Mínimo: 1 botão
- Máximo: 3 botões
- `title`: máximo 20 caracteres
- `id`: máximo 256 caracteres
- `id` e `title` são obrigatórios

#### Response:
```json
{
  "status": "success",
  "response": [
    {
      "id": "true_5521999999999@c.us_3EB0XXX",
      "from": "5521999999999@c.us",
      "to": "5521999999999@c.us",
      "ack": 1
    }
  ]
}
```

#### Fallback Automático:
Se o método `sendButtons` não estiver disponível, o sistema envia automaticamente uma mensagem de texto formatada:

```
*Bem-vindo!*

Escolha uma opção:

1. Opção 1
2. Opção 2
3. Opção 3

_Powered by WPPConnect_
```

---

### 2. Responder Mensagem com Botão

**POST** `/api/:session/reply-button`

Simula o clique em um botão de uma mensagem recebida.

#### Request Body:
```json
{
  "phone": ["5521999999999"],
  "isGroup": false,
  "buttonId": "btn_1",
  "buttonTitle": "Opção 1",
  "messageId": "true_5521999999999@c.us_3EB0XXX"
}
```

#### Parâmetros:
- `phone`: Número(s) de destino
- `buttonId`: ID do botão (obtido da mensagem original)
- `buttonTitle`: Título do botão (obtido da mensagem original)
- `messageId` (opcional): ID da mensagem original com botões

#### Response:
```json
{
  "status": "success",
  "response": [
    {
      "id": "true_5521999999999@c.us_3EB0YYY",
      "method": "button_reply",
      "ack": 1
    }
  ]
}
```

#### Fallback Automático:
Se o método `sendButtonResponse` não estiver disponível:
1. Tenta `sendReplyButton`
2. Se falhar, envia como mensagem de texto (usando `reply` se `messageId` fornecido)

---

### 3. Detectar Botões em Mensagem

**POST** `/api/:session/detect-buttons`

Analisa uma mensagem e retorna informações sobre botões disponíveis.

#### Request Body:
```json
{
  "messageId": "true_5521999999999@c.us_3EB0XXX"
}
```

#### Response:
```json
{
  "status": "success",
  "response": {
    "hasButtons": true,
    "buttons": [
      {
        "id": "btn_1",
        "title": "Opção 1",
        "type": "reply"
      },
      {
        "id": "btn_2",
        "title": "Opção 2",
        "type": "reply"
      }
    ],
    "message": {
      "id": "true_5521999999999@c.us_3EB0XXX",
      "type": "buttons",
      "from": "5521999999999@c.us",
      "timestamp": 1700000000
    }
  }
}
```

#### Tipos Suportados:
- `buttons`: Mensagens com botões padrão
- `list`: Mensagens com lista de opções
- `list_reply`: Resposta a lista

---

## Utilitário Helper

### `buttonHelper.ts`

Fornece funções auxiliares para trabalhar com botões:

#### 1. `replyWithButtonFallback()`
Tenta responder com botão, com fallback automático para texto.

```typescript
import { replyWithButtonFallback } from './util/buttonHelper';

const result = await replyWithButtonFallback(
  client,
  logger,
  '5521999999999',
  'btn_1',
  'Opção 1',
  'messageId',
  {
    enabled: true,
    timeoutMs: 3000,
    textMapping: {
      'btn_1': '#1',
      'btn_2': '#2'
    }
  }
);
```

#### 2. `detectButtons()`
Detecta botões em um objeto de mensagem.

```typescript
import { detectButtons } from './util/buttonHelper';

const { hasButtons, buttons } = detectButtons(message);
```

#### 3. `selectButton()`
Seleciona automaticamente um botão baseado em critérios.

```typescript
import { selectButton } from './util/buttonHelper';

// Por índice
const button = selectButton(buttons, { index: 0 });

// Por ID
const button = selectButton(buttons, { id: 'btn_1' });

// Por título parcial
const button = selectButton(buttons, { titleContains: 'produto' });

// Aleatório
const button = selectButton(buttons, { preference: 'random' });
```

#### 4. `validateButtons()`
Valida array de botões antes de enviar.

```typescript
import { validateButtons } from './util/buttonHelper';

const { valid, errors } = validateButtons(buttons);
if (!valid) {
  console.error(errors);
}
```

#### 5. `generateTextFromButtons()`
Gera mensagem de texto formatada a partir de botões.

```typescript
import { generateTextFromButtons } from './util/buttonHelper';

const text = generateTextFromButtons(
  'Escolha:',
  buttons,
  'Cabeçalho',
  'Rodapé'
);
```

---

## Exemplos de Uso

### Exemplo 1: Bot Simples com Resposta Automática

```javascript
// Enviar mensagem com botões
const sendResponse = await fetch('http://localhost:21465/api/session1/send-interactive-buttons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    phone: ['5521999999999'],
    message: 'Como posso ajudar?',
    buttons: [
      { id: 'help', title: 'Ajuda' },
      { id: 'support', title: 'Suporte' },
      { id: 'cancel', title: 'Cancelar' }
    ]
  })
});

// Detectar resposta do usuário (webhook)
// Quando receber mensagem com button_reply:

const detectResponse = await fetch('http://localhost:21465/api/session1/detect-buttons', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_TOKEN'
  },
  body: JSON.stringify({
    messageId: receivedMessageId
  })
});

const { buttons } = await detectResponse.json();

// Responder automaticamente
if (buttons.length > 0) {
  await fetch('http://localhost:21465/api/session1/reply-button', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      phone: ['5521999999999'],
      buttonId: buttons[0].id,
      buttonTitle: buttons[0].title,
      messageId: receivedMessageId
    })
  });
}
```

### Exemplo 2: Integração Bot-to-Bot

```javascript
// Bot A recebe mensagem com botões de Bot B
async function handleIncomingMessage(message) {
  // Detectar se tem botões
  const detection = await fetch('http://localhost:21465/api/sessionA/detect-buttons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      messageId: message.id
    })
  }).then(r => r.json());

  if (detection.response.hasButtons) {
    const buttons = detection.response.buttons;
    
    // Lógica de decisão
    let selectedButton;
    if (buttons.find(b => b.title.includes('Sim'))) {
      selectedButton = buttons.find(b => b.title.includes('Sim'));
    } else {
      selectedButton = buttons[0]; // Primeira opção
    }
    
    // Responder com botão
    await fetch('http://localhost:21465/api/sessionA/reply-button', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify({
        phone: [message.from],
        buttonId: selectedButton.id,
        buttonTitle: selectedButton.title,
        messageId: message.id
      })
    });
  }
}
```

### Exemplo 3: Menu Interativo

```javascript
async function sendMenu(phone) {
  await fetch('http://localhost:21465/api/session1/send-interactive-buttons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_TOKEN'
    },
    body: JSON.stringify({
      phone: [phone],
      header: '🏪 Loja Virtual',
      message: 'Bem-vindo! O que você gostaria de fazer?',
      footer: 'Atendimento 24/7',
      buttons: [
        { id: 'products', title: '📦 Ver Produtos' },
        { id: 'orders', title: '📋 Meus Pedidos' },
        { id: 'support', title: '💬 Suporte' }
      ]
    })
  });
}
```

---

## Tipos TypeScript

### `ButtonTypes.ts`

```typescript
interface Button {
  id: string;        // max 256 chars
  title: string;     // max 20 chars
}

interface SendButtonsRequest {
  phone: string | string[];
  isGroup?: boolean;
  message: string;
  header?: string;
  footer?: string;
  buttons: Button[];
  options?: any;
}

interface ReplyButtonRequest {
  phone: string | string[];
  isGroup?: boolean;
  buttonId: string;
  buttonTitle: string;
  messageId?: string;
  options?: any;
}

interface ButtonFallbackConfig {
  enabled: boolean;
  timeoutMs: number;
  textMapping?: Record<string, string>;
}
```

---

## Tratamento de Erros

### Erros Comuns:

#### 1. Botão não disponível
```json
{
  "status": "error",
  "message": "No button reply method available"
}
```
**Solução**: Sistema usa fallback automático para texto

#### 2. Validação falhou
```json
{
  "status": "error",
  "message": "Button title exceeds 20 characters"
}
```
**Solução**: Ajustar título do botão

#### 3. Máximo de botões excedido
```json
{
  "status": "error",
  "message": "Maximum of 3 buttons allowed"
}
```
**Solução**: Reduzir para no máximo 3 botões

---

## Compatibilidade

### Métodos Tentados (em ordem):

#### Para Envio:
1. `client.sendButtons()` - Método nativo WPPConnect
2. Fallback: `client.sendText()` - Texto formatado

#### Para Resposta:
1. `client.sendButtonResponse()`
2. `client.sendReplyButton()`
3. Fallback: `client.reply()` ou `client.sendText()`

---

## Logs e Debugging

Os endpoints geram logs detalhados:

```
[INFO] Attempting to send button reply: btn_1 - Opção 1
[WARN] Button reply failed: No button reply method available
[INFO] Falling back to text message
[INFO] Fallback text message sent successfully
```

Para debug, verifique os logs do wppconnect-server.

---

## Limitações Conhecidas

1. **Máximo de 3 botões** por mensagem (limitação do WhatsApp)
2. **Título limitado a 20 caracteres** (limitação do WhatsApp)
3. **Instabilidade**: Botões podem não funcionar em todas as versões do WhatsApp
4. **Rate Limiting**: Evite envio excessivo para prevenir bloqueios

---

## Segurança

- ✅ Validação de input completa
- ✅ Sanitização de dados
- ✅ Rate limiting recomendado (configure no seu proxy/nginx)
- ✅ Autenticação via Bearer token
- ⚠️ Use em ambiente controlado (não oficial)

---

## Próximos Passos

1. Testar com diferentes bots do mercado
2. Ajustar mapeamentos de fallback conforme necessidade
3. Implementar analytics de uso de botões
4. Considerar migração para API oficial se for produção crítica

---

## Suporte

Para issues ou dúvidas:
- GitHub Issues do wppconnect-server
- Documentação oficial do WPPConnect
- Discord/Telegram da comunidade

---

**Desenvolvido para wppconnect-server**  
*Implementação de botões interativos com fallback inteligente*
