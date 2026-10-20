# Auditoría de Fase 3 y entrega de Fase 4

## Fase 3 revisada

El commit previo de main contenía un editor textual y un AST, pero tenía errores en precedencia unaria (-x²), entrada implícita (3x, πr²h), valores iniciales de parámetros y contornos sobre asíntotas. No incluía un campo visual MathLive ni presentación KaTeX.

Esta entrega corrige esos casos y añade adaptadores explícitos: MathLive → ASCIIMath → parser/AST; AST → LaTeX → KaTeX. El código LaTeX no se ejecuta. Las operaciones fuera del subconjunto permitido se rechazan. Los resultados son numéricos, no un sistema algebraico universal. Las pruebas incluyen los seis ejemplos originales, signos/potencias, funciones reales, puntos espaciales y la conversión real de MathLive sin navegador.

La validación tiene límites de longitud, nodos, profundidad y dominio. Los cálculos permitidos son operaciones acotadas, sin instrucciones arbitrarias, propiedades, importaciones o eval() JavaScript.

## Fase 4 implementada

- Three.js y OrbitControls con desmontaje y liberación de geometrías, materiales, texturas, controles y renderer.
- Cámara en sistema cartesiano z-arriba; rotación, desplazamiento, zoom, restablecer, frontal y superior.
- Sólidos con dimensiones modificables: prisma rectangular, pirámide recta rectangular, cono, cilindro y esfera. Área total y volumen mediante fórmulas verificadas.
- Hasta 24 puntos, vectores, rectas y planos. Crear, seleccionar en lista, modificar coordenadas y eliminar. No se implementa arrastre directo de objetos ni dependencias de construcción entre ellos.
- Superficies explícitas z=f(x,y), parámetros, dominio y malla numérica. Se omiten triángulos con valores inválidos y saltos grandes; no se prometen superficies implícitas arbitrarias.
- Secciones de cono doble: puntos calculados a partir de las ecuaciones. Clasificación de casos no degenerados y degenerados. La curva satisface tanto x²+y²=z² como z=tan(θ)x+c.
- Estados de error de WebGL y reintento. ResizeObserver con respaldo de resize, render suspendido con documento oculto o escena fuera de pantalla.
- Pantalla de entrada similar a la referencia: fondo azul oscuro degradado, placa translúcida, triángulo/punto naranja y EduVirtual Lab. Temporizador aproximado de 1000 ms, con reducción de animación si el sistema la solicita. No es un indicador de progreso de red.

## Comprobaciones realizadas

71 pruebas y compilación TypeScript/Vite. Los tests de superficies comprueban las coordenadas de cada vértice utilizado; los de cortes comprueban residuos del cono/plano y casos degenerados; los de medidas cubren prismas, pirámides, conos, cilindros y esfera, incluidos errores de dimensiones y escalado del volumen.

Sin prueba gráfica en navegador. No afirmar que la validación automática sustituye esa comprobación ni que cualquier hardware dispone de WebGL. No se ha implementado guardado de proyectos o captura de datos de investigación en esta fase.

## Revisión manual pendiente en el sitio

1. Recargar: ver EduVirtual Lab centrado, con fondo oscuro; entrar al laboratorio tras aproximadamente un segundo de ejecución del cliente.
2. Editor: probar -x², f(x)=x²+3x−4, V=πr²h y campos de parámetros vacíos. Alternar texto/visual y comprobar teclado MathLive y fuentes sin solicitudes externas.
3. Cambiar f(x) a 1/x y la implícita a 1/x=0: no unir asíntotas como curvas.
4. Geometría 3D: cambiar los cinco sólidos, dimensiones, cuadrícula, ejes y malla. Comprobar que el área/volumen coincide con el sólido actual.
5. Crear, editar y borrar punto, vector, recta y plano. Rechazar vector nulo, puntos coincidentes o normal nula.
6. Abrir z=x²+y² y z=a*x+y desde el editor. Conservar el valor de a al abrir la escena; modificarlo, dejarlo vacío y corregirlo sin perder acceso al campo.
7. Cortes del cono: θ=0°,30°,45°,60° con c=1.5 y luego c=0. Comparar con el plano y recordar la ventana finita.
8. Rotar con ratón/táctil, ampliar con rueda/pellizco, desplazar, restablecer y usar vistas frontal/superior.
9. Probar tamaño móvil, modo oscuro, teclado, cambios de módulo repetidos y recuperación tras fallo de contexto WebGL.
10. Verificar en Cloudflare la versión de public/release.json generada en dist/release.json.

## Referencias técnicas

- https://threejs.org/docs/
- https://mathlive.io/mathfield/api/
- https://katex.org/docs/security.html
- Licencias de los paquetes fijados en package-lock.json y THIRD_PARTY_NOTICES.txt.
