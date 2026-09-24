# Entre mundos

SPA mobile-first para conversar con tres personajes mediante Google Gemini. Incluye rutas `/home`, `/chat` y `/about`, historial independiente por personaje en localStorage, tema claro/oscuro, copiar respuestas, timestamps, indicador de escritura y pruebas unitarias.

## Ejecutar

Requiere Node.js 20+, npm, Vercel CLI y una clave de Google AI Studio.

## Personajes

- **Sherlock Holmes:** detective consultor observador, ingenioso y conciso.
- **Luna Valen:** astrónoma ficticia cálida y curiosa; distingue ciencia de ficción.
- **Morgana:** hechicera del bosque con humor sutil; distingue fantasía de hechos reales.

Cada uno tiene instrucciones propias en `src/characters.js`.

1. Ejecutá `npm install` y, si no tenés la CLI, `npm install -g vercel`.
2. Copiá `.env.example` a `.env.local` y completá `GEMINI_API_KEY`. El nombre del modelo puede cambiarse con `GEMINI_MODEL`.
3. Ejecutá `vercel dev` desde la raíz (puede pedir iniciar sesión en Vercel). Abrí la URL local que indique la terminal. La función `/api/chat` requiere el servidor de Vercel; abrir `index.html` como archivo no sirve para el chat.
4. Ejecutá `npm test` para las cinco pruebas unitarias con Vitest.

## Despliegue en Vercel

Importá este repositorio en Vercel con preset **Other**, directorio raíz del proyecto, sin comando de build y sin directorio de salida. Configurá `GEMINI_API_KEY` como variable de entorno del proyecto (y, opcionalmente, `GEMINI_MODEL`). Desplegá y probá `/home`, `/chat`, `/about`, recargar en cada ruta, y una pregunta real en `/chat`. Nunca agregues `.env.local` al repositorio.

## Enlaces y capturas

- Repositorio de GitHub: pendiente de publicar desde una cuenta conectada.
- Aplicación pública en Vercel: pendiente de desplegar y configurar `GEMINI_API_KEY`.
- Capturas reales: pendientes de generar tras el despliegue y de probar una conversación con la clave configurada. No se incluyen capturas simuladas como evidencia de funcionamiento.

## Diseño y funcionamiento

La History API permite navegar sin recarga y usar atrás/adelante. `vercel.json` sirve `index.html` en las tres rutas. Cada petición manda al servidor el personaje seleccionado y hasta 24 turnos recientes; el servidor valida esos datos, añade el prompt del personaje y llama a Gemini con la clave privada. El historial se guarda en este navegador hasta usar «Borrar chat»; se envía a Gemini al conversar. El diseño contempla móvil (375 px), tablet (768 px) y escritorio (1440 px).

## Uso de IA en el desarrollo

Este proyecto se implementó con asistencia de ChatGPT para estructura, estilos, lógica y pruebas. Revisar el código y probar el servicio real con una clave propia antes de entregar.
