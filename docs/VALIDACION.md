# Fase 1 — validación

## Comprobaciones realizadas

Entorno: Node 24.19.0, npm 11.9.0; instalación completada. TypeScript estricto y build de Vite finalizaron sin errores. Vitest: **2 archivos, 10 pruebas, 10 aprobadas**.

Pruebas significativas: ida/vuelta de coordenadas con zoom y desplazamiento, sentido positivo del eje y, límites de zoom, paso de cuadrícula legible, rechazo de coordenadas no finitas/fuera de rango, deshacer/rehacer movimiento, recuperar objetos tras vaciar, invalidación de ramas de rehacer, ausencia de mutación del estado y límite de historial.

No se ejecutaron pruebas interactivas ni revisión visual en navegador porque no se disponía del control de navegador requerido para este entorno. El build y las pruebas unitarias no demuestran por sí solos que toda interacción o todo dispositivo funcione. No se midió rendimiento en celulares ni accesibilidad con lector de pantalla. GeoGebra y los motores futuros no han sido probados ni instalados.

## Criterios manuales por verificar

Ejecutar `npm ci`, `npm test`, `npm run dev`, abrir el sitio:

1. Ver tres puntos: A=(-3,2), B=(3,2), C=(0,-2). Los ejes positivos x/y deben corresponder a derecha/arriba.
2. Seleccionar A en la lista. Cambiar x a 2 e y a 3; aplicar. Lista, propiedades y plano deben coincidir.
3. Arrastrar A; soltar y deshacer. El movimiento completo debe contar como un paso. Rehacer debe restaurarlo.
4. Elegir Punto y tocar el plano. Se añade un punto con etiqueta única. Seleccionarlo y eliminarlo; deshacer recupera el objeto.
5. Mover vista y arrastrar el plano; las coordenadas de los puntos no cambian. +/− cambia escala. Restablecer vista vuelve al centro y escala inicial sin borrar objetos.
6. Desactivar cuadrícula/ejes con sus controles. Ambos deben ocultarse independientemente.
7. Vaciar plano y deshacer recupera los puntos; vaciar no elimina el historial. El zoom/vista no se incluye en el historial de objetos.
8. Intentar coordenadas vacías, infinitas o fuera de ±10000. No deben cambiar el punto. Decimales con punto según validación de navegador.
9. Tema claro/oscuro: verificar legibilidad. Recargar conserva tema si localStorage funciona y devuelve los puntos iniciales (no hay guardado todavía).
10. Abrir 3D y Experimentos; deben mostrar estado pendiente. Construcciones Fase 2 deben estar deshabilitadas. La fórmula inferior es un ejemplo no editable.
11. Probar tamaños 1440, 900 y 390 px, modo horizontal móvil y zoom del navegador 200%. Sin pérdida de acceso a controles; listas largas desplazan internamente.
12. Recorrer con Tab. Editar coordenadas permite operar sin arrastre. Abrir Guía, cerrar con Escape y verificar retorno de foco; Tab queda dentro del diálogo.
13. Probar panel de propiedades cuando el punto seleccionado deja de existir al deshacer; debe solicitar selección y no lanzar error.
14. Crear hasta 100 puntos y comprobar límite con mensaje al intentar otro. Coordenadas de vista muy lejanas no deben permitir puntos fuera del rango.
15. Inspeccionar la red: esta fase utiliza recursos locales, sin GeoGebra, fuentes remotas, analítica ni recogida de datos.

La Fase 1 estará lista para aprobación visual después de completar estos criterios en los navegadores objetivo. Las fases siguientes añadirán pruebas de adaptadores, matemáticas y navegador.
