// Servicio principal de WhatsApp utilizando Baileys
import { 
  default as makeWASocket, 
  DisconnectReason, 
  useMultiFileAuthState,
  AnyMessageContent,
  proto,
  downloadMediaMessage
} from '@whiskeysockets/baileys';
import * as fs from 'fs';
import { Boom } from '@hapi/boom';
import * as qrcode from 'qrcode-terminal';
import { getWhatsAppConfig } from '../config/whatsapp.config';
import logger from '../utils/logger';
import { 
  ConnectionState, 
  MessageHandler, 
  ConnectionEventHandler, 
  SendMessageOptions, 
  WhatsAppResponse 
} from '../types';

// Clase singleton para el servicio de WhatsApp
class WhatsAppService {
  private static instance: WhatsAppService;
  private socket: ReturnType<typeof makeWASocket> | null = null;
  private connectionState: ConnectionState = ConnectionState.CLOSED;
  private messageHandler: MessageHandler | null = null;
  private connectionEventHandler: ConnectionEventHandler | null = null;
  private authPath: string;
  
  private constructor() {
    const config = getWhatsAppConfig();
    this.authPath = config.authPath;
    
    // Crear directorio de autenticación si no existe
    if (!fs.existsSync(this.authPath)) {
      fs.mkdirSync(this.authPath, { recursive: true });
    }
  }

  // Obtener la instancia única del servicio
  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  // Inicializar la conexión con WhatsApp
  public initialize = async (
    messageHandler?: MessageHandler,
    connectionEventHandler?: ConnectionEventHandler
  ): Promise<WhatsAppResponse> => {
    try {
      if (messageHandler) {
        this.messageHandler = messageHandler;
      }
      
      if (connectionEventHandler) {
        this.connectionEventHandler = connectionEventHandler;
      }
      
      await this.connect();
      
      return {
        success: true,
        message: 'WhatsApp inicializado correctamente',
      };
    } catch (error) {
      logger.error('Error al inicializar WhatsApp:', error);
      return {
        success: false,
        message: 'Error al inicializar WhatsApp',
        error: error as Error,
      };
    }
  };

  // Conectar con WhatsApp
  private connect = async (): Promise<void> => {
    try {
      // Cambiar estado de conexión
      this.updateConnectionState(ConnectionState.CONNECTING);
      
      const config = getWhatsAppConfig();
      const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
      
      // Crear socket de WhatsApp
      this.socket = makeWASocket({
        ...config.connectionConfig,
        auth: state,
        printQRInTerminal: config.printQRInTerminal,
        logger,
      });
      
      // Manejar actualización de credenciales
      this.socket.ev.on('creds.update', saveCreds);
      
      // Manejar cambios en la conexión
      this.socket.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        // Mostrar código QR si está disponible y configurado
        if (qr && config.printQRInTerminal) {
          qrcode.generate(qr, { small: true });
          logger.info('🔄 Escanea el código QR con tu teléfono para iniciar sesión');
        }
        
        // Manejar estados de conexión
        if (connection === 'close') {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;
          const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
          
          logger.info(`❌ Conexión cerrada. Código: ${statusCode}`);
          
          if (shouldReconnect) {
            logger.info('🔄 Reconectando WhatsApp...');
            this.updateConnectionState(ConnectionState.RECONNECTING);
            this.connect();
          } else {
            logger.info('❌ Desconexión permanente, sesión cerrada');
            this.updateConnectionState(ConnectionState.CLOSED);
          }
        } else if (connection === 'open') {
          logger.info('✅ Conexión a WhatsApp establecida correctamente');
          this.updateConnectionState(ConnectionState.OPEN);
        }
      });
      
      // Manejar mensajes entrantes
      this.socket.ev.on('messages.upsert', async (m) => {
        if (m.type === 'notify') {
          for (const msg of m.messages) {
            if (!msg?.key.fromMe && this.messageHandler) {
              await this.messageHandler(msg);
            }
          }
        }
      });
      
    } catch (error) {
      logger.error('Error al conectar con WhatsApp:', error);
      this.updateConnectionState(ConnectionState.CLOSED, error as Error);
      throw error;
    }
  };

  // Actualizar el estado de la conexión y notificar al handler
  private updateConnectionState = (state: ConnectionState, error?: Error): void => {
    this.connectionState = state;
    
    if (this.connectionEventHandler) {
      this.connectionEventHandler(state, error);
    }
  };

  // Verificar si está conectado
  public isConnected = (): boolean => {
    return this.connectionState === ConnectionState.OPEN;
  };

  // Obtener el socket actual
  public getSocket = () => {
    return this.socket;
  };

  // Enviar mensaje de texto
  public sendMessage = async (
    jid: string, 
    text: string, 
    options?: SendMessageOptions
  ): Promise<WhatsAppResponse> => {
    try {
      if (!this.isConnected() || !this.socket) {
        return {
          success: false,
          message: 'No hay conexión a WhatsApp',
        };
      }
      
      await this.socket.sendMessage(jid, { text }, options);
      
      return {
        success: true,
        message: 'Mensaje enviado correctamente',
      };
    } catch (error) {
      logger.error('Error al enviar mensaje:', error);
      return {
        success: false,
        message: 'Error al enviar mensaje',
        error: error as Error,
      };
    }
  };

  // Enviar mensaje multimedia
  public sendMediaMessage = async (
    jid: string,
    media: Buffer | string,
    mimetype: string,
    caption?: string,
    options?: SendMessageOptions
  ): Promise<WhatsAppResponse> => {
    try {
      if (!this.isConnected() || !this.socket) {
        return {
          success: false,
          message: 'No hay conexión a WhatsApp',
        };
      }
      
      let content: AnyMessageContent;
      
      // Determinar el tipo de contenido basado en el mimetype
      if (mimetype.startsWith('image/')) {
        content = {
          image: media,
          caption: caption ?? '',
          mimetype,
        };
      } else if (mimetype.startsWith('video/')) {
        content = {
          video: media,
          caption: caption ?? '',
          mimetype,
        };
      } else if (mimetype.startsWith('audio/')) {
        content = {
          audio: media,
          mimetype,
        };
      } else {
        content = {
          document: media,
          mimetype,
          fileName: caption ?? 'file',
        };
      }
      
      await this.socket.sendMessage(jid, content, options);
      
      return {
        success: true,
        message: 'Mensaje multimedia enviado correctamente',
      };
    } catch (error) {
      logger.error('Error al enviar mensaje multimedia:', error);
      return {
        success: false,
        message: 'Error al enviar mensaje multimedia',
        error: error as Error,
      };
    }
  };

  // Cerrar la conexión
  public closeConnection = async (): Promise<WhatsAppResponse> => {
    try {
      if (this.socket) {
        this.socket.end(undefined);
        this.socket = null;
        this.updateConnectionState(ConnectionState.CLOSED);
      }
      
      return {
        success: true,
        message: 'Conexión cerrada correctamente',
      };
    } catch (error) {
      logger.error('Error al cerrar la conexión:', error);
      return {
        success: false,
        message: 'Error al cerrar la conexión',
        error: error as Error,
      };
    }
  };
}

// Exportar funciones de utilidad usando funciones flecha
export const getWhatsAppService = () => WhatsAppService.getInstance();
export const initialize = async (
  messageHandler?: MessageHandler,
  connectionEventHandler?: ConnectionEventHandler
) => {
  return await WhatsAppService.getInstance().initialize(messageHandler, connectionEventHandler);
};
export const isConnected = () => WhatsAppService.getInstance().isConnected();
export const closeConnection = async () => {
  return await WhatsAppService.getInstance().closeConnection();
};

export default {
  getWhatsAppService,
  initialize,
  isConnected,
  closeConnection,
};
