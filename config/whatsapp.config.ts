// 📱 Configuración de conexión a WhatsApp usando Baileys
import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

/**
 * Variables globales para mantener el estado de la conexión
 */
let sock: WASocket | null = null;
let reconnectCount = 0; // Contador de reconexiones
let messagesEventSubscribed = false; // Control para evitar múltiples suscripciones

/**
 * Directorio donde se almacenarán los archivos de autenticación
 */
const AUTH_FOLDER = 'auth_info_baileys';

/**
 * Establece una conexión con WhatsApp usando Baileys
 * @param onMessage - Callback opcional para procesar mensajes entrantes
 * @returns La instancia del socket de WhatsApp
 */
export const connectToWhatsApp = async (
  onMessage?: (message: any) => Promise<void>
) => {
  // Crear directorio de autenticación si no existe
  const authPath = path.join(__dirname, '..', AUTH_FOLDER);
  if (!fs.existsSync(authPath)) {
    fs.mkdirSync(authPath, { recursive: true });
    logger.info(`Directorio de autenticación creado en: ${authPath}`);
  }

  // Obtener estado de autenticación
  const { state, saveCreds } = await useMultiFileAuthState(authPath);

  // Desconectar el socket anterior antes de crear uno nuevo
  if (sock) {
    logger.info('Cerrando conexión anterior antes de reconectar...');
    try {
      sock.ev.removeAllListeners('messages.upsert');
      sock.ws.close();
    } catch (err) {
      logger.error('Error al cerrar conexión anterior: ' + err);
    }
  }

  // Crear nueva instancia del socket
  sock = makeWASocket({
    auth: state,
    printQRInTerminal: true,
    // Configuración adicional puede ser añadida aquí
  });

  // Guardar credenciales cuando se actualicen
  sock.ev.on('creds.update', saveCreds);

  // Manejar eventos de conexión
  sock.ev.on('connection.update', async update => {
    const { connection, lastDisconnect } = update;
    
    if (connection === 'close') {
      // Determinar si debemos intentar reconectar
      const shouldReconnect =
        (lastDisconnect?.error as Boom)?.output?.statusCode !==
        DisconnectReason.loggedOut;
      
      if (shouldReconnect) {
        reconnectCount++;
        logger.info(`Reconectando a WhatsApp... (Reconexión #${reconnectCount})`);
        connectToWhatsApp(onMessage);
      } else {
        logger.warn('Desconexión permanente (logout). No se intentará reconectar.');
      }
    } else if (connection === 'open') {
      logger.info('✅ Conexión a WhatsApp establecida correctamente');
      messagesEventSubscribed = false; // Resetear para permitir nueva suscripción

      // Suscribir al evento de mensajes entrantes
      if (onMessage && !messagesEventSubscribed) {
        messagesEventSubscribed = true;
        logger.info('Suscribiendo a eventos de mensajes...');

        sock?.ev.on('messages.upsert', async ({ messages, type }) => {
          logger.info(`Evento messages.upsert recibido. Tipo: ${type}, Mensajes: ${messages.length}`);
          for (const message of messages) {
            try {
              await onMessage(message);
            } catch (error) {
              logger.error(`Error al procesar mensaje en evento: ${error}`);
            }
          }
        });
      }
    }
  });

  return sock;
};

/**
 * Obtiene la instancia actual del socket de WhatsApp
 * @returns La instancia del socket o null si no existe
 */
export const getWhatsAppSocket = (): WASocket | null => sock;

/**
 * Comprueba si hay una conexión activa con WhatsApp
 * @returns true si está conectado, false en caso contrario
 */
export const isConnected = (): boolean => {
  return sock !== null;
};

/**
 * Cierra la conexión actual con WhatsApp
 */
export const closeConnection = async (): Promise<void> => {
  if (sock) {
    try {
      logger.info('Cerrando conexión de WhatsApp...');
      await sock.ws.close();
      sock = null;
    } catch (error) {
      logger.error(`Error al cerrar la conexión: ${error}`);
    }
  }
};