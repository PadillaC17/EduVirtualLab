# Panel del administrador y Supabase

Ruta prevista: `/admin`.

## Objetivo

Centralizar los resultados de Geometría II para que el docente pueda consultar participantes, respuestas cualitativas de investigación y calificaciones de quiz sin depender del navegador de cada estudiante.

## Seguridad

- El frontend usa únicamente la clave pública de Supabase.
- La clave `service_role` no se incluye en el navegador ni en GitHub.
- El acceso del administrador usa Supabase Auth.
- Las tablas de resultados se protegen con Row Level Security.
- Solo usuarios registrados en `admin_users` pueden consultar datos.
- Los estudiantes no reciben permisos de lectura sobre resultados.

## Datos previstos

- `participants`: códigos seudonimizados como EST-001.
- `research_responses`: Naturalización, Desnaturalización y Reconstrucción reflexiva.
- `quiz_attempts`: intento, modalidad, puntaje, aciertos y fecha.
- `quiz_answers`: respuestas por pregunta.
- `admin_users`: usuarios autorizados para el panel.

## Panel

El panel incluye:

- indicadores de participantes, evidencias, intentos y promedio;
- tabla de participantes con estado activo/inactivo;
- detalle de las tres fases de investigación;
- listado de intentos y calificaciones;
- creación de códigos de participante;
- actualización manual de datos;
- diseño adaptable a escritorio y móvil.

## Pendiente para la captura estudiantil

El panel ya está preparado para leer datos de Supabase. El siguiente paso del flujo estudiantil será conectar el módulo de Investigación y el futuro Quiz con funciones de envío seguras asociadas al código del participante. No se debe habilitar lectura pública de las tablas para lograrlo.
