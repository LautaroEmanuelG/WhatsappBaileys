# 🔌 Módulo WSP - Conexión con WhatsApp

Este módulo proporciona una implementación lista para usar de la conexión a WhatsApp utilizando la biblioteca [Baileys](https://github.com/WhiskeySockets/Baileys). Está diseñado para ser fácilmente integrado en cualquier aplicación Node.js.

## 📋 Características principales

- **Conexión simplificada**: Manejo automático de la autenticación y reconexiones
- **Patrón Singleton**: Garantiza una única instancia de conexión
- **Fácil manejo de mensajes**: Envío de texto, imágenes y archivos multimedia
- **Sistema de logging**: Registro detallado de eventos y errores
- **Tipado completo**: Interfaces TypeScript para mejor desarrollo
- **Manejo de autenticación**: Generación de código QR y almacenamiento seguro de sesiones

## 🚀 Cómo usar este módulo

### 1. Inicializar la conexión

```typescript
import wsp from './wsp';

// Inicializar la conexión con un manejador de mensajes
wsp.initialize(async (message) => {
  console.log('Mensaje recibido:', message);
});
```

### 2. Enviar mensajes de texto

```typescript
import { getWhatsAppService } from './wsp';

const whatsapp = getWhatsAppService();

// Enviar mensaje a un chat individual
await whatsapp.sendMessage('1234567890@s.whatsapp.net', '¡Hola! Este es un mensaje de prueba');

// Enviar mensaje a un grupo
await whatsapp.sendMessage('123456789-987654321@g.us', '¡Hola a todos!');
```

### 3. Enviar mensajes multimedia

```typescript
import { getWhatsAppService } from './wsp';
import fs from 'fs';

const whatsapp = getWhatsAppService();

// Enviar una imagen desde una URL
await whatsapp.sendMediaMessage(
  '1234567890@s.whatsapp.net',
  'https://example.com/imagen.jpg',
  'image/jpeg',
  'Mira esta imagen 📸'
);

// Enviar una imagen desde un archivo local
const imageBuffer = fs.readFileSync('ruta/a/imagen.jpg');
await whatsapp.sendMediaMessage(
  '1234567890@s.whatsapp.net',
  imageBuffer,
  'image/jpeg',
  'Foto desde archivo local 📄'
);
```

### 4. Verificar el estado de la conexión

```typescript
import { isConnected } from './wsp';

if (isConnected()) {
  console.log('¡WhatsApp está conectado! ✅');
} else {
  console.log('WhatsApp está desconectado ❌');
}
```

### 5. Cerrar la conexión

```typescript
import { closeConnection } from './wsp';

// Cerrar la conexión al finalizar
await closeConnection();
```

## 🔧 Configuración avanzada

El módulo admite configuraciones adicionales a través de variables de entorno:

```
# Ruta alternativa para archivos de credenciales
AUTH_PATH=/ruta/personalizada/auth_folder

# Habilitar logs detallados (debug|info|warn|error)
LOG_LEVEL=debug

# Desactivar la impresión del código QR en la terminal
PRINT_QR_TERMINAL=false
```

## 📚 Estructura del módulo

```
wsp/
├── config/              # Configuraciones de conexión
│   └── whatsapp.config.ts
├── services/            # Servicios de interacción con WhatsApp
│   └── whatsapp.service.ts
├── types/               # Definiciones de tipos
│   └── index.ts
├── utils/               # Herramientas de utilidad
│   └── logger.ts
├── auth_info_baileys/   # Directorio donde se guardan las credenciales (generado automáticamente)
└── index.ts             # Punto de entrada principal
```

## 🔐 Notas sobre seguridad

- Las sesiones se almacenan localmente en el directorio `auth_info_baileys`
- Nunca compartas los archivos de sesión, ya que permiten acceso a tu cuenta de WhatsApp
- El código QR expuesto en la terminal debe ser escaneado únicamente desde tu dispositivo

## 📥 Instalación 

Para instrucciones detalladas de instalación y configuración, consulta el archivo [INSTALLATION.md](./INSTALLATION.md).

Pasos rápidos:

```bash
# Instalar dependencias
npm install @whiskeysockets/baileys qrcode-terminal winston

# Configurar variables de entorno (opcional)
echo "WSP_LOG_LEVEL=info" >> .env
echo "WSP_PRINT_QR=true" >> .env
```

## 👨‍💻 Ejemplos de código adicionales

### Manejo de eventos específicos

```typescript
import wsp from './wsp';
import { ConnectionState } from './wsp/types';

// Monitorear estado de conexión
const monitorConnection = () => {
  const socket = wsp.getWhatsAppSocket();
  socket?.ev.on('connection.update', (update) => {
    const state = update.connection;
    console.log(`Estado de conexión: ${state ?? 'desconocido'}`);
  });
};

// Ejecutar ejemplo
const runExample = async () => {
  await wsp.initialize();
  monitorConnection();
};
```

## 📅 Última actualización: Mayo 2025