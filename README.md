# Eduvirtual LAB · Fase 3

Laboratorio virtual educativo sin cuentas, orientado al aprendizaje de las secciones cónicas en Geometría II. Las Fases 1, 2 y 3 están integradas en la aplicación publicada.

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

- Plano libre de Fase 1: puntos, edición, zoom, desplazamiento, cuadrícula, ejes y deshacer/rehacer.
- Explorador dinámico de parábola, elipse e hipérbola de Fase 2, con elementos notables, parámetros y ecuación asociada.
- Fase 3: editor de expresiones y ecuaciones con analizador seguro, AST tipado y evaluación numérica.
- Clasificación de funciones 2D, ecuaciones implícitas 2D, superficies explícitas 3D, puntos 2D y fórmulas escalares.
- Gráficas 2D aproximadas, manejo de discontinuidades, evaluación f(x) y parámetros explícitos para fórmulas.
- Límites de seguridad: 512 caracteres, 128 nodos, profundidad 32, funciones permitidas y ausencia de `eval()`.
- Interfaz adaptable, modo claro/oscuro y navegación entre Cónicas dinámicas y Ecuaciones y gráficas.

Sin autenticación ni peticiones a una API propia; no se recopilan datos personales. Las construcciones todavía no se conservan al recargar: el guardado corresponde a Fase 5.

## Pendiente, explícitamente

Motor 3D interactivo, persistencia de proyectos, importación/exportación y actividades de investigación guiadas. La Fase 3 utiliza un analizador propio con lista blanca en lugar de depender de MathLive/Math.js/KaTeX; esas librerías no son necesarias para el alcance funcional actual.

- [Arquitectura, licencias, interpretación y fases](docs/ARQUITECTURA.md)
- [Resultados y criterios manuales de Fase 1](docs/VALIDACION.md)
- [Instrucciones de GitHub y Cloudflare Pages](docs/PUBLICACION.md)

El repositorio Git local contiene la entrega. Después de extraer el ZIP puedes usar su historial incluido o iniciar otro repositorio. `node_modules` no se incluye; `npm ci` reconstruye las dependencias. `dist` contiene el build verificado, pero los cambios se hacen en `src` y luego se recompilan.
