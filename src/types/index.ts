// Definiciones de tipos para el módulo WhatsApp
import { proto } from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';

// Enumeración para estados de conexión
export enum ConnectionState {
  CONNECTING = 'connecting',
  OPEN = 'open',
  CLOSING = 'closing',
  CLOSED = 'closed',
  RECONNECTING = 'reconnecting',
}

// Tipo para errores de conexión
export type ConnectionError = Boom | Error | null | undefined;

// Tipo para handler de mensajes
export type MessageHandler = (message: proto.IWebMessageInfo) => Promise<void> | void;

// Tipo para eventos de estado de conexión
export type ConnectionEventHandler = (state: ConnectionState, error?: ConnectionError) => void;

// Tipo para respuesta genérica de WhatsApp
export interface WhatsAppResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: ConnectionError;
}

// Tipo para opciones de envío de mensajes
export interface SendMessageOptions {
  quoted?: proto.IWebMessageInfo;
  mentions?: string[];
  sendSeen?: boolean;
}

// Tipo para credenciales
export interface WhatsAppCredentials {
  state: any;
  saveCreds: () => Promise<void>;
}
