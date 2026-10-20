# EduVirtual Lab · Fases 1–4

Laboratorio de geometría para Geometría II, Universidad de Guayaquil. Sin cuentas ni autenticación. El código fuente de main genera el sitio de Cloudflare Pages; dist se reconstruye durante la publicación.

## Estado actual

- **Fase 1:** plano libre con puntos, coordenadas, zoom, tema e historial.
- **Fase 2:** explorador de parábola, elipse e hipérbola con parámetros, focos, directriz, asíntotas y ecuaciones.
- **Fase 3 revisada:** entrada textual y visual MathLive, representación KaTeX, AST tipado, evaluación, parámetros explícitos, puntos 2D/3D, funciones 2D e implícitas. Sin eval() de JavaScript.
- **Fase 4:** escena Three.js con cámara libre, vistas, zoom, ejes, cuadrícula y malla; prismas rectangulares, pirámides rectas rectangulares, cilindros, conos y esferas; cálculo de áreas/volúmenes; puntos, vectores, rectas y planos editables; superficies explícitas y cortes de un cono doble.
- **Entrada:** fondo azul oscuro, logotipo y «EduVirtual Lab» durante aproximadamente un segundo después de iniciar React. El tiempo total de descarga depende de la conexión; el motor 3D y MathLive se cargan al usarse.

## Uso

En Geometría 2D elige Cónicas dinámicas o Ecuaciones y gráficas. En el editor, texto y modo visual se convierten al mismo AST validado. Las funciones trigonométricas usan radianes. Los parámetros aparecen con valor inicial explícito 1. Una superficie z=f(x,y) o un punto A=(x,y,z) se abre con «Abrir en Geometría 3D».

Geometría 3D tiene cuatro herramientas: Sólidos, Objetos, Superficies y Cortes del cono. Arrastrar rota la cámara; rueda/pellizco amplía; botón derecho/dos dedos desplaza. Hay botones para vistas frontal xz, superior xy y restablecer. El eje vertical es z.

Los cortes corresponden a x²+y²=z² y al plano z=tan(θ)x+c. Para c≠0: círculo a 0°, elipse por debajo de 45°, parábola a 45° e hipérbola por encima. Para c=0 se muestran casos degenerados. La ventana finita |z|≤6 recorta las ramas, sin afirmar que terminan allí.

## Límites explícitos

- Editor: 512 caracteres, 128 nodos por sentencia y profundidad 32. Funciones: sin, cos, tan, sqrt, abs, exp, ln y log (base 10). No hay integración simbólica general ni CAS universal.
- Los identificadores largos son nombres de parámetros. Se admite multiplicación implícita como 3x, πr²h y (x+1)(x−1). Las familias soportadas están clasificadas; se rechazan las demás.
- Las gráficas y superficies son aproximaciones numéricas; omiten valores no reales, singularidades detectadas y puntos fuera de la ventana. No garantizan detectar todas las características de cualquier función arbitraria.
- Superficies: z=f(x,y), dominio configurable hasta ±6 y ventana vertical ±10. No se representan superficies implícitas 3D generales.
- Los objetos se editan mediante coordenadas en el panel. Las rectas y planos dibujados son porciones finitas de objetos matemáticamente infinitos; no tienen longitud/área total finita.
- Las medidas de los sólidos se calculan por fórmulas del dominio, independientemente de la triangulación visual.
- El trabajo no se guarda al recargar. Persistencia/importación corresponde a Fase 5. Las actividades completas de investigación corresponden a Fase 6.

## Instalación y publicación

Node 24 LTS recomendado (mínimo 22.12):

```bash
npm ci
npm test
npm run build
npm run dev
```

Cloudflare Pages: rama main, comando `npm run build`, output directory `dist`. El script de build prepara las fuentes locales de MathLive antes de compilar. No se necesitan secretos ni servicios de pago para estas funciones. Las fuentes de MathLive y KaTeX se sirven desde el propio sitio.

## Verificación de esta entrega

71 pruebas aprobadas en 6 archivos y build de producción correcto: regresiones 2D, auditoría del parser, adaptador real de MathLive (conversión sin DOM), medidas de sólidos, validación espacial, superficies y ecuaciones de las secciones del cono. Se corrigieron además las asíntotas trasladadas y la selección de semiejes al cambiar a elipse.

No se ejecutó revisión visual/interactiva en navegador en este entorno: el control de navegador requerido no estaba disponible. El montaje real de MathLive, WebGL, gestos y descarga de fuentes requieren la comprobación manual de docs/FASE_4.md. Un fallo de WebGL tiene un estado de error y opción de reintento.

Three.js, MathLive y KaTeX tienen licencia MIT en las versiones instaladas; conservar los avisos en THIRD_PARTY_NOTICES.txt, THIRD_PARTY_PHASE4.txt y los de los paquetes. La app no incluye ni redistribuye GeoGebra en esta implementación.
