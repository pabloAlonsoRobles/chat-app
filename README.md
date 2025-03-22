# Chat App con Next.js y Firebase

Una aplicación de chat en tiempo real construida con Next.js, Firebase y TailwindCSS.

## Características

- Autenticación con Google
- Chat en tiempo real
- Interfaz responsive
- Mensajes instantáneos
- Lista de usuarios en línea
- Diseño moderno con TailwindCSS

## Tecnologías

- Next.js 14
- Firebase (Authentication, Firestore)
- TailwindCSS
- TypeScript

## Configuración del Proyecto

1. Clona el repositorio:
```bash
git clone https://github.com/pabloAlonsoRobles/chat-app.git
cd chat-app
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno:
Crea un archivo `.env.local` con las siguientes variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=tu_measurement_id
```

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

## Uso

1. Abre http://localhost:3000 en tu navegador
2. Inicia sesión con tu cuenta de Google
3. Selecciona un usuario de la lista para comenzar a chatear
4. ¡Disfruta del chat en tiempo real!

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría hacer.

## Licencia

MIT
