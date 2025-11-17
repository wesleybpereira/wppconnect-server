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
 * Represents a single button in an interactive message
 */
export interface Button {
  /**
   * Unique identifier for the button (max 256 characters)
   */
  id: string;
  /**
   * Text displayed on the button (max 20 characters)
   */
  title: string;
}

/**
 * Request payload for sending interactive button messages
 */
export interface SendButtonsRequest {
  /**
   * Phone number(s) to send the message to
   */
  phone: string | string[];
  /**
   * Whether the recipient is a group
   */
  isGroup?: boolean;
  /**
   * Whether the recipient is a newsletter
   */
  isNewsletter?: boolean;
  /**
   * Body text of the message (required)
   */
  message: string;
  /**
   * Optional header text
   */
  header?: string;
  /**
   * Optional footer text
   */
  footer?: string;
  /**
   * Array of buttons (1-3 buttons allowed)
   */
  buttons: Button[];
  /**
   * Additional options
   */
  options?: {
    /**
     * Message ID to quote/reply to
     */
    quotedMsg?: string;
    /**
     * Additional WPPConnect options
     */
    [key: string]: any;
  };
}

/**
 * Request payload for replying to a button message
 */
export interface ReplyButtonRequest {
  /**
   * Phone number to send the reply to
   */
  phone: string | string[];
  /**
   * Whether the recipient is a group
   */
  isGroup?: boolean;
  /**
   * ID of the button being clicked (from received message)
   */
  buttonId: string;
  /**
   * Title of the button being clicked (from received message)
   */
  buttonTitle: string;
  /**
   * Message ID of the original button message (optional)
   */
  messageId?: string;
  /**
   * Additional options
   */
  options?: {
    [key: string]: any;
  };
}

/**
 * Represents a button found in a received message
 */
export interface ReceivedButton {
  id: string;
  title: string;
  type?: string;
}

/**
 * Helper interface for detecting buttons in messages
 */
export interface MessageWithButtons {
  /**
   * Whether the message contains buttons
   */
  hasButtons: boolean;
  /**
   * Array of buttons found in the message
   */
  buttons: ReceivedButton[];
  /**
   * Original message object
   */
  message: any;
}

/**
 * Response from button-related operations
 */
export interface ButtonResponse {
  status: 'success' | 'error';
  message?: string;
  response?: any;
  error?: any;
}

/**
 * Fallback configuration for button replies
 */
export interface ButtonFallbackConfig {
  /**
   * Whether to enable fallback to text
   */
  enabled: boolean;
  /**
   * Timeout in milliseconds before falling back to text
   */
  timeoutMs: number;
  /**
   * Mapping of button IDs to text equivalents
   */
  textMapping?: Record<string, string>;
}
