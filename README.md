# Eduvirtual LAB · v0.1.0

Primera entrega de un laboratorio virtual educativo sin cuentas. Implementa la Fase 1, no toda la hoja de ruta. Código completo, configuración, lockfile y pruebas incluidos.

## Ejecutar en Windows, macOS o Linux

Instala Node.js 22.12 o posterior (recomendado Node 24 LTS). Abre una terminal en esta carpeta:

```bash
npm ci
npm run dev
```

Abre la dirección que indique Vite, normalmente http://localhost:5173. Para detenerlo usa Ctrl+C. La opción --host permite acceso desde la red local; no equivale a publicación en Internet.

```bash
npm test
npm run build
npm run preview
```

`preview` sirve el build de producción, normalmente en http://localhost:4173. Si un puerto está ocupado, usa la dirección que indique el comando.

## Qué funciona

- Interfaz adaptable, panel de objetos y propiedades; modos claro/oscuro.
- Plano SVG cartesiano con 3 puntos iniciales.
- Seleccionar, arrastrar, crear y eliminar puntos; editar coordenadas por teclado.
- Zoom, desplazar vista, cuadrícula/ejes y restablecer vista.
- Deshacer/rehacer cambios de puntos, incluido vaciar el plano.
- Guía y navegación a páginas que identifican los módulos pendientes.

Sin autenticación ni peticiones a una API; no se recopilan datos personales. Las construcciones **no se conservan al recargar**: el guardado corresponde a Fase 5. El tema sí se conserva cuando el navegador permite localStorage.

## Pendiente, explícitamente

GeoGebra, rectas/segmentos/rayos/vectores, polígonos, mediciones, gráficas, MathLive, cálculo de expresiones, 3D, importación/exportación y actividades. No se presentan como funciones terminadas. No existe todavía despliegue en lab.eduvirtual.win ni remoto de GitHub.

- [Arquitectura, licencias, interpretación y fases](docs/ARQUITECTURA.md)
- [Resultados y criterios manuales de Fase 1](docs/VALIDACION.md)
- [Instrucciones de GitHub y Cloudflare Pages](docs/PUBLICACION.md)

El repositorio Git local contiene la entrega. Después de extraer el ZIP puedes usar su historial incluido o iniciar otro repositorio. `node_modules` no se incluye; `npm ci` reconstruye las dependencias. `dist` contiene el build verificado, pero los cambios se hacen en `src` y luego se recompilan.
