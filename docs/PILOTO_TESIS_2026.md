# Piloto de tesis — exportación y trazabilidad (rama de pruebas)

## Estado
El sistema ya dispone de tablas `participants`, `quiz_attempts`, `quiz_answers` y `research_responses`, y un panel `/admin`. Esta rama **no modifica** las tablas ni la producción.

## Procedimiento sugerido
1. Obtener autorización institucional y establecer consentimiento informado de los participantes; la participación no debe afectar notas oficiales.
2. El administrador crea códigos `EST-001` y PIN únicos desde `/admin`. Entregar credenciales individualmente y no publicar los códigos asociados a personas.
3. Aplicar instrumentos equivalentes en dificultad antes y después de la intervención, con rúbrica aprobada y misma escala 0–100.
4. Aplicar laboratorios guiados de parábola, elipse e hipérbola; guardar predicciones, observaciones y reconstrucciones.
5. Exportar CSV desde el panel con el nuevo botón **Exportar CSV tesis**. Abrirlo en Excel/LibreOffice usando separador punto y coma y UTF-8.
6. En el reporte, `cambio_puntos` = promedio postest − promedio pretest. Si falta alguno se deja vacío. `actividades_reflexivas` cuenta tipos de actividad únicos. Los promedios incluyen todos los intentos registrados del modo respectivo; establecer un protocolo de intentos **antes** de recoger datos.
7. Mantener por separado los resultados académicos oficiales y los instrumentos de investigación. El CSV está seudonimizado, no anonimizado si existe una tabla de correspondencias.

## Seguridad pendiente
- El analizador de Supabase marca una función pública `submit_research_response` con `SECURITY DEFINER`. Es intencional que participantes sin Supabase Auth puedan enviar respuestas por código y PIN, pero debe auditarse la función para asegurar verificación criptográfica, límites de longitud, control de reintentos, prohibición de lectura y ausencia de escalamiento de permisos antes del piloto real.
- Supabase también advierte que la protección contra contraseñas filtradas está desactivada.
- No guardar PIN en `localStorage`. En esta rama se solicitá de nuevo al refrescar la página.
- No publicar resultados identificables, credenciales ni relaciones código/persona en GitHub.
- Usar un entorno de pruebas y cuentas ficticias antes de publicar.

## Verificación
```bash
npm ci
npm test
npm run build
```
Revisar manualmente el CSV con dos participantes ficticios, uno con pretest/postest y otro sin postest. Verificar permisos del panel, rechazos con PIN inválido y que ninguna solicitud anónima lea tablas.

**Nota:** La implementación de la rama se ha inspeccionado en GitHub, pero no se ha realizado compilación ni pruebas de navegador por falta de ejecución del repositorio en este entorno. No fusionar a `main` hasta comprobarlo.
