// Índice principal del módulo WhatsApp Baileys
import whatsappService, { 
  getWhatsAppService,
  initialize,
  isConnected,
  closeConnection
} from './services/whatsapp.service';
import { getWhatsAppConfig } from './config/whatsapp.config';
import logger from './utils/logger';
import * as Types from './types';

// Exportamos todos los componentes para facilitar el uso del módulo
export {
  // Servicio principal
  whatsappService as default,
  getWhatsAppService,
  initialize,
  isConnected,
  closeConnection,
  
  // Configuración
  getWhatsAppConfig,
  
  // Utilidades
  logger,
  
  // Tipos
  Types
};

// Para uso directo desde línea de comandos
if (require.main === module) {
  // Función de ejemplo para el manejo de mensajes
  const handleMessage = async (message: Types.proto.IWebMessageInfo) => {
    const jid = message.key.remoteJid;
    const body = message.message?.conversation || 
                message.message?.extendedTextMessage?.text || 
                '';
    
    logger.info(`📩 Mensaje recibido: ${body}`);
    
    // Respuesta simple a mensajes "hola"
    if (jid && body.toLowerCase() === 'hola') {
      const whatsapp = getWhatsAppService();
      await whatsapp.sendMessage(
        jid, 
        '¡Hola! Soy un bot de WhatsApp con Baileys 👋'
      );
    }
  };

  // Inicializar el servicio al ejecutar directamente
  initialize(handleMessage, (state, error) => {
    logger.info(`Estado de conexión: ${state}`);
    if (error) {
      logger.error('Error de conexión:', error);
    }
  })
  .then(() => logger.info('🚀 Servicio WhatsApp inicializado correctamente'))
  .catch(err => logger.error('❌ Error al inicializar WhatsApp:', err));
}
