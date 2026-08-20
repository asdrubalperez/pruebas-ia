# Architecture

## 0. Roadmap de Releases

| Release | Alcance (resumen) | Estado |
|---|---|---|
| MVP — Validación de formato | Función isValidEmailFormat(email) con resultado booleano para formato estándar y error si el argumento no es string. | Activo |
| Validación de dominios permitidos | Función isAllowedDomain(email, dominiosPermitidos) con validación previa de formato y comparación de dominio exacta sin distinguir mayúsculas/minúsculas. | Pendiente |

## 1. Análisis Técnico

- **Descripción macro de la arquitectura:** Paquete interno TypeScript de validación determinística, dividido en una capacidad de formato y una evolución para dominios permitidos. Los consumidores invocan funciones puras sin dependencias de red o persistencia.
- **Backend:** Lógica de biblioteca TypeScript con API funcional: isValidEmailFormat en r1 e isAllowedDomain en r2.
- **Frontend:** No Aplica: no existe UI ni canal de usuario final.
- **Bases de datos:** No Aplica: no se almacena información ni la lista de dominios.
- **Integraciones y APIs:** No se requieren APIs externas; la lista de dominios permitidos se recibe como argumento.
- **¿Requiere infraestructura nueva?** No — El alcance es un paquete interno y no requiere servicios, bases de datos ni recursos de red adicionales.
- **¿Consume servicios externos?** No — La verificación DNS/MX y cualquier comprobación externa están fuera de alcance.
- **¿Tecnología nueva para este producto?** Sí — Se incorpora un nuevo paquete interno TypeScript al producto; no se informan frameworks o dependencias nuevas.

## 2. Componentes Técnicos

| Componente | Tipo | Descripción |
|---|---|---|
| Validador de formato de email | Función pura TypeScript | Valida el contrato usuario@dominio.tld, devuelve true o false y rechaza mediante error argumentos que no sean string. |
| Validador de dominio permitido | Función pura TypeScript | Evolución prevista para r2: devuelve false si el formato es inválido y compara el dominio con la lista recibida sin distinguir mayúsculas/minúsculas. |

## 3. Análisis de Riesgo

| Situación Analizada | Riesgo | Impacto | Severidad | Acción Recomendada |
|---|---|---|---|---|
| Definición de formato estándar mediante reglas locales | Medio | Medio | Alta | Documentar el contrato aceptado y cubrir con pruebas casos válidos, inválidos y entradas no string sin añadir comprobaciones DNS/MX. |
| Comparación de dominios permitidos sin distinguir mayúsculas/minúsculas | Bajo | Medio | Baja | Normalizar únicamente mayúsculas y minúsculas antes de la comparación exacta y probar listas con distintas capitalizaciones. |
| Procesamiento de direcciones de email en integraciones internas | Bajo | Medio | Baja | Mantener las funciones sin persistencia y evitar registrar valores completos de email en evidencias de prueba. |

## 4. Hallazgos y Anomalías

La arquitectura no necesita capas de UI, almacenamiento, servicio remoto ni integración externa. La separación funcional coincide con los dos releases solicitados y conserva contratos distintos para entrada no string y formato inválido.
