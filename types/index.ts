// 📋 Tipos de datos para el módulo WSP

/**
 * Configuración para la conexión de WhatsApp
 */
export interface WhatsAppConfig {
  // Ruta donde se guardarán los archivos de autenticación
  authPath?: string;
  // Duración del QR en segundos (0 para infinito)
  qrTimeoutMs?: number; 
  // Si debe mostrar QR en terminal
  printQRInTerminal?: boolean;
  // Si debe reconectar automáticamente
  autoReconnect?: boolean;
  // Máximo número de reconexiones (0 para infinito)
  maxReconnects?: number;
}

/**
 * Información básica de un mensaje de WhatsApp
 */
export interface WhatsAppMessage {
  id: string;
  remoteJid: string;
  fromMe: boolean;
  participant?: string;
  text: string;
  timestamp: number;
  isGroup: boolean;
}

/**
 * Estado de la conexión de WhatsApp
 */
export enum ConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'open',
  DISCONNECTED = 'close',
  RECONNECTING = 'reconnecting'
}

/**
 * Opciones para enviar un mensaje multimedia
 */
export interface MediaMessageOptions {
  caption?: string;
  fileName?: string;
  mimetype?: string;
}

/**
 * Tipo de mensaje multimedia
 */
export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  STICKER = 'sticker'
}