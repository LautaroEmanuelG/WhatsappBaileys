// Configuración para WhatsApp usando Baileys
import * as path from 'path';

// Constantes de configuración en mayúsculas según tu preferencia
export const AUTH_PATH = process.env.AUTH_PATH ?? path.join(process.cwd(), 'auth_info_baileys');
export const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info';
export const PRINT_QR_TERMINAL = process.env.PRINT_QR_TERMINAL !== 'false';

// Configuración predeterminada para la conexión de WhatsApp
export const DEFAULT_CONNECTION_CONFIG = {
  printQRInTerminal: PRINT_QR_TERMINAL,
  auth: undefined, // Se completará en tiempo de ejecución
  logger: undefined, // Se completará por el servicio
  browser: ['WhatsApp Baileys', 'Chrome', '4.0.0'],
  version: [2, 2414, 7],
};

// Tipo de configuración para WhatsApp
export type WhatsAppConfig = {
  authPath: string;
  logLevel: string;
  printQRInTerminal: boolean;
  connectionConfig: typeof DEFAULT_CONNECTION_CONFIG;
};

// Función para obtener la configuración completa
export const getWhatsAppConfig = (): WhatsAppConfig => ({
  authPath: AUTH_PATH,
  logLevel: LOG_LEVEL,
  printQRInTerminal: PRINT_QR_TERMINAL,
  connectionConfig: DEFAULT_CONNECTION_CONFIG,
});

export default getWhatsAppConfig;
