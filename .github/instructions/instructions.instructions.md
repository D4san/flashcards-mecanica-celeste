---
description: Instrucciones generales para todo el proyecto de flashcards gamificadas de mecánica celeste.
applyTo: "**/*.{ts,tsx,js,jsx,css,md}"
---

# Contexto del producto

Esta web es una experiencia de aprendizaje **colaborativo** para recordar y comprender conceptos de **mecánica celeste** mediante una dinámica tipo **minijuego**.

El objetivo principal no es solo “responder flashcards”, sino mantener a estudiantes motivados con una experiencia:

- amigable y clara,
- divertida y dinámica,
- útil en celular y computador,
- enfocada en trabajo en equipo.

# Principios de UX del proyecto

1. **Mobile-first real**
	- Diseñar primero para pantallas pequeñas y luego escalar a desktop.
	- Evitar layouts que dependan de hover o de precisión de mouse.
	- Mantener acciones principales visibles y alcanzables con pulgar.

2. **Claridad antes que complejidad**
	- Cada pantalla debe dejar claro: qué está pasando, qué hacer ahora y qué viene después.
	- Reducir fricción cognitiva: textos directos, botones evidentes, feedback inmediato.

3. **Lúdico con propósito pedagógico**
	- Las mecánicas de juego (equipo, puntos, boss, bonus, temporizador, efectos) deben reforzar el aprendizaje, no distraer.
	- Priorizar flujo de estudio continuo sobre adornos visuales innecesarios.

4. **Colaboración explícita**
	- Favorecer decisiones y progreso de equipo.
	- Hacer visibles aportes individuales (quién respondió, aciertos del equipo, progreso común).

# Lineamientos de contenido académico

- Mantener rigor conceptual en mecánica celeste.
- Evitar simplificaciones incorrectas por “hacerlo más juego”.
- Si se usan trampas/distractores, deben servir para aprendizaje correctivo.
- Mostrar siempre la explicación correcta de forma comprensible para estudiantes.

# Diseño visual y componentes

- Usar componentes existentes del proyecto (`components/ui`) y patrones actuales antes de crear nuevos.
- Conservar consistencia visual con el estilo ya definido (tema cósmico + RPG académico).
- Evitar introducir estilos aislados o una estética que rompa la identidad del producto.
- Mantener jerarquía visual clara: estado del juego, pregunta, respuesta, acciones.

# Reglas de implementación técnica

1. **Cambios pequeños y enfocados**
	- Priorizar modificaciones puntuales sobre refactors grandes sin necesidad.

2. **No romper el flujo del juego**
	- Setup de equipo → ronda de pregunta → evaluación colaborativa → avance de partida.
	- Cualquier mejora debe respetar ese ciclo base.

3. **Rendimiento y estabilidad**
	- Cuidar animaciones y efectos para que no degraden experiencia en móviles medios.
	- Evitar trabajo innecesario en render y efectos repetitivos costosos.

4. **Accesibilidad mínima obligatoria**
	- Contraste suficiente, textos legibles y objetivos táctiles cómodos.
	- Interacciones base accesibles por teclado cuando aplique.

5. **Idioma y tono**
	- UI y copy principalmente en español.
	- Tono cercano, motivador y didáctico (sin perder precisión técnica).

# Criterio de decisión ante ambigüedad

Si una decisión de diseño o desarrollo es ambigua, elegir la opción que mejor cumpla este orden:

1. Aprendizaje efectivo de mecánica celeste.
2. Facilidad de uso en móvil y desktop.
3. Colaboración entre estudiantes.
4. Ritmo lúdico y motivador.
5. Complejidad técnica mínima necesaria.

# Qué evitar

- Features “bonitas” que no mejoran aprendizaje o colaboración.
- Sobrecargar pantallas con demasiadas acciones simultáneas.
- Cambios visuales que reduzcan legibilidad en móvil.
- Introducir patrones inconsistentes con los componentes y flujo actual.