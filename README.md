
# Chat-Bot

Descripción
-----------

Este repositorio contiene un chatbot dividido en dos partes principales:

- Frontend: una interfaz hecha con React + Vite ubicada en `ChatBot-Ui`.
- Backend: un servicio (API) en TypeScript usando NestJS ubicado en `mcp-service` que integra Google Gemini / GenAI y el SDK de Model Context Protocol (MCP).

El sistema está pensado para que la UI (frontend) consulte al backend, y el backend maneje la integración con los modelos generativos y la lógica de contexto médico.

Estructura del repositorio
---------------------------

Raíz
- `README.md` — este archivo.
- `ChatBot-Ui/` — frontend (React + Vite).
- `mcp-service/` — backend (NestJS + TypeScript).

Resumen rápido de carpetas y archivos importantes
-------------------------------------------------

Frontend (`ChatBot-Ui`)
- `package.json` — scripts y dependencias (Vite, React, Axios).
- `.env` — variable clave: `VITE_API_URL` (URL del backend, por defecto `http://localhost:3000`).
- `src/main.tsx` — punto de entrada de la app.
- `src/App.jsx` — componente raíz.
- `src/components/ChatbotWidget.tsx` — componente principal del widget de chat; contiene la UI y la interacción con la API.
- `src/api/chatbotService.ts` — cliente HTTP (usa `axios`) que comunica con el backend.
- `src/config.ts` — configuración local (constantes usadas por la UI).

Backend (`mcp-service`)
- `package.json` — scripts y dependencias (NestJS, @google/genai, @modelcontextprotocol/sdk, dotenv, zod, etc.).
- `.env` — variables de entorno importantes (ej.: `GEMINI_API_KEY`, `PORT`, `CHATBOT_NAME`, `CHATBOT_VERSION`). **No** comitear claves reales.
- `src/main.ts` — arranque de la aplicación NestJS.
- `src/app.module.ts` — módulos y proveedores registrados.
- `src/controllers/chatbot.controller.ts` — endpoints HTTP expuestos para la UI.
- `src/services/gemini.service.ts` — encapsula llamadas a la API de Google Gemini / GenAI.
- `src/config/mcp-context.ts` y otros `mcp-context-*.ts` — definiciones y contextos médicos usados por el flujo MCP.
- `src/dto/chat-message.dto.ts` — tipos/DTOs para mensajes entre UI y backend.
- `src/interfaces/` — interfaces TypeScript para tipado del contexto y datos.

Tecnologías principales
----------------------

- Frontend: React (v19), Vite, Axios. Código mayormente en TypeScript/JSX.
- Backend: NestJS (TypeScript) con integración a SDKs de Google GenAI y Model Context Protocol (MCP). Se usan `dotenv` para variables, `zod` para validación y `rxjs` junto a utilidades de Nest.

Requisitos previos
------------------

- Node.js 18+ (recomendado). Asegúrate de tener `npm` o `pnpm` instalado.
- Git para clonar el repositorio.
- Una API key de Google Gemini/GenAI para el backend (variable `GEMINI_API_KEY`).

Instalación y ejecución (desarrollo)
------------------------------------

1) Clonar el repositorio

```powershell
git clone https://github.com/GabyAvila1993/Chat-Bot.git
cd Chat-Bot
```

2) Backend (mcp-service)

```powershell
cd mcp-service
npm install
# Modo desarrollo con hot-reload de Nest
npm run start:dev

# Alternativamente, para producción:
# npm run build
# npm start
```

Variables de entorno del backend (archivo `.env` en `mcp-service`)
- `GEMINI_API_KEY` — clave/secret para Google Gemini / GenAI.
- `PORT` — puerto donde escuchar (por defecto `3000`).
- `CHATBOT_NAME` — nombre del chatbot (opcional).
- `CHATBOT_VERSION` — versión (opcional).

Importante: reemplaza `GEMINI_API_KEY` por tu propia clave. Nunca subas claves a repositorios públicos.

3) Frontend (ChatBot-Ui)

```powershell
cd ..\ChatBot-Ui
npm install
npm run dev
```

La app de Vite suele arrancar en `http://localhost:5173` (salvo configuración distinta). El frontend por defecto apuntará al backend mediante la variable `VITE_API_URL` en `ChatBot-Ui/.env` (ej.: `http://localhost:3000`).

Endpoints y flujo básico
-----------------------

- La UI envía peticiones HTTP (por `chatbotService.ts`) a los endpoints del backend definidos en `chatbot.controller.ts`.
- El backend recibe la petición, prepara el contexto médico (archivos `mcp-context-*.ts`) y llama a `gemini.service.ts` para obtener la respuesta del modelo generativo.
- El backend devuelve la respuesta procesada a la UI.

Archivos clave (qué hacen y por qué importan)
-------------------------------------------

Frontend
- `src/api/chatbotService.ts` — centraliza las llamadas HTTP hacia el backend; lugar recomendado para agregar reintentos/timeout y manejo de errores de red.
- `src/components/ChatbotWidget.tsx` — UI del chat: entrada del usuario, historial y renderizado de respuestas. Es el punto donde se integra la experiencia del usuario.
- `src/config.ts` — contiene constantes de la app (por ejemplo la URL base recogida de `import.meta.env.VITE_API_URL`).

Backend
- `src/main.ts` — arranca NestJS; aquí se configuran pipes globales, validación y CORS si hace falta.
- `src/app.module.ts` — define módulos, controladores y proveedores; es el lugar a editar si añades nuevos servicios.
- `src/controllers/chatbot.controller.ts` — define rutas públicas que el frontend consumirá (ej.: POST `/chat/message`).
- `src/services/gemini.service.ts` — encapsula la lógica de llamadas al SDK de Google GenAI y adaptación de respuestas; modificar aquí para cambiar proveedor o ajustar prompts.
- `src/config/mcp-context.ts` (y variantes) — contienen plantillas y reglas del contexto médico que se pasan al modelo (esencial para comportamiento correcto del asistente médico).

Buenas prácticas y notas de seguridad
-----------------------------------

- No subir claves en `.env` al repositorio. Usa secretos en tu proveedor de hosting o CI.
- Añade validación estricta (por ejemplo con `zod`) en los DTOs del backend para evitar inputs malformados.
- Considera límites de tasa y backoff al llamar a APIs externas (Gemini) para evitar costos inesperados.

Pruebas rápidas y verificación
-----------------------------

1. Levanta el backend en `PORT=3000`.
2. Levanta el frontend con `npm run dev` en `ChatBot-Ui`.
3. En la UI, envía un mensaje y observa la petición saliente hacia `VITE_API_URL` y la respuesta del backend.

Soporte y pasos siguientes sugeridos
-----------------------------------

- Añadir tests unitarios y de integración (por ejemplo usando Jest) para el backend.
- Añadir manejo de errores y estados de carga más detallados en la UI.
- Añadir documentación de la API (por ejemplo con Swagger en NestJS) para facilitar integración.

Contacto y licencia
-------------------

Este repositorio es mantenido por el autor listado en el `package.json`. Revisa la licencia en el repo (si aplica) y crea issues para preguntas o propuestas de mejora.

-- Fin del README --
