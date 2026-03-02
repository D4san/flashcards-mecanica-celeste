# Cacería Astral de Mecánica Celeste (UdeA)

Aplicación web gamificada para repasar rápidamente conceptos vistos en la clase de Mecánica Celeste de la Universidad de Antioquia (UdeA).

La dinámica central promueve el diálogo entre estudiantes: el equipo discute cada pregunta, construye acuerdos y coopera para derrotar a un jefe astral. La cooperación no es un adorno del juego, sino parte del aprendizaje.

## ¿Qué aporta esta app?

- Repaso rápido de conceptos clave de mecánica celeste.
- Trabajo colaborativo en tiempo real entre compañeros.
- Flujo lúdico de combate por fases para mantener motivación.
- Retroalimentación inmediata con enfoque didáctico.

## Mecánica general

1. Se configura el equipo.
2. Aparece una pregunta de repaso.
3. El equipo discute y responde en conjunto.
4. Las respuestas correctas causan daño al jefe.
5. El avance depende de la cooperación y la precisión colectiva.

## Stack

- Next.js 14
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion

## Desarrollo local

Requisitos:

- Node.js 18+
- npm

Pasos:

1. Instalar dependencias
   - npm install --legacy-peer-deps
2. Ejecutar en desarrollo
   - npm run dev
3. Build de producción
   - npm run build
4. Correr build local
   - npm run start

## Publicación en GitHub

1. Inicializar repositorio local (si aún no existe)
   - git init
2. Agregar archivos
   - git add .
3. Crear commit inicial
   - git commit -m "feat: cacería astral mecánica celeste"
4. Crear repositorio remoto en GitHub.
5. Enlazar remoto y subir rama principal
   - git remote add origin <URL_DEL_REPO>
   - git branch -M main
   - git push -u origin main

## Despliegue en Netlify

Opción A (desde GitHub, recomendado):

1. En Netlify, seleccionar Add new site -> Import an existing project.
2. Conectar el repo de GitHub.
3. Build command: npm run build
4. Publish directory: .next
5. Deploy.

Opción B (CLI):

1. Instalar CLI
   - npm i -g netlify-cli
2. Login
   - netlify login
3. Vincular o crear sitio
   - netlify init
4. Deploy de producción
   - netlify deploy --prod

## Nota pedagógica

Este proyecto está diseñado para fortalecer la comprensión conceptual a través de conversación académica entre pares. La meta no es solo “contestar bien”, sino argumentar, contrastar ideas y construir respuestas en equipo para avanzar juntos.
