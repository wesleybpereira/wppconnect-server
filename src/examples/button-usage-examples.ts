/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * EXEMPLOS DE USO - API DE BOTÕES INTERATIVOS
 * 
 * Este arquivo contém exemplos práticos de como usar os novos endpoints
 * de botões interativos do wppconnect-server
 */

// ============================================================================
// EXEMPLO 1: Enviar Mensagem com Botões Simples
// ============================================================================

async function exemploEnviarBotoesSimples() {
  const response = await fetch('http://localhost:21465/api/session1/send-interactive-buttons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN_AQUI'
    },
    body: JSON.stringify({
      phone: ['5521999999999'],
      message: 'Bem-vindo ao nosso atendimento! Como posso ajudar?',
      buttons: [
        { id: 'info', title: 'Informações' },
        { id: 'buy', title: 'Comprar' },
        { id: 'support', title: 'Suporte' }
      ]
    })
  });

  const result = await response.json();
  console.log('Mensagem enviada:', result);
}

// ============================================================================
// EXEMPLO 2: Enviar com Cabeçalho e Rodapé
// ============================================================================

async function exemploComHeaderFooter() {
  const response = await fetch('http://localhost:21465/api/session1/send-interactive-buttons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN_AQUI'
    },
    body: JSON.stringify({
      phone: ['5521999999999'],
      header: '🏪 Loja XYZ',
      message: 'Confira nossas promoções especiais do dia!',
      footer: 'Atendimento disponível 24/7',
      buttons: [
        { id: 'promo_clothes', title: '👕 Roupas' },
        { id: 'promo_shoes', title: '👟 Calçados' },
        { id: 'promo_accessories', title: '👜 Acessórios' }
      ]
    })
  });

  const result = await response.json();
  console.log('Promoção enviada:', result);
}

// ============================================================================
// EXEMPLO 3: Responder a um Botão Recebido
// ============================================================================

async function exemploResponderBotao(messageId: string) {
  // Primeiro, detectar os botões na mensagem recebida
  const detectResponse = await fetch('http://localhost:21465/api/session1/detect-buttons', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer SEU_TOKEN_AQUI'
    },
    body: JSON.stringify({
      messageId: messageId
    })
  });

  const detection = await detectResponse.json();
  
  if (detection.response.hasButtons) {
    const buttons = detection.response.buttons;
    console.log('Botões detectados:', buttons);

    // Selecionar o primeiro botão
    const selectedButton = buttons[0];

    // Responder ao botão
    const replyResponse = await fetch('http://localhost:21465/api/session1/reply-button', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer SEU_TOKEN_AQUI'
      },
      body: JSON.stringify({
        phone: ['5521999999999'],
        buttonId: selectedButton.id,
        buttonTitle: selectedButton.title,
        messageId: messageId
      })
    });

    const result = await replyResponse.json();
    console.log('Resposta ao botão enviada:', result);
  } else {
    console.log('Mensagem não contém botões');
  }
}

// ============================================================================
// EXEMPLO 4: Bot de Atendimento Automático com Fluxo
// ============================================================================

class BotAtendimento {
  private baseUrl = 'http://localhost:21465';
  private session = 'session1';
  private token = 'SEU_TOKEN_AQUI';

  async enviarMenuPrincipal(phone: string) {
    return await this.enviarBotoes(phone, {
      header: '🤖 Atendimento Automático',
      message: 'Olá! Sou um assistente virtual. Como posso ajudar?',
      footer: 'Escolha uma opção abaixo',
      buttons: [
        { id: 'menu_produtos', title: '📦 Produtos' },
        { id: 'menu_pedidos', title: '📋 Pedidos' },
        { id: 'menu_atendente', title: '👤 Falar com humano' }
      ]
    });
  }

  async enviarMenuProdutos(phone: string) {
    return await this.enviarBotoes(phone, {
      header: '📦 Catálogo de Produtos',
      message: 'Temos várias categorias disponíveis:',
      buttons: [
        { id: 'prod_eletronicos', title: '💻 Eletrônicos' },
        { id: 'prod_moda', title: '👔 Moda' },
        { id: 'prod_voltar', title: '⬅️ Voltar' }
      ]
    });
  }

  async processarResposta(messageId: string, phone: string) {
    const detection = await this.detectarBotoes(messageId);
    
    if (!detection.hasButtons) {
      console.log('Sem botões para processar');
      return;
    }

    // Aqui você pode implementar lógica baseada no buttonId
    const button = detection.buttons[0];
    
    // Responder ao botão
    await this.responderBotao(phone, button.id, button.title, messageId);

    // Navegar no fluxo
    switch (button.id) {
      case 'menu_produtos':
        await this.enviarMenuProdutos(phone);
        break;
      case 'menu_pedidos':
        // Implementar menu de pedidos
        break;
      case 'menu_atendente':
        // Transferir para atendente humano
        break;
      case 'prod_voltar':
        await this.enviarMenuPrincipal(phone);
        break;
    }
  }

  private async enviarBotoes(phone: string, data: any) {
    const response = await fetch(`${this.baseUrl}/api/${this.session}/send-interactive-buttons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ phone: [phone], ...data })
    });
    return await response.json();
  }

  private async detectarBotoes(messageId: string) {
    const response = await fetch(`${this.baseUrl}/api/${this.session}/detect-buttons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ messageId })
    });
    const result = await response.json();
    return result.response;
  }

  private async responderBotao(phone: string, buttonId: string, buttonTitle: string, messageId?: string) {
    const response = await fetch(`${this.baseUrl}/api/${this.session}/reply-button`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({
        phone: [phone],
        buttonId,
        buttonTitle,
        messageId
      })
    });
    return await response.json();
  }
}

// ============================================================================
// EXEMPLO 5: Bot-to-Bot - Comunicação entre Bots
// ============================================================================

class BotToBotHandler {
  private baseUrl = 'http://localhost:21465';
  private session = 'minha_sessao';
  private token = 'SEU_TOKEN_AQUI';

  /**
   * Processa mensagem recebida de outro bot
   * Se tiver botões, responde automaticamente
   */
  async processarMensagemDeBot(message: any) {
    console.log('Mensagem recebida de:', message.from);

    // Detectar se tem botões
    const detection = await this.detectarBotoes(message.id);

    if (detection.hasButtons) {
      console.log('Botões detectados:', detection.buttons);

      // Estratégia de seleção inteligente
      const botaoSelecionado = this.selecionarBotaoInteligente(detection.buttons);

      if (botaoSelecionado) {
        console.log('Respondendo com botão:', botaoSelecionado);

        // Aguardar um pouco para parecer humano
        await this.delay(1000);

        // Responder com o botão
        await this.responderBotao(
          message.from,
          botaoSelecionado.id,
          botaoSelecionado.title,
          message.id
        );
      }
    } else {
      console.log('Mensagem sem botões, processando como texto normal');
      // Processar resposta de texto normal aqui
    }
  }

  /**
   * Seleciona botão baseado em palavras-chave
   */
  private selecionarBotaoInteligente(buttons: any[]) {
    // Prioridades de palavras-chave
    const prioridades = [
      { palavras: ['sim', 'confirmar', 'aceitar', 'ok'], peso: 10 },
      { palavras: ['continuar', 'próximo', 'avançar'], peso: 8 },
      { palavras: ['ver', 'visualizar', 'mostrar'], peso: 6 },
      { palavras: ['não', 'cancelar', 'sair'], peso: 1 }
    ];

    // Pontuar cada botão
    const botoesComPontuacao = buttons.map(btn => {
      let pontuacao = 0;
      const tituloLower = btn.title.toLowerCase();

      for (const prioridade of prioridades) {
        for (const palavra of prioridade.palavras) {
          if (tituloLower.includes(palavra)) {
            pontuacao += prioridade.peso;
          }
        }
      }

      return { ...btn, pontuacao };
    });

    // Ordenar por pontuação
    botoesComPontuacao.sort((a, b) => b.pontuacao - a.pontuacao);

    // Retornar o de maior pontuação (ou primeiro se empate)
    return botoesComPontuacao[0];
  }

  private async detectarBotoes(messageId: string) {
    const response = await fetch(`${this.baseUrl}/api/${this.session}/detect-buttons`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({ messageId })
    });
    const result = await response.json();
    return result.response;
  }

  private async responderBotao(phone: string, buttonId: string, buttonTitle: string, messageId?: string) {
    const response = await fetch(`${this.baseUrl}/api/${this.session}/reply-button`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.token}`
      },
      body: JSON.stringify({
        phone: [phone],
        buttonId,
        buttonTitle,
        messageId
      })
    });
    return await response.json();
  }

  private delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// ============================================================================
// EXEMPLO 6: Integração com Webhook
// ============================================================================

/**
 * Este exemplo mostra como integrar com webhooks para responder
 * automaticamente a mensagens com botões
 */

// Express.js webhook handler
/*
import express from 'express';
const app = express();
app.use(express.json());

const botHandler = new BotToBotHandler();

app.post('/webhook/whatsapp', async (req, res) => {
  const message = req.body;
  
  console.log('Webhook recebido:', message);

  // Processar mensagem em background
  botHandler.processarMensagemDeBot(message).catch(err => {
    console.error('Erro ao processar mensagem:', err);
  });

  // Responder rapidamente ao webhook
  res.status(200).json({ status: 'received' });
});

app.listen(3000, () => {
  console.log('Webhook listener rodando na porta 3000');
});
*/

// ============================================================================
// EXEMPLO 7: Testes Unitários
// ============================================================================

/**
 * Exemplo de como testar os endpoints
 */
async function testarEndpoints() {
  console.log('=== Iniciando testes ===\n');

  // Teste 1: Enviar botões
  console.log('Teste 1: Enviar mensagem com botões');
  try {
    await exemploEnviarBotoesSimples();
    console.log('✅ Teste 1 passou\n');
  } catch (error) {
    console.error('❌ Teste 1 falhou:', error, '\n');
  }

  // Teste 2: Com header e footer
  console.log('Teste 2: Enviar com header e footer');
  try {
    await exemploComHeaderFooter();
    console.log('✅ Teste 2 passou\n');
  } catch (error) {
    console.error('❌ Teste 2 falhou:', error, '\n');
  }

  // Teste 3: Detectar botões
  console.log('Teste 3: Detectar botões em mensagem');
  try {
    // Usar um messageId de teste
    await exemploResponderBotao('true_5521999999999@c.us_3EB0XXX');
    console.log('✅ Teste 3 passou\n');
  } catch (error) {
    console.error('❌ Teste 3 falhou:', error, '\n');
  }

  console.log('=== Testes finalizados ===');
}

// ============================================================================
// EXPORTAÇÕES
// ============================================================================

export {
  exemploEnviarBotoesSimples,
  exemploComHeaderFooter,
  exemploResponderBotao,
  BotAtendimento,
  BotToBotHandler,
  testarEndpoints
};

// Para usar, descomente:
// testarEndpoints();
