# 🛠️ Guía de Instalación - Módulo WSP

## 📋 Requisitos previos

Antes de instalar el módulo WSP, asegúrate de tener instalado:

- Node.js v14.0.0 o superior
- npm v6.0.0 o superior
- TypeScript v4.0.0 o superior

## 🚀 Instalación

### 1️⃣ Instalar las dependencias necesarias

El módulo WSP depende principalmente de la biblioteca Baileys para la conexión con WhatsApp. Instala las dependencias requeridas:

```bash
npm install @whiskeysockets/baileys@latest
npm install qrcode-terminal # Para mostrar el código QR en terminal
npm install winston # Para el sistema de logging
```

### 2️⃣ Copiar el módulo a tu proyecto

Puedes integrar este módulo en tu proyecto de varias maneras:

#### 📁 Opción 1: Importación directa

1. Copia toda la carpeta `wsp` dentro de tu proyecto
2. Importa el módulo desde donde lo necesites:

```typescript
import wsp from './path/to/wsp';
```

#### 📦 Opción 2: Como paquete npm local

1. Añade un package.json al módulo WSP con la siguiente configuración:

```json
{
  "name": "whatsapp-wsp",
  "version": "1.0.0",
  "description": "Módulo para integración con WhatsApp usando Baileys",
  "main": "index.js",
  "types": "index.d.ts",
  "dependencies": {
    "@whiskeysockets/baileys": "^6.0.0",
    "qrcode-terminal": "^0.12.0",
    "winston": "^3.8.0"
  }
}
```

2. Construye el módulo:

```bash
cd src/wsp
npm install
tsc
```

3. Instala el módulo desde tu proyecto principal:

```bash
npm install ./src/wsp
```

## ⚙️ Configuración

### 📄 Variables de Entorno

Crea un archivo `.env` en la raíz de tu proyecto con las siguientes variables:

```env
# Configuración de WSP
WSP_LOG_LEVEL=info           # Nivel de logging (debug|info|warn|error)
WSP_AUTH_PATH=./auth_data    # Ruta personalizada para almacenamiento de sesión (opcional)
WSP_PRINT_QR=true            # Mostrar QR en terminal (true|false)
```

### 🛡️ Permisos necesarios

El módulo necesita permisos de:
- Lectura/escritura en el sistema de archivos para guardar las sesiones
- Acceso a la red para comunicación con los servidores de WhatsApp

## 🔄 Actualización

Para actualizar el módulo a una nueva versión:

1. Respalda tu carpeta `auth_info_baileys` donde se almacenan las sesiones
2. Reemplaza los archivos del módulo con la nueva versión
3. Restaura la carpeta de sesiones si es necesario

```bash
cp -r wsp/auth_info_baileys ./backup/
# Actualizar módulo
cp -r ./backup/auth_info_baileys wsp/
```

## 🔍 Verificación de la instalación

Para verificar que la instalación se realizó correctamente, puedes crear un script de prueba:

```typescript
import wsp from './wsp';

// Inicializar módulo
const init = async () => {
  try {
    await wsp.initialize(async (msg) => {
      console.log('Mensaje recibido:', msg.key.remoteJid);
    });
    console.log('✅ WSP inicializado correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar WSP:', error);
  }
};

init();
```

## 🔧 Solución de problemas comunes

### ❓ El código QR no aparece
- Verifica que `printQRInTerminal` esté habilitado
- Comprueba que la terminal soporte caracteres Unicode

### ❓ Error de autenticación
- Elimina la carpeta `auth_info_baileys` y vuelve a intentar
- Asegúrate de que tu WhatsApp esté actualizado

### ❓ No se reciben mensajes
- Verifica la conexión a internet
- Comprueba que el callback de mensajes esté correctamente implementado