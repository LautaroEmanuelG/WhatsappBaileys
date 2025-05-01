// Utilidad de logging para la aplicación de WhatsApp
import * as pino from 'pino';
import { LOG_LEVEL } from '../config/whatsapp.config';

// Creación del logger con nivel configurable
const logger = pino({
  level: LOG_LEVEL,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    },
  },
});

// Exportación del logger como función de flecha, siguiendo tus preferencias
export const getLogger = () => logger;

export default logger;
