// 📝 Sistema de logging para el módulo WSP
import winston from 'winston';

// Colores para los niveles de log
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'cyan',
};

// Añadir colores a winston
winston.addColors(colors);

// Formato personalizado de logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `[${info.timestamp}] [WSP] [${info.level}]: ${info.message}`
  )
);

// Nivel de log basado en el entorno
const level = process.env.NODE_ENV === 'production' ? 'info' : 'debug';

// Crear el logger
const logger = winston.createLogger({
  level,
  format,
  transports: [
    // Escribir logs a la consola
    new winston.transports.Console(),
    // Guardar logs de errores en archivo
    new winston.transports.File({
      filename: 'logs/wsp-error.log',
      level: 'error',
    }),
    // Guardar todos los logs en otro archivo
    new winston.transports.File({ 
      filename: 'logs/wsp-combined.log' 
    }),
  ],
});

export default logger;