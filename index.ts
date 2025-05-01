// 🚀 Punto de entrada para el módulo WSP - Conexión con WhatsApp

import WhatsAppService, { initWhatsApp } from './services/whatsapp.service';
import { 
  connectToWhatsApp, 
  getWhatsAppSocket, 
  isConnected, 
  closeConnection 
} from './config/whatsapp.config';
import * as Types from './types';
import logger from './utils/logger';

/**
 * Inicializar WhatsApp con un callback para procesar mensajes
 */
export const initializeWhatsApp = async (
  onMessage?: (message: any) => Promise<void>
): Promise<void> => {
  await initWhatsApp(onMessage);
};

/**
 * Obtener una instancia del servicio de WhatsApp
 */
export const getWhatsAppService = (): WhatsAppService => {
  return new WhatsAppService();
};

export {
  // Configuración básica
  connectToWhatsApp,
  getWhatsAppSocket,
  isConnected,
  closeConnection,
  
  // Servicio para envío de mensajes
  WhatsAppService,
  
  // Tipos de datos
  Types,
  
  // Utilidades
  logger
};

// Exportación por defecto para importar todo el módulo
export default {
  initialize: initializeWhatsApp,
  getService: getWhatsAppService,
  utils: {
    isConnected,
    closeConnection,
    logger
  }
};