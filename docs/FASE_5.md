# Fase 5 — Proyectos, guardado e intercambio

La Fase 5 añade persistencia local y un formato de proyecto JSON versionado. No introduce cuentas, backend ni sincronización remota.

## Qué se guarda

El navegador conserva automáticamente, cuando existe estado compatible:

- Plano libre: puntos, vista, cuadrícula y ejes.
- Cónicas: tipo, orientación, parámetros y visibilidad de elementos.
- Ecuaciones: entrada, expresión representada, modo de editor, evaluación y parámetros.
- Geometría 3D: herramienta activa, sólido, dimensiones, objetos, superficie, parámetros, dominio, corte y opciones visuales.
- Investigación: evidencias ya guardadas por el estudiante.
- Navegación: módulo y herramienta 2D activos.

## Archivo de proyecto

El botón **Proyecto** permite exportar un archivo `.json` con `schemaVersion: 1`. La importación acepta como máximo 2 MiB y reconstruye únicamente campos incluidos en la lista blanca del modelo de dominio.

Se rechazan:

- versiones desconocidas;
- coordenadas o tamaños fuera de los límites;
- más objetos de los permitidos;
- tipos de objeto no reconocidos;
- cadenas excesivas;
- claves `__proto__`, `prototype` o `constructor`;
- scripts, HTML, XML y cualquier formato diferente del JSON de EduVirtual Lab.

El contenido importado nunca se pasa a `eval()` ni se ejecuta como código.

## Alcance

El almacenamiento local facilita continuar trabajando en el mismo navegador, pero no constituye una copia de seguridad. El usuario debe exportar el proyecto para conservar una copia portátil. Borrar los datos del navegador puede eliminar el proyecto local.

La importación recarga la SPA después de validar y almacenar el proyecto para que todos los módulos se hidraten desde un único estado coherente.
