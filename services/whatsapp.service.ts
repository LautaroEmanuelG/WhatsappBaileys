// 💬 Servicio para interactuar con WhatsApp a través de Baileys
import { getWhatsAppSocket, connectToWhatsApp, isConnected } from '../config/whatsapp.config';
import logger from '../utils/logger';

// Singleton para la instancia del servicio
let whatsAppServiceInstance: WhatsAppService | null = null;

export class WhatsAppService {
  // Flag para evitar múltiples inicializaciones
  private static isInitialized = false;

  constructor() {
    // Patrón Singleton - evitar múltiples instancias
    if (whatsAppServiceInstance) {
      logger.debug('Reutilizando instancia existente de WhatsAppService');
      return whatsAppServiceInstance;
    }

    if (WhatsAppService.isInitialized) {
      logger.debug('WhatsAppService ya fue inicializado');
    } else {
      WhatsAppService.isInitialized = true;
      logger.info('Inicializando servicio de WhatsApp usando Baileys');
    }

    whatsAppServiceInstance = this;
  }

  /**
   * Envía un mensaje de texto
   * @param jid - ID de WhatsApp del destinatario (ej: '1234567890@s.whatsapp.net')
   * @param message - Mensaje de texto a enviar
   */
  async sendMessage(jid: string, message: string): Promise<void> {
    try {
      const sock = this.getSocket();
      if (!sock) {
        throw new Error('WhatsApp no conectado, mensaje no enviado');
      }

      await sock.sendMessage(jid, { text: message });
      logger.debug(`Mensaje enviado a ${jid}: ${message.substring(0, 30)}${message.length > 30 ? '...' : ''}`);
    } catch (error) {
      logger.error(`Error al enviar mensaje: ${error}`);
      throw error;
    }
  }

  /**
   * Envía un mensaje multimedia (imagen, video, documento)
   * @param jid - ID de WhatsApp del destinatario
   * @param media - Buffer o URL del medio
   * @param mimetype - Tipo MIME del contenido
   * @param caption - Leyenda opcional para el medio
   */
  async sendMediaMessage(
    jid: string,
    media: Buffer | string,
    mimetype: string,
    caption?: string
  ): Promise<void> {
    try {
      const sock = this.getSocket();
      if (!sock) {
        throw new Error('WhatsApp no conectado, mensaje multimedia no enviado');
      }

      if (typeof media === 'string') {
        // Es una URL
        await sock.sendMessage(jid, {
          image: { url: media },
          mimetype,
          caption,
        });
      } else {
        // Es un Buffer
        await sock.sendMessage(jid, {
          image: media,
          mimetype,
          caption,
        });
      }
      logger.debug(`Mensaje multimedia enviado a ${jid}`);
    } catch (error) {
      logger.error(`Error al enviar mensaje multimedia: ${error}`);
      throw error;
    }
  }

  /**
   * Comprobar estado de conexión
   * @returns true si está conectado, false en caso contrario
   */
  isConnected(): boolean {
    return isConnected();
  }

  /**
   * Método privado para obtener siempre el socket más reciente
   * @returns Socket de WhatsApp o null si no está conectado
   */
  private getSocket() {
    const sock = getWhatsAppSocket();
    if (!sock) {
      logger.warn('Socket de WhatsApp no disponible, intentando reconectar...');
      connectToWhatsApp().catch(err => {
        logger.error(`Error al reconectar WhatsApp: ${err}`);
      });
      return null;
    }
    return sock;
  }

  /**
   * Método para intentar reconectar manualmente
   * @returns true si la reconexión fue exitosa
   */
  async reconnect(): Promise<boolean> {
    try {
      await connectToWhatsApp();
      return this.isConnected();
    } catch (error) {
      logger.error(`Error al reconectar WhatsApp: ${error}`);
      return false;
    }
  }
}

/**
 * Inicializa la conexión con WhatsApp
 * @param messageHandler - Función opcional para manejar mensajes entrantes
 */
export const initWhatsApp = async (
  messageHandler?: (message: any) => Promise<void>
): Promise<void> => {
  await connectToWhatsApp(messageHandler);
  logger.info('Inicialización de WhatsApp completada');
};

// Exportar una instancia por defecto
export default new WhatsAppService();