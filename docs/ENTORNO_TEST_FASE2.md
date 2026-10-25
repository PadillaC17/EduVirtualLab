# EduVirtual LAB — entorno de pruebas Fase 2

## Arquitectura recomendada
- Producción: `lab.eduvirtual.win`, rama `main`, Supabase actual. NO modificar.
- Pruebas: `test.eduvirtual.win`, rama `test/aula-geometria-fase2`, **proyecto Supabase diferente**.
- Se reutilizan los motores 2D/3D, laboratorio de cónicas, actividades y el cuestionario `/aula-demo`.
- Las notas, perfiles y credenciales de pruebas deben quedar exclusivamente en Supabase TEST.

## Configuración Cloudflare Pages
1. Entrar a Workers & Pages y crear un **segundo proyecto Pages** conectado al repositorio `PadillaC17/EduVirtualLab`.
2. Seleccionar la rama de producción del **segundo proyecto**: `test/aula-geometria-fase2`. No alterar la rama `main` del Pages original.
3. Comando de build: `npm run build`. Directorio de salida: `dist`. Directorio raíz: `/`.
4. Asociar el dominio personalizado `test.eduvirtual.win` en el proyecto nuevo y comprobar HTTPS.
5. En variables de entorno del proyecto de pruebas colocar `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY`, tomados de un proyecto **nuevo** Supabase TEST. Jamás usar la clave secret/service-role en Vite.
6. Desplegar y visitar `/aula-demo`. Por ahora es un quiz local de demostración, NO una evaluación remota.
7. Antes de crear alumnos, completar esquema de usuarios, Auth, RLS, registro cerrado/abierto y calificación en servidor.

## Registro sin correo
No está implementado aún. Para utilizar solo usuario/contraseña se requiere un servicio de autenticación probado con manejo robusto de credenciales, recuperación de cuenta y sesiones; no usar correo falso generado ni guardar contraseñas en tablas de aplicaciones. Como alternativa para un primer piloto, usar Supabase Auth con correo real y contraseña y desactivar confirmación únicamente si el protocolo institucional lo permite. No divulgar las cuentas de prueba.

## Política de seguridad y continuidad
- La web `test.eduvirtual.win` NO está creada ni publicada por agregar este archivo. Su DNS y despliegue se configuran en Cloudflare.
- Esta rama no toca ni migra Supabase productivo.
- No mezclar pretest, postest y quiz de práctica; no exponer respuestas correctas en cliente para pruebas evaluativas.
- Sólo el administrador puede asignar roles profesor y cerrar el registro; los controles deben ser server-side.
- Comprobar `npm ci`, `npm test`, `npm run build`, registro, intentos, RLS y pruebas móviles antes de la apertura a estudiantes.
