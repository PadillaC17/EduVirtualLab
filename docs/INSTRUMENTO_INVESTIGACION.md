# Integración del instrumento piloto de investigación

Esta entrega adapta las ideas útiles del prototipo ZIP previo al código actual de EduVirtual Lab. No reemplaza las Fases 1–3 ni copia la aplicación antigua completa.

## Secuencia implementada

Cada actividad de parábola, elipse e hipérbola sigue tres momentos:

1. **Naturalización:** el estudiante registra una predicción o explicación inicial antes del contraste.
2. **Desnaturalización:** activa una comparación visual, explora el caso y registra una observación.
3. **Reconstrucción reflexiva:** revisa la respuesta inicial y formula una explicación posterior.

La interfaz evita afirmar que esta secuencia, por sí sola, demuestra efectividad pedagógica. Se presenta como instrumento piloto que deberá someterse a revisión docente y validación metodológica antes de la aplicación formal.

## Evidencias

Cada actividad puede guardar localmente:

- identificador de la cónica;
- predicción inicial;
- observación durante el contraste;
- reconstrucción reflexiva;
- fecha de finalización.

No se solicitan nombres, correos, cédulas ni cuentas. Los registros permanecen en el navegador y solo salen del dispositivo si el usuario pulsa **Exportar JSON** o **Exportar CSV**.

El esquema local actual es `schemaVersion: 1` y la clave es `eduvirtual_research_responses_v1`.

## Uso futuro en metodología y resultados

La estructura está preparada para que el Capítulo III pueda describir el procedimiento de aplicación y los indicadores observables, y para que el Capítulo IV pueda organizar comparaciones entre respuesta inicial, observación y reconstrucción. Esto no sustituye la definición formal de instrumentos, población, muestra, validación ni técnica de análisis que correspondan a la tesis.

## Navegación

Se añadió una navegación lateral en escritorio y horizontal en pantallas pequeñas para acceder rápidamente a:

- Cónicas dinámicas.
- Ecuaciones y gráficas.
- Investigación.
- Espacio 3D.
- Plano libre.

La integración conserva los módulos existentes y evita sobrescribir la arquitectura actual con la del ZIP.
