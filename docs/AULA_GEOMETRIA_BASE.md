# Aula de Geometría II — base de implementación
Rama de prueba: feature/aula-geometria-base-2026

## Entregado
- Motor de preguntas de selección única: cuatro alternativas A–D, exactamente una correcta, explicación y tema.
- Calificación sobre 100 y validación de preguntas.
- Demostración navegable en /aula-demo (SOLO al desplegar la rama de prueba).
- Pruebas de dominio.

## Diseño de acceso — pendiente de implementación
- **Administrador**: único rol que puede abrir/cerrar inscripciones, asignar roles de profesor, suspender usuarios y ver configuración general.
- **Profesor**: publicar cuestionarios de Geometría II, preguntas con cuatro opciones, fechas y resultados de sus grupos.
- **Estudiante**: registrarse con nombre, apellido, usuario único y contraseña; ver actividades asignadas, realizar quiz y consultar sus resultados.
- **Registro**: estado `registration_open` almacenado en base de datos; **no basta** con ocultar un botón. El backend debe comprobarlo en cada alta.
- **Autenticación sin correo**: Supabase Auth estándar está orientado a email/teléfono; se requiere diseñar y revisar un mecanismo seguro de identidad y recuperación por usuario antes de ofrecer registro público. No usar correos inventados ni contraseñas en tablas propias. Proteger recuperación de cuentas con un procedimiento administrado.
- **Autorización**: permisos únicamente comprobados en servidor y RLS, no por botones o datos editables en navegador.
- **Resultados de pruebas reales**: corrección en backend; respuestas correctas no deben enviarse al estudiante antes del cierre. Los quizzes de práctica pueden revelar explicaciones después de enviar.
- **Tesis**: separar evaluaciones de investigación (pretest/postest) de quiz de práctica; guardar versión del instrumento, número de intento y marca temporal; no calificar sólo en JavaScript.
- **Datos personales**: almacenar el mínimo necesario, consentimiento aprobado institucionalmente, períodos de retención, privacidad e información de acceso. Los códigos de investigación deben estar separados del nombre de usuario.

## Antes de publicar
1. npm ci; npm test; npm run build.
2. Crear esquema SQL y políticas RLS mediante revisión independiente.
3. Probar alta con registro habilitado y cerrado, unicidad de usuario, bloqueo, sesión y recuperación de cuenta.
4. Verificar que estudiante no pueda obtener respuestas ni calificaciones ajenas; profesor sólo puede acceder a grupos asignados.
5. Probar en móvil, teclado y navegadores.
6. Mantener la rama main como producción hasta revisar todo lo anterior.
