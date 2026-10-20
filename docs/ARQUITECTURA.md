# Eduvirtual LAB — arquitectura y plan de ejecución

## Decisión técnica
Aplicación SPA estática con React, TypeScript estricto, Vite y Tailwind CSS. Sin backend, autenticación, cuentas, base de datos ni analítica. El destino previsto es Cloudflare Pages y el subdominio lab.eduvirtual.win. Esta entrega no realiza despliegue ni modifica DNS. Git local iniciado; el repositorio remoto de GitHub todavía debe crearse y conectarse.

Arquitectura por capas:

1. **Interfaz**: componentes accesibles y adaptables, paneles, editor visual, controles y actividades. No calcula geometría por su cuenta.
2. **Dominio**: objetos tipados con identificadores, coordenadas, dependencias de construcción y parámetros. Modelo canónico independiente del motor; cada proyecto incluye schemaVersion y migraciones explícitas.
3. **Aplicación**: acciones, historial y selección. Un cambio por gesto; historial limitado. Política de borrado futuro: eliminar también dependientes con una previsualización clara, o rechazar la operación; no dejar referencias rotas.
4. **Matemática**: analizadores, árboles de expresión validados, evaluación y mediciones; resultados distinguen aproximación numérica y fórmula exacta.
5. **Adaptadores**: SVG de base en Fase 1; GeoGebra 2D desde Fase 2, GeoGebra 3D en Fase 4. Three.js solamente para escenas personalizadas que GeoGebra no cubra. Un motor activo por vista, sin duplicar dos escenas interactivas simultáneamente.
6. **Persistencia**: almacenamiento local y JSON versionado desde Fase 5; resultados importados reconstruidos exclusivamente desde objetos de dominio seguros.

El renderizador SVG de esta fase comprueba interacción y coordenadas. No sustituye a GeoGebra como motor final de geometría dinámica. La API pública debe añadir capacidades solamente después de implementarlas y validarlas. El contrato actual declara únicamente puntos. No hay importaciones ocultas de motores futuros.

## Dependencias y límites

| Dependencia | Licencia oficial revisada | Uso y límite |
| --- | --- | --- |
| React / React DOM | MIT | Interfaz; no es motor matemático. Instalados en Fase 1. |
| TypeScript | Apache-2.0 | Tipado estático; no valida archivos JSON durante ejecución. Instalado. |
| Vite | MIT | Desarrollo y compilación estática; no publica ni gestiona DNS. Instalado. |
| Tailwind CSS | MIT | Estilos y diseño adaptable; accesibilidad depende de los componentes. Instalado. |
| Vitest | MIT en el paquete instalado | Pruebas unitarias; no reemplaza pruebas de navegador. Instalado. |
| MathLive | MIT | Entrada visual y MathJSON. No asumir que su editor resuelve o grafica; Fase 3. |
| Math.js | Apache-2.0 | Evaluación numérica, simplificación y derivadas soportadas. No prometer CAS universal, integración simbólica general ni resolución arbitraria; Fase 3. |
| KaTeX | MIT | Presentación de un subconjunto de LaTeX, no cálculo ni intérprete; Fase 3. |
| GeoGebra | Condiciones diferenciadas | Producto/materiales: uso no comercial con atribución. Código fuente: EUPL-1.2; idiomas, documentación y recursos de interfaz: CC BY-NC-SA 4.0 o posterior. No etiquetar el producto completo como MIT. Fases 2/4. |
| Three.js | MIT | Renderizado WebGL, no CAS ni kernel geométrico. Cálculos en dominio y validación propia; Fase 4 si es necesario. |

Las licencias permisivas exigen conservar avisos de copyright/licencia; Apache incluye condiciones específicas de redistribución y NOTICE cuando corresponda. El proyecto no impone todavía una licencia a tu código original: puedes elegirla antes de hacer público GitHub. Los avisos de las dependencias instaladas se conservan en THIRD_PARTY_NOTICES.txt.

GeoGebra permite el uso académico no comercial, pero una web gratuita también podría tener fines comerciales (publicidad, patrocinio o ventaja comercial). Para esta investigación educativa gratuita se prevé integración remota con atribución visible **Made with GeoGebra®** y enlace oficial. No se redistribuye su producto ni su código en Fase 1. Antes de integrarlo se volverán a revisar las condiciones y la modalidad concreta. No afirmar que la integración convierte toda la aplicación en software con licencia permisiva.

Cloudflare Pages y GitHub son servicios con condiciones y cuotas independientes, no dependencias MIT. Esta aplicación estática no necesita plan de pago por diseño, pero tampoco promete gratuidad o cuotas ilimitadas de proveedores. GeoGebra remoto requiere conexión y genera solicitudes a un tercero; antes de Fase 7 verificar privacidad, cookies, solicitudes y atribución. La Fase 1 no carga fuentes, motores ni analítica remotos.

## Interpretación matemática prevista — Fase 3

LaTeX, texto humano y expresión interna son formatos distintos. No convertir LaTeX con reemplazos de texto generales ni enviar libremente la entrada a comandos del motor.

**Flujo**: entrada visual/textual → analizador → AST validado → clasificación y resolución de símbolos → documento matemático interno → evaluación o adaptador gráfico → resultado y representación KaTeX.

- Entrada textual: normalizador pequeño para π → pi y superíndices admitidos; gramática explícita para asignaciones, ecuaciones y puntos. El lado de cada expresión se analiza con Math.js. En español se documentará punto decimal; las comas separan coordenadas, no se adivinará su significado.
- Entrada visual: MathLive entrega MathJSON; adaptador recursivo con lista de nodos admitidos a nuestro árbol interno. El Compute Engine es una dependencia separada y no se presupone instalado. Añadirlo solo si el método elegido lo requiere, con nueva revisión de licencia y pruebas.
- Canonical: objetos como Function2D, Implicit2D, Surface3D, Point2D y ScalarFormula, con árboles tipados, parámetros, fuente opcional y estado de error. No guardar funciones ejecutables, HTML o JavaScript.
- Math.js: instancia restringida, sin import, evaluate, parse, createUnit u otras funciones de metaprogramación accesibles desde la entrada. Permitir solo números reales finitos, símbolos aprobados, operaciones + − × ÷ ^ y funciones expresamente soportadas. Rechazar acceso a propiedades, bloques, matrices no admitidas, asignaciones dentro de subexpresiones y llamadas arbitrarias. Límites iniciales: 512 caracteres, 128 nodos y 32 niveles; cálculos acotados en Worker con timeout y terminación. Valores concretos se ajustarán según pruebas.
- Símbolos: x, y, z y parámetros declarados en un entorno sin prototipo o Map. Un símbolo desconocido se informa; no se le asigna cero. Dependencias entre fórmulas se ordenan y se rechazan ciclos.
- Adaptador GeoGebra: generar comandos desde AST permitido y nombres internos saneados. Comprobar retorno, existencia del objeto y readiness; registrar eventos para sincronizar cambios. No enviar texto de importaciones directamente a evalCommand. El nombre de esa API no implica uso de eval JavaScript.
- Adaptador Three.js: muestras numéricas de superficies con límites de resolución; omitir valores inválidos y mostrar aproximación. Las discontinuidades no se unirán artificialmente. Una malla no es una solución algebraica exacta.

| Entrada | Clasificación | Cálculo y representación previstos |
| --- | --- | --- |
| f(x)=x²+3x−4 | Función 2D | AST x^2+3*x-4; GeoGebra 2D; evaluar f(2)=6 como prueba de aceptación. |
| y=sin(x) | Función 2D | Radianes por defecto y aviso visible; GeoGebra 2D. |
| x²+y²=25 | Ecuación implícita 2D | Circunferencia de radio 5; GeoGebra 2D. No tratarla como una única y=f(x). |
| z=x²+y² | Superficie explícita 3D | GeoGebra 3D; alternativamente malla Three.js para escenas específicas. |
| A=(2,3) | Punto 2D | Objeto Point2D, no vector por inferencia. |
| V=πr²h | Fórmula escalar | pi*r^2*h: solicitar r y h; no asignar valores tácitos ni convertir automáticamente en sólido. |

Las ecuaciones con x,y,z y sin z despejada no estarán soportadas hasta implementar un método real; la interfaz debe informarlo. Medidas físicas requieren unidades compatibles; en el primer alcance se usan unidades geométricas abstractas. Los errores separarán sintaxis, símbolos sin valor, dominio, capacidad no implementada y fallo del motor.

## Estructura

```text
eduvirtual-lab/
  src/
    app/                 App, estilos, composición
    components/          iconos, propiedades, errores
    domain/              tipos y validación de coordenadas
    math/                transformaciones; AST y cálculo en Fase 3
    engines/
      contracts.ts       capacidades explícitas
      svg/               plano funcional de Fase 1
      geogebra/          especificación del adaptador de Fase 2
    features/
      workspace/         historial; acciones y construcciones futuras
      activities/        reservado para Fase 6
    storage/             reservado para Fase 5
  tests/                 cálculos y estado
  public/                favicon local
  docs/                  arquitectura, validación y publicación
  package.json
  package-lock.json      instalación reproducible
  vite.config.ts
  tsconfig.json
```

## Primera versión y secuencia

La **entrega v0.1.0 (Fase 1)** contiene paneles, navegación, tema, puntos y propiedades; arrastrar puntos, crear/eliminar, deshacer/rehacer, zoom, desplazamiento, ejes/cuadrícula y vaciar/restaurar vista. Las operaciones tienen datos reales; los módulos futuros están marcados y las herramientas futuras deshabilitadas. Máximo 100 puntos; coordenadas finitas hasta ±10000; historial de 50 pasos. No se guarda el trabajo aún. Solo se conserva el tema cuando localStorage está disponible.

El **primer piloto educativo v1.0**, construido por fases, abarcará construcciones 2D y mediciones, las seis familias de entrada de la tabla, sólidos 3D con dimensiones y áreas/volúmenes correctos, guardado JSON seguro y seis actividades guiadas. Secciones planas y superficies implícitas 3D avanzadas quedan fuera hasta tener implementación comprobada. No incluir IA generativa ni API de pago.

| Fase | Entrega | Verificación mínima |
| --- | --- | --- |
| 1 | Base funcional — esta entrega | Build, pruebas de coordenadas/historial y lista manual de controles. |
| 2 | GeoGebra 2D; puntos, rectas, segmentos, rayos, vectores, polígonos, círculos y mediciones | Segmento 3-4-5; áreas conocidas; degenerados; arrastre mantiene dependencias; historial del motor. |
| 3 | MathLive, AST, Math.js, KaTeX, funciones/implícitas | Tabla de seis entradas, round-trip de formatos, errores y rechazo de entrada arbitraria; discontinuidades. |
| 4 | GeoGebra 3D; sólidos, cámara, dimensiones, superficies explícitas | Volúmenes/áreas conocidos, dimensiones inválidas y casos degenerados; disponibilidad WebGL. |
| 5 | LocalStorage/IndexedDB según tamaño, JSON versionado e imágenes según API | Ida/vuelta; versiones; referencias; tamaños máximos; importaciones maliciosas; cuotas y recuperación. |
| 6 | Actividades de seis temas | Objetivo, instrucciones, interacción, preguntas y retroalimentación real; revisión docente. |
| 7 | Optimización, E2E y Cloudflare Pages | Móvil/teclado, fallos de red del motor, auditoría de solicitudes, HTTPS y dominio confirmado. |

Para Fase 5: importación máximo 2 MiB inicialmente; versión, discriminantes, conteos, coordenadas, dependencias y profundidad validados. Rechazar campos ejecutables, scripts, objetos externos y claves peligrosas. Reconstruir desde lista blanca; nunca importar XML/.ggb arbitrario ni cargar JavaScript incorporado. Documentar que el guardado local no es una copia de seguridad y habilitar JSON descargable.

## Fuentes oficiales consultadas

Consulta efectuada durante esta entrega; revisar otra vez al añadir versiones reales de los motores.
- https://www.geogebra.org/license
- https://geogebra.github.io/docs/reference/en/GeoGebra_Apps_API/
- https://github.com/react/react/blob/main/LICENSE
- https://github.com/microsoft/TypeScript/blob/main/LICENSE.txt
- https://github.com/vitejs/vite/blob/main/LICENSE
- https://github.com/tailwindlabs/tailwindcss/blob/main/LICENSE
- https://github.com/arnog/mathlive (sección License)
- https://github.com/josdejong/mathjs/blob/develop/LICENSE
- https://mathjs.org/docs/expressions/security.html
- https://mathjs.org/docs/reference/functions/simplify.html
- https://mathjs.org/docs/reference/functions/derivative.html
- https://github.com/KaTeX/KaTeX/blob/main/LICENSE
- https://github.com/mrdoob/three.js/blob/dev/LICENSE
