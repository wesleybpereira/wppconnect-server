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

import { Whatsapp } from '@wppconnect-team/wppconnect';
import { Logger } from 'winston';

import {
  Button,
  ReplyButtonRequest,
  ButtonFallbackConfig,
} from '../types/ButtonTypes';

/**
 * Tenta responder a uma mensagem com botões usando button_reply
 * Se falhar, usa fallback para texto
 */
export async function replyWithButtonFallback(
  client: Whatsapp,
  logger: Logger,
  phone: string,
  buttonId: string,
  buttonTitle: string,
  messageId?: string,
  config?: ButtonFallbackConfig
): Promise<any> {
  const fallbackConfig: ButtonFallbackConfig = {
    enabled: true,
    timeoutMs: 3000,
    ...config,
  };

  try {
    // Tentar enviar button_reply primeiro
    logger.info(
      `Attempting to send button reply: ${buttonId} - ${buttonTitle}`
    );

    let result: any = null;
    let success = false;

    // Cast para any para acessar métodos que podem não estar tipados
    const clientAny = client as any;

    // Método 1: Tentar enviar mensagem interativa do tipo button_reply
    if (typeof clientAny.sendRawMessage === 'function') {
      try {
        // Estrutura de button_reply conforme WhatsApp Business API
        const interactiveMessage = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: phone,
          type: 'interactive',
          interactive: {
            type: 'button_reply',
            button_reply: {
              id: buttonId,
              title: buttonTitle,
            },
          },
        };

        // Se tiver messageId, adiciona contexto
        if (messageId) {
          (interactiveMessage as any).context = {
            message_id: messageId,
          };
        }

        result = await clientAny.sendRawMessage(phone, interactiveMessage);
        success = true;
        logger.info('Button reply sent via sendRawMessage (interactive format)');
      } catch (rawError: any) {
        logger.warn(`sendRawMessage failed: ${rawError.message}`);
      }
    }

    // Método 2: Tentar sendButtonResponse (se existir)
    if (!success && typeof clientAny.sendButtonResponse === 'function') {
      result = await clientAny.sendButtonResponse(phone, {
        buttonId: buttonId,
        buttonText: buttonTitle,
        messageId: messageId,
      });
      success = true;
      logger.info('Button reply sent via sendButtonResponse');
    }
    
    // Método 3: Tentar sendReplyButton
    else if (!success && typeof clientAny.sendReplyButton === 'function') {
      result = await clientAny.sendReplyButton(
        phone,
        buttonId,
        buttonTitle,
        messageId
      );
      success = true;
      logger.info('Button reply sent via sendReplyButton');
    }
    
    // Método 4: Tentar sendButtons genérico
    else if (!success && typeof clientAny.sendButtons === 'function') {
      result = await clientAny.sendButtons(phone, {
        type: 'reply',
        buttonId: buttonId,
        buttonText: buttonTitle,
        messageId: messageId,
      });
      success = true;
      logger.info('Button reply sent via sendButtons');
    }

    if (success && result) {
      return {
        success: true,
        method: 'button_reply',
        result,
      };
    }

    throw new Error('No button reply method available');
  } catch (error: any) {
    logger.warn(`Button reply failed: ${error.message}`);

    if (!fallbackConfig.enabled) {
      throw error;
    }

    // Fallback para texto
    logger.info('Falling back to text message');

    try {
      let textMessage = buttonTitle;

      // Usar mapeamento customizado se disponível
      if (
        fallbackConfig.textMapping &&
        fallbackConfig.textMapping[buttonId]
      ) {
        textMessage = fallbackConfig.textMapping[buttonId];
      }

      let result: any;
      if (messageId) {
        result = await client.reply(phone, textMessage, messageId);
      } else {
        result = await client.sendText(phone, textMessage);
      }

      logger.info('Fallback text message sent successfully');
      return {
        success: true,
        method: 'text_fallback',
        result,
        originalError: error.message,
      };
    } catch (fallbackError: any) {
      logger.error(`Fallback also failed: ${fallbackError.message}`);
      throw new Error(
        `Both button reply and fallback failed: ${error.message} | ${fallbackError.message}`
      );
    }
  }
}

/**
 * Detecta se uma mensagem contém botões
 */
export function detectButtons(message: any): {
  hasButtons: boolean;
  buttons: Button[];
} {
  const hasButtons =
    message.type === 'buttons' ||
    message.type === 'list' ||
    (message.buttons && message.buttons.length > 0) ||
    (message.listResponse && message.listResponse.singleSelectReply);

  let buttons: Button[] = [];

  if (hasButtons) {
    if (message.buttons && Array.isArray(message.buttons)) {
      buttons = message.buttons.map((btn: any) => ({
        id: btn.id || btn.buttonId || '',
        title: btn.displayText || btn.text || btn.title || '',
      }));
    } else if (message.type === 'list' && message.list) {
      // Para list messages
      buttons =
        message.list.sections?.flatMap((section: any) =>
          section.rows?.map((row: any) => ({
            id: row.rowId || '',
            title: row.title || '',
          }))
        ) || [];
    }
  }

  return {
    hasButtons,
    buttons,
  };
}

/**
 * Seleciona automaticamente um botão baseado em critérios
 */
export function selectButton(
  buttons: Button[],
  criteria?: {
    index?: number;
    id?: string;
    titleContains?: string;
    preference?: 'first' | 'last' | 'random';
  }
): Button | null {
  if (!buttons || buttons.length === 0) {
    return null;
  }

  // Se um ID específico foi fornecido
  if (criteria?.id) {
    return buttons.find((btn) => btn.id === criteria.id) || null;
  }

  // Se um índice específico foi fornecido
  if (criteria?.index !== undefined && criteria.index < buttons.length) {
    return buttons[criteria.index];
  }

  // Se busca por título parcial
  if (criteria?.titleContains) {
    return (
      buttons.find((btn) =>
        btn.title.toLowerCase().includes(criteria.titleContains!.toLowerCase())
      ) || null
    );
  }

  // Preferência de seleção
  switch (criteria?.preference) {
    case 'last':
      return buttons[buttons.length - 1];
    case 'random':
      return buttons[Math.floor(Math.random() * buttons.length)];
    case 'first':
    default:
      return buttons[0];
  }
}

/**
 * Valida os dados de um botão
 */
export function validateButton(button: Button): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!button.id) {
    errors.push('Button id is required');
  } else if (button.id.length > 256) {
    errors.push('Button id cannot exceed 256 characters');
  }

  if (!button.title) {
    errors.push('Button title is required');
  } else if (button.title.length > 20) {
    errors.push('Button title cannot exceed 20 characters');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida um array de botões
 */
export function validateButtons(buttons: Button[]): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!buttons || !Array.isArray(buttons)) {
    errors.push('Buttons must be an array');
    return { valid: false, errors };
  }

  if (buttons.length === 0) {
    errors.push('At least one button is required');
  }

  if (buttons.length > 3) {
    errors.push('Maximum of 3 buttons allowed');
  }

  buttons.forEach((button, index) => {
    const validation = validateButton(button);
    if (!validation.valid) {
      errors.push(`Button ${index + 1}: ${validation.errors.join(', ')}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Mapeia um botão para uma mensagem de texto equivalente
 */
export function mapButtonToText(
  button: Button,
  index?: number,
  mapping?: Record<string, string>
): string {
  // Usar mapeamento customizado se disponível
  if (mapping && mapping[button.id]) {
    return mapping[button.id];
  }

  // Usar índice se fornecido
  if (index !== undefined) {
    return `#${index + 1}`;
  }

  // Usar título do botão
  return button.title;
}

/**
 * Gera uma mensagem de texto com opções numeradas a partir de botões
 */
export function generateTextFromButtons(
  message: string,
  buttons: Button[],
  header?: string,
  footer?: string
): string {
  let text = '';

  if (header) {
    text += `*${header}*\n\n`;
  }

  text += message;
  text += '\n\n';

  buttons.forEach((button, index) => {
    text += `${index + 1}. ${button.title}\n`;
  });

  if (footer) {
    text += `\n_${footer}_`;
  }

  return text;
}
