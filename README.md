# Cacería Astral de Mecánica Celeste (UdeA)

<p align="left">
  <a href="https://flashcards-mecanica-celeste-udea.netlify.app">
    <img src="https://img.shields.io/badge/Despliegue-Netlify-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Despliegue en Netlify" />
  </a>
  <img src="https://img.shields.io/badge/Estado-Producci%C3%B3n-success?style=for-the-badge" alt="Estado en producción" />
  <img src="https://img.shields.io/badge/Framework-Next.js%2014-black?style=for-the-badge&logo=nextdotjs" alt="Framework Next.js 14" />
  <img src="https://img.shields.io/badge/Curso-Mec%C3%A1nica%20Celeste%20(UdeA)-4A5568?style=for-the-badge" alt="Curso Mecánica Celeste UdeA" />
  <img src="https://img.shields.io/badge/Modo-Aprendizaje%20Colaborativo-7C3AED?style=for-the-badge" alt="Aprendizaje colaborativo" />
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/Licencia-MIT-blue?style=for-the-badge" alt="Licencia MIT" />
  </a>
</p>

**Demo en Netlify:** https://flashcards-mecanica-celeste-udea.netlify.app

Aplicación web gamificada para reforzar conceptos del curso de Mecánica Celeste de la Universidad de Antioquia (UdeA), con dinámica colaborativa entre estudiantes.

## Objetivo del proyecto

- Promover discusión académica en equipo.
- Reforzar conceptos clave mediante preguntas y retroalimentación.
- Mantener una experiencia lúdica sin perder rigor conceptual.

## Cómo actualizar preguntas

Las preguntas del juego se editan directamente en:

- `app/page.tsx`

Dentro del arreglo `initialFlashcards`, cada objeto usa esta estructura:

```ts
{
  question: "Pregunta",
  answer: "Respuesta correcta",
  nanswer: "Respuesta falsa (solo para trampa)",
  isTrap: true // opcional
}
```

### Preguntas trampa

- Activa `isTrap: true` para marcar una pregunta como trampa.
- En preguntas trampa, debes definir `nanswer` con la respuesta falsa.
- `answer` siempre debe contener la respuesta correcta final.

## Ejecución

### Desde GitHub

Puedes ejecutar el proyecto directamente desde GitHub con Codespaces:

1. Abre el repositorio en GitHub.
2. Selecciona **Code** → **Codespaces** → **Create codespace on main**.
3. En la terminal del Codespace, ejecuta:
   - `npm install --legacy-peer-deps`
   - `npm run dev`

### En local

Requisitos:

- Node.js 18+
- npm

Comandos:

1. `npm install --legacy-peer-deps`
2. `npm run dev`
3. `npm run build`
4. `npm run start`

## Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE`.
