# Publicación prevista — Fase 7

Esta guía describe el procedimiento; **no se ha publicado ni configurado un dominio**.

## Conservar en GitHub

Crea en tu cuenta un repositorio vacío, inicialmente privado si prefieres. No añadas README remoto al crearlo. Con Git instalado y sesión autorizada:

```bash
git remote add origin https://github.com/TU_USUARIO/eduvirtual-lab.git
git push -u origin main
```

Sustituye TU_USUARIO. Si ya existe origin, revisa `git remote -v` y no lo reemplaces sin verificar. No subas contraseñas, tokens ni node_modules. El ZIP incluye el repositorio local para conservar el commit; los archivos fuente también funcionan al crear un nuevo repositorio.

## Cloudflare Pages

Después de completar las fases y validar el piloto:

1. Conecta el repositorio GitHub a un proyecto de **Pages**, no a un Worker de servidor.
2. Rama de producción: `main`; raíz: carpeta que contiene package.json.
3. Comando de build: `npm ci && npm run build`; directorio de salida: `dist`.
4. Versión de Node: 24, coherente con el entorno validado. No se necesitan claves ni variables secretas.
5. Confirma primero la URL `*.pages.dev` y prueba el build en navegador.
6. En el proyecto Pages, añade el dominio personalizado `lab.eduvirtual.win`. Usa las instrucciones de DNS que devuelva Cloudflare. Si la zona ya está en Cloudflare, el asistente puede crear el registro necesario. Si está en otro proveedor, sigue la configuración indicada para el subdominio y espera validación/HTTPS.
7. Revisa que el registro `lab` no esté en uso antes de cambiarlo. No modificar los registros del dominio raíz eduvirtual.win ni su sitio actual.
8. Verifica HTTPS, recursos, móvil y comportamiento de motores externos en la URL final. Solo entonces declarar el despliegue completado.

La aplicación Fase 1 no tiene rutas de servidor; los módulos cambian en memoria. Si se añade enrutador, definir y probar fallback SPA. Antes de integrar GeoGebra, definir la política de seguridad compatible con sus dominios reales y comprobar qué recursos externos carga; no inventar una CSP que rompa el motor.
